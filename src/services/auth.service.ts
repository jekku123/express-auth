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

    const { accessToken, refreshToken } = this.tokenService.generateTokens();

    account.refreshToken = refreshToken.token;
    account.accessToken = accessToken.token;
    account.expiresAt = new Date(refreshToken.expires);
    account.sessionState = 'active';

    const updatedAccount = await account.save();

    if (!updatedAccount) {
      throw new AppError('Failed to update account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const session = Session.create({
      userId: user.id,
      sessionToken: accessToken.token,
      expiresAt: accessToken.expires,
    });

    if (!session) {
      throw new AppError('Failed to create session', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(
      `Session created for user with email ${email}\n
        sessionToken: ${accessToken.token}\n
        expiresAt: ${accessToken.expires}`,
      AuthService.name
    );
    this.logger.info(`User with email ${email} logged in`, AuthService.name);

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    const session = await Session.findOne({ userId });

    if (!session) {
      throw new AppError('Logout failed, session not found', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const account = await Account.findOne({ userId });

    if (!account) {
      throw new AppError('Logout failed, account not found', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    account.refreshToken = undefined;
    account.accessToken = undefined;
    account.expiresAt = undefined;
    account.sessionState = 'inactive';

    const updatedAccount = await account.save();

    if (!updatedAccount) {
      throw new AppError('Failed to update account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`Account with id ${account.userId} logged out`, AuthService.name);

    const deletedSession = await Session.deleteOne({ _id: session.id });

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

    await foundToken.verifyToken(token);

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { userId });
    }

    user.emailVerified = true;
    const linked = await user.linkAccount(userId, user.email);

    if (!linked) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    await user.save();

    const deletedToken = await VerificationToken.deleteOne({ userId });

    if (!deletedToken) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`User with id ${userId} verified email`, AuthService.name);
  }
}
