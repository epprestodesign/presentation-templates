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
} from './primitives'

/**
 * Diagram — Data Flow. How data moves through a pipeline ACROSS ROLES.
 *
 * Ported from the diagram-design skill's `data-flow` type. Lanes are roles, columns
 * are steps, and a cell holds a node only if that role does something at that step.
 * Reach for Architecture when the question is what talks to what; reach for this
 * one when the question is *who touches this, and in what order*.
 *
 * THE EMPTY CELL IS THE POINT. Upstream's first anti-pattern is a placeholder box
 * in a cell where a role does not participate, and it is worth restating: the
 * shape of the occupied cells IS the diagram. A grid of boxes with some greyed out
 * says "everyone is involved throughout"; a sparse grid says "the reservation
 * changes hands three times", which is the actual claim.
 *
 * ONE LABELLED ARROW. Also upstream's, also worth restating: every hand-off is an
 * arrow, but only the focal cross-role hand-off is named. Labelling all eight
 * turns the lanes into a wall of type and there is no longer a subject.
 *
 * PAYLOAD CHIPS ARE A SEPARATE AXIS FROM THE FOCAL COLOUR. A chip says what shape
 * the data is in (a form submission, a reservation row, a report); the accent says
 * which hand-off the slide is about. They must not be confused, so the chip palette
 * is `role.series` with the accent REMOVED — otherwise a payload chip would read
 * as focal.
 *
 * LAYOUT IS DERIVED. Lane height from the well's height, step width from its
 * width; three lanes × six steps and four × five both fill it.
 */

/** Grid-aligned floor — a divided dimension must never round outward. */
const floor4 = (n: number) => Math.max(4, Math.floor(n / 4) * 4)

export interface FlowLane {
  /** Two lines, both uppercase — a lane label is an identifier, not prose. */
  name: [string, string]
  /** Short code repeated inside every node in the lane. */
  key: string
}

export interface FlowStep {
  number: string
  label: string
  /** At most one. Accent header chip. */
  focal?: boolean
}

export interface FlowNode {
  /** Lane `key`. */
  lane: string
  /** Step index. */
  step: number
  title: string
  sub?: string
  /** Payload in / out, as codes declared in `payloads`. Position is fixed: in
   *  then out, left to right, in the node's top-right corner opposite the role
   *  tag. Upstream puts them on the bottom edge, which is better — a node then
   *  reads left-to-right as "this comes in, this goes out" — but `NodeBox`
   *  centres its name/sublabel block in the whole body and has no bottom
   *  reserve, so at these node heights a bottom chip landed on the sublabel. The
   *  choice was chips-at-the-bottom or a sublabel, and the sublabel says what the
   *  step actually does. The in-then-out reading order is preserved. */
  chips?: { in?: string; out?: string }
  /** At most one — the node that RECEIVES the focal hand-off. */
  focal?: boolean
}

export interface FlowArrow {
  from: { lane: string; step: number }
  to: { lane: string; step: number }
  tone?: ArrowTone
  dashed?: boolean
  /** Only the focal hand-off should carry one. */
  label?: string
  /** Override the derived exit / entry side.
   *
   *  Needed whenever the derived route would pass THROUGH a node that is not an
   *  endpoint — upstream rule 5. A right-exit cross-lane hop runs horizontally at
   *  the source's own lane y, so if the source's lane is also occupied at the
   *  target's step, that box is directly on the path. Dropping out of the bottom
   *  instead clears it. The component cannot infer this without a full obstacle
   *  map, so the author says so. */
  fromSide?: 'right' | 'bottom' | 'top' | 'left'
  toSide?: 'left' | 'top' | 'bottom' | 'right'
}

export interface DataFlowProps {
  width: number
  height: number
  lanes: FlowLane[]
  steps: FlowStep[]
  nodes: FlowNode[]
  arrows?: FlowArrow[]
  /** Payload codes in display order; the order fixes their colour. */
  payloads?: { code: string; label: string }[]
  legend?: LegendItem[]
}

