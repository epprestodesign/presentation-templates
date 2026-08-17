import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  NodeBox,
  Zone,
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
 * Diagram — IT current state. The landscape a customer runs BEFORE the platform.
 *
 * This is a sales slide, not an engineering one. Its job in a modernisation
 * pitch is to make the reader recognise their own week: the shared drive nobody
 * versions, the rooming list that arrives as an email attachment, the analyst
 * whose laptop is the integration layer. Upstream is explicit that the type
 * exists to show "the gap that a platform proposal is going to close", and the
 * three things it draws that an architecture diagram does not are:
 *
 *  1. HAND-OFF FORMAT ON EVERY EDGE. `CSV`, `EMAIL`, `EXCEL`, `RE-KEY` — the
 *     label is the argument. An arrow with no label reads as an integration; an
 *     arrow labelled EMAIL reads as a person doing it by hand on a Tuesday.
 *  2. PAIN FLAGS. A negative-toned dot on a component, explained in the legend.
 *     Separate from `focal` on purpose: focal is the one or two headline
 *     bottlenecks, and a flag is "this hurts but it is not the headline".
 *     Upstream reaches for a rust-red custom hex for exactly this; the deck
 *     already has `role.negative`, so no new colour enters the system.
 *  3. CROSS-CUTTING FOOTER BARS. Layer-wide concerns — the shared mailbox, the
 *     spreadsheet template everyone copies — that touch every zone and so must
 *     not be wired to any single component.
 *
 * ROUTING: cross-zone edges take a CORRIDOR through the zone gutter — out of the
 * source's right edge, down (or up) a vertical in the gap between the columns,
 * then into the destination's LEFT edge travelling right. That last detail is
 * upstream's marker-visibility rule and the reason this type does not reuse
 * Architecture's single-elbow route: with `refX=7`, an arrowhead entering a top
 * edge while travelling upward has its whole body inside the box, where the
 * node's own paper mask hides it and one pixel of tip pokes out. Entering a side
 * edge head-on keeps all 7px outside. The corridor also means no stroke ever
 * crosses a component that is not its endpoint.
 *
 * Same-zone edges are a plain vertical, which is the one case where a straight
 * segment is correct.
 */

export interface StateComponent {
  id: string
  name: string
  /** The technical reality — "Windows share · no version control". */
  sublabel?: string
  tag?: string
  /** `focal` is the bottleneck. One or two per diagram, never four. */
  kind?: NodeKind
  /** Flags a pain point without spending the accent on it. */
  pain?: boolean
}

export interface StateZone {
  /** Uppercase phase name — COLLECTION, PROCESSING, DISSEMINATION. */
  label?: string
  components: StateComponent[]
  flex?: number
}

export interface StateEdge {
  from: string
  to: string
  /** The hand-off format. Uppercased by ArrowLabel; keep to ≤10 characters. */
  label?: string
  tone?: ArrowTone
  dashed?: boolean
}

/** A layer-wide concern. Spans the full width; nothing connects to it. */
export interface StateFooter {
  name: string
  sublabel?: string
}

export interface CurrentStateProps {
  width: number
  height: number
  zones: StateZone[]
  edges?: StateEdge[]
  footers?: StateFooter[]
  legend?: LegendItem[]
  /** Gutter between zone columns. It carries BOTH the outgoing labels and the
   *  corridor verticals, in that order, so it needs roughly the widest label
   *  plus 24px. 56 is the floor. */
  zoneGap?: number
}

/* Grid-aligned by construction, so nothing downstream has to be corrected. */
const ZONE_PAD = 16
const ZONE_HEAD = 28
const COMP_GAP = 24
const COMP_MIN = 48
const COMP_MAX = 76
const FOOTER_H = 52
const FOOTER_GAP = 8
const FOOTER_TOP = 20
const floorGrid = (n: number) => Math.floor(n / 4) * 4

