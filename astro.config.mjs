import { defineConfig } from 'astro/config';

export default defineConfig({
  // The organization site is served from the root of this domain.
  site: 'https://gloaming-dusk.github.io',
  // Keep the spaces where prose breaks before an inline tag ("or <code>dd</code>").
  compressHTML: false,
});
