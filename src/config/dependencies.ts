const controllers = {
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
};

const services = {
  AuthService: Symbol.for('AuthService'),
  UserService: Symbol.for('UserService'),
  TokenService: Symbol.for('TokenService'),
  Logger: Symbol.for('Logger'),
};

export const INTERFACE_TYPE = {
  ...controllers,
  ...services,
};