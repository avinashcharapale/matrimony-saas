// Proxy configuration for Angular dev server (Angular 21 / Vite-based)
// Uses array format with `context` which Angular's normalizeProxyConfiguration
// explicitly supports and converts to Vite-compatible object format.
module.exports = [
  {
    context: ['/api'],
    target: 'http://localhost:8000',
    secure: false,
    changeOrigin: true,
  },
];
