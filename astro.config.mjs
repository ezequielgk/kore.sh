import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  base: '/',
  output: 'static',
  integrations: [tailwind()],
});
