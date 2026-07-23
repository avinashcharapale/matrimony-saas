/**
 * Authentication Module Exports
 *
 * Password hashing and JWT generation are handled by the .NET Backend.
 * This module only provides: token verification, permission lookups, middleware.
 */

export * from './types';
export * from './crypto.util';
export * from './jwt.util';
export * from './database';
export * from './middleware';
export * from './routes';
export * from './config';

export { AuthDatabase } from './database';
export { CryptoUtil } from './crypto.util';
export { JwtUtil } from './jwt.util';
export { AuthorizationService } from './authorization.service';
