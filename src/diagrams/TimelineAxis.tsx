import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  DiagramText,
  Legend,
  diagramType,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Timeline Axis. Events positioned proportionally IN TIME.
 *
 * THE AXIS IS A SCALE, NOT A ROW OF SLOTS. That is the entire reason this type
 * exists alongside the deck's `Templates/Narrative/Timeline`, which spaces
 * milestones evenly because its subject is sequence. Here the subject is
 * *interval*: a room block signed at T-180 and a cut-off at T-30 are five months
 * apart, and the drawing has to show five months. Upstream's rule is blunt about
 * it — "if intervals are non-equal, space the circles non-equally; don't fake
 * linear spacing for aesthetics" — and an evenly spaced timeline is the type's
 * first listed anti-pattern.
 *
 * So every x comes from one linear scale over the date domain, and nothing in
 * this file can place an event any other way. Everything else is derived from
 * that: tick boundaries, label lanes, span brackets.
 *
 * LABEL COLLISION IS SOLVED, NOT HOPED FOR. Proportional spacing means events
 * cluster — a contract at T-180 then four dates inside the final fortnight — and
 * the type's third anti-pattern is exactly that cluster rendered as overlapping
 * text. Labels are therefore packed: each one takes the shallowest free slot in
 * (side, lane) order, its measured box is reserved, and a lane-1 label is only
 * accepted if its leader line can reach the axis without crossing a lane-0 box
 * on the same side. Two lanes a side, so four slots, which is enough for the
 * nine-event budget.
 *
 * No <path> is emitted. The baseline, the ticks, the leaders and the span
 * brackets are all rules and measures rather than connectors — an axis is not an
 * arrow between two nodes — so they are <line>, which is what upstream's own
 * timeline spec draws.
 */

export interface TimelineEvent {
  /** ISO `YYYY-MM-DD`, or `YYYY-MM-DDTHH:MM` for an incident timeline. Parsed as
   *  UTC either way, so the scale never shifts by a zone. */
  date: string
  name: string
  /** Extra metadata, appended after the formatted date. Keep it short. */
  sublabel?: string
  /** `milestone` is the accent. One or two per timeline, never four. */
  kind?: 'event' | 'milestone'
}

export interface TimelineTick {
  date: string
  label: string
}

/** A measured duration between two dates — a bracket with an ArrowLabel.
 *
 *  This is the annotation that makes the unevenness legible: "60 DAYS" over a
 *  wide gap and "9 DAYS" over a narrow one says more about the process than
 *  either pair of dots does. Spans share one band, so they must not overlap in
 *  time; two overlapping spans would stack their brackets on the same rule. */
export interface TimelineSpan {
  from: string
  to: string
  /** Uppercased by ArrowLabel. Keep to ≤14 characters. */
  label: string
  tone?: 'soft' | 'accent'
}

export interface TimelineAxisProps {
  width: number
  height: number
  events: TimelineEvent[]
  /** Domain ends. Default to the event range, padded by 4% either side so the
   *  first and last dot are not sitting on the axis terminals. */
  start?: string
  end?: string
  /** Explicit boundaries. Omitted → one tick per month start in the domain. */
  ticks?: TimelineTick[]
  /** Eyebrow at the top-left of the drawing — the unit or the domain, so the
   *  reader is never asking "what scale is this". Same slot Gantt and Bar put
   *  their axis titles in, which is the only slot in this type that is
   *  guaranteed clear: the axis's own right end is where the last label and the
   *  last span bracket both want to be. */
  axisLabel?: string
  spans?: TimelineSpan[]
  legend?: LegendItem[]
}

/* ------------------------------------------------------------------ scaling */

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** Parse to a UTC instant, whether the caller wrote a date or a datetime.
 *
 *  Everything is forced to UTC because the alternative is a diagram whose
 *  geometry depends on the machine that rendered it: a bare `YYYY-MM-DD` is UTC
 *  per spec but a bare `YYYY-MM-DDTHH:MM` is LOCAL, so the same story would
 *  place its dots differently in two timezones and the PNG check would flap. */
const utc = (iso: string) =>
  Date.parse(iso.includes('T') ? (/(Z|[+-]\d\d:?\d\d)$/.test(iso) ? iso : `${iso}Z`) : `${iso}T00:00:00Z`)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad2 = (n: number) => String(n).padStart(2, '0')
