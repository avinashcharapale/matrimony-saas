IIS Deployment Guide (Tenant Domain Testing)

Goal
- Run web-angular behind IIS with host-header tenant domains.
- Reverse proxy /api to Node API on localhost:3333.
- Validate login, register, and search in a prod-like flow.

Prerequisites
- Windows Server or Windows with IIS installed.
- IIS modules: URL Rewrite and ARR (Application Request Routing).
- Node.js installed on server.
- SQL Server reachable from API.

1) Publish artifacts
- From repository root:
  powershell -ExecutionPolicy Bypass -File .\scripts\publish-iis.ps1

This produces:
- Web: C:\inetpub\matrimony-saas\web-angular
- API: C:\inetpub\matrimony-saas\api

Notes:
- The script publishes the Angular browser build output from dist\apps\web-angular\browser into the IIS web root.

2) Configure IIS
- Create a new site, for example: MatrimonyWeb.
- Physical path:
  C:\inetpub\matrimony-saas\web-angular
- Add host bindings (examples):
  anandmaratha.local
  petwatch.local

Notes:
- The web.config in web-angular handles SPA fallback and proxies /api and /health to localhost:3333.
- If ARR proxy is disabled, enable it in IIS Manager:
  Server node -> Application Request Routing Cache -> Server Proxy Settings -> Enable proxy.

3) Run API process on port 3333
- Open PowerShell in:
  C:\inetpub\matrimony-saas\api
- Set environment variables (example):
  $env:HOST='127.0.0.1'
  $env:PORT='3333'
  $env:DB_SERVER='YOUR_SQL_SERVER'
  $env:DB_NAME='MatrimonySaaS'
  $env:DB_USER='YOUR_DB_USER'
  $env:DB_PASSWORD='YOUR_DB_PASSWORD'
  $env:DB_TRUST_CERT='true'
  $env:JWT_SECRET='change-me'
  $env:REFRESH_TOKEN_SECRET='change-me-too'

- Start API:
  node main.js

Production recommendation:
- Run API using PM2, NSSM, or Windows service wrapper so it auto-restarts.

4) Local DNS for tenant domains (test box)
- Edit hosts file:
  C:\Windows\System32\drivers\etc\hosts

Add:
  127.0.0.1 anandmaratha.local
  127.0.0.1 petwatch.local

5) Validate end-to-end
- Seed test tenant data first (SSMS):
  apps/api/sql/seed_test_tenant_data_mssql.sql
- Open:
  http://anandmaratha.local
  http://petwatch.local
- Register a user.
- Login.
- Run search flow.

How tenant works in current app
- Frontend resolves tenant from hostname in tenant-config.
- Frontend interceptor sends x-tenant-id and x-tenant-host for API requests.
- Backend auth routes consume x-tenant-id for login/register/oauth2.

Troubleshooting
- 502 from IIS on /api:
  API is not running on localhost:3333, or ARR proxy disabled.
- Login/register tenant mismatch:
  Verify Host header and x-tenant-id request header in browser dev tools.
- CORS issues:
  Keep same-origin routing through IIS (/api on same host) to avoid cross-origin preflight complexity.
