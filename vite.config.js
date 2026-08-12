import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Root Vite config — LOAD-BEARING for Storybook. @storybook/vue3-vite
// auto-detects and merges this as the base config for its build, and it is
// what supplies the @vitejs/plugin-vue instance. Without it every .vue import
// fails with "Failed to parse source for import analysis / Install
// @vitejs/plugin-vue to handle .vue files". Do not delete.
//
// (There is no standalone app entry or index.html at the root; the deck
// player has its own config in vite.deck.config.js.)
export default defineConfig({
  plugins: [vue()],
})
