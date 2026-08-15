// Proxy configuration for Angular 21 / Vite-based dev server
// All routes go through YARP gateway at port 8000
module.exports = {
  '/identity': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/tenant': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
  '/profile': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
    bypass: (req) => {
      if (req.url.startsWith('/profiles')) {
        return '/index.html';
      }
    },
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
  '/api': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
  },
};
