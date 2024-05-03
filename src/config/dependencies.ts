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
  AccountService: Symbol.for('AccountService'),
  TokenService: Symbol.for('TokenService'),
};

const repositories = {
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  TokenRepository: Symbol.for('TokenRepository'),
  AccountRepository: Symbol.for('AccountRepository'),
};

export const INTERFACE_TYPE = {
  ...controllers,
  ...services,
  ...repositories,
};
