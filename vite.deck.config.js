import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

/**
 * The deck player build — a standalone app, separate from Storybook.
 *
 * Two things here are load-bearing:
 *
 *   `root` is src/deck, so the entry HTML lives beside the code it loads rather
 *   than at the repo root where it would compete with Storybook's own config.
 *
 *   `base` comes from DECK_BASE_PATH. GitHub Pages serves this from a SUBPATH —
 *   /presentation-templates/deck/ — and Vite emits absolute asset paths, so
 *   without a matching base the deployed page requests /assets/... , receives the
 *   404 page and renders a blank screen with nothing in the console. Same trap
 *   the Storybook build has, same fix. Unset locally, where the base is '/'.
 *
 * `publicDir` points at src/assets so the deck resolves imagery exactly as
 * Storybook does via its staticDirs — otherwise a photographic slide would work
 * in Storybook and be blank in the deck, which is the worst possible split.
 */
export default defineConfig({
  root: resolve(import.meta.dirname, 'src/deck'),
  base: process.env.DECK_BASE_PATH || '/',
  publicDir: resolve(import.meta.dirname, 'src/assets'),
  plugins: [react()],
  build: {
    // Out of the deck root, back up to a top-level folder the deploy can copy.
    outDir: resolve(import.meta.dirname, 'deck-static'),
    emptyOutDir: true,
  },
  server: { port: 6009 },
})
