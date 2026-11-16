import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from './scripts/sitemap.js';

export default defineConfig(({ mode }) => ({
  plugins: [react(), sitemap(loadEnv(mode, process.cwd(), 'VITE_'))],
}));
