/**
 * Authentication Module Exports
 *
 * Password hashing and JWT generation are handled by the .NET Backend.
 * This module only provides: token verification, middleware.
 */

export * from './types';
export * from './jwt.util';
export * from './database';
export * from './middleware';
export * from './routes';
export * from './config';

export { AuthDatabase } from './database';
export { JwtUtil } from './jwt.util';
export { setAuthDatabase } from './middleware';