const clockOf = (ms: number) => {
  const d = new Date(ms)
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`
}
const dayOf = (ms: number) => {
  const d = new Date(ms)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/**
 * Tick steps, coarsest that still leaves ≤ 8 ticks.
 *
 * A timeline needs boundaries at a unit the reader already thinks in, and which
 * unit that is depends entirely on the domain: `09:15` for a two-hour incident,
 * `4 Mar` for a season, `Mar` for three years. Guessing wrong is upstream's
 * second anti-pattern ("what unit is this?") in a different costume.
 */
const STEPS = [5 * MIN, 15 * MIN, 30 * MIN, HOUR, 2 * HOUR, 6 * HOUR, 12 * HOUR, DAY, 2 * DAY, 7 * DAY, 14 * DAY]

function autoTicks(t0: number, t1: number): TimelineTick[] {
  const span = t1 - t0
  if (span > 70 * DAY) return monthTicks(t0, t1)
  const step = STEPS.find((s) => span / s <= 8) ?? 14 * DAY
  const out: TimelineTick[] = []
  /* Aligned to epoch multiples of the step, which for hour and day steps means
     aligned to UTC hour and UTC midnight — a boundary, not an offset. */
  for (let at = Math.ceil(t0 / step) * step; at <= t1; at += step) {
    out.push({
      date: new Date(at).toISOString(),
      label: step < DAY ? clockOf(at) : dayOf(at),
    })
  }
  return out
}

/** One tick per month boundary, with the year appended whenever it turns over —
 *  so a three-year history reads `Nov · Jan 27 · Mar` rather than repeating a
 *  year the reader can infer. */
function monthTicks(t0: number, t1: number): TimelineTick[] {
  const out: TimelineTick[] = []
  const d = new Date(t0)
  const y = d.getUTCFullYear()
  let m = d.getUTCMonth()
  // Start at the first month boundary at or after t0.
  if (d.getUTCDate() !== 1 || d.getUTCHours() !== 0) m += 1
  /* Thin the ticks out on a long domain: twelve month labels across a slide is
     a ruler, not an axis. */
  const months = (t1 - t0) / (30.4 * DAY)
  const every = months > 30 ? 6 : months > 15 ? 3 : months > 9 ? 2 : 1
  for (let guard = 0; guard < 64; guard++, m += 1) {
    const at = Date.UTC(y + Math.floor(m / 12), m % 12, 1)
    if (at > t1) break
    if (m % every !== 0) continue
    const mm = ((m % 12) + 12) % 12
    const yy = y + Math.floor(m / 12)
    out.push({
      date: new Date(at).toISOString(),
      label: mm === 0 ? `${MONTHS[mm]} ${String(yy).slice(2)}` : MONTHS[mm],
    })
  }
  return out
}

/* ------------------------------------------------------------ label packing */

/** Rough advance width. Poppins at these sizes runs a little under 0.6em per
 *  character; 0.62 leaves the packer erring toward more space, never less. */
const measure = (text: string, size: number) => text.length * size * 0.62

const LANE_H = 34
/** Axis → first label lane, and the gap the leader line lives in. */
const ABOVE_GAP = 18
const BELOW_GAP = 10
/** Tick date labels under the baseline. */
const TICK_BAND = 26
/** Reserved when there are spans: bracket rule + its ArrowLabel above it. */
const SPAN_BAND = 32
const MAX_LANES = 2
/** Horizontal breathing room between two adjacent label boxes. */
const LABEL_PAD = 10

interface Slot {
  side: 'above' | 'below'
  lane: number
}

interface PlacedLabel extends Slot {
  ev: TimelineEvent
  /** Dot centre — always the true scaled position. */
  x: number
  /** Label box, which may be anchored left or right of the dot near the edges. */
  left: number
  right: number
  anchor: 'start' | 'middle' | 'end'
  textX: number
}

export function TimelineAxis({
  width,
  height,
  events,
  start,
  end,
  ticks,
  axisLabel,
  spans = [],
  legend,
}: TimelineAxisProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  /* --- domain and scale ------------------------------------------------- */
  const times = events.map((e) => utc(e.date))
  const rawMin = start ? utc(start) : Math.min(...times)
  const rawMax = end ? utc(end) : Math.max(...times)
  const pad = start && end ? 0 : (rawMax - rawMin) * 0.04
  const t0 = rawMin - pad
  const t1 = rawMax + pad
  const span = Math.max(t1 - t0, 1)
  const x = (iso: string) => snap(((utc(iso) - t0) / span) * width)

  /* One formatter for the whole diagram, chosen from the domain. Mixing `4 Mar`
     and `09:15` on one axis is the fastest way to make a reader distrust it. */
  const stamp = (iso: string) => (span < 3 * DAY ? clockOf(utc(iso)) : dayOf(utc(iso)))
  const metaOf = (ev: TimelineEvent) =>
    ev.sublabel ? `${stamp(ev.date)} · ${ev.sublabel}` : stamp(ev.date)

  /* --- pack the labels -------------------------------------------------- */
  /* Sorted by date so packing is left-to-right and the reserved intervals are
     always compared against everything to the left — which is what makes a
     single greedy pass correct. */
  const ordered = [...events]
    .map((ev) => ({ ev, x: x(ev.date) }))
    .sort((a, b) => a.x - b.x)

  const occupied = new Map<string, { left: number; right: number }[]>()
  const key = (s: Slot) => `${s.side}:${s.lane}`
  const reserve = (s: Slot, left: number, right: number) => {
    const arr = occupied.get(key(s)) ?? []
    arr.push({ left, right })
    occupied.set(key(s), arr)
  }
  const free = (s: Slot, left: number, right: number) =>
    !(occupied.get(key(s)) ?? []).some((b) => left < b.right + LABEL_PAD && right > b.left - LABEL_PAD)

  const placed: PlacedLabel[] = ordered.map(({ ev, x: ex }, i) => {
    const meta = metaOf(ev)
    const w = Math.max(
      measure(ev.name, diagramType.nodeName.size),
      measure(meta, diagramType.sublabel.size)
    )

    /* Anchor from position, not from a clamp. A label centred on a dot near the
       right edge would run off the artboard; nudging it back would break the
       leader line's alignment. Anchoring `end` at the dot instead keeps the
       leader exactly on the label's edge and stays inside the well. */
    const anchor: 'start' | 'middle' | 'end' =
      ex + w / 2 > width ? 'end' : ex - w / 2 < 0 ? 'start' : 'middle'
    const left = anchor === 'start' ? ex : anchor === 'end' ? ex - w : ex - w / 2
    const right = left + w

    /* Alternate the preferred side, then deepen. Alternation is the editorial
       convention; the lane search is the part that survives a cluster. */
    const prefer: 'above' | 'below' = i % 2 === 0 ? 'above' : 'below'
    const other: 'above' | 'below' = prefer === 'above' ? 'below' : 'above'
    const order: Slot[] = []
    for (let lane = 0; lane < MAX_LANES; lane++) {
      order.push({ side: prefer, lane }, { side: other, lane })
    }

    const fits = order.find((s) => {
      if (!free(s, left, right)) return false
      /* A lane-1 leader has to cross lane 0 to reach the axis. Only accept the
         slot if the dot's x is clear of every shallower box on that side —
         otherwise the leader draws straight through a name. */
      for (let l = 0; l < s.lane; l++) {
        const shallower = occupied.get(key({ side: s.side, lane: l })) ?? []
        if (shallower.some((b) => ex > b.left - 6 && ex < b.right + 6)) return false
      }
      return true
    })
    /* Nothing free means the timeline is over its event budget. Take the
       deepest slot rather than silently dropping a label. */
    const slot = fits ?? { side: prefer, lane: MAX_LANES - 1 }
    reserve(slot, left, right)
    return { ...slot, ev, x: ex, left, right, anchor, textX: ex }
  })

  const depth = (side: 'above' | 'below') =>
    placed.filter((p) => p.side === side).reduce((n, p) => Math.max(n, p.lane + 1), 0)
  const aboveLanes = depth('above')
  const belowLanes = depth('below')

  /* --- vertical composition, derived from the lanes actually used -------- */
  const spanBand = spans.length ? SPAN_BAND : 0
  const aboveDepth = (aboveLanes ? ABOVE_GAP + aboveLanes * LANE_H : ABOVE_GAP) + spanBand
  const belowDepth = TICK_BAND + (belowLanes ? BELOW_GAP + belowLanes * LANE_H : 0)
  const axisY = snap(aboveDepth + Math.max(0, (drawH - aboveDepth - belowDepth) / 2))

  /** Bottom edge of an above lane, and top edge of a below lane. */
  const laneBottom = (lane: number) => axisY - ABOVE_GAP - spanBand - lane * LANE_H
  const laneTop = (lane: number) => axisY + TICK_BAND + BELOW_GAP + lane * LANE_H

  const spanRunY = snap(axisY - ABOVE_GAP - 8)
  const tickList = ticks ?? autoTicks(t0, t1)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Timeline"
      data-diagram="timeline-axis"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Tick boundaries first, behind everything — they are ground, not
          content, and a dot must be able to sit on one. */}
      {tickList.map((t) => {
        const tx = x(t.date)
        return (
          <g key={t.date}>
            <line x1={tx} y1={axisY} x2={tx} y2={axisY + 6} stroke={role.rule} strokeWidth={1} />
            <text
              x={tx}
              y={axisY + 17}
              fill={role.soft}
              fontFamily={diagramType.family}
              fontSize={diagramType.eyebrow.size}
              fontWeight={diagramType.eyebrow.weight}
              letterSpacing={`${diagramType.eyebrow.tracking}em`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {t.label.toUpperCase()}
            </text>
          </g>
        )
      })}

      {/* The baseline. Arrowheaded, because a timeline that does not say which
          way time runs makes the reader guess. */}
      <line
        x1={0}
        y1={axisY}
        x2={width}
        y2={axisY}
        stroke={role.ruleSolid}
        strokeWidth={1}
        markerEnd={`url(#${uid}-arrow-soft)`}
      />

      {axisLabel && (
        <DiagramText x={0} y={8} variant="eyebrow" tone="soft" uppercase>
          {axisLabel}
        </DiagramText>
      )}

      {/* Leader lines, before the dots so a dot always caps its own leader. */}
      {placed.map((p) => {
        const y2 = p.side === 'above' ? laneBottom(p.lane) + 4 : laneTop(p.lane) - 4
        return (
          <line
            key={`${p.ev.date}-${p.ev.name}-leader`}
            x1={p.x}
            y1={p.side === 'above' ? axisY - 6 : axisY + 6}
            x2={p.x}
            y2={y2}
            stroke={withAlpha(role.ink, 0.18)}
            strokeWidth={1}
          />
        )
      })}

      {/* Duration brackets AFTER the leaders, so where a leader crosses a
          bracket the bracket wins.

          An above-side label whose dot sits inside a span always produces that
          crossing, and z-order is the whole difference between the two readings:
          a faint ink@0.18 leader breaking an accent measure looks like a bug,
          while the measure running unbroken across it looks like a measure.
          Verticals stop 4px short of the baseline so the bracket reads as a
          measure OF the axis rather than a fence across it. */}
      {spans.map((s) => {
        const x1 = x(s.from)
        const x2 = x(s.to)
        const stroke = s.tone === 'accent' ? role.accent : role.soft
        return (
          <g key={`${s.from}-${s.to}`}>
            <line x1={x1} y1={spanRunY} x2={x1} y2={axisY - 4} stroke={stroke} strokeWidth={1} />
            <line x1={x2} y1={spanRunY} x2={x2} y2={axisY - 4} stroke={stroke} strokeWidth={1} />
            <line x1={x1} y1={spanRunY} x2={x2} y2={spanRunY} stroke={stroke} strokeWidth={1} />
          </g>
        )
      })}

      {placed.map((p) => {
        const milestone = p.ev.kind === 'milestone'
        const laneY = p.side === 'above' ? laneBottom(p.lane) - LANE_H : laneTop(p.lane)
        const meta = metaOf(p.ev)
        return (
          <g key={`${p.ev.date}-${p.ev.name}`}>
            {/* Paper collar, so the baseline does not run visibly through the
                dot's edge on a milestone's wider circle. */}
            <circle cx={p.x} cy={axisY} r={milestone ? 8 : 6} fill={role.paper} />
            <circle
              cx={p.x}
              cy={axisY}
              r={milestone ? 6 : 4}
              fill={milestone ? role.accent : role.muted}
            />
            <text
              x={p.textX}
              y={laneY + 10}
              fill={milestone ? role.accentDeep : role.ink}
              fontFamily={diagramType.family}
              fontSize={diagramType.nodeName.size}
              fontWeight={diagramType.nodeName.weight}
              textAnchor={p.anchor}
              dominantBaseline="central"
            >
              {p.ev.name}
            </text>
            <text
              x={p.textX}
              y={laneY + 26}
              fill={role.muted}
              fontFamily={diagramType.family}
              fontSize={diagramType.sublabel.size}
              fontWeight={diagramType.sublabel.weight}
              letterSpacing={`${diagramType.sublabel.tracking}em`}
              textAnchor={p.anchor}
              dominantBaseline="central"
            >
              {meta.toUpperCase()}
            </text>
          </g>
        )
      })}

      {/* Span labels last, above the bracket rule on open canvas. */}
      {spans.map((s) => (
        <ArrowLabel
          key={`${s.from}-${s.to}-label`}
          x={(x(s.from) + x(s.to)) / 2}
          y={spanRunY}
          text={s.label}
          side="above"
          tone={s.tone === 'accent' ? 'accent' : 'soft'}
        />
      ))}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

export { role }
