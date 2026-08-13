/* =============================================================
 * TIER 2 — Semantic tokens + slide geometry.
 *
 * This file is the single source of truth for the whole system. Three
 * consumers read it:
 *
 *   1. scripts/build-tokens.mjs → src/css/tokens.generated.css, which is
 *      what elements and templates actually reference as var(--slide-*).
 *   2. src/lib/pptx/* — the PowerPoint / Google Slides emitter, which
 *      needs the numeric values, not CSS strings.
 *   3. The Foundations stories, which document them.
 *
 * EVERY length is expressed in px inside a 1280x720 coordinate space.
 * That is not arbitrary: 1280x720 at 96px/inch is exactly 13.333in x
 * 7.5in, which is PowerPoint's and Google Slides' 16:9 slide. So
 * 1px === 1/96in and the emitter needs no scaling math at all — it just
 * divides by 96.
 * ============================================================= */
import { orient, fountainBlue, neutral, blueGrey } from './palette.js'

/** The slide canvas. Do not change these without re-deriving the grid. */
export const canvas = {
  width: 1280,
  height: 720,
  aspect: '16:9',
  /** CSS px per inch — the constant that makes the PPTX mapping exact. */
  pxPerInch: 96,
  /** Target size in inches, for the emitter. 1280/96, 720/96. */
  inchWidth: 1280 / 96,
  inchHeight: 720 / 96,
  /** Export scale for raster output; the reference deck is 2x (2560x1440). */
  exportScale: 2,
}

/** Layout grid and the vertical anchors the reference deck lands on.
 *  Templates position against these rather than inventing coordinates,
 *  which is what keeps 30 slides feeling like one deck. */
export const grid = {
  marginX: 40,
  marginTop: 40,
  marginBottom: 40,
  columns: 12,
  gutter: 16,
  /** 1280 - (2 * 40) */
  contentWidth: 1200,
  /** (1200 - 11 * 16) / 12 */
  columnWidth: (1200 - 11 * 16) / 12,

  /* Vertical anchors, measured off the reference slides. */
  /** Top-left eyebrow and top-right page number share this band. */
  chromeY: 44,
  /** Cap-top of the headline on a standard content slide. */
  titleY: 84,
  /** Where a lead paragraph starts when it follows a 2-line headline. */
  leadY: 184,
  /** Top of the main content well (cards, charts, tables, mosaics). */
  bodyY: 264,
  /** Baseline band for the bottom-right rotated wordmark. */
  watermarkY: 520,
  /** Right-hand gutter the watermark occupies. Any full-width content well
   *  on a slide that shows the watermark must stop here instead of at
   *  `marginX`, or it runs underneath the wordmark — measured off slide 07,
   *  whose card row ends at x=1195. Templates read this rather than
   *  hard-coding a second margin. */
  watermarkGutter: 85,
}

/** Type scale. Poppins throughout — 400/500/600/700 plus italics.
 *  `size` and `lineHeight` are px in the 1280x720 space. */
export const type = {
  fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  scale: {
    /** Cover and full-slide statements. */
    display:   { size: 64, lineHeight: 1.06, weight: 700, tracking: '-0.02em' },
    /** The standard slide headline. Set by matching cap height to the
     *  reference deck (32px cap), not line width — Poppins runs wider per em
     *  than the face the originals used, so a width match would have left
     *  the letters visibly short. Long headlines therefore wrap one word
     *  earlier here than in the originals. */
    h1:        { size: 40, lineHeight: 1.14, weight: 700, tracking: '-0.015em' },
    h2:        { size: 32, lineHeight: 1.18, weight: 700, tracking: '-0.015em' },
    /** Card and panel titles. */
    h3:        { size: 22, lineHeight: 1.25, weight: 700, tracking: '-0.01em' },
    h4:        { size: 18, lineHeight: 1.3,  weight: 600, tracking: '-0.01em' },
    /** The subhead that sits under a headline. */
    lead:      { size: 17, lineHeight: 1.5,  weight: 400, tracking: '0' },
    body:      { size: 15, lineHeight: 1.55, weight: 400, tracking: '0' },
    bodySm:    { size: 13, lineHeight: 1.5,  weight: 400, tracking: '0' },
    caption:   { size: 11, lineHeight: 1.4,  weight: 500, tracking: '0' },
    /** Top-left section label. Uppercase + tracked. */
    eyebrow:   { size: 12, lineHeight: 1,    weight: 700, tracking: '0.14em' },
    /** Top-right page number. */
    pageNumber:{ size: 12, lineHeight: 1,    weight: 700, tracking: '0.06em' },
    /** Hero KPI numbers. */
    stat:      { size: 68, lineHeight: 1,    weight: 600, tracking: '-0.02em' },
    statSm:    { size: 44, lineHeight: 1,    weight: 600, tracking: '-0.02em' },
  },
}

