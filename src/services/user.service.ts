import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../config/dependencies';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';

import AppError from '../config/errors/AppError';
import User, { IUser } from '../models/user';

import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { ITokenService } from '../types/ITokenService';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  private logger: ILoggerService;
  private mailerService: IMailerService;
  private tokenService: ITokenService;

  constructor(
    @inject(INTERFACE_TYPE.Logger) logger: ILoggerService,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService,
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService
  ) {
    this.logger = logger;
    this.mailerService = mailerService;
    this.tokenService = tokenService;
  }

  async createUser(email: string, password: string): Promise<IUser> {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }

    const user = new User({ email, password });
    const savedUser = await user.save();

    if (!savedUser) {
      throw new AppError('User not saved', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const token = await this.tokenService.generateToken(email);

    await this.mailerService.sendVerificationEmail(token.identifier, token.token);

    this.logger.info(`User with email ${email} registered`, UserService.name);

    return savedUser;
  }

  async getUserProfile(id: string): Promise<IUser> {
    const user = await User.findById(id);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { id });
    }

    return user;
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser> {
    const user = await User.findById(userId);

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
