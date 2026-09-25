import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://error420notfound.github.io',
  base: '/chroma',
  output: 'static',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