/** Brand gradients, sampled off the reference deck.
 *  Both run deep-blue → bright-teal; only the angle differs. Because
 *  PptxGenJS still has no gradient fill (open since 2017), the emitter
 *  rasterises these to a background PNG layer and keeps the text on top
 *  live and editable.
 *
 *  `angle` is the CSS angle: 0deg points up, 90deg points right. `from` is
 *  the first stop, `to` the last. Sampled corners on the reference dividers
 *  run dark at bottom-left to bright at top-right. */
export const gradient = {
  /** Cards and panels — dark bottom-left to bright top-right. */
  brand: { angle: 45, from: orient[800], to: fountainBlue[600] },
  /** Full-bleed section dividers and covers — near-horizontal, dark left. */
  brandBleed: { angle: 80, from: orient[900], to: fountainBlue[600] },
  /** Chart bars and columns — dark at the base, bright at the top. */
  brandVertical: { angle: 0, from: orient[800], to: fountainBlue[600] },
  /** The opposite diagonal — dark top-left to bright bottom-right. Available
   *  as StatCard's `brandAlt` surface.
   *
   *  NOT sampled from the staircase cards, despite an earlier comment here
   *  saying so. That claim came from comparing only top-left against
   *  bottom-right, and on a 45° gradient BOTH of those corners are mid-tones,
   *  so the pair cannot distinguish the two diagonals. Scanning all four
   *  corners of the staircase cards gives #02678d at bottom-left rising to
   *  #01a9b1 at top-right — which is `brand` above, not this. The staircase
   *  cards therefore use `brand`; this token stands on its own as the other
   *  diagonal, for when a deck wants it. */
  brandCardAlt: { angle: 135, from: '#02718f', to: '#01a2b1' },
}

/** The tinted table ramp, sampled row-by-row off the four integration
 *  slides. It is deliberately NOT the `orient` ramp — every step reads
 *  brighter, and fitting the samples shows it is not one cyan at
 *  descending opacity either, so it is kept as its own measured ramp.
 *  Rows are applied top-to-bottom in order; the header is pure black. */
export const tableTint = {
  header: neutral[950],
  headerText: neutral[0],
  rows: ['#20d2f5', '#64e8fe', '#9af2ff', '#cefafe', '#f6ffff'],
}

/** Semantic colors. Elements reference ONLY these. */
export const color = {
  /* Surfaces */
  surface: neutral[0],
  /** The #f5f5f5 card fill used on every stat and feature card. */
  surfaceMuted: neutral[100],
  surfaceSunken: neutral[50],

  /* Text on light surfaces */
  text: neutral[950],
  textSubtle: neutral[500],
  textMuted: neutral[600],
  /** Cooler gray the reference uses for card body copy specifically. */
  textCool: blueGrey[600],

  /* Text on brand gradient / photography */
  textOnBrand: neutral[0],
  textOnBrandSubtle: 'rgba(255, 255, 255, 0.72)',

  /* Accents */
  /** The highlighted clause in a headline, rules, and the table hilite row. */
  accent: fountainBlue[600],
  /** Big KPI numbers. Sampled as #02859d — deliberately between
   *  orient-700 and fountain-blue-700, deeper than `accent` so a 68px
   *  number does not vibrate against white. */
  accentDeep: '#02859d',
  accentSoft: fountainBlue[50],
  /** The dark ink in the logo wordmark ("event"), taken straight from the
   *  current artwork (references/logo/Eventpipe Logo.svg). The superseded logo
   *  file used #093e60; this is the value that ships. Kept exact — the logo is
   *  the one place it must match. */
  brandNavy: '#02658c',

  /* Lines */
  border: neutral[200],
  rule: neutral[300],
  ruleOnBrand: 'rgba(255, 255, 255, 0.28)',

  /* Chart series, in application order. */
  series: [fountainBlue[600], orient[700], fountainBlue[400], orient[500], fountainBlue[800]],
  axis: neutral[300],
  axisLabel: neutral[500],
  gridline: neutral[200],
}

/** Corner radii, measured off the reference deck. */
export const radius = {
  image: 8,
  card: 10,
  panel: 16,
  pill: 999,
}

/** Spacing scale. Use these rather than arbitrary gaps. */
export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64, 11: 80,
}

/** Motion. Owned by the deck player — advancing between slides — and nothing
 *  else. Every slide is also rasterised by headless Chromium for the PNG and
 *  PPTX exports, so anything that animates on mount is captured
 *  mid-transition; that is why charts are always given `skipAnimation` and no
 *  element animates itself. */
export const motion = {
  duration: { instant: 0, slide: 240, slow: 400 },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  /** Slide-advance options, with when to use each. */
  transitions: {
    cut: 'Default — no transition, and the only option that matches the exported PDF exactly',
    fade: 'Softer pacing for narrative decks',
    push: 'Directional, for a sequence that reads left to right',
  },
}

/** Soft shadow used on the floating image cards (slide 2-01). */
export const shadow = {
  card: '0 4px 16px rgba(0, 0, 0, 0.10)',
  image: '0 6px 24px rgba(0, 0, 0, 0.16)',
}

export const tokens = { canvas, grid, type, gradient, tableTint, color, radius, space, shadow, motion }
export default tokens
