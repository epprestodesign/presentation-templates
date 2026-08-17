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
  withAlpha,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — Swimlane. A process, with the owner of every step made visible.
 *
 * Ported from the diagram-design skill's `type-swimlane.md`. One horizontal lane
 * per actor, steps sitting in the lane of whoever performs them, and THE
 * HANDOFFS — the arrows that cross a lane boundary — carrying the argument. A
 * swimlane exists because someone asked "who does this", so the accent belongs
 * on the crossing that costs the most coupling or the most waiting, not on a step.
 *
 * LAYOUT IS DERIVED. Lane bands split the well's height evenly; step columns
 * split what is left after the label column. A step is placed by `(lane, col)`
 * and never given a coordinate. Empty cells render nothing — a lane with one
 * step is a legitimate finding, not a hole to fill.
 *
 * Routing follows upstream's rule: EXIT RIGHT, ENTER TOP OR BOTTOM. That single
 * convention is what keeps a cross-lane diagram readable, because every handoff
 * then has the same silhouette and the corridor is always the column the target
 * sits in. Three cases:
 *
 *  - Same lane, next column → a straight horizontal line.
 *  - Different lane, later column → out of the right face, along the source's
 *    lane, then down (or up) into the target's horizontal face.
 *  - Backwards — a rework or escalation loop — the same shape mirrored: out of
 *    the LEFT face, back along the source's lane, then into the target's
 *    horizontal face. Dash it, because a reader who meets a solid line running
 *    right-to-left reads it as a mistake.
 *
 * A backwards edge must change lane. Within one lane the return leg would run at
 * the target's own centre line and end up travelling through it, and upstream's
 * answer to that is not a clever route — it is to reorder the steps.
 */

export interface SwimLane {
  key: string
  /** Uppercased. Use `\n` for a two-line lane name. */
  name: string
  /** Tint the band. Upstream's rule: at most one lane, or it reads as decor. */
  tint?: boolean
}

export interface SwimNode {
  id: string
  /** `key` of the lane that owns this step. */
  lane: string
  /** 0-based step column. */
  col: number
  name: string
  sublabel?: string
  tag?: string
  kind?: NodeKind
}

export interface SwimEdge {
  from: string
  to: string
  label?: string
  tone?: ArrowTone
  dashed?: boolean
}

export interface SwimlaneProps {
  width: number
  height: number
  lanes: SwimLane[]
  nodes: SwimNode[]
  edges?: SwimEdge[]
  legend?: LegendItem[]
  /** Defaults to the widest column referenced. */
  columns?: number
  labelWidth?: number
  colGap?: number
  nodeHeight?: number
}

type Side = 'top' | 'right' | 'bottom' | 'left'

