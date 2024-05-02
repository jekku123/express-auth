export interface IUserEntity {
  id: string;
  email: string;
  password: string;
  emailVerified: boolean;
  updatePassword(newPassword: string): Promise<void>;
  save(): Promise<void>;
}
