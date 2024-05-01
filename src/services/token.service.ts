// import crypto from 'crypto';
// import { injectable } from 'inversify';
// import { ITokenService } from '../types/ITokenService';

// @injectable()
// export class TokenService implements ITokenService {
//   // 15 minutes
//   public static SESSION_TOKEN_EXPIRES = 15 * 60 * 1000;

//   // 5 minutes
//   public static SESSION_EXPIRATION_THRESHOLD = 5 * 60 * 1000;

//   generateSessionId() {
//     const rand64 = crypto.randomBytes(64).toString('base64');
//     const expires = new Date(Date.now() + TokenService.SESSION_TOKEN_EXPIRES).toISOString();

//     return {
//       token: rand64,
//       expires,
//     };
//   }
// }