interface Placed extends SwimNode {
  laneIndex: number
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

export function Swimlane({
  width,
  height,
  lanes,
  nodes,
  edges = [],
  legend,
  columns,
  labelWidth = 132,
  colGap = 24,
  nodeHeight = 64,
}: SwimlaneProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  const cols = columns ?? nodes.reduce((m, n) => Math.max(m, n.col + 1), 1)
  const contentW = width - labelWidth
  const colW = contentW / cols
  const laneH = drawH / lanes.length
  const laneIndex = new Map(lanes.map((l, i) => [l.key, i]))

  const placed: Placed[] = nodes.map((n) => {
    const li = laneIndex.get(n.lane) ?? 0
    const h = Math.min(nodeHeight, laneH - 16)
    const w = colW - colGap
    const x = snap(labelWidth + n.col * colW + colGap / 2)
    const y = snap(li * laneH + (laneH - h) / 2)
    return {
      ...n,
      laneIndex: li,
      x,
      y,
      w: snap(w),
      h: snap(h),
      cx: snap(x + w / 2),
      cy: snap(y + h / 2),
    }
  })
  const byId = new Map(placed.map((p) => [p.id, p]))

  const sidesFor = (e: SwimEdge) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) return null
    const back = b.col < a.col
    const down = b.laneIndex > a.laneIndex
    const vertical = b.col === a.col
    const fs: Side = vertical ? (down ? 'bottom' : 'top') : back ? 'left' : 'right'
    const ts: Side =
      a.laneIndex === b.laneIndex && !vertical ? 'left' : down ? 'top' : 'bottom'
    return { a, b, fs, ts }
  }

  const key = (id: string, side: string) => `${id}:${side}`
  const outN = new Map<string, number>()
  const inN = new Map<string, number>()
  for (const e of edges) {
    const s = sidesFor(e)
    if (!s) continue
    outN.set(key(e.from, s.fs), (outN.get(key(e.from, s.fs)) ?? 0) + 1)
    inN.set(key(e.to, s.ts), (inN.get(key(e.to, s.ts)) ?? 0) + 1)
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

    const horizontalRun = fs === 'right' || fs === 'left'
    const d = elbow(p1, p2, horizontalRun ? 'h' : 'v')
    /* The label's home is the long leg, which for a lane crossing is the run
       through the SOURCE's lane — open canvas by construction, because the cells
       the leg crosses are the ones the process skipped. */
    const mid: Point = horizontalRun
      ? { x: snap((p1.x + p2.x) / 2), y: p1.y }
      : { x: p1.x, y: snap((p1.y + p2.y) / 2) }

    /* Walk the label back toward the source until it clears every box that is
       not an endpoint — upstream rule 6, same treatment as Architecture. */
    const others = placed.filter((p) => p.id !== e.from && p.id !== e.to)
    const halfW = Math.max((e.label?.length ?? 0) * 3.2 + 8, 14)
    const clears = (x: number, y: number) =>
      !others.some(
        (p) => x + halfW > p.x && x - halfW < p.x + p.w && y > p.y - 14 && y < p.y + p.h + 14
      )
    let label = mid
    if (e.label && horizontalRun && !clears(mid.x, mid.y)) {
      const dir = Math.sign(p2.x - p1.x) || 1
      for (let step = 1; step <= 20; step++) {
        const cx = mid.x - dir * step * 18
        if (clears(cx, mid.y)) {
          label = { x: cx, y: mid.y }
          break
        }
      }
    }

    return { e, d, label, horizontalRun }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Swimlane diagram"
      /* Scopes scripts/check-diagram.mjs to the drawing — see Architecture.tsx. */
      data-diagram="swimlane"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Lane tints, emitted as bare rects rather than inside a <g>: the geometry
          gate reads any group holding two or more rects as a node box, and a pair
          of tint bands would then report as overlapping nodes. */}
      {lanes.map((l, i) =>
        l.tint ? (
          <rect
            key={`tint-${l.key}`}
            x={labelWidth}
            y={snap(i * laneH)}
            width={width - labelWidth}
            height={snap(laneH)}
            fill={withAlpha(role.accent, 0.04)}
          />
        ) : null
      )}

      {/* Lane dividers and the label-column rule. */}
      {lanes.map((l, i) => (
        <line
          key={`div-${l.key}`}
          x1={0}
          y1={snap(i * laneH)}
          x2={width}
          y2={snap(i * laneH)}
          stroke={role.rule}
          strokeWidth={i === 0 ? 1 : 0.8}
        />
      ))}
      <line x1={0} y1={snap(drawH)} x2={width} y2={snap(drawH)} stroke={role.rule} strokeWidth={1} />
      <line
        x1={labelWidth}
        y1={0}
        x2={labelWidth}
        y2={snap(drawH)}
        stroke={role.ruleSolid}
        strokeWidth={1}
      />

      {/* Lane labels. Every lane is named — an unlabelled lane is the one thing
          this type cannot survive. */}
      {lanes.map((l, i) => {
        const lines = l.name.split('\n')
        const mid = i * laneH + laneH / 2
        return lines.map((line, li) => (
          <DiagramText
            key={`label-${l.key}-${li}`}
            x={labelWidth - 20}
            y={snap(mid + (li - (lines.length - 1) / 2) * 13)}
            variant="eyebrow"
            tone="muted"
            anchor="end"
            uppercase
          >
            {line}
          </DiagramText>
        ))
      })}

      {/* Connectors BEFORE nodes. */}
      {routed.map(
        (r, i) => r && <Connector key={i} d={r.d} tone={r.e.tone} dashed={r.e.dashed} idPrefix={uid} />
      )}

      {placed.map((p) => (
        <NodeBox
          key={p.id}
          x={p.x}
          y={p.y}
          w={p.w}
          h={p.h}
          kind={p.kind}
          name={p.name}
          sublabel={p.sublabel}
          tag={p.tag}
        />
      ))}

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
