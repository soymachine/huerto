import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://soymachine.github.io',
  base: '/huerto',
  integrations: [react()],
});
