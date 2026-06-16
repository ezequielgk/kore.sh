import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  base: '/v4/',
  output: 'static',
  integrations: [tailwind()],
});
