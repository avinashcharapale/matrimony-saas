# Dependencies to Install

Add these to your package.json dependencies:

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.1.2",
    "axios": "^1.7.2",
    "mssql": "^10.0.1",
    "express": "^4.21.2",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.7",
    "@types/express": "^4.17.22",
    "@types/node": "^20.12.12",
    "@types/bcrypt": "^5.0.2"
  }
}
```

## Installation Commands

```bash
# Install JSON Web Token support
npm install jsonwebtoken @types/jsonwebtoken

# Install HTTP client
npm install axios

# Install SQL Server driver
npm install mssql

# Install bcrypt for password hashing (optional but recommended)
npm install bcrypt @types/bcrypt

# If you haven't already
npm install express @types/express
```

## Verification

After installation, verify with:

```bash
npm list jsonwebtoken
npm list mssql
npm list axios
npm list bcrypt
```

## Using bcrypt Instead of PBKDF2

Update `crypto.util.ts` after installing bcrypt:

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export class CryptoUtil {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  // ... rest of the utilities
}
```

This is more secure and battle-tested.
