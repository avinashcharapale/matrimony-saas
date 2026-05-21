/**
 * Authentication Configuration
 */

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string | number;
  };
  refreshToken: {
    secret: string;
    expiresIn: string | number;
  };
  encryption: {
    key: string;
  };
  session: {
    expiresInMs: number;
  };
  oauth2: {
    providers: {
      google?: {
        clientId: string;
        clientSecret: string;
      };
      facebook?: {
        clientId: string;
        clientSecret: string;
      };
      microsoft?: {
        clientId: string;
        clientSecret: string;
      };
    };
  };
}

export function loadAuthConfig(): AuthConfig {
  return {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET || 'your-super-secret-refresh-key-change-in-production',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY || 'your-encryption-key-change-in-production',
    },
    session: {
      expiresInMs: parseInt(process.env.SESSION_EXPIRES_MS || String(24 * 60 * 60 * 1000), 10),
    },
    oauth2: {
      providers: {
        google: {
          clientId: process.env.OAUTH2_GOOGLE_CLIENT_ID || '',
          clientSecret: process.env.OAUTH2_GOOGLE_CLIENT_SECRET || '',
        },
        facebook: {
          clientId: process.env.OAUTH2_FACEBOOK_CLIENT_ID || '',
          clientSecret: process.env.OAUTH2_FACEBOOK_CLIENT_SECRET || '',
        },
        microsoft: {
          clientId: process.env.OAUTH2_MICROSOFT_CLIENT_ID || '',
          clientSecret: process.env.OAUTH2_MICROSOFT_CLIENT_SECRET || '',
        },
      },
    },
  };
}
