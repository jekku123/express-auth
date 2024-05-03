const controllers = {
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};

const services = {
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  LoggerService: Symbol.for('LoggerService'),
  MailerService: Symbol.for('MailerService'),
  VerificationService: Symbol.for('VerificationService'),
  SessionService: Symbol.for('SessionService'),
  TokenService: Symbol.for('TokenService'),
  PasswordResetService: Symbol.for('PasswordService'),
};

const repositories = {
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  VerificationRepository: Symbol.for('VerificationRepository'),
  PasswordResetRepository: Symbol.for('PasswordResetRepository'),
};

export const INTERFACE_TYPE = {
  ...controllers,
  ...services,
  ...repositories,
};
