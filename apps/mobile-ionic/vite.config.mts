/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/mobile-ionic',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  server: {
    proxy: {
      '/identity': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/tenant': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/profile': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/subscription': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/match': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/chat': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
      '/gateway': { target: 'http://127.0.0.1:8000', secure: false, changeOrigin: true },
    },
  },
  test: {
    name: 'mobile-ionic',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/mobile-ionic',
      provider: 'v8' as const,
    },
  },
}));
