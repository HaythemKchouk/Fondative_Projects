import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const PORT = 3039;

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      // toute requête sur /api/... sera redirigée vers http://localhost:3000/api/...
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // on ne fait PAS de rewrite, on laisse /api tel quel
      },
      '/argo': {
        target: 'https://localhost:8080',
        changeOrigin: true,
        secure: false, // Ignore SSL errors
        rewrite: (path) => path.replace(/^\/argo/, '')
      }
    },
  },
  preview: {
    port: PORT,
    host: true,
  },
});
