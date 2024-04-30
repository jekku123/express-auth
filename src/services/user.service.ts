import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../config/dependencies';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';

import AppError from '../config/errors/AppError';
import User, { UserType } from '../models/user';

import { ILogger } from '../types/ILogger';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  private logger: ILogger;

  constructor(@inject(INTERFACE_TYPE.Logger) logger: ILogger) {
    this.logger = logger;
  }

  async register(email: string, password: string): Promise<UserType> {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await User.findOne({ email });

    if (user) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }

    const userObj = new User({ email, password });

    await userObj.createVerificationToken(userObj.id);

    const newUser = await userObj.save();

    if (!newUser) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`User with email ${email} registered`, UserService.name);

    return newUser;
  }

  async getUserProfile(id: string): Promise<UserType> {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { id });
    }

    this.logger.info(`User with id ${id} fetched`, UserService.name);

    return user;
  }

  async updatePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<UserType | null> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { email });
    }

    if (!user || !(await Bun.password.verify(oldPassword, user.password))) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const hashedPassword = await Bun.password.hash(newPassword);
    const updatedUser = await User.findOneAndUpdate(
      {
        email,
      },
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`User with email ${email} updated password`, UserService.name);

    return updatedUser;
  }
}
