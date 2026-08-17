import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  NodeBox,
  diagramType,
  elbow,
  fanPoints,
  role,
  snap,
  withAlpha,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — High Level. The end-to-end stack, with the phases named across the top.
 *
 * Ported from the diagram-design skill's `high-level` type. A chevron banner names
 * the phases, a dashed zone on the left holds what is outside the system, a solid
 * boundary holds what is inside it, and every component sits in the column of the
 * phase it belongs to. Reach for Architecture when the question is what talks to
 * what and the phases do not matter; reach for Platform Integration when the
 * question is which surfaces exist and over what wire; reach for this one when the
 * subject is that the stack has an ORDER and the reader should be able to name
 * each stage.
 *
 * THE BANNER IS A LEGEND, AND THAT IS ENFORCED BY GEOMETRY. Upstream's first
 * reproducibility check and its first anti-pattern are the same rule from two
 * sides: a node's centre must equal its chevron's centre. A node placed anywhere
 * else breaks the contract that makes the banner readable as a key rather than
 * decoration, so `nodeCx` is not a parameter — it is looked up from the chevron.
 *
 * VERTICAL CHEVRONS PAIR 1:1 WITH A CROSS-SPANNING COMPONENT. `Orchestration`,
 * `Security`, `Observability`, `Governance` and `Backup` are reserved names that
 * always render rotated in the right-hand strip, and each one is the label for a
 * bar or a cross-cutting row rather than a column of its own. The strip is
 * reserved only when a vertical exists, and when it is, every horizontal
 * dimension shrinks to make room — which is why `effW` exists and why nothing in
 * this file measures against `width` directly.
 *
 * FOUR DEPARTURES FROM UPSTREAM.
 *
 *  1. NO ICONS. Upstream hangs a tool glyph in every box. The deck has no icon
 *     set at diagram scale and a stack of invented glyphs would be worse than
 *     none, so the metadata register is the type scale instead — a rectangular
 *     tag for the role, a letter-spaced sublabel for the detail.
 *
 *  2. NO PER-COMPONENT COLOUR OVERRIDES. Upstream allows two components to carry
 *     a semantic hex — rust for security, slate for observability. Every colour
 *     here comes from a role, and the deck has no vocabulary that reads as
 *     "security" without also reading as "bad" (`negative` is a coral red). The
 *     vertical chevron already names the concern, which is what the colour was
 *     for.
 *
 *  3. FOCAL-TOUCHING EDGES ARE NOT AUTO-PROMOTED TO ACCENT. Upstream promotes
 *     every edge that touches the focal node. That is right when the focal has
 *     two edges and wrong when it is a hub: a four-edge focal produces four
 *     accent lines, and this deck's rule is one or two accent elements in the
 *     whole drawing. The author names the accent path, and it is usually the main
 *     line rather than every branch off it.
 *
 *  4. SOURCE FANS SHARE ONE TRUNK. Upstream's §4.1, kept deliberately even though
 *     it means two verticals can overlap where their spans coincide. Three wires
 *     into one node with three separate corridors reads as three unrelated
 *     routes; one trunk with three horizontal legs off it reads as what it is, a
 *     bus. Attach points are still fanned, which is the rule that actually
 *     matters — no two connectors share a point on a box.
 *
 * LAYOUT IS DERIVED. Chevron widths come from the well's width, the cluster and
 * the columns from its height, and the canvas grows a band per cross-cutting row.
 */

/** Grid-aligned floor — a divided dimension must never round outward. Used for
 *  `effW` too: `snap` rounds, and a width rounded UP by 1px puts the right-hand
 *  strip a pixel past the artboard, which the geometry gate reports as overflow. */
const floor4 = (n: number) => Math.max(4, Math.floor(n / 4) * 4)

/** Concerns that are always drawn as a vertical chevron, whatever the author
 *  says. Upstream's reserved list — these are not phases of the flow, they are
 *  things true of every phase, and putting one in the banner would claim the
 *  stack stops being secure after the Storage column. */
