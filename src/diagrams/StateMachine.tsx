import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  NodeBox,
  elbow,
  fanPoints,
  role,
  snap,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — State machine. Finite states, and what moves between them.
 *
 * Ported from the diagram-design skill's `type-state.md`. States are rounded
 * rectangles, the entry point is a filled dot, the terminal is a ringed dot, and
 * EVERY TRANSITION IS LABELLED — `event [guard] / action`, with the sections you
 * do not need left off. An unlabelled transition removes the only thing a state
 * diagram exists to say, which is what triggers the move.
 *
 * LAYOUT IS DERIVED. States sit on a row/column grid; each row's band height is
 * the share of the well left after fixed rows, and each state is capped well
 * below its cell width. The cap is what buys the gap a transition label needs:
 * with boxes filling their cells the only home for `inventory loaded` is a
 * 40px gutter, and the mask would land inside both neighbours.
 *
 * Three routing cases, in the order the reader meets them:
 *
 *  - Same row → a straight horizontal line, the one legitimate straight case.
 *  - Same column, adjacent rows → a straight vertical, label beside it.
 *  - Neither → the ROW-GAP CORRIDOR: down out of the source, across the empty
 *    band between rows, down into the target's top face. Two elbows
 *    concatenated into one path, so the label lands on a long horizontal leg in
 *    open canvas instead of on a diagonal that would fail the gate outright.
 *
 * Upstream draws transitions as curves and self-loops as arcs. Both are
 * orthogonal here: the deck's connector rules are absolute, and a quarter-arc
 * corner already reads as a curve at this scale. A self-loop is therefore a
 * rectangular U over the state's top edge, landing on two distinct attach
 * points — upstream's rule 4 applies to a loop like anything else.
 *
 * `note` exists for the transition every state machine has and nobody should
 * draw: `* → Cancelled`. Upstream's own guidance is to annotate it once rather
 * than run an arrow out of all six states.
 */

export type StateShape = 'state' | 'start' | 'end'

export interface StateNode {
  id: string
  /** Omitted for `start` / `end`, which are dots. */
  name?: string
  sublabel?: string
  kind?: NodeKind
  shape?: StateShape
  /** 0-based column. */
  col: number
}

export interface StateRow {
  states: StateNode[]
  height?: number
}

export interface Transition {
  from: string
  to: string
  /** `event`, or `event [guard]`. Uppercased by ArrowLabel. */
  label: string
  tone?: ArrowTone
  dashed?: boolean
}

export interface StateMachineProps {
  width: number
  height: number
  rows: StateRow[]
  transitions?: Transition[]
  /** The one-line annotation that replaces a "from any state" fan-out. */
  note?: string
  legend?: LegendItem[]
  colGap?: number
  rowGap?: number
  stateWidth?: number
  stateHeight?: number
}

type Side = 'top' | 'right' | 'bottom' | 'left'

