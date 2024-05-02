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

@injectable()
export class AuthService implements IAuthService {
  private logger: ILogger;

  constructor(@inject(INTERFACE_TYPE.Logger) logger: ILogger) {
    this.logger = logger;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await User.findByEmail(email);

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

    const session = new Session({
      userId: user.id,
    });

    account.expiresAt = session.expiresAt;
    account.sessionState = 'active';

    const updatedAccount = await account.save();

    if (!updatedAccount) {
      throw new AppError('Failed to update account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const savedSession = await session.save();

    if (!savedSession) {
      throw new AppError('Failed to create session', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      sessionId: session.sessionId,
    };
  }

  async logout(sessionId: string) {
    const session = await Session.findOne({ sessionId });

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

    const deletedSession = await Session.deleteOne({ sessionId });

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

  async verifyEmail(token: string) {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
    const existingToken = await VerificationToken.findOne({ token });

    if (!existingToken) {
      throw new AppError('Verification token not found', STATUS_CODES.NOT_FOUND);
    }

    const hasExpired = existingToken.expiresAt < new Date(Date.now());

    if (hasExpired) {
      throw new AppError('Verification token expired', STATUS_CODES.UNAUTHORIZED);
    }

    const existingUser = await User.findByEmail(existingToken.identifier);

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, {
        email: existingToken.identifier,
      });
    }

    existingUser.emailVerified = true;

    const linked = await existingUser.linkAccount(existingUser.id, existingUser.email);

    if (!linked) {
      throw new AppError('Failed linking account', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    await existingUser.save();
    await VerificationToken.deleteOne({ token: existingToken.token });

    this.logger.info(
      `User with email ${existingUser.email} has verified an account`,
      AuthService.name
    );
  }
}
