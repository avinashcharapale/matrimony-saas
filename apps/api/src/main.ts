import express from 'express';
import mssql from 'mssql';
import {
  AuthorizationService,
  AuthDatabase,
  createAuthRoutes,
  securityMiddleware,
  errorHandlerMiddleware,
  loadAuthConfig,
  JwtUtil,
} from './auth';
import { createProfileRoutes } from './profiles';
import { createGeoRoutes } from './geo';
import { createMasterRoutes } from './master';
import { createMasterDataRoutes } from './master/master-data.routes';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const app = express();

// Load config and initialize JWT verification against .NET Backend
const authConfig = loadAuthConfig();
JwtUtil.initialize({
  secret: authConfig.dotnetJwtSecret,
  issuer: authConfig.dotnetJwtIssuer,
  audience: authConfig.dotnetJwtAudience,
});

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

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Tenant-Id, X-Tenant-Host'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database and services
let services: {
  authDb: AuthDatabase;
  authzService: AuthorizationService;
  pool: mssql.ConnectionPool;
} | null = null;

async function initializeServices() {
  try {
    const pool = new mssql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✓ Database connected');

    const authDb = new AuthDatabase(pool);
    const authzService = new AuthorizationService(authDb);

    services = { authDb, authzService, pool };

    console.log('✓ Services initialized (.NET JWT verification ready)');
    setupRoutes();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

function setupRoutes() {
  if (!services) {
    throw new Error('Services not initialized');
  }

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API info
  app.get('/', (_req, res) => {
    res.json({
      message: 'Matrimony SaaS API',
      version: '1.0.0',
      auth: 'Delegated to .NET Backend (/identity/Auth/*)',
      endpoints: {
        auth: '/api/auth',
        profiles: '/api/profiles',
        master: '/api/master',
        geo: '/api/geo',
        health: '/health',
      },
    });
  });

  // Auth routes (minimal — just /me, /health)
  app.use('/api/auth', createAuthRoutes());

  // Protected routes
  const { authDb, pool } = services;
  app.use('/api/profiles', createProfileRoutes(pool, authDb));
  app.use('/api/geo', createGeoRoutes(pool));
  app.use('/api/master', createMasterRoutes(pool, authDb));
  app.use('/api/master-data', createMasterDataRoutes(pool));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      code: 'NOT_FOUND',
      path: _req.path,
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
      console.log(`  Auth: delegated to .NET Backend`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
