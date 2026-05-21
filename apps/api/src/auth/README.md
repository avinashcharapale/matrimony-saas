# JWT & OAuth2 Authentication System

Complete JWT and OAuth2 authentication and authorization system for the Matrimony SaaS API.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Security](#security)
- [Configuration](#configuration)

## ✨ Features

### Authentication
- ✅ Email/Password login & registration
- ✅ JWT access tokens with refresh tokens
- ✅ Session management with device tracking
- ✅ Multi-factor authentication support (TOTP, WebAuthn)
- ✅ OAuth2 integration (Google, Facebook, Microsoft)
- ✅ API key generation for service-to-service auth
- ✅ Automatic token refresh
- ✅ Token revocation & logout

### Authorization
- ✅ Fine-grained permission management
- ✅ Role-based access control
- ✅ Permission expiration support
- ✅ Resource ownership checks
- ✅ Tenant-based access control
- ✅ Super admin privileges

### Security
- ✅ PBKDF2 password hashing (upgrade to bcrypt in production)
- ✅ Token hashing (never store plain tokens)
- ✅ AES-256 encryption for sensitive data
- ✅ Rate limiting
- ✅ CORS & security headers
- ✅ XSS protection
- ✅ CSRF protection ready
- ✅ Audit logging

## 🏗️ Architecture

### File Structure

```
apps/api/src/auth/
├── types.ts                    # TypeScript interfaces
├── crypto.util.ts             # Password & token hashing
├── jwt.util.ts                # JWT generation & validation
├── database.ts                # Database access layer
├── authentication.service.ts   # Core auth logic
├── oauth2.service.ts          # OAuth2 flows
├── authorization.service.ts   # Permission checking
├── middleware.ts              # Express middleware
├── routes.ts                  # API routes
├── config.ts                  # Configuration
└── index.ts                   # Barrel exports
```

### Components

#### **CryptoUtil**
- Password hashing (PBKDF2)
- Token generation & hashing
- Data encryption/decryption
- API key generation

#### **JwtUtil**
- Access token generation
- Refresh token generation
- Token verification
- Token expiration checks

#### **AuthDatabase**
- Database operations
- Token storage/retrieval
- Session management
- Permission queries
- OAuth2 token storage

#### **AuthenticationService**
- User login/registration
- Token refresh
- Logout & token revocation
- Password change

#### **OAuth2Service**
- OAuth2 authorization flows
- Provider configuration
- Token exchange
- User info retrieval

#### **AuthorizationService**
- Permission checking
- Permission caching
- Role-based access
- Tenant access control

#### **Middleware**
- JWT authentication
- API key authentication
- Permission checking
- Rate limiting
- Security headers

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install jsonwebtoken axios mssql
npm install --save-dev @types/jsonwebtoken @types/node
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret-key-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d
ENCRYPTION_KEY=your-encryption-key-min-32-chars

# Database
DB_SERVER=localhost
DB_NAME=MatrimonySaaS
DB_USER=sa
DB_PASSWORD=your-password

# OAuth2 Providers
OAUTH2_GOOGLE_CLIENT_ID=...
OAUTH2_GOOGLE_CLIENT_SECRET=...
```

### 3. Database Setup

Run the SQL schema:
```bash
# Using SSMS or sqlcmd
sqlcmd -S localhost -U sa -P your-password -i apps/api/sql/register_form_schema_mssql_single.sql
```

The schema includes all required tables:
- `Users`
- `RefreshTokens`
- `UserSessions`
- `OAuth2Tokens`
- `OAuth2Providers`
- `Permissions`
- `UserPermissions`
- `ApiKeys`
- `AuthenticationMethods`
- `LoginHistory`

### 4. Start Server

```bash
npm start apps/api
# or
nx serve api
```

## 📡 API Endpoints

### Authentication

#### **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "device-uuid",
  "deviceInfo": "Chrome on Windows"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600000,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "tenantId": 1
  }
}
```

#### **Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "tenantId": 1
}

Response: Same as login response
```

#### **Refresh Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 3600000,
  "tokenType": "Bearer"
}
```

#### **Logout**
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "message": "Logged out successfully"
}
```

#### **Change Password**
```http
POST /api/auth/change-password
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "oldPassword": "currentPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}

Response:
{
  "message": "Password changed successfully"
}
```

#### **Get Current User**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGc...

Response:
{
  "id": 1,
  "email": "user@example.com",
  "tenantId": 1,
  "isSuperAdmin": false,
  "isActive": true,
  "permissions": ["PROFILE_VIEW", "PROFILE_EDIT"]
}
```

#### **Get Permissions**
```http
GET /api/auth/permissions
Authorization: Bearer eyJhbGc...

Response:
{
  "permissions": ["PROFILE_VIEW", "PROFILE_EDIT", "MESSAGE_SEND"],
  "count": 3
}
```

