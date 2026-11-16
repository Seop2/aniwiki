import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import sitemap from './scripts/sitemap.js';
import netflixOriginals from './scripts/netflixOriginals.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return { plugins: [react(), sitemap(env), netflixOriginals(env)] };
});
