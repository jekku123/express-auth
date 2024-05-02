const controllers = {
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};

const services = {
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  LoggerService: Symbol.for('LoggerService'),
  MailerService: Symbol.for('MailerService'),
  TokenService: Symbol.for('TokenService'),
  SessionService: Symbol.for('SessionService'),
};

const repositories = {
  UserRepository: Symbol.for('UserRepository'),
  SessionRepository: Symbol.for('SessionRepository'),
  TokenRepository: Symbol.for('TokenRepository'),
};

const entities = {
  UserEntity: Symbol.for('UserEntity'),
  // Session: Symbol.for('Session'),
  // Token: Symbol.for('Token'),
};

export const INTERFACE_TYPE = {
  ...controllers,
  ...services,
  ...repositories,
  ...entities,
};