/**
 * Two-bend orthogonal corridor: H out of the source, V through the gutter, H
 * into the destination's side edge. Both bends are quarter-arcs, r=8.
 *
 * `elbow()` covers one bend and is used verbatim for the same-column case; this
 * is the two-bend sibling the zone-gutter route needs, and it is built from the
 * identical `L … Q` formula so the two cannot drift. Radius is clamped against
 * every leg, or an arc overshoots its corner on a short run.
 */
function corridor(from: Point, to: Point, midX: number, r = 8): string {
  const dy = to.y - from.y
  if (Math.abs(dy) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  const sy = Math.sign(dy)
  const sx1 = Math.sign(midX - from.x) || 1
  const sx2 = Math.sign(to.x - midX) || 1
  const rr = Math.min(
    r,
    Math.abs(dy) / 2,
    Math.max(Math.abs(midX - from.x), 1),
    Math.max(Math.abs(to.x - midX), 1)
  )
  return [
    `M ${from.x} ${from.y}`,
    `L ${midX - sx1 * rr} ${from.y}`,
    `Q ${midX} ${from.y} ${midX} ${from.y + sy * rr}`,
    `L ${midX} ${to.y - sy * rr}`,
    `Q ${midX} ${to.y} ${midX + sx2 * rr} ${to.y}`,
    `L ${to.x} ${to.y}`,
  ].join(' ')
}

interface Placed extends StateComponent {
  zone: number
  x: number
  y: number
  w: number
  h: number
}

export function CurrentState({
  width,
  height,
  zones,
  edges = [],
  footers = [],
  legend,
  zoneGap = 64,
}: CurrentStateProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const footerBlock = footers.length
    ? FOOTER_TOP + footers.length * FOOTER_H + (footers.length - 1) * FOOTER_GAP
    : 0
  const zonesH = height - legendH - footerBlock

  /* --- columns ----------------------------------------------------------- */
  const totalFlex = zones.reduce((n, z) => n + (z.flex ?? 1), 0)
  const unit = (width - zoneGap * (zones.length - 1)) / totalFlex

  /* --- component height is DERIVED from the tallest column ---------------
     Not a constant. A fixed 60px height silently overflows the well the moment
     a zone holds four components, and the failure is invisible until the export
     clips. Sizing off the busiest column instead means the diagram always fits
     and every zone agrees on its row rhythm. */
  const maxCount = Math.max(1, ...zones.map((z) => z.components.length))
  const body = zonesH - ZONE_HEAD - ZONE_PAD
  const compH = Math.max(
    COMP_MIN,
    Math.min(COMP_MAX, floorGrid((body - (maxCount - 1) * COMP_GAP) / maxCount))
  )

  let cursorX = 0
  const placed: Placed[] = []
  const zoneBoxes = zones.map((z, zi) => {
    const w = unit * (z.flex ?? 1)
    const box = { x: snap(cursorX), y: 0, w: snap(w), h: zonesH, label: z.label }
    const count = z.components.length
    const stackH = count * compH + (count - 1) * COMP_GAP
    let y = ZONE_HEAD + Math.max(0, (zonesH - ZONE_HEAD - stackH) / 2)
    z.components.forEach((c) => {
      placed.push({
        ...c,
        zone: zi,
        x: snap(box.x + ZONE_PAD),
        y: snap(y),
        w: snap(box.w - ZONE_PAD * 2),
        h: compH,
      })
      y += compH + COMP_GAP
    })
    cursorX += w + zoneGap
    return box
  })

  const byId = new Map(placed.map((c) => [c.id, c]))

  /* --- where the corridor verticals go ----------------------------------
     TO THE RIGHT OF THE LABEL BAND, not at the middle of the gutter.

     The gutter midpoint is the obvious choice and it is wrong, in a way that
     only shows up once the diagram is dense. Every component in a zone shares
     one right edge, so every outgoing label starts at the same x — and a label
     wide enough to reach the gutter midpoint lands on whichever connector has
     its vertical there. In the first render of `Before EventPipe` the EMAIL mask
     punched a white gap straight through the teal vertical carrying
     mailbox → front desks, two rows below it. The geometry gate did not catch it
     because it only tests masks against near-horizontal strokes.

     Reserving the near half of the gutter for labels and pushing every vertical
     past them makes the collision impossible rather than unlikely — including a
     label against its OWN vertical, which the gutter midpoint also produced for
     every upward edge. Clamped so a corridor never crosses into the destination
     component. */
  const labelW = (text?: string) =>
    Math.max((text?.length ?? 0) * 9 * 0.62 + 10, 22)
  const widestLabel = new Map<number, number>()
  for (const e of edges) {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b || a.zone === b.zone || !e.label) continue
    widestLabel.set(a.zone, Math.max(widestLabel.get(a.zone) ?? 0, labelW(e.label)))
  }
  /**
   * The gutter's two bands: labels first, then the corridor verticals.
   *
   * `labelLeft` prefers to start just OUTSIDE the source zone's border rather
   * than 8px past the component. Both clear the component, but a mask starting
   * inside the zone punches a white notch through the zone's own right border —
   * three of them, in the first render of `Before EventPipe`. It only takes the
   * tidy position when the corridor still fits between the label band and the
   * destination component; a long label falls back to the inside start, which
   * costs a notch and keeps the geometry correct.
   */
  const band = (from: Placed, to: Placed) => {
    const box = zoneBoxes[from.zone]
    const widest = widestLabel.get(from.zone) ?? 0
    const outside = box.x + box.w + 6
    const inside = from.x + from.w + 8
    const labelLeft = outside + widest + 8 <= to.x - 10 ? outside : inside
    const gutterMid = box.x + box.w + zoneGap / 2
    return {
      labelLeft,
      corridorX: snap(Math.min(Math.max(gutterMid, labelLeft + widest + 8), to.x - 10)),
    }
  }

  /* --- fan the attach points -------------------------------------------- */
  const key = (id: string, side: string) => `${id}:${side}`
  const outTotal = new Map<string, number>()
  const inTotal = new Map<string, number>()
  const sideOf = (e: StateEdge) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) return null
    const sameZone = a.zone === b.zone
    const down = b.y > a.y
    return sameZone
      ? { from: down ? 'bottom' : 'top', to: down ? 'top' : 'bottom' }
      : { from: 'right', to: 'left' }
  }
  for (const e of edges) {
    const s = sideOf(e)
    if (!s) continue
    outTotal.set(key(e.from, s.from), (outTotal.get(key(e.from, s.from)) ?? 0) + 1)
    inTotal.set(key(e.to, s.to), (inTotal.get(key(e.to, s.to)) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()
  const anchor = (c: Placed, side: string, i: number, n: number): Point => {
    if (side === 'right') return { x: c.x + c.w, y: fanPoints(c.y, c.h, n)[i] }
    if (side === 'left') return { x: c.x, y: fanPoints(c.y, c.h, n)[i] }
    const xs = fanPoints(c.x, c.w, n)
    return { x: xs[i], y: side === 'bottom' ? c.y + c.h : c.y }
  }

  const routed = edges.map((e) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    const s = sideOf(e)
    if (!a || !b || !s) return null

    const fk = key(e.from, s.from)
    const tk = key(e.to, s.to)
    const fi = outSeen.get(fk) ?? 0
    const ti = inSeen.get(tk) ?? 0
    outSeen.set(fk, fi + 1)
    inSeen.set(tk, ti + 1)

    const p1 = anchor(a, s.from, fi, outTotal.get(fk) ?? 1)
    const p2 = anchor(b, s.to, ti, inTotal.get(tk) ?? 1)
    const crossZone = a.zone !== b.zone

    /* Cross-zone → corridor through the gutter. Same-zone → a plain vertical,
       which is the one case where a straight segment is correct.

       Adjacent zones only. An edge that skips a zone turns in the first gutter
       and then has to cross the whole middle column to reach its destination,
       which is a rule-5 violation whichever gutter it turns in — the fix is to
       reorder the zones, not to route around it. */
    const gutter = crossZone ? band(a, b) : null
    const d = gutter ? corridor(p1, p2, gutter.corridorX) : elbow(p1, p2, 'v')

    /* LABEL SITS AT THE START OF THE CONNECTOR, not its midpoint.

       Upstream's §3.5, and the right rule for this type: the label names the
       format leaving a system, so it belongs beside that system. The mask sits in
       the gutter's label band (see `band`) and ends before any corridor vertical,
       so it can only ever land on a zone background, which is painted first.

       When one component has TWO outgoing edges the second label flips below its
       own segment. Two masks stacked above two fan points twenty pixels apart
       would put the lower mask on the upper stroke; above/below separates them.
       A third outgoing edge on one side has nowhere left to go — that is the
       density cap, not a bug. */
    const w = labelW(e.label)
    const label = gutter
      ? {
          x: gutter.labelLeft + w / 2,
          y: p1.y,
          side: fi % 2 === 0 ? ('above' as const) : ('below' as const),
        }
      : { x: p1.x, y: (p1.y + p2.y) / 2, side: 'right' as const }

    return { e, d, label }
  })

  /* --- footer bars ------------------------------------------------------- */
  const footerY = (k: number) => snap(zonesH + FOOTER_TOP + k * (FOOTER_H + FOOTER_GAP))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Current-state landscape"
      data-diagram="current-state"
    >
      <ArrowMarkers idPrefix={uid} />

      {zoneBoxes.map((z, i) => (
        <Zone key={i} {...z} />
      ))}

      {/* Connectors before components, so strokes end under the node fills. */}
      {routed.map(
        (r, i) => r && <Connector key={i} d={r.d} tone={r.e.tone} dashed={r.e.dashed} idPrefix={uid} />
      )}

      {placed.map((c) => (
        <NodeBox
          key={c.id}
          x={c.x}
          y={c.y}
          w={c.w}
          h={c.h}
          kind={c.kind}
          name={c.name}
          sublabel={c.sublabel}
          tag={c.tag}
        />
      ))}

      {/* Pain flags, after the boxes they sit on. A bare circle rather than a
          badge with a mask rect: a masked chip inside a node is what the
          geometry gate looks for when it hunts rule-6 violations, and a dot
          says the same thing in a quarter of the ink. */}
      {placed
        .filter((c) => c.pain)
        .map((c) => (
          <circle
            key={`${c.id}-pain`}
            cx={c.x + c.w - 12}
            cy={c.y + 12}
            r={4}
            fill={role.negative}
          />
        ))}

      {/* Footer bars. Left-aligned, because they are read as a list of services
          rather than looked at as objects in a topology. */}
      {footers.map((f, k) => (
        <g key={f.name}>
          <rect
            x={0}
            y={footerY(k)}
            width={width}
            height={FOOTER_H}
            rx={8}
            fill={withAlpha(role.ink, 0.03)}
            stroke={withAlpha(role.ink, 0.18)}
            strokeWidth={0.8}
          />
          <DiagramText x={20} y={footerY(k) + (f.sublabel ? 19 : 26)} variant="nodeName">
            {f.name}
          </DiagramText>
          {f.sublabel && (
            <DiagramText x={20} y={footerY(k) + 35} variant="sublabel" tone="muted" uppercase>
              {f.sublabel}
            </DiagramText>
          )}
        </g>
      ))}

      {/* Labels last, so their masks sit above the strokes they annotate. */}
      {routed.map(
        (r, i) =>
          r?.e.label && (
            <ArrowLabel
              key={i}
              x={r.label.x}
              y={r.label.y}
              text={r.e.label}
              side={r.label.side}
              tone={r.e.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legend?.length ? (
        <Legend x={0} y={height - legendH + 8} width={width} items={legend} />
      ) : null}
    </svg>
  )
}

export { role }
