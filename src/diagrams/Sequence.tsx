import { Fragment, useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  NodeBox,
  diagramType,
  elbow,
  role,
  snap,
  withAlpha,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — Sequence. Who calls whom, in what order.
 *
 * Ported from the diagram-design skill's `type-sequence.md`. Actors sit in a row
 * at the top, a dashed lifeline drops from each, and every message is a
 * horizontal arrow between two lifelines. Time flows down and only down — an
 * arrow pointing up reverses time and is the one unforgivable error in this type.
 *
 * TIME IS DERIVED, NOT TYPED IN. The author lists messages; the component
 * assigns each a slot and divides the well's remaining height between them. A
 * combined fragment claims extra slots for its tab, its guard and its divider,
 * so adding an `alt` pushes every message below it down instead of landing on
 * top of one. Adding a message re-times the whole exchange.
 *
 * Two departures from upstream, both forced by what this deck owns:
 *
 *  1. ASYNC USES A SOFT DASHED HEAD, NOT A HOLLOW ONE. Upstream signals
 *     fire-and-forget with an open (unfilled) arrowhead. `ArrowMarkers` in
 *     primitives.tsx defines four filled heads and nothing else, and primitives
 *     is not this file's to edit — so async is dashed + `soft`, the palest head
 *     available, and the legend says so. If an open marker is ever added
 *     upstream of here, this is the one line to change.
 *
 *  2. THE OPERATOR TAB AND GUARDS ARE POPPINS, TRACKED. Upstream requires mono
 *     for `ALT` / `OPT` / `LOOP` and for `[guard]` text. The deck has no mono
 *     face; the technical register comes from size, weight and tracking, exactly
 *     as roles.ts sets out.
 */

export interface SeqActor {
  id: string
  name: string
  sublabel?: string
  kind?: NodeKind
}

/** Message kinds, from upstream's table. `success` is the one headline arrow. */
export type SeqKind = 'call' | 'external' | 'return' | 'async' | 'success'

export interface SeqMessage {
  from: string
  to: string
  /** Uppercased by ArrowLabel. Keep it under ~14 characters. */
  label: string
  kind?: SeqKind
}

export interface SeqFragment {
  operator: 'alt' | 'opt' | 'loop'
  /** Inclusive message-index range the frame spans. */
  from: number
  to: number
  /** `[condition]`, shown under the tab. */
  guard: string
  /** `alt` only: the message index where the second region starts. */
  elseAt?: number
  elseGuard?: string
}

export interface SeqActivation {
  actor: string
  /** Inclusive message-index range this actor holds control for. */
  from: number
  to: number
}

export interface SequenceProps {
  width: number
  height: number
  actors: SeqActor[]
  messages: SeqMessage[]
  fragments?: SeqFragment[]
  activations?: SeqActivation[]
  legend?: LegendItem[]
  actorHeight?: number
  actorGap?: number
}

const TONE: Record<SeqKind, { tone: ArrowTone; dashed: boolean }> = {
  call: { tone: 'default', dashed: false },
  external: { tone: 'link', dashed: false },
  return: { tone: 'default', dashed: true },
  async: { tone: 'soft', dashed: true },
  success: { tone: 'accent', dashed: false },
}

export function Sequence({
  width,
  height,
  actors,
  messages,
  fragments = [],
  activations = [],
  legend,
  actorHeight = 48,
  actorGap = 24,
}: SequenceProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  const actorW = (width - actorGap * (actors.length - 1)) / actors.length
  const geom = actors.map((a, i) => {
    const x = snap(i * (actorW + actorGap))
    return { actor: a, x, w: snap(actorW), cx: snap(x + actorW / 2) }
  })
  const cxOf = new Map(geom.map((g) => [g.actor.id, g.cx]))

  /* Slot allocation. A fragment's tab + guard needs the space of roughly one
     message before its first arrow, and an `alt` divider + second guard needs
     about the same again — so both buy slots rather than overlapping arrows. */
  const startAt = new Map<number, SeqFragment>()
  const elseAt = new Map<number, SeqFragment>()
  for (const f of fragments) {
    startAt.set(f.from, f)
    if (f.elseAt !== undefined) elseAt.set(f.elseAt, f)
  }

  /* A fragment's tab buys 1.7 slots and an `alt` divider 1.5, which is what it
     takes for the tab band and the guard to clear the 20px an ArrowLabel mask
     reserves above the first message of the region. Anything less and the
     region's guard renders under the first arrow's label. */
  const endedAt = new Set(fragments.map((f) => f.to + 1))
  const slots: number[] = []
  let cursor = 0
  messages.forEach((_, i) => {
    if (startAt.has(i)) cursor += 1.7
    if (elseAt.has(i)) cursor += 1.5
    /* And half a slot AFTER a frame closes, so the next message's label mask
       does not white out the frame's bottom border on its way past. */
    if (endedAt.has(i)) cursor += 0.5
    slots.push(cursor)
    cursor += 1
  })

  const topY = snap(actorHeight + 30)
  const bottomY = snap(drawH - 8)
  const totalSlots = Math.max(cursor - 0.35, 1)
  const step = (bottomY - topY) / totalSlots
  const ys = slots.map((s) => snap(topY + s * step))

  /* A message leaves and lands just off the lifeline so the arrowhead never
     buries itself in the activation bar it is aimed at. */
  const OFF = 5
  const routed = messages.map((m, i) => {
    const y = ys[i]
    const from = cxOf.get(m.from)
    const to = cxOf.get(m.to)
    if (from === undefined || to === undefined) return null
    const t = TONE[m.kind ?? 'call']

    if (m.from === m.to) {
      /* Self-message: a rectangular U back onto the same lifeline. Two elbows
         concatenated — right and down, then straight back — so every segment
         stays axis-aligned and the whole loop is one path with one head. */
      const loopW = Math.min(48, Math.max(28, step * 1.1))
      const drop = Math.max(14, step * 0.45)
      const p1: Point = { x: from + 4, y }
      const bend: Point = { x: snap(from + loopW), y: snap(y + drop) }
      const p2: Point = { x: from + OFF, y: bend.y }
      return {
        m,
        t,
        d: `${elbow(p1, bend, 'h')} ${elbow(bend, p2, 'h')}`,
        label: { x: bend.x, y: snap(y + drop / 2) },
        side: 'right' as const,
      }
    }

    const dir = Math.sign(to - from)
    const p1: Point = { x: snap(from + dir * OFF), y }
    const p2: Point = { x: snap(to - dir * OFF), y }

    /* A MESSAGE THAT SKIPS A LIFELINE CANNOT LABEL ITSELF AT ITS MIDPOINT.

       The midpoint of `Booking API → Hotel PMS` is the System of Record's
       lifeline, to the pixel — and upstream's own anti-pattern list names
       "labels sitting over another lifeline", because the label's opaque mask
       punches a hole in a lifeline it has nothing to do with and the reader
       reads the gap as the lifeline ending. So the run is cut at every lifeline
       it crosses and the label takes the middle of the WIDEST resulting span,
       which is open canvas by construction. For a message between neighbours
       there is nothing to cut and this is the midpoint, as before. */
    const lo = Math.min(p1.x, p2.x)
    const hi = Math.max(p1.x, p2.x)
    const stops = [
      lo,
      ...geom
        .map((g) => g.cx)
        .filter((cx) => cx > lo + 6 && cx < hi - 6)
        .sort((a, b) => a - b),
      hi,
    ]
    let best = { mid: (lo + hi) / 2, span: -1 }
    for (let k = 0; k < stops.length - 1; k++) {
      const span = stops[k + 1] - stops[k]
      if (span > best.span) best = { span, mid: (stops[k] + stops[k + 1]) / 2 }
    }

    return {
      m,
      t,
      d: elbow(p1, p2),
      label: { x: snap(best.mid), y },
      side: 'above' as const,
    }
  })

  /* Fragment frames span only the lifelines that participate, inset far enough
     that an activation bar on the outermost lifeline stays inside the frame. */
  const frames = fragments.map((f) => {
    const inRange = messages.slice(f.from, f.to + 1)
    const xs = inRange.flatMap((m) => [cxOf.get(m.from), cxOf.get(m.to)]).filter((n): n is number => n !== undefined)
    const x1 = snap(Math.max(0, Math.min(...xs) - 22))
    const x2 = snap(Math.min(width, Math.max(...xs) + 22))
    const top = snap(ys[f.from] - step * 1.45)
    const bottom = snap(ys[f.to] + step * 0.5)
    const divider = f.elseAt !== undefined ? snap(ys[f.elseAt] - step * 1.15) : undefined
    return { f, x: x1, y: top, w: x2 - x1, h: bottom - top, divider }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Sequence diagram"
      /* Scopes scripts/check-diagram.mjs to the drawing — see Architecture.tsx. */
      data-diagram="sequence"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Frames first: a wash behind the exchange, never over it. */}
      {frames.map((fr, i) => (
        <rect
          key={`frame-${i}`}
          x={fr.x}
          y={fr.y}
          width={fr.w}
          height={fr.h}
          rx={4}
          fill={withAlpha(role.ink, 0.02)}
          stroke={withAlpha(role.ink, 0.22)}
          strokeWidth={1}
        />
      ))}

      {/* Lifelines, then activation bars. Both are <line>/<rect> rather than
          paths, which keeps them out of the connector geometry walk — they are
          structure, not connections. */}
      {geom.map((g) => (
        <line
          key={`life-${g.actor.id}`}
          x1={g.cx}
          y1={actorHeight}
          x2={g.cx}
          y2={drawH - 4}
          stroke={withAlpha(role.ink, 0.2)}
          strokeWidth={1}
          strokeDasharray="3,3"
        />
      ))}

      {activations.map((a, i) => {
        const cx = cxOf.get(a.actor)
        if (cx === undefined) return null
        const top = snap(ys[a.from] - 6)
        const h = snap(ys[a.to] - ys[a.from] + 12)
        /* Two rects, mask then wash — the same trick NodeBox uses. With only the
           6% wash the dashed lifeline showed straight through and every bar read
           as hatched. They are siblings rather than a <g> because a group holding
           two rects is what the geometry gate calls a node box. */
        return (
          <Fragment key={`act-${i}`}>
            <rect x={cx - 4} y={top} width={8} height={h} rx={1} fill={role.paper} />
            <rect
              x={cx - 4}
              y={top}
              width={8}
              height={h}
              rx={1}
              fill={withAlpha(role.ink, 0.06)}
              stroke={role.muted}
              strokeWidth={0.8}
            />
          </Fragment>
        )
      })}

      {/* alt divider — dashed hairline across the frame, on the 4px grid. */}
      {frames.map((fr, i) =>
        fr.divider ? (
          <line
            key={`div-${i}`}
            x1={fr.x + 8}
            y1={fr.divider}
            x2={fr.x + fr.w - 8}
            y2={fr.divider}
            stroke={withAlpha(role.ink, 0.2)}
            strokeWidth={1}
            strokeDasharray="4,3"
          />
        ) : null
      )}

      {/* Messages before actor boxes, so a stroke sits behind the box it ends at. */}
      {routed.map(
        (r, i) => r && <Connector key={`msg-${i}`} d={r.d} tone={r.t.tone} dashed={r.t.dashed} idPrefix={uid} />
      )}

      {geom.map((g) => (
        <NodeBox
          key={g.actor.id}
          x={g.x}
          y={0}
          w={g.w}
          h={actorHeight}
          kind={g.actor.kind}
          name={g.actor.name}
          sublabel={g.actor.sublabel}
        />
      ))}

      {/* Operator tab + guards. The tab is rx=3, not rx=2: the geometry gate
          identifies an arrow-label mask as `one rect at rx=2 with an opaque fill
          plus one text`, and a fragment tab is a frame label, not a mask that
          must clear a stroke. */}
      {frames.map((fr, i) => (
        <g key={`tab-${i}`}>
          <rect
            x={fr.x}
            y={fr.y}
            width={44}
            height={16}
            rx={3}
            fill={role.paper2}
            stroke={withAlpha(role.ink, 0.22)}
            strokeWidth={1}
          />
          <text
            x={fr.x + 22}
            y={fr.y + 8}
            fill={role.muted}
            fontFamily={diagramType.family}
            fontSize={diagramType.eyebrow.size}
            fontWeight={diagramType.eyebrow.weight}
            letterSpacing={`${diagramType.eyebrow.tracking}em`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {fr.f.operator.toUpperCase()}
          </text>
          <DiagramText x={fr.x + 54} y={fr.y + 9} variant="sublabel" tone="soft">
            {`[${fr.f.guard}]`}
          </DiagramText>
          {fr.divider && fr.f.elseGuard && (
            /* Both guards hang off x + 54 — clear of the leftmost lifeline and
               its activation bar, which the frame's own inset does not clear. */
            <DiagramText x={fr.x + 54} y={fr.divider + 7} variant="sublabel" tone="soft">
              {`[${fr.f.elseGuard}]`}
            </DiagramText>
          )}
        </g>
      ))}

      {/* Labels last — masked, and held off their own stroke by ArrowLabel. */}
      {routed.map(
        (r, i) =>
          r && (
            <ArrowLabel
              key={`lab-${i}`}
              x={r.label.x}
              y={r.label.y}
              text={r.m.label}
              side={r.side}
              tone={r.t.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}
