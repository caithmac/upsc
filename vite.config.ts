import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/upsc/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
