const controllers = {
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};

const services = {
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  LoggerService: Symbol.for('LoggerService'),
  MailerService: Symbol.for('MailerService'),
  EmailVerificationService: Symbol.for('EmailVerificationService'),
  SessionService: Symbol.for('SessionService'),
  PasswordResetService: Symbol.for('PasswordResetService'),
};

const repositories = {
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  EmailVerificationRepository: Symbol.for('EmailVerificationRepository'),
  PasswordResetRepository: Symbol.for('PasswordResetRepository'),
};

export const INTERFACE_TYPE = {
  ...controllers,
  ...services,
  ...repositories,
};
