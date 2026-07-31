const ANGULAR_ROUTES = ['/profiles', '/subscriptions', '/subscription-plans'];

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
  '/tenant/': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/profile': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
    bypass: (req) => {
      if (ANGULAR_ROUTES.some(r => req.url.startsWith(r))) {
        return req.url;
      }
    },
  },
  '/subscription': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
    bypass: (req) => {
      if (ANGULAR_ROUTES.some(r => req.url.startsWith(r))) {
        return req.url;
      }
    },
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
