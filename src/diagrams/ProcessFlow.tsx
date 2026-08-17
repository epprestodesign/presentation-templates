import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  TypeTag,
  diagramType,
  elbow,
  fanPoints,
  nodeStyle,
  role,
  snap,
  withAlpha,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — Process. A sequential process where WHO does the step and WHAT
 * payload moves are both part of the claim.
 *
 * Ported from the diagram-design skill's `type-process.md`, which is the richest
 * of the ported types and the only parametric one: upstream every coordinate is
 * a formula over the inputs, and two generations from the same inputs must
 * produce identical SVG. That property is kept — but the formulas are rederived
 * from the WELL rather than from upstream's fixed 112px step slot, because a
 * slide hands the diagram its box and a diagram that assumes 1400px wide would
 * be scaled, and a scaled diagram has soft hairlines and fractional type.
 *
 * Reach for swimlane instead when the payloads and the owning team are all that
 * matter. Reach for this when the reader has to see, per step, who owns it, what
 * arrives and what leaves.
 *
 * Four departures from upstream, each with its reason:
 *
 *  1. THE FOCAL ARROW SET IS DERIVED. Upstream asks the author to declare
 *     `style: focal-in` / `focal-out` on the edges touching the focal node. Any
 *     edge touching the focal node is accented here automatically, which removes
 *     a whole class of inconsistency — the declaration cannot disagree with the
 *     focal node any more.
 *
 *  2. PAYLOAD CHIPS ARE HAIRLINE, NOT FILLED. Upstream fills each chip with a
 *     per-format hex and sets white 5px mono inside it. Codes here take their
 *     colour from `role.series`, the deck's own categorical ramp, and are drawn
 *     as hairline tags — the same treatment as a type tag, because a filled chip
 *     at 8.5px turns into a coloured smudge and the ramp is not a set of
 *     payload-format semantics.
 *
 *  3. NO DOT-PATTERN GROUND. Upstream's §2.1 paints a dotted paper. Its own
 *     SKILL.md forbids that inside a slide, where the texture compounds with the
 *     surrounding chrome.
 *
 *  4. ONE LEGEND STRIP, FROM primitives. Upstream builds a bespoke three- or
 *     four-row legend inside the drawing. The deck already reserves 52px below
 *     the well for `Legend`, and the payload row is appended to it automatically
 *     so an author never has to know which series step a code was given.
 */

/** A payload format that moves between steps — upstream's data-type chips. */
export interface Payload {
  /** Two-letter code shown in the chip. */
  code: string
  /** What the code means. Appended to the legend. */
  label: string
}

export interface ProcessLane {
  /** 2–3 letter role badge, shown inside every node in the lane. */
  key: string
  /** Uppercased. Use `\n` for a two-line lane name. */
  name: string
  tint?: boolean
}

export interface ProcessStep {
  /** Column number as the reader should see it. */
  number: string
  label: string
  /** Exactly one step should be focal — the analytical or decision pivot. */
  focal?: boolean
}

export interface ProcessNodeSpec {
  id: string
  /** `key` of the owning lane. */
  lane: string
  /** 0-based step index. */
  step: number
  title: string
  /** The tool or system the step runs on. */
  tool?: string
  /** Payload arriving. Omitted on the first step — there is no upstream. */
  in?: string
  /** Payload leaving. Omitted on the last step — there is no downstream. */
  out?: string
  /** Exactly one node should be focal — the one receiving the critical handoff. */
  focal?: boolean
  kind?: NodeKind
}

export interface ProcessEdge {
  from: string
  to: string
  /** Orchestration trigger rather than a data handoff — dashed. */
  trigger?: boolean
  /** Only for a non-step concept: a rework loop, an escalation. */
  label?: string
}

export interface ProcessFlowProps {
  width: number
  height: number
  lanes: ProcessLane[]
  steps: ProcessStep[]
  nodes: ProcessNodeSpec[]
  edges?: ProcessEdge[]
  payloads?: Payload[]
  legend?: LegendItem[]
  labelWidth?: number
  colGap?: number
  nodeHeight?: number
}

type Side = 'top' | 'right' | 'bottom' | 'left'

interface Placed extends ProcessNodeSpec {
  laneIndex: number
  x: number
  y: number
  w: number
  h: number
  cx: number
  cy: number
}

/** Height of the step-number header strip. */
const HEADER_H = 40