#### **Validate Token**
```http
GET /api/auth/validate
Authorization: Bearer eyJhbGc...

Response:
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "tenantId": 1
  },
  "permissions": ["PROFILE_VIEW"]
}
```

### OAuth2

#### **Get Authorization URL**
```http
POST /api/auth/oauth2/authorize/google
Content-Type: application/json

{
  "redirectUri": "http://localhost:4200/auth/callback",
  "state": "random-state-string"
}

Response:
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### **Handle Callback**
```http
POST /api/auth/oauth2/callback/google
Content-Type: application/json

{
  "code": "authorization-code",
  "redirectUri": "http://localhost:4200/auth/callback"
}

Response: Same as login response
```

### API Keys

#### **Create API Key**
```http
POST /api/auth/api-keys
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "keyName": "Development API Key",
  "scope": "PROFILE_VIEW,MESSAGE_SEND",
  "rateLimit": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"
}

Response:
{
  "apiKeyId": 123,
  "key": "sk_abc123def456...",
  "prefix": "sk",
  "keyName": "Development API Key",
  "scope": "PROFILE_VIEW,MESSAGE_SEND",
  "rateLimit": 1000,
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

## 📚 Usage Examples

### In Frontend (Angular)

```typescript
// Login
this.http.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
}).subscribe(response => {
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
});

// Add token to requests
const headers = new HttpHeaders({
  'Authorization': `Bearer ${accessToken}`
});

// Refresh token
this.http.post('/api/auth/refresh', {
  refreshToken: localStorage.getItem('refreshToken')
}).subscribe(response => {
  localStorage.setItem('accessToken', response.accessToken);
});
```

### In Backend (Express)

```typescript
// Using auth middleware
app.get('/api/profiles/:id', authMiddleware(db), (req, res) => {
  // req.auth contains user context
  console.log(req.auth.userId);
  console.log(req.auth.permissions);
});

// Checking permissions
app.post('/api/profiles', 
  authMiddleware(db),
  requirePermission('PROFILE_CREATE'),
  (req, res) => {
    // Only users with PROFILE_CREATE can access
  }
);

// Optional auth
app.get('/api/profiles', optionalAuthMiddleware(db), (req, res) => {
  if (req.auth) {
    // User authenticated
  } else {
    // Anonymous access
  }
});
```

## 🔒 Security

### Best Practices

1. **Never expose plain tokens** - Always hash before storing
2. **Use HTTPS in production** - Prevent token interception
3. **Set strong secrets** - Minimum 32 characters
4. **Rotate secrets regularly** - Implement secret rotation
5. **Monitor token usage** - Log all auth operations
6. **Implement rate limiting** - Prevent brute force attacks
7. **Use secure cookies** - For web apps (HttpOnly, Secure, SameSite)
8. **Validate all inputs** - Prevent injection attacks

### Token Security

- Access tokens: Short-lived (1 hour default)
- Refresh tokens: Long-lived (7 days default)
- Tokens hashed before storage
- Revocation support for immediate logout
- Session tracking for fraud detection

### Password Security

- PBKDF2 hashing with 100,000 iterations (upgrade to bcrypt)
- Random salt per password
- Constant-time comparison
- Password requirements enforced

## ⚙️ Configuration

### JWT Settings

```typescript
{
  jwt: {
    secret: 'min-32-character-secret-key',
    expiresIn: '1h'  // 1h, 1d, 7d, etc.
  },
  refreshToken: {
    secret: 'min-32-character-secret-key',
    expiresIn: '7d'
  },
  session: {
    expiresInMs: 24 * 60 * 60 * 1000  // 24 hours
  }
}
```

### OAuth2 Configuration

Add providers in database:
```sql
INSERT INTO dbo.OAuth2Providers (TenantId, ProviderName, ClientId, ClientSecret, AuthorizationUrl, TokenUrl, UserInfoUrl, RedirectUrl, Scope, IsEnabled)
VALUES (1, 'google', 'client-id', 'client-secret', 'https://accounts.google.com/o/oauth2/v2/auth', '...', '...', 'http://localhost:4200/auth/callback', 'openid profile email', 1);
```

### Permissions

Define permissions in database:
```sql
INSERT INTO dbo.Permissions (TenantId, PermissionCode, DisplayName, ResourceType, Action, IsActive)
VALUES (1, 'PROFILE_VIEW', 'View Profile', 'Profile', 'View', 1);
```

Grant to users:
```sql
INSERT INTO dbo.UserPermissions (UserId, PermissionId, GrantedAt)
VALUES (1, 1, SYSUTCDATETIME());
```

## 📖 Next Steps

1. ✅ Review database schema
2. ✅ Configure environment variables
3. ✅ Test auth endpoints
4. ✅ Implement frontend auth flows
5. ✅ Add audit logging
6. ✅ Set up monitoring
7. ✅ Deploy to production

## 🤝 Contributing

For improvements or bug reports, please create an issue.

## 📄 License

MIT
