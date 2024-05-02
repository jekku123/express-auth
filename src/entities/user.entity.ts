import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { IUser } from '../models/user';
import { IUserEntity } from '../types/IUserEntity';
import { IUserRepository } from '../types/IUserRepository';

@injectable()
export class UserEntity implements IUserEntity {
  private userRepository: IUserRepository;

  // Define properties of the User entity
  private _id: string;
  private _email: string;
  private _password: string;
  private _emailVerified: boolean;

  constructor(@inject(INTERFACE_TYPE.UserRepository) userRepository: IUserRepository, user: IUser) {
    this.userRepository = userRepository;
    this._id = user._id || '';
    this._email = user.email || '';
    this._password = user.password || '';
    this._emailVerified = user.emailVerified || false;
  }

  // Method to initialize the entity with data from a user document
  load(user: IUser): void {
    this._id = user._id;
    this._email = user.email;
    this._password = user.password;
    this._emailVerified = user.emailVerified;
  }

  // Getters and setters for each property
  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  set email(newEmail: string) {
    this._email = newEmail;
  }

  get password(): string {
    return this._password;
  }

  set password(newPassword: string) {
    this._password = newPassword;
  }

  get emailVerified(): boolean {
    return this._emailVerified;
  }

  set emailVerified(isVerified: boolean) {
    this._emailVerified = isVerified;
  }

  // Method to update the user's password
  async updatePassword(newPassword: string): Promise<void> {
    this._password = newPassword;
    await this.userRepository.update(this._id, { password: newPassword });
  }

  // Method to save changes to the user repository
  async save(): Promise<void> {
    // Save changes to the repository
    await this.userRepository.update(this._id, {
      email: this._email,
      password: this._password,
      emailVerified: this._emailVerified,
    });
  }

  // Add other entity methods as needed
}