export function ProcessFlow({
  width,
  height,
  lanes,
  steps,
  nodes,
  edges = [],
  payloads = [],
  legend = [],
  labelWidth = 132,
  /* THE CORRIDOR BETWEEN TWO CARDS, and 32 rather than the 20 this started at.
     Upstream's slot is a 100px node in a 112px column, so 12px of corridor —
     a proportion that survives being scaled down from a 1400px canvas, and does
     not survive being rendered 1:1 on a slide. At 20px the whole connector
     between two same-lane steps was 20px long, 8 of which were the arrowhead:
     an arrow with no shaft, and two cards that read as one. */
  colGap = 32,
  nodeHeight = 84,
}: ProcessFlowProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  /* Payload code → colour, by order of declaration. The author never names a
     colour; the ramp does, which is what keeps two process diagrams in one deck
     agreeing about what `RL` looks like. */
  const payloadColor = new Map(payloads.map((p, i) => [p.code, role.series[i % role.series.length]]))
  const legendItems: LegendItem[] = [
    ...legend,
    ...payloads.map((p) => ({ label: `${p.code} ${p.label}`, swatch: payloadColor.get(p.code) })),
  ]
  const legendH = legendItems.length ? 52 : 0
  const drawH = height - legendH

  const laneH = (drawH - HEADER_H) / lanes.length
  const colW = (width - labelWidth) / steps.length
  const laneIndex = new Map(lanes.map((l, i) => [l.key, i]))
  const laneKey = lanes.map((l) => l.key)
  const stepCx = (j: number) => snap(labelWidth + j * colW + colW / 2)
  const laneTop = (k: number) => snap(HEADER_H + k * laneH)

  const placed: Placed[] = nodes.map((n) => {
    const li = laneIndex.get(n.lane) ?? 0
    /* 16px of lane left over — upstream's own 8px margin above and below the
       card, which is the most that can be given back to the four-row stack
       inside it and still keep the card visibly off the lane divider. */
    const h = Math.min(nodeHeight, laneH - 16)
    const w = colW - colGap
    const x = snap(stepCx(n.step) - w / 2)
    const y = snap(laneTop(li) + (laneH - h) / 2)
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
  const focalId = nodes.find((n) => n.focal)?.id

  /* Routing: upstream §3.1 — exit RIGHT, enter TOP or BOTTOM, one right-angle
     bend, no diagonals and no left-side entry. Same lane and a later step is the
     one straight-line case. A trigger running backwards is the same shape
     mirrored: out of the left face, back along the source's lane, into the
     target's horizontal face. */
  const sidesFor = (e: ProcessEdge) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) return null
    const back = b.step < a.step
    const down = b.laneIndex > a.laneIndex
    const vertical = b.step === a.step
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
    const label: Point = horizontalRun
      ? { x: snap((p1.x + p2.x) / 2), y: p1.y }
      : { x: p1.x, y: snap((p1.y + p2.y) / 2) }

    /* Focal arrows are derived from the focal node, never declared — with one
       tightening of upstream: a TRIGGER off the focal node stays muted. Accent
       marks the payload path, and an orchestration hop is not one. */
    const focal = (e.from === focalId || e.to === focalId) && !e.trigger
    return { e, d, label, horizontalRun, tone: focal ? ('accent' as const) : ('default' as const) }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Process diagram"
      /* Scopes scripts/check-diagram.mjs to the drawing — see Architecture.tsx. */
      data-diagram="process-flow"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Lane tints as bare rects — a <g> holding two of them would read as a
          node box to the geometry gate. */}
      {lanes.map((l, i) =>
        l.tint ? (
          <rect
            key={`tint-${l.key}`}
            x={labelWidth}
            y={laneTop(i)}
            width={width - labelWidth}
            height={snap(laneH)}
            fill={withAlpha(role.accent, 0.04)}
          />
        ) : null
      )}

      {/* Structure: header rule, lane dividers, label-column rule. */}
      {lanes.map((l, i) => (
        <line
          key={`div-${l.key}`}
          x1={0}
          y1={laneTop(i)}
          x2={width}
          y2={laneTop(i)}
          stroke={role.rule}
          strokeWidth={i === 0 ? 1 : 0.8}
        />
      ))}
      <line x1={0} y1={snap(drawH)} x2={width} y2={snap(drawH)} stroke={role.rule} strokeWidth={1} />
      <line
        x1={labelWidth}
        y1={HEADER_H}
        x2={labelWidth}
        y2={snap(drawH)}
        stroke={role.ruleSolid}
        strokeWidth={1}
      />

      {/* Step headers: a numbered chip over an uppercase label. The focal step's
          chip is the accent — one per diagram, and it names the pivot. */}
      {steps.map((s, j) => {
        const cx = stepCx(j)
        const w = s.number.length > 1 ? 22 : 18
        return (
          <g key={`step-${s.number}`}>
            <rect
              x={cx - w / 2}
              y={4}
              width={w}
              height={16}
              rx={8}
              fill={s.focal ? withAlpha(role.accent, 0.18) : withAlpha(role.ink, 0.08)}
            />
            <text
              x={cx}
              y={12}
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
              x={cx}
              y={30}
              variant="eyebrow"
              tone={s.focal ? 'accentDeep' : 'muted'}
              anchor="middle"
              uppercase
            >
              {s.label}
            </DiagramText>
          </g>
        )
      })}

      {/* Lane labels. */}
      {lanes.map((l, i) => {
        const lines = l.name.split('\n')
        const mid = laneTop(i) + laneH / 2
        return lines.map((line, li) => (
          <DiagramText
            key={`lane-${l.key}-${li}`}
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
        (r, i) => r && <Connector key={i} d={r.d} tone={r.tone} dashed={r.e.trigger} idPrefix={uid} />
      )}

      {placed.map((p) => (
        <ProcessNode
          key={p.id}
          x={p.x}
          y={p.y}
          w={p.w}
          h={p.h}
          badge={laneKey[p.laneIndex]}
          title={p.title}
          tool={p.tool}
          inCode={p.in}
          outCode={p.out}
          kind={p.focal ? 'focal' : (p.kind ?? 'step')}
          colorOf={payloadColor}
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
              tone={r.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legendItems.length ? <Legend x={0} y={drawH + 8} width={width} items={legendItems} /> : null}
    </svg>
  )
}

/**
 * The process node — a four-row card, not the two-row stack `NodeBox` centres.
 *
 * It keeps NodeBox's own construction (opaque paper mask, then the styled box,
 * then a hairline `TypeTag`) so the geometry gate still reads it as one node box,
 * but the rows are placed explicitly: the badge says who, the title says what,
 * the tool says where it runs, and the chips say what arrives and what leaves.
 * Centring that stack is what makes upstream's node illegible at slide scale.
 */
function ProcessNode({
  x,
  y,
  w,
  h,
  badge,
  title,
  tool,
  inCode,
  outCode,
  kind,
  colorOf,
}: {
  x: number
  y: number
  w: number
  h: number
  badge: string
  title: string
  tool?: string
  inCode?: string
  outCode?: string
  kind: NodeKind
  colorOf: Map<string, string>
}) {
  const s = nodeStyle[kind]
  const dash = 'dash' in s ? (s.dash as string) : undefined
  const cx = x + w / 2
  /* FOUR ROWS AND FIVE GAPS, all of them at least 8px.

     The rows are 14 + 15 + 11 + 13 = 53px of content, so on an 80px card there
     are 27px of air to spend and the only question is where. Spending it evenly
     is what stops the card reading as a paragraph: the chips were 3px off the
     bottom border and 7px under the tool line, which at 8.5px type is close
     enough to touch. Title and tool therefore move UP by 2 and 3, and the chips
     come off the border by 21 — 8px of clearance below them, 9px above. */
  const titleY = y + 32
  const toolY = y + 45
  const chipTop = y + h - 21
  /* Upstream's collision rule: when the card is too short for four rows, the
     chips are the row that goes. */
  const showChips = chipTop > toolY + 10 && Boolean(inCode || outCode)

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={role.paper} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={1}
        {...(dash ? { strokeDasharray: dash } : {})}
      />
      <TypeTag x={x + 8} y={y + 7} label={badge} stroke={s.stroke} />
      <text
        x={cx}
        y={titleY}
        fill={role.ink}
        fontFamily={diagramType.family}
        fontSize={diagramType.nodeName.size}
        fontWeight={diagramType.nodeName.weight}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {title}
      </text>
      {tool && (
        <text
          x={cx}
          y={toolY}
          fill={role.muted}
          fontFamily={diagramType.family}
          fontSize={diagramType.sublabel.size}
          fontWeight={diagramType.sublabel.weight}
          letterSpacing={`${diagramType.sublabel.tracking}em`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {tool}
        </text>
      )}
      {showChips && inCode && (
        <PayloadChip x={x + 8} y={chipTop} code={inCode} color={colorOf.get(inCode) ?? role.muted} />
      )}
      {showChips && outCode && (
        <PayloadChip
          x={x + w - 34}
          y={chipTop}
          code={outCode}
          color={colorOf.get(outCode) ?? role.muted}
        />
      )}
    </g>
  )
}

/** Payload chip. Hairline and colour-coded, left = arriving, right = leaving. */
function PayloadChip({
  x,
  y,
  code,
  color,
}: {
  x: number
  y: number
  code: string
  color: string
}) {
  const t = diagramType.eyebrow
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={26}
        height={13}
        rx={2}
        fill="transparent"
        stroke={withAlpha(color, 0.6)}
        strokeWidth={0.8}
      />
      <text
        x={x + 13}
        y={y + 7}
        fill={color}
        fontFamily={diagramType.family}
        fontSize={t.size}
        fontWeight={t.weight}
        letterSpacing={`${t.tracking}em`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {code}
      </text>
    </g>
  )
}
