import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  Legend,
  NodeBox,
  diagramType,
  elbow,
  fanPoints,
  nodeStyle,
  role,
  snap,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — Flowchart. Decision logic, top to bottom.
 *
 * Ported from the diagram-design skill's `type-flowchart.md`. The rule that
 * matters there is SHAPE CARRIES TYPE, NOT COLOUR: an oval is a terminal, a
 * rectangle is a step, a diamond is a decision. Colour is spent on exactly one
 * thing — the happy path, or the single most consequential decision — never on
 * both, and never as a legend for node types.
 *
 * LAYOUT IS DERIVED. The author writes rows of cells on a column grid; the
 * component computes every coordinate from the well it was handed:
 *
 *  - Columns split the drawing width evenly, minus `colGap`.
 *  - A row with an explicit `height` keeps it; the rest share what is left, so
 *    the stack always fills the well exactly and adding a row re-flows the whole
 *    chart instead of pushing it off the slide.
 *  - Node widths are CAPPED below their cell width on purpose. A box that fills
 *    its cell leaves only `colGap` for a label on a horizontal branch, and an
 *    arrow label wider than its gap lands inside a node — the geometry gate's
 *    rule 6. Capping the box widens the gap without moving the grid.
 *
 * Two departures from upstream, both forced and both deliberate:
 *
 *  1. THE HAPPY PATH RUNS DOWN THE SPINE, exceptions to the sides. Upstream's
 *     convention is "Yes right, No below". On a 16:9 slide the vertical budget is
 *     the scarce one, so the sequential path takes the centre column and every
 *     branch exits sideways. Both outgoing arrows are still labelled, which is
 *     the part of the convention that actually carries meaning.
 *
 *  2. NO MERGE DOT. Upstream rejoins branches on a small filled dot. A dot has
 *     no edge to fan attach points along, so two arrowheads land on one point —
 *     which is upstream's own rule 4. Branches here rejoin at the node that
 *     consumes them, whose top edge fans cleanly for N inbound connectors.
 */

export type FlowShape = 'terminal' | 'step' | 'decision'
export type FlowSide = 'top' | 'right' | 'bottom' | 'left'

export interface FlowNode {
  id: string
  label: string
  sublabel?: string
  tag?: string
  /** Oval = start/end, rectangle = step, diamond = decision. Default `step`. */
  shape?: FlowShape
  kind?: NodeKind
  /** 0-based column. */
  col: number
  /** Columns spanned. Default 1. */
  span?: number
}

export interface FlowRow {
  nodes: FlowNode[]
  /** Fixed band height. Rows without one share the remaining space. */
  height?: number
}

export interface FlowEdge {
  from: string
  to: string
  /** Label every branch leaving a decision — an unlabelled fork is the one
   *  flowchart anti-pattern that costs the reader the whole diagram. */
  label?: string
  tone?: ArrowTone
  dashed?: boolean
  fromSide?: FlowSide
  toSide?: FlowSide
}

export interface FlowchartProps {
  width: number
  height: number
  rows: FlowRow[]
  edges?: FlowEdge[]
  legend?: LegendItem[]
  /** Defaults to the widest column referenced. */
  columns?: number
  colGap?: number
  rowGap?: number
}

/** Height a shape wants, clamped to its row band. */
const SHAPE_H: Record<FlowShape, number> = { terminal: 52, step: 72, decision: 96 }
/** Width cap per shape — see the note on gaps in the header comment. */
const SHAPE_W: Record<FlowShape, number> = { terminal: 296, step: 300, decision: 272 }

