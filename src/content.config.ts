import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({
    // Shady's docs, shady-shell's, and the greeter's README as "greeter"; the
    // checkouts are described in astro.config.mjs.
    pattern: ['shady/docs/*.md', 'shady-shell/docs/*.md', 'shady-greeter/README.md'],
    base: '.',
    generateId: ({ entry }) =>
      entry.startsWith('shady-greeter/')
        ? 'greeter'
        : entry.split('/').pop()!.replace(/\.md$/i, '').toLowerCase()
  })
});

export const collections = { docs };
