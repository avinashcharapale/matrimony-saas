/**
 * Authentication Configuration
 *
 * The .NET Backend is the single source of truth for:
 * - Password hashing/verification (BCrypt)
 * - JWT token generation (access + refresh)
 * - User registration and login
 *
 * This config only needs the .NET JWT secret for token VERIFICATION.
 */

export interface AuthConfig {
  /** .NET Backend's JWT HMAC-SHA256 secret — must match JwtSettings:Secret in appsettings */
  dotnetJwtSecret: string;
  /** .NET Backend's JWT issuer — must match JwtSettings:Issuer */
  dotnetJwtIssuer: string;
  /** .NET Backend's JWT audience — must match JwtSettings:Audience */
  dotnetJwtAudience: string;
}

export function loadAuthConfig(): AuthConfig {
  return {
    dotnetJwtSecret: process.env.DOTNET_JWT_SECRET || 'DevSecret-ChangeThisInProduction',
    dotnetJwtIssuer: process.env.DOTNET_JWT_ISSUER || 'MatrimonialSaaS',
    dotnetJwtAudience: process.env.DOTNET_JWT_AUDIENCE || 'MatrimonialSaaSUsers',
  };
}
