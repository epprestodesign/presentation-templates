import type { ReactNode } from 'react'

/**
 * One slide in a rendered deck.
 *
 * `render` is a function rather than a ReactNode so a slide is only constructed
 * when the player actually shows it. With 40 slides of charts and diagrams that
 * is the difference between a deck that opens instantly and one that mounts
 * every MUI chart in the presentation before painting the first frame.
 *
 * Authored as JSX rather than as a name-plus-props registry, deliberately: the
 * templates are typed, and JSX gets that checking for free. A registry would
 * turn every prop into `unknown` and move the errors to runtime. The PPTX
 * emitter has its own flat spec for the same slides — see scripts/deck-spec.mjs
 * — because an exporter genuinely cannot read React props, but a browser can.
 */
export interface DeckSlide {
  /** Stable slug. Appears in the URL, so it must not change casually — a link
   *  to a slide is the main way one gets shared. */
  id: string
  /** Shown in the overview grid and the browser title. */
  title: string
  /** Speaker notes. Presenter-only; never rendered on the slide itself. */
  notes?: string
  render: () => ReactNode
  /** Live links for this slide, rendered by the player as a clickable strip
   *  under the artboard.
   *
   *  On the slide itself a URL can only ever be text; the strip is what makes it
   *  usable during a talk, and it keeps the artboard clean because the slide does
   *  not have to carry a legible full URL. Presenter-facing, like `notes` — it is
   *  chrome, not part of the exported slide. */
  links?: { label: string; href: string }[]
}

export interface DeckMeta {
  title: string
  subtitle?: string
}
