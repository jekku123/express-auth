import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../config/dependencies';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';

import AppError from '../config/errors/AppError';
import { IUser } from '../models/user';

import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { ITokenService } from '../types/ITokenService';
import { IUserEntity } from '../types/IUserEntity';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  private loggerService: ILoggerService;
  private mailerService: IMailerService;
  private tokenService: ITokenService;
  private userRepository: IUserRepository;
  private userEntity: IUserEntity;

  constructor(
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService,
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService,
    @inject(INTERFACE_TYPE.UserRepository) userRepository: IUserRepository,
    @inject(INTERFACE_TYPE.UserEntity) userEntity: IUserEntity
  ) {
    this.loggerService = loggerService;
    this.mailerService = mailerService;
    this.tokenService = tokenService;
    this.userRepository = userRepository;
    this.userEntity = userEntity;
  }

  async createUser(email: string, password: string): Promise<IUser> {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findOne({ email });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }

    const user = await this.userRepository.create(email, password);
    const { identifier, token } = await this.tokenService.generateVerificationToken(email);

    await this.mailerService.sendVerificationEmail(identifier, token);

    this.loggerService.info(`User with email ${email} registered`, UserService.name);

    return user;
  }

  async getUserProfile(id: string): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ _id: id });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return user;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const user = await this.userRepository.findOne({ _id: id });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return user;
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser> {
    const user = await this.userRepository.findOne({ _id: userId });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const isPasswordValid = await Bun.password.verify(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const updatedUser = await this.userRepository.update(userId, { password: newPassword });

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    this.loggerService.info(`User with email ${user.email} updated password`, UserService.name);

    return updatedUser;
  }

  async setEmailVerified(userId: string): Promise<IUser> {
    const user = await this.userRepository.update(userId, { emailVerified: true });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    this.loggerService.info(`User with id ${userId} email verified`, UserService.name);

    return user;
  }
}
