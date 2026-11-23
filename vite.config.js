import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  // relative asset paths: dist/ can be served from any sub-path on a lab site
  base: './',
});
