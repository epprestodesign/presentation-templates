/* =============================================================
 * The slide spec — the contract the whole system is built on.
 *
 * A slide is DATA, never markup. That is what lets one spec drive three
 * renderers (React/HTML for Storybook and the deck player, PptxGenJS for
 * editable Google Slides / PowerPoint, and PNG@2x for raster), and it is
 * what makes a slide cheap for an agent to author: it writes an object and
 * TypeScript tells it immediately if the shape is wrong.
 *
 * Every length is px inside the 1280x720 coordinate space. See
 * src/tokens/tokens.js for why that number is not arbitrary.
 * ============================================================= */

/* -------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------- */

/** The style flags a run can carry. Combinable — the opening slide sets its
 *  figures teal *and* underlined, so these must not be mutually exclusive. */
export interface TextRunStyles {
  /** The brand teal — the deck's most repeated typographic move. */
  accent?: boolean
  bold?: boolean
  italic?: boolean
  underline?: boolean
  muted?: boolean
}

/** One styled span inside a headline or paragraph.
 *
 *  Runs stay data rather than markup so the PPTX emitter can rebuild them as
 *  styled text runs inside a single editable text box. Rendering a headline as
 *  HTML and screenshotting it would flatten it to a picture.
 *
 *  Three accepted forms, in increasing explicitness:
 *
 *    'plain text'                              — no styling
 *    { accent: 'teal text' }                   — shorthand, one style
 *    { text: 'teal underlined', accent: true, underline: true }
 *                                              — composable, any combination
 */
export type TextRun =
  | string
  | ({ text: string } & TextRunStyles)
  /** Single-style shorthands. The value is the text itself. */
  | { accent: string }
  | { bold: string }
  | { italic: string }
  | { underline: string }
  | { muted: string }

/** A headline or paragraph: one string, or a sequence of styled runs. */
export type RichText = TextRun[] | string

/** Steps in the type scale. Mirrors the keys of `type.scale` in tokens.js. */
export type TypeStep =
  | 'displayLg'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'lead'
  | 'body'
  | 'bodySm'
  | 'caption'
  | 'eyebrow'
  | 'pageNumber'
  | 'stat'
  | 'statMd'
  | 'statSm'

/* -------------------------------------------------------------------------
 * Surfaces and chrome
 * ---------------------------------------------------------------------- */

/** What the artboard itself is filled with. */
export type SlideSurface =
  /** White paper — the default for content slides. */
  | 'light'
  /** The brand gradient, full bleed. Dividers, covers, the closing slide. */
  | 'brand'
  /** A full-bleed photograph. */
  | 'image'
  /** Solid logo navy. */
  | 'navy'

/** Fills available to cards and panels. */
export type CardSurface = 'muted' | 'brand' | 'brandAlt' | 'plain' | 'outline'

/** The chrome every slide shares. */
export interface SlideChromeSpec {
  /** Top-left section label. Rendered uppercase and tracked. */
  eyebrow?: string
  /** Top-right page number. Numbers are zero-padded to two digits; pass a
   *  string to label a slide out of sequence, e.g. 'A6'. */
  pageNumber?: number | string
  /** Bottom-left classification tag, e.g. 'CONFIDENTIAL'. */
  tag?: string
  /** Bottom-right rotated wordmark + glyph. On by default. */
  watermark?: boolean
  /** Partner mark shown beside the wordmark, for co-branded decks. */
  coBrand?: CoBrandSpec
}

/** A co-brand lockup: partner mark, divider, then EventPipe. */
export interface CoBrandSpec {
  /** Partner name — also the placeholder label until `src` is supplied. */
  name: string
  /** Partner logo URL. Omit to render a labelled placeholder. */
  src?: string
}

/* -------------------------------------------------------------------------
 * Charts
 *
 * Charts are the clearest case for keeping slides as data: PptxGenJS has a
 * native `addChart`, so a chart specified this way lands in Google Slides as
 * a real chart object whose data can be edited, rather than a flat picture.
 * Recharts renders the same object for HTML.
 * ---------------------------------------------------------------------- */

export type ChartKind = 'bar' | 'stackedBar' | 'line'

export interface ChartSeries {
  name: string
  data: number[]
  /** Overrides the series colour from `color.series`. */
  color?: string
}

export interface ChartSpec {
  kind: ChartKind
  /** Bold label above the plot. */
  title?: string
  /** Secondary label under the title. */
  subtitle?: string
  /** Unit note, shown in the legend, e.g. 'USD $000s'. */
  unit?: string
  /** X-axis category labels. Must match each series' data length. */
  categories: string[]
  series: ChartSeries[]
  /** Fill bars with a brand gradient instead of a flat series colour.
   *  Names a key of `gradient` in tokens.js. */
  fill?: 'brandVertical' | 'brand' | 'flat'
  /** Print each value above its bar / at its point, as the reference does. */
  valueLabels?: boolean
  /** Explicit y-axis bounds. Omit to fit the data. */
  yMin?: number
  yMax?: number
  /** Format a value for display — tick labels and value labels both use it. */
  format?: (value: number) => string
  /** A single figure called out in a floating circle over the plot,
   *  e.g. '15.6%' / '2027 EBITA Margin' on slide 16. */
  callout?: { value: string; label?: string }
}

/* -------------------------------------------------------------------------
 * Repeated content shapes
 * ---------------------------------------------------------------------- */

/** One KPI tile. */
export interface StatSpec {
  label?: string
  /** Pre-formatted, e.g. '1.9M' or '$8.4M'. Kept a string so the deck
   *  controls rounding and currency rather than a formatter guessing. */
  value?: string
  description?: string
  surface?: CardSurface
  /** Label above the value, or below it. */
  order?: 'label-first' | 'value-first'
  /** Material Symbols glyph pinned to the tile's top-right corner. */
  icon?: string
  valueSize?: TypeStep
  align?: 'top' | 'bottom'
}

/** One person: headshot, name, role, optional prior-company logos. */
export interface PersonSpec {
  name: string
  role?: string
  /** Path under src/assets/team. */
  photo?: string
  /** 'rounded' matches the leadership row; 'circle' the account-team grid. */
  shape?: 'rounded' | 'circle'
  /** Logos of previous employers, as on the leadership slide. */
  priorLogos?: string[]
  email?: string
  phone?: string
  linkedin?: string
}

/** One image inside a mosaic or card grid. */
export interface ImageSpec {
  src: string
  alt?: string
  /** Absolute placement in slide px. Mosaics are hand-composed, so the
   *  rects come straight from scripts/detect-images.mjs. */
  x?: number
  y?: number
  w?: number
  h?: number
  radius?: number
}

/** One cell after the label column. Either a paragraph, or a bullet list —
 *  declared by the cell itself rather than flagged on the row, since a row can
 *  mix a plain cell and a bulleted one. */
export type TableCell = RichText | { bullets: RichText[] }

/** A row in a tinted table. The tint is chosen by row index from
 *  `tableTint.rows`, so a row never names its own colour and reordering rows
 *  keeps the ramp intact. */
export interface TableRowSpec {
  /** Left-hand cell. Underlined in the reference deck. */
  label: RichText
  /** One entry per column after the label. */
  cells: TableCell[]
}

export interface TableSpec {
  /** Column headings, rendered white on black. */
  headers: string[]
  rows: TableRowSpec[]
  /** Column widths in slide px. Omit to distribute evenly. */
  columnWidths?: number[]
}
