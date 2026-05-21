import express from 'express';
import mssql from 'mssql';
import type { SignOptions } from 'jsonwebtoken';
import {
  AuthenticationService,
  OAuth2Service,
  AuthorizationService,
  AuthDatabase,
  createAuthRoutes,
  securityMiddleware,
  errorHandlerMiddleware,
  loadAuthConfig,
} from './auth';
import { createProfileRoutes } from './profiles';
import { createGeoRoutes } from './geo';
import { createMasterRoutes } from './master';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();

// Configuration
const authConfig = loadAuthConfig();

// Database configuration
const dbConfig: mssql.config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'MatrimonySaaS',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
    },
  },
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  },
};

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(securityMiddleware);

// Legacy CORS configuration (can extract to middleware function)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database and services
let authServices: {
  authService: AuthenticationService;
  oauth2Service: OAuth2Service;
  authzService: AuthorizationService;
  authDb: AuthDatabase;
  pool: mssql.ConnectionPool;
} | null = null;

async function initializeServices() {
  try {
    // Connect to database
    const pool = new mssql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✓ Database connected');

    // Initialize services
    const authDb = new AuthDatabase(pool);

    const authService = new AuthenticationService(authDb, {
      jwtSecret: authConfig.jwt.secret,
      jwtExpiresIn: authConfig.jwt.expiresIn as SignOptions['expiresIn'],
      refreshTokenSecret: authConfig.refreshToken.secret,
      refreshTokenExpiresIn: authConfig.refreshToken.expiresIn as SignOptions['expiresIn'],
      encryptionKey: authConfig.encryption.key,
      sessionExpiresInMs: authConfig.session.expiresInMs,
    });

    const oauth2Service = new OAuth2Service(authDb, {
      jwtSecret: authConfig.jwt.secret,
      jwtExpiresIn: authConfig.jwt.expiresIn as SignOptions['expiresIn'],
      refreshTokenSecret: authConfig.refreshToken.secret,
      refreshTokenExpiresIn: authConfig.refreshToken.expiresIn as SignOptions['expiresIn'],
      sessionExpiresInMs: authConfig.session.expiresInMs,
    });

    const authzService = new AuthorizationService(authDb);

    authServices = {
      authService,
      oauth2Service,
      authzService,
      authDb,
      pool,
    };

    console.log('✓ Authentication services initialized');

    // Setup routes
    setupRoutes();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

function setupRoutes() {
  if (!authServices) {
    throw new Error('Services not initialized');
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API info
  app.get('/', (req, res) => {
    res.json({
      message: 'Matrimony SaaS API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        health: '/health',
      },
    });
  });

  // Authentication routes
  const authRoutes = createAuthRoutes(
    authServices.authDb,
    authServices.authService,
    authServices.oauth2Service,
    authServices.authzService
  );
  app.use('/api/auth', authRoutes);

  // Profile routes
  const profileRoutes = createProfileRoutes(authServices.pool, authServices.authDb);
  app.use('/api/profiles', profileRoutes);

  // Geographic lookup routes (public)
  const geoRoutes = createGeoRoutes(authServices.pool);
  app.use('/api/geo', geoRoutes);

  // Master data lookup routes (public read, admin write)
  const masterRoutes = createMasterRoutes(authServices.pool);
  app.use('/api/master', masterRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: req.path,
    });
  });

  // Error handler
  app.use(errorHandlerMiddleware);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
async function start() {
  try {
    await initializeServices();

    app.listen(port, host, () => {
      console.log(`✓ Server running at http://${host}:${port}`);
      console.log(`✓ API documentation: http://${host}:${port}/api-docs (when available)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