interface Placed extends FlowNode {
  laneIdx: number
  x: number
  y: number
  w: number
  h: number
}

export function DataFlow({
  width,
  height,
  lanes,
  steps,
  nodes,
  arrows = [],
  payloads = [],
  legend,
}: DataFlowProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const nLanes = lanes.length
  const nSteps = steps.length

  /* The accent is removed from the chip palette so a payload chip can never read
     as the focal hand-off. `seriesCategorical[0]` IS `color.accent`. */
  const palette = role.series.filter((c) => c !== role.accent)
  const chipColor = (code: string) => {
    const i = payloads.findIndex((p) => p.code === code)
    return palette[(i < 0 ? 0 : i) % palette.length]
  }

  const legendH = 44
  const HEADER_H = 32
  const bodyH = height - legendH - HEADER_H
  const laneH = floor4(bodyH / nLanes)

  const labelColW = snap(Math.max(100, Math.min(152, width * 0.1)))
  const rightPad = 12
  const slotW = floor4((width - labelColW - rightPad) / nSteps)
  const nodeW = slotW - 24
  const nodeH = Math.min(laneH - 14, 76)

  const stepCx = (j: number) => snap(labelColW + j * slotW + slotW / 2)
  const laneTop = (k: number) => snap(HEADER_H + k * laneH)
  const laneCy = (k: number) => snap(laneTop(k) + laneH / 2)
  const gridBottom = laneTop(nLanes)

  const laneIdx = new Map(lanes.map((l, i) => [l.key, i]))

  const placed: Placed[] = nodes.flatMap((n) => {
    const k = laneIdx.get(n.lane)
    if (k === undefined) return []
    return [
      {
        ...n,
        laneIdx: k,
        x: snap(stepCx(n.step) - nodeW / 2),
        y: snap(laneTop(k) + (laneH - nodeH) / 2),
        w: nodeW,
        h: nodeH,
      },
    ]
  })
  const byCell = new Map(placed.map((n) => [`${n.lane}:${n.step}`, n]))

  /* Fan attach points, exactly as Architecture does it: group edges by (cell,
     side) so no two connectors share a point on a box (upstream rule 4). */
  const key = (r: { lane: string; step: number }, side: string) => `${r.lane}:${r.step}:${side}`
  const sideOf = (a: Placed, b: Placed, e: FlowArrow) => {
    const derived =
      a.laneIdx === b.laneIdx
        ? ({ fs: 'right', ts: 'left' } as const)
        : a.step === b.step
          ? b.laneIdx > a.laneIdx
            ? ({ fs: 'bottom', ts: 'top' } as const)
            : ({ fs: 'top', ts: 'bottom' } as const)
          : b.laneIdx > a.laneIdx
            ? ({ fs: 'right', ts: 'top' } as const)
            : ({ fs: 'right', ts: 'bottom' } as const)
    return { fs: e.fromSide ?? derived.fs, ts: e.toSide ?? derived.ts }
  }

  const outCount = new Map<string, number>()
  const inCount = new Map<string, number>()
  for (const e of arrows) {
    const a = byCell.get(`${e.from.lane}:${e.from.step}`)
    const b = byCell.get(`${e.to.lane}:${e.to.step}`)
    if (!a || !b) continue
    const { fs, ts } = sideOf(a, b, e)
    outCount.set(key(e.from, fs), (outCount.get(key(e.from, fs)) ?? 0) + 1)
    inCount.set(key(e.to, ts), (inCount.get(key(e.to, ts)) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()
  const anchor = (n: Placed, side: string, i: number, total: number) => {
    if (side === 'right' || side === 'left') {
      const ys = fanPoints(n.y, n.h, total)
      return { x: side === 'right' ? n.x + n.w : n.x, y: snap(ys[i]) }
    }
    const xs = fanPoints(n.x, n.w, total)
    return { x: snap(xs[i]), y: side === 'bottom' ? n.y + n.h : n.y }
  }

  const routed = arrows.flatMap((e) => {
    const a = byCell.get(`${e.from.lane}:${e.from.step}`)
    const b = byCell.get(`${e.to.lane}:${e.to.step}`)
    if (!a || !b) return []
    const { fs, ts } = sideOf(a, b, e)
    const fk = key(e.from, fs)
    const tk = key(e.to, ts)
    const fi = outSeen.get(fk) ?? 0
    const ti = inSeen.get(tk) ?? 0
    outSeen.set(fk, fi + 1)
    inSeen.set(tk, ti + 1)
    const p1 = anchor(a, fs, fi, outCount.get(fk) ?? 1)
    const p2 = anchor(b, ts, ti, inCount.get(tk) ?? 1)

    /* BIAS IS DECIDED BY THE ENTRY SIDE, NOT THE EXIT SIDE.

       `elbow()`'s last leg runs along the axis the bias did NOT move first, so an
       arrow entering a node's TOP must be horizontal-first and one entering its
       LEFT must be vertical-first. Keying the bias off the exit side instead
       looked right for the common case (right → top) and produced a 90°-wrong
       route the moment an author overrode `fromSide`: an arrow leaving a node's
       top and entering another's bottom came in sideways and terminated on the
       box's edge rather than under it. */
    const horizontal = ts === 'top' || ts === 'bottom'
    const d = elbow(p1, p2, horizontal ? 'h' : 'v')

    /* A same-step cross-lane hop shares an x, so `elbow()` emits a single
       vertical line and the bias is moot — but the LABEL still has to know. Keying
       the label off the bias alone put "ROOMING LIST" above a run that has no
       horizontal leg, which landed the mask inside the source node. */
    const verticalRun = Math.abs(p2.x - p1.x) < 0.5
    const labelOnHorizontal = horizontal && !verticalRun

    /* THE LABEL SITS IN THE GUTTER, NOT AT THE PATH MIDPOINT. Same reasoning as
       Architecture: with 180px nodes in 204px slots, the geometric midpoint of a
       cross-lane run lands inside a box, the box paints over the mask, and the
       text renders as a fragment on the border. The open canvas is the span from
       the source's right edge to the target's centre line. */
    const mid = labelOnHorizontal
      ? { x: snap((Math.max(a.x + a.w, p1.x) + p2.x) / 2), y: p1.y }
      : { x: p1.x, y: snap((p1.y + p2.y) / 2) }

    return [{ e, d, mid, labelOnHorizontal }]
  })

  /* The flow half of the legend is DERIVED from the arrows actually drawn. A
     legend row for a style the diagram does not use is worse than no legend: the
     reader hunts the drawing for a dashed line that is not there. */
  const flowItems: LegendItem[] = []
  if (arrows.some((a) => !a.dashed && (a.tone ?? 'default') === 'default'))
    flowItems.push({ label: 'Hand-off', line: 'default' })
  if (arrows.some((a) => a.dashed)) flowItems.push({ label: 'Governance', line: 'default', dashed: true })
  if (arrows.some((a) => a.tone === 'accent')) flowItems.push({ label: 'Focal hand-off', line: 'accent' })
  if (arrows.some((a) => a.tone === 'link')) flowItems.push({ label: 'Published', line: 'link' })

  const autoLegend: LegendItem[] =
    legend ?? [...payloads.map((p) => ({ label: p.label, swatch: chipColor(p.code) })), ...flowItems]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Data flow diagram"
      data-diagram="data-flow"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Grid: lane dividers and the label-column rule. NO lane tints — upstream
             lists an over-tinted lane set as an anti-pattern, and with dividers
             plus a two-line lane label the stripes carry no extra information. */}
      {lanes.map((_l, k) => (
        <line
          key={`d${k}`}
          x1={0}
          y1={laneTop(k)}
          x2={width}
          y2={laneTop(k)}
          stroke={withAlpha(role.ink, 0.12)}
          strokeWidth={0.8}
        />
      ))}
      <line
        x1={0}
        y1={gridBottom}
        x2={width}
        y2={gridBottom}
        stroke={withAlpha(role.ink, 0.12)}
        strokeWidth={0.8}
      />
      <line
        x1={labelColW}
        y1={HEADER_H}
        x2={labelColW}
        y2={gridBottom}
        stroke={withAlpha(role.ink, 0.12)}
        strokeWidth={0.8}
      />

      {/* 2. Step headers. A pill here rather than the rectangular type tag: this
             IS a status-of-progress chip — step 3 of 5 — which is the one meaning
             a pill is right for. */}
      {steps.map((s, j) => (
        <g key={s.label}>
          <rect
            x={stepCx(j) - 17}
            y={2}
            width={34}
            height={16}
            rx={8}
            fill={s.focal ? withAlpha(role.accent, 0.2) : withAlpha(role.ink, 0.1)}
          />
          <text
            x={stepCx(j)}
            y={10}
            fill={s.focal ? role.accentDeep : role.ink}
            fontFamily={diagramType.family}
            fontSize={diagramType.eyebrow.size}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {s.number}
          </text>
          <DiagramText
            x={stepCx(j)}
            y={26}
            variant="eyebrow"
            tone={s.focal ? 'accent' : 'muted'}
            anchor="middle"
            uppercase
          >
            {s.label}
          </DiagramText>
        </g>
      ))}

      {/* 3. Lane labels. */}
      {lanes.map((l, k) => (
        <g key={l.key}>
          <DiagramText x={snap(labelColW / 2)} y={laneCy(k) - 7} variant="eyebrow" tone="muted" anchor="middle" uppercase>
            {l.name[0]}
          </DiagramText>
          <DiagramText x={snap(labelColW / 2)} y={laneCy(k) + 6} variant="eyebrow" tone="muted" anchor="middle" uppercase>
            {l.name[1]}
          </DiagramText>
        </g>
      ))}

      {/* 4. Connectors before nodes, so strokes sit behind the boxes. */}
      {routed.map((r, i) => (
        <Connector key={i} d={r.d} tone={r.e.tone} dashed={r.e.dashed} idPrefix={uid} />
      ))}

      {/* 5. Nodes. `NodeBox` carries the paper mask, the box and the role tag; the
             payload chips are drawn as children so they land on the box's bottom
             edge, where upstream fixes them. */}
      {placed.map((n) => (
        <NodeBox
          key={`${n.lane}-${n.step}`}
          x={n.x}
          y={n.y}
          w={n.w}
          h={n.h}
          kind={n.focal ? 'focal' : 'step'}
          name={n.title}
          sublabel={n.sub}
          tag={n.lane}
        >
          {n.chips?.in && <PayloadChip x={n.x + n.w - 72} y={n.y + 7} code={n.chips.in} fill={chipColor(n.chips.in)} />}
          {n.chips?.out && (
            <PayloadChip x={n.x + n.w - 38} y={n.y + 7} code={n.chips.out} fill={chipColor(n.chips.out)} />
          )}
        </NodeBox>
      ))}

      {/* 6. The one labelled arrow, last. */}
      {routed.map(
        (r, i) =>
          r.e.label && (
            <ArrowLabel
              key={i}
              x={r.mid.x}
              y={r.mid.y}
              text={r.e.label}
              side={r.labelOnHorizontal ? 'above' : 'right'}
              tone={r.e.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      <Legend x={0} y={height - legendH + 8} width={width} items={autoLegend} />
    </svg>
  )
}

/** Payload chip. `rx=3`, NOT 2: the geometry gate reads an opaque `rx=2` rect
 *  paired with one text as an arrow-label mask, and these sit ON a node box, so at
 *  rx=2 every chipped node reported itself as a rule-6 violation. */
function PayloadChip({ x, y, code, fill }: { x: number; y: number; code: string; fill: string }) {
  const w = 30
  const h = 14
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} />
      <text
        x={x + w / 2}
        y={y + h / 2}
        fill={role.paper}
        fontFamily={diagramType.family}
        fontSize={diagramType.eyebrow.size}
        fontWeight={700}
        letterSpacing="0.06em"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {code}
      </text>
    </g>
  )
}
