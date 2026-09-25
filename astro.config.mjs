import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://error420notfound.github.io',
  // GitHub Pages serves this project from /chroma, while local dev runs at /
  base: process.env.NODE_ENV === 'development' ? '/' : '/chroma',
  output: 'static',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
