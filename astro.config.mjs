import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: dominio definitivo (serve per sitemap, canonical e Open Graph).
  site: 'https://example.com',
  // Per GitHub Pages in un sottopercorso: base: '/nome-repo'
  integrations: [sitemap()],
  // Lets a parent's scoped styles reach the root element of a child component via `class`.
  scopedStyleStrategy: 'class',
});
