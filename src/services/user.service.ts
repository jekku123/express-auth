import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../config/dependencies';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';

import AppError from '../config/errors/AppError';
import User, { UserType } from '../models/user';

import VerificationToken from '../models/verificationToken';
import { ILogger } from '../types/ILogger';
import { IMailerService } from '../types/IMailerService';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  private logger: ILogger;
  private mailerService: IMailerService;

  constructor(
    @inject(INTERFACE_TYPE.Logger) logger: ILogger,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService
  ) {
    this.logger = logger;
    this.mailerService = mailerService;
  }

  async createUser(email: string, password: string): Promise<UserType> {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }

    const user = new User({ email, password });
    const verificationToken = new VerificationToken({ identifier: email });

    const savedToken = await verificationToken.save();
    const savedUser = await user.save();

    if (!savedToken) {
      throw new AppError('Verification token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    if (!savedUser) {
      throw new AppError('User not saved', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    await this.mailerService.sendVerificationEmail(savedToken.identifier, savedToken.token);

    this.logger.info(`User with email ${email} registered`, UserService.name);

    return savedUser;
  }

  async getUserProfile(id: string): Promise<UserType> {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { id });
    }

    return user;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<UserType | null> {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (!(await user.verifyPassword(oldPassword))) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    user.password = newPassword;

    const updatedUser = await user.save();

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.logger.info(`User with email ${user.email} updated password`, UserService.name);

    return updatedUser;
  }
}
