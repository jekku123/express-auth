import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import Account from '../models/account';
import Session from '../models/session';
import User from '../models/user';
import VerificationToken from '../models/verificationToken';
import { ILogger } from '../types/ILogger';
import { ITokenService } from '../types/ITokenService';

@injectable()
export class AuthService implements IAuthService {
  private tokenService: ITokenService;
  private logger: ILogger;

  constructor(
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService,
    @inject(INTERFACE_TYPE.Logger) logger: ILogger
  ) {
    this.tokenService = tokenService;
    this.logger = logger;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { email });
    }

    if (!user.emailVerified) {
      throw new AppError('Email not verified', STATUS_CODES.UNAUTHORIZED, {
        email,
      });
    }

    if (!(await Bun.password.verify(password, user.password))) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED, {
        email,
      });
    }
    const account = await Account.findOne({ userId: user.id });

    // TODO: Maybe link account to user if not linked here instead in emailVerification
    if (!account) {
      throw new AppError('Account not linked', STATUS_CODES.NOT_FOUND, {
        email,
      });
    }

    if (account.sessionState === 'active') {
      throw new AppError('User already logged in', STATUS_CODES.UNAUTHORIZED, {
        email,
      });
    }

    const { token, expires } = this.tokenService.generateSessionToken();

    account.expiresAt = new Date(expires);
    account.sessionState = 'active';

    const updatedAccount = await account.save();

    if (!updatedAccount) {
      throw new AppError('Failed to update account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const session = Session.create({
      userId: user.id,
      sessionToken: token,
      expiresAt: expires,
    });

    if (!session) {
      throw new AppError('Failed to create session', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(
      `Session created for user with email ${email}\n
        sessionToken: ${token}\n
        expiresAt: ${expires}`,
      AuthService.name
    );
    this.logger.info(`User with email ${email} logged in`, AuthService.name);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      sessionToken: token,
    };
  }

  async logout(sessionToken: string) {
    const session = await Session.findOne({ sessionToken });

    if (!session) {
      throw new AppError('Logout failed, session not found', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const account = await Account.findOne({ userId: session.userId });

    if (!account) {
      throw new AppError('Logout failed, account not found', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    // delete account.expiresAt;
    // delete account.sessionState;

    account.expiresAt = undefined;
    account.sessionState = 'inactive';

    const updatedAccount = await account.save();

    if (!updatedAccount) {
      throw new AppError('Failed to update account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`Account with id ${account.userId} logged out`, AuthService.name);

    const deletedSession = await Session.deleteOne({ sessionToken });

    if (!deletedSession) {
      throw new AppError('Failed to delete session', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`Deleted session with id ${session.id}`, AuthService.name);
  }

  async refreshToken(refreshToken: string) {
    console.log({ refreshToken });
    // const decoded = this.tokenService.verifyRefreshToken(refreshToken);

    // if (!decoded.user) {
    //   throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    // }

    // const user = await User.findById(decoded.user.id);

    // if (!user) {
    //   throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, {
    //     email: decoded.user.email,
    //   });
    // }

    // const accessToken = this.tokenService.generateAccessToken();

    // this.logger.info(`User with email ${user.email} refreshed token`, AuthService.name);

    // return accessToken;
    return {
      token: 'accessToken',
      expires: 'sadda',
    };
  }

  async verifyEmail(userId: string, token: string) {
    if (!userId || !token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
    const foundToken = await VerificationToken.findOne({ userId });

    if (!foundToken) {
      throw new AppError('Verification token not found', STATUS_CODES.NOT_FOUND);
    }

    const result = foundToken.verifyToken(token);

    if (!result.success) {
      throw new AppError(result.message, STATUS_CODES.UNAUTHORIZED);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { userId });
    }

    const linked = await user.linkAccount(userId, user.email);

    if (!linked) {
      throw new AppError('Failed linking account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    user.emailVerified = true;
    await user.save();

    const deletedToken = await VerificationToken.deleteOne({ userId });

    if (!deletedToken) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`User with id ${userId} verified email`, AuthService.name);
  }
}