interface Placed {
  node: FlowNode
  shape: FlowShape
  row: number
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

export function Flowchart({
  width,
  height,
  rows,
  edges = [],
  legend,
  columns,
  colGap = 40,
  rowGap = 28,
}: FlowchartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  const cols =
    columns ??
    rows.reduce((m, r) => r.nodes.reduce((n, c) => Math.max(n, c.col + (c.span ?? 1)), m), 1)
  const colW = (width - colGap * (cols - 1)) / cols

  /* Row bands: fixed heights are honoured, the remainder is split between the
     rest. A chart whose rows are all `auto` therefore fills the well exactly. */
  const fixed = rows.reduce((n, r) => n + (r.height ?? 0), 0)
  const autoCount = rows.filter((r) => !r.height).length
  const spare = Math.max(0, drawH - rowGap * (rows.length - 1) - fixed)
  const autoH = autoCount ? spare / autoCount : 0

  const placed: Placed[] = []
  let cursorY = 0
  rows.forEach((r, ri) => {
    const bandH = r.height ?? autoH
    r.nodes.forEach((n) => {
      const shape = n.shape ?? 'step'
      const span = n.span ?? 1
      const cellX = n.col * (colW + colGap)
      const cellW = colW * span + colGap * (span - 1)
      const w = Math.min(cellW, SHAPE_W[shape])
      const h = Math.min(bandH, SHAPE_H[shape])
      const x = snap(cellX + (cellW - w) / 2)
      const y = snap(cursorY + (bandH - h) / 2)
      placed.push({
        node: n,
        shape,
        row: ri,
        x,
        y,
        w: snap(w),
        h: snap(h),
        cx: snap(x + w / 2),
        cy: snap(y + h / 2),
      })
    })
    cursorY += bandH + rowGap
  })

  const byId = new Map(placed.map((p) => [p.node.id, p]))

  /* Fan attach points per (node, side), so no two connectors share a point on a
     box — upstream rule 4. A diamond is the exception: its sides are single
     vertices, and a decision has at most three exits, each on its own side. */
  const key = (id: string, side: string) => `${id}:${side}`
  const outN = new Map<string, number>()
  const inN = new Map<string, number>()

  const sidesFor = (e: FlowEdge) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) return null
    const sameCol = Math.abs(a.cx - b.cx) < 8
    const down = b.row > a.row
    let fs: FlowSide
    let ts: FlowSide
    if (a.row === b.row) {
      fs = b.cx > a.cx ? 'right' : 'left'
      ts = b.cx > a.cx ? 'left' : 'right'
    } else if (sameCol) {
      fs = down ? 'bottom' : 'top'
      ts = down ? 'top' : 'bottom'
    } else {
      // Off-spine: leave sideways, arrive on the horizontal face. The corner
      // then lands in the row gap rather than inside a column.
      fs = b.cx > a.cx ? 'right' : 'left'
      ts = down ? 'top' : 'bottom'
    }
    return { a, b, fs: e.fromSide ?? fs, ts: e.toSide ?? ts }
  }

  for (const e of edges) {
    const s = sidesFor(e)
    if (!s) continue
    outN.set(key(e.from, s.fs), (outN.get(key(e.from, s.fs)) ?? 0) + 1)
    inN.set(key(e.to, s.ts), (inN.get(key(e.to, s.ts)) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()

  const anchor = (p: Placed, side: FlowSide, i: number, total: number): Point => {
    if (p.shape === 'decision') {
      // Vertices only. A point part-way along a diamond's slanted face is not on
      // the shape's outline in any way the reader can see.
      if (side === 'right') return { x: p.x + p.w, y: p.cy }
      if (side === 'left') return { x: p.x, y: p.cy }
      return { x: p.cx, y: side === 'bottom' ? p.y + p.h : p.y }
    }
    if (side === 'right' || side === 'left') {
      const ys = fanPoints(p.y, p.h, total)
      return { x: side === 'right' ? p.x + p.w : p.x, y: snap(ys[i]) }
    }
    const xs = fanPoints(p.x, p.w, total)
    return { x: snap(xs[i]), y: side === 'bottom' ? p.y + p.h : p.y }
  }

  const routed = edges.map((e) => {
    const s = sidesFor(e)
    if (!s) return null
    const { a, b, fs, ts } = s
    const fk = key(e.from, fs)
    const tk = key(e.to, ts)
    const fi = outSeen.get(fk) ?? 0
    const ti = inSeen.get(tk) ?? 0
    outSeen.set(fk, fi + 1)
    inSeen.set(tk, ti + 1)

    const p1 = anchor(a, fs, fi, outN.get(fk) ?? 1)
    const p2 = anchor(b, ts, ti, inN.get(tk) ?? 1)
    /* Bias follows the EXIT side, not the longer leg: an arrow leaving a right
       face has to travel sideways first or its first pixel is already wrong. */
    const horizontalRun = fs === 'right' || fs === 'left'
    const bias = horizontalRun ? 'h' : 'v'

    /* Label home: the open span the connector's first leg crosses. For a
       sideways exit that is between the two boxes' facing edges; for a vertical
       exit it is the row gap, and the label sits beside the line. */
    const mid: Point = horizontalRun
      ? { x: (p1.x + p2.x) / 2, y: p1.y }
      : { x: p1.x, y: (p1.y + p2.y) / 2 }

    /* Walk the label back toward the source until it clears every box that is
       not an endpoint. Upstream rule 6: nodes paint after labels, so a mask
       landing inside one renders as a fragment on the box border. */
    const others = placed.filter((p) => p.node.id !== e.from && p.node.id !== e.to)
    const halfW = Math.max((e.label?.length ?? 0) * 3.2 + 8, 14)
    const clears = (x: number, y: number) =>
      !others.some(
        (p) => x + halfW > p.x && x - halfW < p.x + p.w && y > p.y - 14 && y < p.y + p.h + 14
      )
    let label = mid
    if (e.label && horizontalRun && !clears(mid.x, mid.y)) {
      const dir = Math.sign(p2.x - p1.x) || 1
      for (let step = 1; step <= 20; step++) {
        const cx = mid.x - dir * step * 20
        if (clears(cx, mid.y)) {
          label = { x: cx, y: mid.y }
          break
        }
      }
    }

    return { e, d: elbow(p1, p2, bias), label, horizontalRun }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Flowchart"
      /* Scopes scripts/check-diagram.mjs to the drawing. Without it the checker
         walks the logo watermark and reports the wordmark as diagonal
         connectors. Every ported type carries it. */
      data-diagram="flowchart"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Connectors BEFORE nodes, so strokes sit behind the boxes. */}
      {routed.map(
        (r, i) => r && <Connector key={i} d={r.d} tone={r.e.tone} dashed={r.e.dashed} idPrefix={uid} />
      )}

      {placed.map((p) =>
        p.shape === 'decision' ? (
          <Diamond
            key={p.node.id}
            x={p.x}
            y={p.y}
            w={p.w}
            h={p.h}
            label={p.node.label}
            sublabel={p.node.sublabel}
            kind={p.node.kind}
          />
        ) : (
          <NodeBox
            key={p.node.id}
            x={p.x}
            y={p.y}
            w={p.w}
            h={p.h}
            /* A terminal is a full stadium, not upstream's flat rx=20: the shape
               is the only thing separating "start / end" from "step", so it has
               to be unmistakable at slide distance. */
            rx={p.shape === 'terminal' ? p.h / 2 : 6}
            kind={p.node.kind}
            name={p.node.label}
            sublabel={p.node.sublabel}
            tag={p.node.tag}
          />
        )
      )}

      {/* Labels last: their masks must sit above the strokes they interrupt, and
          the nodes still win over them — which is why every label is placed on
          open canvas. */}
      {routed.map(
        (r, i) =>
          r?.e.label && (
            <ArrowLabel
              key={i}
              x={r.label.x}
              y={r.label.y}
              text={r.e.label}
              side={r.horizontalRun ? 'above' : 'right'}
              tone={r.e.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/** The decision diamond.
 *
 *  Drawn as two <polygon>s — an opaque paper mask, then the styled shape — for
 *  the same reason NodeBox stacks two rects: a connector routed behind a
 *  translucent fill must not show through. It is a polygon rather than a path
 *  because the geometry gate parses every `path` for slanted segments, and a
 *  diamond's faces are exactly that; the shape's own outline is not a connector,
 *  so it has no business in that walk. */
function Diamond({
  x,
  y,
  w,
  h,
  label,
  sublabel,
  kind = 'step',
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  sublabel?: string
  kind?: NodeKind
}) {
  const s = nodeStyle[kind]
  const dash = 'dash' in s ? (s.dash as string) : undefined
  const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g>
      <polygon points={pts} fill={role.paper} />
      <polygon
        points={pts}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={1}
        {...(dash ? { strokeDasharray: dash } : {})}
      />
      <text
        x={cx}
        y={sublabel ? cy - 8 : cy}
        fill={role.ink}
        fontFamily={diagramType.family}
        fontSize={diagramType.nodeName.size}
        fontWeight={diagramType.nodeName.weight}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={cx}
          y={cy + 10}
          fill={role.muted}
          fontFamily={diagramType.family}
          fontSize={diagramType.sublabel.size}
          fontWeight={diagramType.sublabel.weight}
          letterSpacing={`${diagramType.sublabel.tracking}em`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}
