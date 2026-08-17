import { color, type as typeTokens } from '../tokens/tokens.js'
import { blueGrey, fountainBlue, neutral, orient } from '../tokens/palette.js'

/**
 * Semantic ROLES for diagrams, mapped onto the deck's own tokens.
 *
 * Ported from the diagram-design skill (MIT, cathrynlavery/diagram-design),
 * which keeps every colour behind a role name — `accent`, never a hex — so a
 * whole diagram library can be reskinned from one place. That indirection is the
 * reason the port is cheap, and it is worth preserving exactly: no diagram
 * component may reference a palette step or a hex directly.
 *
 * Three deliberate departures from the upstream skin:
 *
 *  1. POPPINS THROUGHOUT. Upstream uses Instrument Serif for titles, Geist for
 *     names and Geist Mono for anything technical — ports, field types, arrow
 *     labels. The deck is Poppins and has no mono face, so the "technical
 *     register" that mono carried is rebuilt from SIZE, WEIGHT and TRACKING
 *     instead: a sublabel is small, medium-weight and letter-spaced, which reads
 *     as metadata without a second family. Mixing a mono in would have added a
 *     typeface to a system that deliberately has one.
 *
 *  2. NO SHADOWS, NO GRADIENTS. Upstream's rule, and it is kept — even though
 *     the deck's cards use `shadow.card` and the brand gradient elsewhere. A
 *     diagram is a drawing, and a drop shadow on a node box competes with the
 *     hairlines that carry the structure. `gradient.*` and `shadow.*` are
 *     therefore NOT re-exported here; a diagram that wants one is using the
 *     wrong template.
 *
 *  3. `link` IS ORIENT, NOT A FOREIGN BLUE. Upstream uses #2e5aa8 for external
 *     calls, which is a blue the deck does not contain. orient-700 is the
 *     brand's own blue and reads as "different from accent" for the same reason.
 */

export const role = {
  /* --- surfaces --------------------------------------------------------- */
  /** Page background, and the default fill of a node box. */
  paper: color.surface as string,
  /** Container / zone background, secondary fill. */
  paper2: color.surfaceMuted as string,

  /* --- ink -------------------------------------------------------------- */
  /** Primary text and primary stroke. */
  ink: color.text as string,
  /** Secondary text, and the default arrow stroke. */
  muted: color.textCool as string,
  /** Sublabels, boundary labels, axis labels. */
  soft: color.textSubtle as string,

  /* --- lines ------------------------------------------------------------ */
  /** Hairline borders. */
  rule: color.border as string,
  /** Stronger borders and baselines. */
  ruleSolid: color.rule as string,

  /* --- focus ------------------------------------------------------------ */
  /** THE FOCAL COLOUR. One or two elements per diagram, never four. */
  accent: color.accent as string,
  /** Fill behind an accent-stroked box. */
  accentTint: fountainBlue[50],
  /** Deeper accent, for a figure or a label that must hold against the tint. */
  accentDeep: color.accentDeep as string,
  /** External calls, API hops, anything crossing a system boundary. */
  link: orient[700],

  /* --- direction, borrowed from the deck's own semantics ---------------- */
  positive: color.positive as string,
  negative: color.negative as string,
  warning: color.warning as string,

  /** Non-focal series, for the few types that genuinely overlap entities. */
  series: color.seriesCategorical as string[],
} as const

/** Fills and strokes by NODE KIND, so a component never invents a treatment.
 *
 *  Straight from the upstream table, with `ink` at the same opacities. Keeping
 *  the opacities rather than substituting flat greys matters: a store at
 *  `ink@0.05` sits on whatever paper it lands on, including a zone container,
 *  and a flat grey would band against it. */
export const nodeStyle = {
  /** 1–2 per diagram. The thing the reader should look at first. */
  focal: { fill: role.accentTint, stroke: role.accent },
  /** A service, an API, a step. The default. */
  step: { fill: role.paper, stroke: role.ink },
  /** A datastore or a held state. */
  store: { fill: withAlpha(role.ink, 0.05), stroke: role.muted },
  /** Someone else's system. */
  external: { fill: withAlpha(role.ink, 0.03), stroke: withAlpha(role.ink, 0.3) },
  /** A person, or an inbound request. */
  input: { fill: withAlpha(role.muted, 0.1), stroke: role.soft },
  /** Optional or asynchronous — dashed. */
  optional: {
    fill: withAlpha(role.ink, 0.02),
    stroke: withAlpha(role.ink, 0.2),
    dash: '4,3',
  },
  /** A trust boundary or a security zone — dashed accent. */
  boundary: {
    fill: withAlpha(role.accent, 0.05),
    stroke: withAlpha(role.accent, 0.5),
    dash: '4,4',
  },
} as const

export type NodeKind = keyof typeof nodeStyle

/** Type scale for diagram text, in SVG user units (= slide px).
 *
 *  Smaller than the deck's body scale on purpose: a diagram is read as a whole
 *  before any single label, and label type at slide-copy size turns the drawing
 *  into a wall of words. The tracking on `sublabel` and `eyebrow` is what
 *  replaces the mono face — see the note at the top of this file. */
export const diagramType = {
  family: typeTokens.fontFamily,
  /** Human-readable node names. */
  nodeName: { size: 13, weight: 600, tracking: 0 },
  /** Ports, field types, units — the metadata register. */
  sublabel: { size: 10, weight: 500, tracking: 0.04 },
  /** Type tags, axis labels, zone names. Uppercase. */
  eyebrow: { size: 8.5, weight: 600, tracking: 0.14 },
  /** Annotation on a connector. Uppercase, ≤14 characters. */
  arrowLabel: { size: 9, weight: 500, tracking: 0.06 },
  /** A figure inside a node — a count, a percentage. */
  figure: { size: 22, weight: 600, tracking: -0.01 },
  /** The legend strip. */
  legend: { size: 9, weight: 500, tracking: 0.1 },
} as const

/** `#rrggbb` + alpha → `rgba(...)`. Kept here so no component hand-writes one
 *  and drifts by a hundredth. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** The 4px grid every coordinate lands on. Upstream's rule, kept because it is
 *  what stops a hand-placed node sitting 1px off its neighbour. */
export const GRID = 4
export const snap = (n: number) => Math.round(n / GRID) * GRID

/** Floor to the grid. Use this for any dimension DERIVED BY SUBTRACTION OR
 *  DIVISION from the available space.
 *
 *  `snap` rounds to nearest, which is right for a position an author chose and
 *  wrong for a width computed from the canvas: rounding up pushes the result
 *  past the edge it was measured from. A layer stack whose width came out
 *  `snap(1155 - 52) = 1104` ended at x=1156 inside a 1155 viewBox, and since the
 *  SVG clips, every band lost its right border. A Gantt did the same thing
 *  vertically and put seven rows past the floor. */
export const snapDown = (n: number) => Math.floor(n / GRID) * GRID

/** Neutral re-export, for the rare component that needs a step directly. */
export { neutral, blueGrey }
