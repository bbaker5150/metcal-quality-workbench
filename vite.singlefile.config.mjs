import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { hardenInlineHtml } from './scripts/hardenInlineHtml.mjs';
import { forgeRuntime } from './scripts/forgeRuntime.mjs';

// ---------------------------------------------------------------------------
// The deliverable: one self-contained HTML file for a SharePoint library.
// ---------------------------------------------------------------------------
// The page is rendered inside an <iframe srcdoc>, which has no URL of its own,
// so every relative asset request would fail. Everything therefore has to be
// inlined — scripts, styles, and the seal as a data URI.
//
// Plugin order is load-bearing and matches the uncertainty tool's, which was
// arrived at the hard way:
//   viteSingleFile   inlines the bundle
//   hardenInlineHtml escapes anything a sanitiser could read as markup
//   rename           gives the file the name it ships under
//   forgeRuntime     injects the runtime + manifest, last, so the manifest
//                    names the final filename and its bytes are not rewritten

const buildStamp = () => {
  if (process.env.BUILD_STAMP) return process.env.BUILD_STAMP;
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return `${sha} ${new Date().toISOString().slice(0, 16)}Z`;
  } catch {
    return `local ${new Date().toISOString().slice(0, 16)}Z`;
  }
};

const OUTPUT = 'metcal-quality.html';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    viteSingleFile({ removeViteModuleLoader: true }),
    hardenInlineHtml(),
    {
      name: 'name-single-file-output',
      enforce: 'post',
      generateBundle(_options, bundle) {
        const entry = bundle['index.html'];
        if (!entry) return;
        delete bundle['index.html'];
        entry.fileName = OUTPUT;
        bundle[OUTPUT] = entry;
      },
    },
    forgeRuntime({ project: 'METCAL Quality', build: buildStamp(), globalName: '__METCAL_BUILD__' }),
  ],
  build: {
    outDir: 'build-singlefile',
    emptyOutDir: true,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(process.cwd(), 'index.html'),
      output: { inlineDynamicImports: true },
    },
    chunkSizeWarningLimit: 16384,
  },
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
});
