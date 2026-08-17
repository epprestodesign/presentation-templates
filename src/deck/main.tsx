/* globals.css FIRST, before any component import.
 *
 * ES imports execute in order, so a stylesheet imported last is injected last
 * and wins every equal-specificity contest. With it at the bottom, typography's
 * `.ds-text-*` colour rule out-cascaded DataTable's `.headerCell`, and every
 * tinted table rendered black text on its black header bar — present in the DOM,
 * invisible on screen. Storybook was unaffected only because preview.tsx happens
 * to import it first; this file now matches. The specificity fix in
 * DataTable.module.css means neither file has to stay lucky. */
import '../styles/globals.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from '../lib/muiTheme'
import { Player } from './Player'
import { meta, slides } from './slides'

/* The same MUI theme Storybook installs. Without it any chart or grid inside a
   slide renders in MUI's default blue and Roboto — visibly off-brand, and only
   in the deck, which is the worst place to discover it. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <Player meta={meta} slides={slides} />
    </ThemeProvider>
  </StrictMode>
)