const RESERVED = ['Orchestration', 'Security', 'Observability', 'Governance', 'Backup']

/**
 * Three-segment H-V-H route with quarter-arc corners.
 *
 * Local to this file for the same reason `Medallion` keeps `staple` and
 * `PlatformIntegration` keeps `dogleg`: `elbow()` expresses a two-segment route,
 * and a two-segment route cannot cross a column gutter without running its
 * vertical leg along the target column's edge — which means along the edges of
 * the boxes above the target.
 *
 * THIS IS NOW THE SECOND COPY of the same twelve lines, which by the note left in
 * `PlatformIntegration` is the point at which it earns a place in
 * `primitives.tsx`. It has not been moved there in this change because that file
 * is shared by all 27 types and belongs to no single one of them; the promotion is
 * a separate, mechanical edit.
 */
function dogleg(p1: Point, p2: Point, midX: number, r = 8): string {
  const legA = Math.abs(midX - p1.x)
  const legB = Math.abs(p2.x - midX)
  const rise = Math.abs(p2.y - p1.y)
  if (rise < 0.5) return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`
  if (legA < 2 || legB < 2) return elbow(p1, p2, 'h')

  const rr = Math.min(r, legA / 2, legB / 2, rise / 2)
  const sxA = Math.sign(midX - p1.x)
  const sxB = Math.sign(p2.x - midX)
  const sy = Math.sign(p2.y - p1.y)
  return [
    `M ${p1.x} ${p1.y}`,
    `L ${midX - sxA * rr} ${p1.y}`,
    `Q ${midX} ${p1.y} ${midX} ${p1.y + sy * rr}`,
    `L ${midX} ${p2.y - sy * rr}`,
    `Q ${midX} ${p2.y} ${midX + sxB * rr} ${p2.y}`,
    `L ${p2.x} ${p2.y}`,
  ].join(' ')
}

export interface HighLevelChevron {
  name: string
  /** Column span. A phase that holds two stacked components often wants 1 still —
   *  the span is about horizontal room, not component count. */
  columns?: number
  /** Force the right-hand strip. Reserved names are vertical without this. */
  vertical?: boolean
}

export interface HighLevelSource {
  name: string
  sublabel?: string
}

/** `node` sits in the cluster under its chevron. `bar` spans the cluster's top.
 *  `crosscut` spans the whole body BELOW the cluster, because a concern that
 *  applies to everything cannot be drawn inside the thing it applies to. */
export type HighLevelKind = 'node' | 'bar' | 'crosscut'

export interface HighLevelComponent {
  name: string
  /** Name of the chevron this component belongs to. A `node` must name a
   *  horizontal one; a `bar` or `crosscut` names its vertical. */
  chevron: string
  kind?: HighLevelKind
  sublabel?: string
  tag?: string
  /** Exactly one, and only ever a `node`. */
  focal?: boolean
  /** Overrides the default treatment. Bars and crosscuts default to `store`. */
  nodeKind?: NodeKind
}

export interface HighLevelEdge {
  from: string
  to: string
  /** Kept short — it sits on a horizontal leg between two columns. */
  label?: string
  tone?: ArrowTone
  dashed?: boolean
}

export interface HighLevelProps {
  width: number
  height: number
  chevrons: HighLevelChevron[]
  sources: HighLevelSource[]
  components: HighLevelComponent[]
  edges?: HighLevelEdge[]
  /** Label for the dashed zone. Defaults to the first chevron's own name. */
  sourceZoneLabel?: string
  /** Label at the foot of the cluster — where all of this is deployed. */
  clusterLabel?: string
  legend?: LegendItem[]
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Route {
  e: HighLevelEdge
  d: string
  tone: ArrowTone
  dashed: boolean
  /** `null` when the edge takes no label — a bar drop never does. */
  label: { x: number; y: number; side: 'above' | 'right' } | null
}

export function HighLevel({
  width,
  height,
  chevrons,
  sources,
  components,
  edges = [],
  sourceZoneLabel,
  clusterLabel,
  legend,
}: HighLevelProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const isVertical = (c: HighLevelChevron) => c.vertical ?? RESERVED.includes(c.name)
  const verticals = chevrons.filter(isVertical)
  const horizontals = chevrons.filter((c) => !isVertical(c))

  /* --- canvas ---------------------------------------------------------- */
  const STRIP_W = 28
  const STRIP_GAP = 8
  const stripW = verticals.length ? STRIP_W : 0
  const stripX = width - stripW
  /** Every horizontal element measures against this, never against `width`. */
  const effW = floor4(width - stripW - (verticals.length ? STRIP_GAP : 0))

  const BANNER_H = 28
  const BANNER_GAP = 8
  const bodyTop = BANNER_H + BANNER_GAP

  const bars = components.filter((c) => c.kind === 'bar')
  const crosscuts = components.filter((c) => c.kind === 'crosscut')
  const nodes = components.filter((c) => (c.kind ?? 'node') === 'node')

  const CROSS_H = 40
  const CROSS_GAP = 4
  const legendH = legend?.length ? 44 : 0
  const crossBand = crosscuts.length * (CROSS_H + CROSS_GAP)
  /** Bottom of the cluster and of the dashed source zone. */
  const bodyBottom = height - legendH - crossBand
  const crossY = (k: number) => snap(bodyBottom + CROSS_GAP + k * (CROSS_H + CROSS_GAP))
  const stripBottom = crosscuts.length ? crossY(crosscuts.length - 1) + CROSS_H : bodyBottom

  /* --- chevron banner --------------------------------------------------- */
  /* Upstream floors each width to a multiple of 4 and then clamps it up to 120,
     which can push the total past the canvas. The clamp is dropped: a banner of
     eight phases in this well genuinely has 130px columns, and a diagram that
     overflows its artboard is worse than one whose labels are tight. */
  const sumCols = horizontals.reduce((n, c) => n + (c.columns ?? 1), 0) || 1
  const unit = floor4(effW / sumCols)
  const widths = horizontals.map((c) => unit * (c.columns ?? 1))
  if (widths.length) widths[widths.length - 1] += effW - widths.reduce((a, b) => a + b, 0)
  const xB = widths.reduce<number[]>((acc, w) => [...acc, acc[acc.length - 1] + w], [0])
  const chevIdx = new Map(horizontals.map((c, i) => [c.name, i]))
  const chevCx = (i: number) => snap((xB[i] + xB[i + 1]) / 2)

  /* --- zones ------------------------------------------------------------ */
  /** Gutter between the dashed zone and the cluster. It is also the source fan's
   *  trunk corridor, so it is a real dimension rather than a hairline. */
  const GUT = 8
  const srcW = floor4((xB[1] ?? effW) - GUT)
  const clusterX = snap(xB[1] ?? 0)
  const clusterW = effW - clusterX
  /** Room at the foot of the cluster for its deployment label. */
  const CLUSTER_FOOT = 28

  /* --- cluster contents ------------------------------------------------- */
  const BAR_H = 40
  const BAR_GAP = 8
  const barX = snap(clusterX + 12)
  const barW = floor4(clusterW - 24)
  const barY = (k: number) => snap(bodyTop + 12 + k * (BAR_H + BAR_GAP))
  const barsBottom = bars.length ? barY(bars.length - 1) + BAR_H : bodyTop

  const NODE_GAP = 16
  const nodeTop0 = bars.length ? barsBottom + 20 : bodyTop + 16
  const nodeAvail = bodyBottom - CLUSTER_FOOT - nodeTop0
  /* Rows are TOP-ALIGNED across chevrons rather than centred per column, so row 0
     is the main line of flow in every column and a two-node column hangs its
     second node off the same rail as its neighbour's. Centring each column
     independently reads as five unrelated stacks. */
  const perChev = new Map<string, HighLevelComponent[]>()
  for (const n of nodes) perChev.set(n.chevron, [...(perChev.get(n.chevron) ?? []), n])
  const maxK = Math.max(1, ...[...perChev.values()].map((v) => v.length))
  const nodeH = Math.min(84, floor4((nodeAvail - NODE_GAP * (maxK - 1)) / maxK))
  const stackH = maxK * nodeH + NODE_GAP * (maxK - 1)
  const nodeTop = snap(nodeTop0 + Math.max(0, (nodeAvail - stackH) / 2))
  const nodeW = Math.min(160, floor4(unit - 24))

  /* --- source column ---------------------------------------------------- */
  const SRC_GAP = 16
  const SRC_PAD = 6
  const srcTop0 = bodyTop + 26
  const srcAvail = bodyBottom - 16 - srcTop0
  const nSrc = Math.max(sources.length, 1)
  const srcH = Math.min(64, floor4((srcAvail - SRC_GAP * (nSrc - 1)) / nSrc))
  const srcBlock = nSrc * srcH + SRC_GAP * (nSrc - 1)
  const srcTop = snap(srcTop0 + Math.max(0, (srcAvail - srcBlock) / 2))
  const srcY = (k: number) => snap(srcTop + k * (srcH + SRC_GAP))
  const srcNodeX = SRC_PAD
  const srcNodeW = floor4(srcW - SRC_PAD * 2)

  /* --- placement -------------------------------------------------------- */
  const boxes = new Map<string, Box>()
  const kindOf = new Map<string, HighLevelKind | 'source'>()
  sources.forEach((s, k) => {
    boxes.set(s.name, { x: srcNodeX, y: srcY(k), w: srcNodeW, h: srcH })
    kindOf.set(s.name, 'source')
  })
  bars.forEach((b, k) => {
    boxes.set(b.name, { x: barX, y: barY(k), w: barW, h: BAR_H })
    kindOf.set(b.name, 'bar')
  })
  crosscuts.forEach((c, k) => {
    boxes.set(c.name, { x: 0, y: crossY(k), w: effW, h: CROSS_H })
    kindOf.set(c.name, 'crosscut')
  })
  for (const [name, list] of perChev) {
    const i = chevIdx.get(name)
    if (i === undefined) continue
    list.forEach((n, k) => {
      boxes.set(n.name, {
        x: snap(chevCx(i) - nodeW / 2),
        y: snap(nodeTop + k * (nodeH + NODE_GAP)),
        w: nodeW,
        h: nodeH,
      })
      kindOf.set(n.name, 'node')
    })
  }
  const chevOf = new Map(nodes.map((n) => [n.name, chevIdx.get(n.chevron) ?? 0]))

  /* --- routing ---------------------------------------------------------- */
  const cy = (b: Box) => b.y + b.h / 2
  const cxOf = (b: Box) => b.x + b.w / 2

  /* Fan counts on the sides that actually fan: a node's right edge for exits, its
     left edge for entries. A bar drops from its bottom at the target's centre, so
     it needs no fan — two drops to the same target would be two identical lines,
     which is an authoring error, not a layout one. */
  const key = (n: string, s: string) => `${n}:${s}`
  const outN = new Map<string, number>()
  const inN = new Map<string, number>()
  const isDrop = (e: HighLevelEdge) => kindOf.get(e.from) === 'bar'
  const isColumnar = (e: HighLevelEdge) => {
    const a = boxes.get(e.from)
    const b = boxes.get(e.to)
    return Boolean(a && b && Math.abs(cxOf(a) - cxOf(b)) < 1)
  }
  for (const e of edges) {
    if (isDrop(e) || isColumnar(e)) continue
    outN.set(key(e.from, 'r'), (outN.get(key(e.from, 'r')) ?? 0) + 1)
    inN.set(key(e.to, 'l'), (inN.get(key(e.to, 'l')) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()

  const routed = edges.flatMap<Route>((e) => {
    const a = boxes.get(e.from)
    const b = boxes.get(e.to)
    if (!a || !b) return []

    /* 1. BAR DROP. Straight vertical from the bar's bottom edge to the target's
          top, at the target's own centre. Upstream: bar drops never elbow, and
          they are dashed and unlabelled, because an orchestration trigger is not
          part of the data path. */
    if (isDrop(e)) {
      const x = snap(cxOf(b))
      return [
        {
          e,
          d: `M ${x} ${a.y + a.h} L ${x} ${b.y}`,
          tone: e.tone ?? 'soft',
          dashed: e.dashed ?? true,
          label: null,
        },
      ]
    }

    /* 2. SAME COLUMN. Two components stacked under one chevron share an x, so the
          only orthogonal route is a vertical — and it is inset from the shared
          centre line so a down edge and an up edge between the same pair cannot
          land on each other. */
    if (isColumnar(e)) {
      const down = cy(b) > cy(a)
      const x = snap(cxOf(a) + (down ? 16 : -16))
      return [
        {
          e,
          d: `M ${x} ${down ? a.y + a.h : a.y} L ${x} ${down ? b.y : b.y + b.h}`,
          tone: e.tone ?? 'default',
          dashed: e.dashed ?? false,
          label: e.label ? { x, y: snap((cy(a) + cy(b)) / 2), side: 'right' as const } : null,
        },
      ]
    }

    /* 3. LEFT TO RIGHT. Out of the source's right edge, along a trunk, into the
          target's left edge. The trunk is the gutter for a source fan and the
          chevron boundary four pixels past the source's own column otherwise —
          which is upstream's §4.1 / §4.2, and which puts every vertical leg in a
          column divider rather than inside a column. */
    const ok = key(e.from, 'r')
    const ik = key(e.to, 'l')
    const oi = outSeen.get(ok) ?? 0
    const ii = inSeen.get(ik) ?? 0
    outSeen.set(ok, oi + 1)
    inSeen.set(ik, ii + 1)
    const p1 = { x: a.x + a.w, y: snap(fanPoints(a.y, a.h, outN.get(ok) ?? 1)[oi]) }
    const p2 = { x: b.x, y: snap(fanPoints(b.y, b.h, inN.get(ik) ?? 1)[ii]) }

    const fromSource = kindOf.get(e.from) === 'source'
    const base = fromSource ? clusterX - 4 : (xB[(chevOf.get(e.from) ?? 0) + 1] ?? p2.x) + 4
    const lo = Math.min(p1.x, p2.x)
    const hi = Math.max(p1.x, p2.x)
    const trunk = snap(Math.min(Math.max(base, lo + 4), hi - 4))

    /* The label goes on the LONGER of the two horizontal legs, which is the only
       one with room for a mask. Its y is whichever endpoint that leg belongs to —
       the first leg runs at the source's y, the second at the target's.

       A STRAIGHT RUN HAS NO LEGS, and treating it as though it did is how three
       labels ended up sitting on the boxes they were describing. Two nodes on the
       same row share a y, so `dogleg` emits one line and the trunk is fictional —
       but the label still measured off it, landed at the midpoint of the fictional
       first leg (a third of the way across the gap), and its mask crossed the
       source's right edge. WRITE and MODEL were 2px over, which reads as a label
       glued to a box; PUBLISH was 7px over, which the geometry gate caught. */
    const straight = Math.abs(p2.y - p1.y) < 0.5
    const legA = Math.abs(trunk - p1.x)
    const legB = Math.abs(p2.x - trunk)
    const onFirst = legA >= legB
    const [legLo, legHi, labelY] = straight
      ? [p1.x, p2.x, p1.y]
      : onFirst
        ? [p1.x, trunk, p1.y]
        : [trunk, p2.x, p2.y]
    /* And keep the whole mask inside the leg either way. `ArrowLabel`'s width
       formula is restated here for the same reason it is in
       `PlatformIntegration`: the alternative is a component placing labels it
       cannot measure. */
    const half = e.label ? Math.max(e.label.length * 9 * 0.62 + 10, 22) / 2 : 0
    const lx = Math.min(
      Math.max((legLo + legHi) / 2, Math.min(legLo, legHi) + 4 + half),
      Math.max(legLo, legHi) - 4 - half
    )
    const label = e.label ? { x: snap(lx), y: labelY, side: 'above' as const } : null

    return [
      {
        e,
        d: dogleg(p1, p2, trunk),
        tone: e.tone ?? 'default',
        dashed: e.dashed ?? false,
        label,
      },
    ]
  })

  /* --- chevron geometry ------------------------------------------------- */
  const NOTCH = 12
  const bannerPoints = (i: number) => {
    const x0 = xB[i]
    const x1 = xB[i + 1]
    const y0 = 0
    const y1 = BANNER_H
    const my = BANNER_H / 2
    const first = i === 0
    const last = i === horizontals.length - 1
    if (first && last) return `${x0},${y0} ${x1},${y0} ${x1},${y1} ${x0},${y1}`
    if (first) return `${x0},${y0} ${x1 - NOTCH},${y0} ${x1},${my} ${x1 - NOTCH},${y1} ${x0},${y1}`
    if (last) return `${x0},${y0} ${x1},${y0} ${x1},${y1} ${x0},${y1} ${x0 + NOTCH},${my}`
    return `${x0},${y0} ${x1 - NOTCH},${y0} ${x1},${my} ${x1 - NOTCH},${y1} ${x0},${y1} ${x0 + NOTCH},${my}`
  }

  /* The strip is split evenly and the last band absorbs the remainder, so the
     bands always meet exactly and the last one always reaches the bottom of the
     lowest cross-cutting row — which is what makes the strip read as owning
     everything beside it. */
  const stripTotal = stripBottom - bodyTop
  const vHeights = verticals.map(() => floor4(stripTotal / Math.max(verticals.length, 1)))
  if (vHeights.length) vHeights[vHeights.length - 1] += stripTotal - vHeights.reduce((a, b) => a + b, 0)
  const vBounds = vHeights.reduce<number[]>((acc, h) => [...acc, acc[acc.length - 1] + h], [bodyTop])
  const stripPoints = (i: number) => {
    const y0 = vBounds[i]
    const y1 = vBounds[i + 1]
    const mx = stripX + STRIP_W / 2
    const first = i === 0
    const last = i === verticals.length - 1
    const top = first ? `${stripX},${y0} ${stripX + STRIP_W},${y0}` : `${stripX},${y0} ${mx},${y0 + NOTCH} ${stripX + STRIP_W},${y0}`
    const bottom = last
      ? `${stripX + STRIP_W},${y1} ${stripX},${y1}`
      : `${stripX + STRIP_W},${y1 - NOTCH} ${mx},${y1} ${stripX},${y1 - NOTCH}`
    return `${top} ${bottom}`
  }

  /** Chevron fills alternate between ink and a lighter ink so the banner reads as
   *  a sequence of steps rather than one bar with dividers. Both take a paper
   *  label; upstream's second fill is a separate hex, which this deck does not
   *  have, so it is the same ink at 0.78 — the alternation is a rhythm, not a
   *  meaning, and it does not need its own token. */
  const chevFill = (i: number) => (i % 2 === 0 ? role.ink : withAlpha(role.ink, 0.78))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="High-level stack diagram"
      data-diagram="high-level"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. The phase banner. Polygons rather than paths: a chevron's notch is a
             SHAPE, not a route between two nodes, and the geometry gate is right
             to only police `<path>`. */}
      {horizontals.map((c, i) => (
        <g key={c.name}>
          <polygon points={bannerPoints(i)} fill={chevFill(i)} />
          <text
            x={chevCx(i)}
            y={BANNER_H / 2}
            fill={role.paper}
            fontFamily={diagramType.family}
            fontSize={diagramType.eyebrow.size}
            fontWeight={diagramType.eyebrow.weight}
            letterSpacing={`${diagramType.eyebrow.tracking}em`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.name.toUpperCase()}
          </text>
        </g>
      ))}

      {/* 2. The right-hand strip: the concerns that are true of every phase. */}
      {verticals.map((c, i) => (
        <g key={c.name}>
          <polygon points={stripPoints(i)} fill={chevFill(i)} />
          <text
            transform={`translate(${stripX + STRIP_W / 2} ${snap((vBounds[i] + vBounds[i + 1]) / 2)}) rotate(-90)`}
            fill={role.paper}
            fontFamily={diagramType.family}
            fontSize={diagramType.eyebrow.size}
            fontWeight={diagramType.eyebrow.weight}
            letterSpacing={`${diagramType.eyebrow.tracking}em`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {c.name.toUpperCase()}
          </text>
        </g>
      ))}

      {/* 3. The two containers, painted before everything they hold. DASHED for
             the source zone and SOLID for the cluster, which is the whole signal:
             a dashed border means these are outside the system. Both are bare
             `<rect>`s rather than the shared `Zone`, whose only dashed tone is
             accent — a trust boundary, which is a different claim. */}
      <rect
        x={0}
        y={bodyTop}
        width={srcW}
        height={bodyBottom - bodyTop}
        rx={6}
        fill={withAlpha(role.ink, 0.02)}
        stroke={withAlpha(role.ink, 0.2)}
        strokeWidth={0.8}
        strokeDasharray="6,3"
      />
      <rect
        x={clusterX}
        y={bodyTop}
        width={clusterW}
        height={bodyBottom - bodyTop}
        rx={8}
        fill={withAlpha(role.ink, 0.02)}
        stroke={withAlpha(role.ink, 0.18)}
        strokeWidth={1.2}
      />
      <DiagramText x={12} y={bodyTop + 14} variant="eyebrow" tone="soft" uppercase>
        {sourceZoneLabel ?? horizontals[0]?.name ?? 'Sources'}
      </DiagramText>
      {clusterLabel && (
        <DiagramText x={clusterX + 14} y={bodyBottom - 14} variant="eyebrow" tone="soft" uppercase>
          {clusterLabel}
        </DiagramText>
      )}

      {/* 4. Connectors before every box, so strokes sit behind the fills. */}
      {routed.map((r, i) => (
        <Connector key={i} d={r.d} tone={r.tone} dashed={r.dashed} idPrefix={uid} />
      ))}

      {/* 5. Sources. No type tag: the dashed border already says external, and a
             tag band on a 60px box pushes the sublabel onto its own bottom edge. */}
      {sources.map((s, k) => (
        <NodeBox
          key={s.name}
          x={srcNodeX}
          y={srcY(k)}
          w={srcNodeW}
          h={srcH}
          kind="input"
          name={s.name}
          sublabel={s.sublabel}
        />
      ))}

      {/* 6. Bars, then nodes, then cross-cutting rows. */}
      {bars.map((b) => (
        <NodeBox
          key={b.name}
          {...boxes.get(b.name)!}
          kind={b.nodeKind ?? 'store'}
          name={b.name}
          sublabel={b.sublabel}
        />
      ))}
      {nodes.map((n) => (
        <NodeBox
          key={n.name}
          {...boxes.get(n.name)!}
          kind={n.focal ? 'focal' : (n.nodeKind ?? 'step')}
          name={n.name}
          sublabel={n.sublabel}
          tag={n.tag}
        />
      ))}
      {crosscuts.map((c) => (
        <NodeBox
          key={c.name}
          {...boxes.get(c.name)!}
          kind={c.nodeKind ?? 'store'}
          name={c.name}
          sublabel={c.sublabel}
        />
      ))}

      {/* 7. Labels last, so their masks sit above the strokes they interrupt. */}
      {routed.map(
        (r, i) =>
          r.label && (
            <ArrowLabel
              key={i}
              x={r.label.x}
              y={r.label.y}
              text={r.e.label!}
              side={r.label.side}
              tone={r.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legend?.length ? <Legend x={0} y={height - legendH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}