interface Placed {
  node: StateNode
  shape: StateShape
  row: number
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

const DOT = { start: 7, end: 10 }

export function StateMachine({
  width,
  height,
  rows,
  transitions = [],
  note,
  legend,
  colGap = 40,
  rowGap = 56,
  /* 164, NOT the 180 this started at. The cap is what buys the gutter a
     transition label sits in, and 180 left `PAYMENT CAPTURED` with 6px of air
     between its mask and each neighbouring state — text wedged between two
     boxes, and no room at all for the `[guard]` half of `event [guard]`, which
     is the label form this type exists to carry. At 164 the same gutter gives
     ~18px each side, and a guard on a corridor or a vertical drop fits without
     touching anything. */
  stateWidth = 164,
  stateHeight = 76,
}: StateMachineProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const noteH = note ? 24 : 0
  const drawH = height - legendH - noteH

  const cols = rows.reduce((m, r) => r.states.reduce((n, s) => Math.max(n, s.col + 1), m), 1)
  const colW = (width - colGap * (cols - 1)) / cols

  const fixed = rows.reduce((n, r) => n + (r.height ?? 0), 0)
  const autoCount = rows.filter((r) => !r.height).length
  const spare = Math.max(0, drawH - rowGap * (rows.length - 1) - fixed)
  const autoH = autoCount ? spare / autoCount : 0

  const bands: { top: number; h: number }[] = []
  const placed: Placed[] = []
  let cursorY = 0
  rows.forEach((r, ri) => {
    const bandH = r.height ?? autoH
    bands.push({ top: cursorY, h: bandH })
    r.states.forEach((s) => {
      const shape = s.shape ?? 'state'
      const cellX = s.col * (colW + colGap)
      const w = shape === 'state' ? Math.min(colW, stateWidth) : DOT[shape] * 2
      const h = shape === 'state' ? Math.min(bandH, stateHeight) : DOT[shape] * 2
      const x = snap(cellX + (colW - w) / 2)
      const y = snap(cursorY + (bandH - h) / 2)
      placed.push({
        node: s,
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

  /* Sides, then fanned attach points — same contract as every other type here. */
  const sidesFor = (t: Transition): { a: Placed; b: Placed; fs: Side; ts: Side } | null => {
    const a = byId.get(t.from)
    const b = byId.get(t.to)
    if (!a || !b) return null
    if (a === b) return { a, b, fs: 'top', ts: 'top' }
    if (a.row === b.row) {
      const right = b.cx > a.cx
      return { a, b, fs: right ? 'right' : 'left', ts: right ? 'left' : 'right' }
    }
    const down = b.row > a.row
    return { a, b, fs: down ? 'bottom' : 'top', ts: down ? 'top' : 'bottom' }
  }

  const key = (id: string, side: string) => `${id}:${side}`
  const outN = new Map<string, number>()
  const inN = new Map<string, number>()
  for (const t of transitions) {
    const s = sidesFor(t)
    if (!s || s.a === s.b) continue
    outN.set(key(t.from, s.fs), (outN.get(key(t.from, s.fs)) ?? 0) + 1)
    inN.set(key(t.to, s.ts), (inN.get(key(t.to, s.ts)) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()

  const anchor = (p: Placed, side: Side, i: number, total: number): Point => {
    if (side === 'right' || side === 'left') {
      const ys = fanPoints(p.y, p.h, total)
      return { x: side === 'right' ? p.x + p.w : p.x, y: snap(ys[i]) }
    }
    const xs = fanPoints(p.x, p.w, total)
    return { x: snap(xs[i]), y: side === 'bottom' ? p.y + p.h : p.y }
  }

  const routed = transitions.map((t) => {
    const s = sidesFor(t)
    if (!s) return null
    const { a, b, fs, ts } = s

    /* Self-loop: up out of the top edge, across, back down into it. Two attach
       points, both on the same face, 60px apart. */
    if (a === b) {
      const top = snap(a.y - 22)
      const p1: Point = { x: snap(a.cx - 30), y: a.y }
      const p2: Point = { x: snap(a.cx + 30), y: a.y }
      const bend: Point = { x: p2.x, y: top }
      return {
        t,
        d: `${elbow(p1, bend, 'v')} ${elbow(bend, p2, 'v')}`,
        label: { x: p2.x, y: snap(a.y - 11) },
        side: 'right' as const,
      }
    }

    const fk = key(t.from, fs)
    const tk = key(t.to, ts)
    const fi = outSeen.get(fk) ?? 0
    const ti = inSeen.get(tk) ?? 0
    outSeen.set(fk, fi + 1)
    inSeen.set(tk, ti + 1)
    const p1 = anchor(a, fs, fi, outN.get(fk) ?? 1)
    const p2 = anchor(b, ts, ti, inN.get(tk) ?? 1)

    if (a.row === b.row) {
      return { t, d: elbow(p1, p2), label: { x: snap((p1.x + p2.x) / 2), y: p1.y }, side: 'above' as const }
    }

    if (Math.abs(a.cx - b.cx) < 8) {
      return {
        t,
        d: elbow(p1, p2, 'v'),
        label: { x: p1.x, y: snap((p1.y + p2.y) / 2) },
        side: 'right' as const,
      }
    }

    /* Row-gap corridor. The band between two rows is the only guaranteed strip
       of open canvas on the drawing, so a transition that changes both row and
       column travels along it and the label goes there too. */
    const down = b.row > a.row
    const srcBand = bands[a.row]
    const gapY = down
      ? srcBand.top + srcBand.h + rowGap / 2
      : bands[b.row].top + bands[b.row].h + rowGap / 2
    const corrY = snap(gapY)
    const bend: Point = { x: p2.x, y: corrY }
    return {
      t,
      d: `${elbow(p1, bend, 'v')} ${elbow(bend, p2, 'v')}`,
      label: { x: snap((p1.x + p2.x) / 2), y: corrY },
      side: 'above' as const,
    }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="State machine diagram"
      /* Scopes scripts/check-diagram.mjs to the drawing — see Architecture.tsx. */
      data-diagram="state-machine"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Connectors BEFORE states. */}
      {routed.map(
        (r, i) => r && <Connector key={i} d={r.d} tone={r.t.tone} dashed={r.t.dashed} idPrefix={uid} />
      )}

      {placed.map((p) =>
        p.shape === 'state' ? (
          <NodeBox
            key={p.node.id}
            x={p.x}
            y={p.y}
            w={p.w}
            h={p.h}
            rx={8}
            kind={p.node.kind}
            name={p.node.name}
            sublabel={p.node.sublabel}
          />
        ) : p.shape === 'start' ? (
          <circle key={p.node.id} cx={p.cx} cy={p.cy} r={DOT.start} fill={role.ink} />
        ) : (
          <g key={p.node.id}>
            <circle
              cx={p.cx}
              cy={p.cy}
              r={DOT.end}
              fill={role.paper}
              stroke={role.ink}
              strokeWidth={1.25}
            />
            <circle cx={p.cx} cy={p.cy} r={DOT.end - 4} fill={role.ink} />
          </g>
        )
      )}

      {routed.map(
        (r, i) =>
          r && (
            <ArrowLabel
              key={i}
              x={r.label.x}
              y={r.label.y}
              text={r.t.label}
              side={r.side}
              tone={r.t.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {note && (
        <DiagramText x={0} y={drawH + 12} variant="sublabel" tone="soft">
          {note}
        </DiagramText>
      )}

      {legend?.length ? (
        <Legend x={0} y={drawH + noteH + 8} width={width} items={legend} />
      ) : null}
    </svg>
  )
}
