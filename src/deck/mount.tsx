/* globals.css FIRST, before any component import.
 *
 * ES imports execute in order, so a stylesheet imported last is injected last
 * and wins every equal-specificity contest. With it at the bottom, typography's
 * `.ds-text-*` colour rule out-cascaded DataTable's `.headerCell`, and every
 * tinted table rendered black text on its black header bar — present in the DOM,
 * invisible on screen. Storybook was unaffected only because preview.tsx happens
 * to import it first.
 *
 * THIS FILE EXISTS SO THAT ORDER IS WRITTEN ONCE. Every deck entry now mounts
 * through here rather than repeating the bootstrap, because the second deck's
 * entry would have been a copy-paste of a file whose first line is load-bearing
 * for a reason nobody would re-read. Entries must import this module BEFORE
 * their own slides module — ESM evaluates an entry's imports in source order, so
 * `mount` (and with it globals.css) has to be the first import to still be
 * first at runtime.
 */
import '../styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from '../lib/muiTheme'
import { Player } from './Player'
import type { DeckMeta, DeckSlide } from './types'

/**
 * Mount a deck into `#root`.
 *
 * The MUI theme is installed here for the same reason globals.css is: without
 * it any chart or grid inside a slide renders in MUI's default blue and Roboto —
 * visibly off-brand, and only in the deck, which is the worst place to discover
 * it. A per-deck entry that forgot the provider would look correct in Storybook
 * and wrong on the projector.
 */
export function mountDeck(meta: DeckMeta, slides: DeckSlide[]) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={muiTheme}>
        <Player meta={meta} slides={slides} />
      </ThemeProvider>
    </StrictMode>
  )
}
