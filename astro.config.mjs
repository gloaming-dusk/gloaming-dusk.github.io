import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Checkouts (or symlinks to them) of the repositories whose docs and images
// the site renders; the Pages workflow checks each out here, under its name.
const here = fileURLToPath(new URL('.', import.meta.url));
const checkout = (name) => path.resolve(here, name);
const repos = {
  '@shady': checkout('shady'),
  '@shady-shell': checkout('shady-shell'),
  '@shady-greeter': checkout('shady-greeter'),
  '@gloam': checkout('gloam'),
  '@afterglow': checkout('shady-rice-afterglow'),
  '@horizon': checkout('shady-rice-horizon')
};

const docSlug = (value) =>
  value
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/\.md$/i, '')
    .replace(/_/g, '-')
    .toLowerCase();

// Links between the docs, also across repositories, stay on the site.
const githubDoc =
  /^https:\/\/github\.com\/gloaming-dusk\/(?:shady|shady-shell)\/blob\/main\/docs\/([^/?#]+\.md)([?#].*)?$/i;
const githubGreeter = /^https:\/\/github\.com\/gloaming-dusk\/shady-greeter\/?(?:blob\/main\/README\.md)?([?#].*)?$/i;

function rewriteRepositoryDocLinks() {
  return (tree) => {
    const walk = (node) => {
      if (node?.type === 'link' && typeof node.url === 'string') {
        const doc = node.url.match(githubDoc);
        const greeter = node.url.match(githubGreeter);
        if (doc) node.url = `/docs/${docSlug(doc[1])}/${doc[2] ?? ''}`;
        else if (greeter) node.url = `/docs/greeter/${greeter[1] ?? ''}`;
        const match = node.url.match(/^([^?#]+\.md)([?#].*)?$/i);
        if (match && !match[1].startsWith('/')) {
          node.url = `/docs/${docSlug(match[1])}/${match[2] ?? ''}`;
        }
      }
      if (Array.isArray(node?.children)) node.children.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  // Set by the Pages workflow (includes any base path); used for absolute
  // canonical and social-card URLs. Optional for local builds.
  site: process.env.SITE_URL || undefined,
  vite: {
    resolve: {
      alias: repos
    },
    server: {
      fs: { allow: ['.', ...Object.values(repos)] }
    }
  },
  markdown: {
    processor: unified({
      remarkPlugins: [rewriteRepositoryDocLinks]
    }),
    shikiConfig: {
      theme: 'github-dark-default'
    }
  }
});
