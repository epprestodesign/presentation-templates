import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Root Vite config — LOAD-BEARING for Storybook. @storybook/react-vite
// auto-detects and merges this as the base config for its build, and it is
// what supplies the React plugin. Without it every .tsx import fails to
// parse. Do not delete.
//
// (There is no standalone app entry or index.html at the root; the deck
// player has its own config in vite.deck.config.ts.)
export default defineConfig({
  plugins: [react()],
})
