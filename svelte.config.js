import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Static build: every route is prerendered to plain files.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    // relative:false makes `base` a plain absolute string, so a manual {base}
    // prefix in the markup is not double-counted.
    paths: { base, relative: false }
  }
};
