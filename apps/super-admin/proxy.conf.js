const ANGULAR_ROUTES = ['/tenants', '/platform-admins', '/platform-roles', '/platform-permissions', '/analytics', '/system', '/login'];

module.exports = {
  '/api': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/identity': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/tenant': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
    bypass: (req) => {
      if (ANGULAR_ROUTES.some(r => req.url.startsWith(r))) {
        return req.url;
      }
    },
  },
  '/profile': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/subscription': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/billing': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/match': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/chat': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
};
