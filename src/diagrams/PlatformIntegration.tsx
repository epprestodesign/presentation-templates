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
  snap,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
  type Point,
} from './primitives'

/**
 * Diagram — Platform Integration. What plugs in, what plugs out, over what wire.
 *
 * Ported from the diagram-design skill's `dp-integration` type. Sources on the
 * left, consumers on the right, the platform as an explicit ZONE in the middle,
 * and every wire labelled with its protocol. No time axis and no phases: the
 * question is "what surfaces does this expose, and over what wire", not "how does
 * data move through stages" — that one is Data Flow.
 *
 * THIS TYPE DELIBERATELY EXCEEDS THE NODE BUDGET, and upstream says so. Every
 * other type caps at nine nodes; a realistic integration picture is fourteen to
 * twenty. The complexity IS the claim — the diagram is asserting how many distinct
 * integration surfaces exist, and collapsing "four sources" into one box marked
 * "Sources" deletes the argument. If it genuinely will not fit, the move is to
 * split by plane (data / identity / observability), not to collapse a column.
 *
 * IDENTITY CONNECTS TO THE LAYER, NEVER TO A COMPONENT. Upstream's §9 and the
 * single most load-bearing rule in the type: an identity provider, a secrets
 * store, an audit sink authenticates EVERY component, so wiring it to one tool
 * understates the trust scope and misrepresents the model. Footer services get one
 * dashed line to the zone's bottom EDGE. `footer` entries therefore take no
 * target, by construction — the component cannot be asked to draw the wrong thing.
 *
 * THE CORRIDOR IS WHERE THE PROTOCOL LABELS LIVE, which is why it is sized rather
 * than fixed. Every source→platform and platform→consumer wire is a three-segment
 * H-V-H route whose vertical leg sits in the corridor, staggered so no two
 * verticals share an x, and whose label sits on the long horizontal leg. A 56px
 * corridor cannot hold a masked `HTTPS` and a staggered vertical at once, so the
 * corridor is a share of the well's width with a floor of 72px.
 *
 * THERE ARE TWO CORRIDORS, AND A WIRE'S VERTICAL LEG IS CLAMPED INTO ITS OWN.
 * `[colW, zoneX]` on the way in, `[zoneRight, width - colW]` on the way out. This
 * is not decoration — it is the constraint that keeps the drawing readable, and
 * getting it wrong is invisible until the diagram is dense. Staggering off the
 * global wire index and measuring back from the target edge (the obvious way,
 * and the way this file was first written) works for three wires and fails for
 * six: the offset grows past the corridor's width and the vertical leg walks out
 * the far side — into the zone on an inbound wire, or behind the source column,
 * where it runs along the edges of boxes it has nothing to do with. So the
 * stagger index is counted PER CORRIDOR, not per wire, and the result is clamped
 * to the corridor's own bounds.
 *
 * THE LONG LEG IS THE ONE THAT CARRIES THE LABEL, and which leg that is depends
 * on direction. Inbound the vertical is pushed toward the zone, so the long leg
 * is the first one and the label sits at the source's own row y; outbound it is
 * pushed toward the zone too, so the long leg is the second one and the label
 * sits at the consumer's row y. Either way the label lands in the middle of a
 * corridor, which is open canvas by construction.
 */

/** Grid-aligned floor — a divided dimension must never round outward. */
const floor4 = (n: number) => Math.max(4, Math.floor(n / 4) * 4)
/** Grid-aligned ceiling — a MINIMUM must never round inward, or the thing it was
 *  protecting overflows by the rounding. */
const ceil4 = (n: number) => Math.max(4, Math.ceil(n / 4) * 4)

/**
 * Three-segment H-V-H route with quarter-arc corners: out sideways, along the
 * corridor, and back in sideways.
 *
 * Local to this file because `elbow()` expresses a two-segment route, and a
 * two-segment route cannot cross a column gutter without running its vertical leg
 * along the target column's edge — which means along the edges of the boxes above
 * the target. Same corner geometry as `elbow()`; a candidate to move into
 * `primitives.tsx` if a second type needs it.
 */
function dogleg(p1: Point, p2: Point, midX: number, r = 8): string {
  const legA = Math.abs(midX - p1.x)
  const legB = Math.abs(p2.x - midX)
  const rise = Math.abs(p2.y - p1.y)
  // Degenerate cases fall back to the shared primitive rather than emitting a
  // zero-length segment with a corner on it.
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

export interface SideNode {
  name: string
  sublabel?: string
  kind?: NodeKind
}

export interface PlatformBar {
  kind: 'bar'
  name: string
  sublabel?: string
  tag?: string
  focal?: boolean
}

export interface PlatformRow {
  kind: 'row'
  nodes: { name: string; sublabel?: string; tag?: string; focal?: boolean; nodeKind?: NodeKind }[]
}

export type PlatformEntry = PlatformBar | PlatformRow

export interface Wire {
  /** Side-column node name, or platform component name. */
  from: string
  to: string
  label?: string
  tone?: ArrowTone
  dashed?: boolean
}

export interface PlatformIntegrationProps {
  width: number
  height: number
  zoneLabel: string
  sources: SideNode[]
  consumers: SideNode[]
  /** Column headers. The zone is labelled, so the two columns flanking it have to
   *  be as well — an unlabelled column of boxes beside a labelled container reads
   *  as an omission rather than a choice. Omit to leave a column unnamed. */
  sourcesLabel?: string
  consumersLabel?: string
  rows: PlatformEntry[]
  /** Source → platform and platform → consumer wires. Protocol-labelled. */
  wires: Wire[]
  /** Platform-internal wires. Unlabelled by rule — see the note on labels. */
  internal?: Wire[]
  /** Layer-wide services. Each gets one dashed line to the zone's bottom edge and
   *  CANNOT name a target: see the note at the top of the file. */
  footer?: { name: string; sublabel?: string; label?: string }[]
  legend?: LegendItem[]
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

export function PlatformIntegration({
  width,
  height,
  zoneLabel,
  sources,
  consumers,
  sourcesLabel,
  consumersLabel,
  rows,
  wires,
  internal = [],
  footer = [],
  legend,
}: PlatformIntegrationProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const legendH = legend?.length ? 48 : 0
  const FOOTER_H = 40
  const FOOTER_GAP = 4
  const footerBand = footer.length ? footer.length * (FOOTER_H + FOOTER_GAP) - FOOTER_GAP : 0
  /* The gap under the zone is where every AUTH line and its label lives, so it is
     reserved rather than left to chance. */
  const authGap = footer.length ? 40 : 0
  const bodyH = height - legendH - footerBand - authGap

  const colW = snap(Math.max(132, Math.min(184, width * 0.145)))
  const corridor = snap(Math.max(72, Math.min(104, width * 0.085)))
  const zoneX = snap(colW + corridor)
  const zoneW = snap(width - 2 * (colW + corridor))
  const zoneRight = zoneX + zoneW

  /* THE HEADER BAND IS SHARED BY ALL THREE COLUMNS.

     The zone reserves 26px for its own label, so its rows are centred in
     `bodyH - HEAD`. Centring the side columns in the full `bodyH` — which is what
     this did — makes the two readings disagree by half the header: source row 1
     sits 13px above platform row 1 and the drawing loses its horizontal grid,
     which is the one thing a hub-and-spoke picture needs. Both sides now reserve
     the same band, which also gives the column headers somewhere to live. */
  const HEAD = 26
  const bandH = bodyH - HEAD

  /* Side columns. Both are laid out against the LARGER count so a 3-source /
     4-consumer diagram keeps one stride and reads as one grid. */
  const nSide = Math.max(sources.length, consumers.length, 1)
  const stride = floor4(bandH / nSide)
  const sideH = Math.min(stride - 16, 68)
  const sideBlock = nSide * sideH + (nSide - 1) * (stride - sideH)
  /* The header band is a FLOOR on the top inset, not an addition to it. Adding it
     to a centred block spends the header twice: with 4 sources in a 332px body the
     stack already has 22px of slack at each end, and pushing it down another 26
     left 48px of padding above the columns and 22 below — a zone visibly heavier
     at the top than the bottom. Taking the larger of the two keeps the block
     centred whenever it can be and reserves the band only when it cannot. */
  const sideTop = snap(Math.max(HEAD, (bodyH - sideBlock) / 2))
  const sideY = (k: number) => snap(sideTop + k * (sideH + (stride - sideH)))

  const boxes = new Map<string, Box>()
  sources.forEach((s, k) => boxes.set(s.name, { x: 0, y: sideY(k), w: colW, h: sideH }))
  consumers.forEach((c, k) => boxes.set(c.name, { x: width - colW, y: sideY(k), w: colW, h: sideH }))

  /* Zone rows: measure the stack, then centre it in the zone body below the zone
     header. Same reasoning as Architecture's column centring — a two-row and a
     three-row zone should agree on their optical middle. */
  const ZONE_PAD = 16
  const BAR_H = 40
  const BAR_H_FOCAL = 48
  const ROW_H = 76
  const ROW_GAP = 16

  /* A BAR'S HEIGHT IS DERIVED FROM WHAT IT CARRIES, not fixed at upstream's 44.

     `NodeBox` reserves a 24px band for a type tag and then centres the
     name+sublabel block in what is LEFT, which means a short box with a tag
     pushes its own sublabel downward. At BAR_H=40 with a tag and a sublabel the
     sublabel lands 2px BELOW the bar's bottom border — the drawing looked right
     until the copy arrived, and then two of three bars had a line of type sitting
     loose on the zone background. The block needs 42px clear of the tag band, so
     the height asks for that rather than trusting the constant. */
  const barH = (e: PlatformBar) => {
    const content = (e.tag ? 24 : 0) + (e.name && e.sublabel ? 42 : 28)
    return Math.max(e.focal ? BAR_H_FOCAL : BAR_H, ceil4(content))
  }
  const entryH = (e: PlatformEntry) => (e.kind === 'bar' ? barH(e) : ROW_H)
  const stackH = rows.reduce((n, e) => n + entryH(e), 0) + ROW_GAP * (rows.length - 1)
  let cursorY = snap(Math.max(HEAD, (bodyH - stackH) / 2))

  const barX = zoneX + ZONE_PAD
  const barW = floor4(zoneW - ZONE_PAD * 2)

  for (const e of rows) {
    const h = entryH(e)
    if (e.kind === 'bar') {
      boxes.set(e.name, { x: barX, y: cursorY, w: barW, h })
    } else {
      const n = e.nodes.length
      const nw = floor4((barW - (n - 1) * ROW_GAP) / n)
      const rowTotal = n * nw + (n - 1) * ROW_GAP
      const left = snap(zoneX + (zoneW - rowTotal) / 2)
      e.nodes.forEach((nd, j) => boxes.set(nd.name, { x: snap(left + j * (nw + ROW_GAP)), y: cursorY, w: nw, h }))
    }
    cursorY += h + ROW_GAP
  }

  const footerY = (k: number) => snap(bodyH + authGap + k * (FOOTER_H + FOOTER_GAP))

  /* AUTH corridors, staggered about the zone's centre line. The stride is derived
     from the WIDEST footer label rather than fixed at 40: `ArrowLabel` sizes its
     mask from the text, sits it 7px to the right of its line, and two `Auth`
     labels at a 40px stride touch at exactly 0px of gap. A footer named
     `Audit sink` overlapped its neighbour outright. */
  const authStride = Math.max(
    40,
    footer.reduce((n, f) => Math.max(n, (f.label ?? 'Auth').length * 5.6 + 22), 0)
  )
  const authX = (k: number) => snap(zoneX + zoneW / 2 + (k - (footer.length - 1) / 2) * authStride)

  /* Fan attach points per (component, side), so no two wires share a point. */
  const cy = (b: Box) => b.y + b.h / 2
  const sideKey = (name: string, s: string) => `${name}:${s}`
  const outN = new Map<string, number>()
  const inN = new Map<string, number>()
  for (const w of wires) {
    outN.set(sideKey(w.from, 'r'), (outN.get(sideKey(w.from, 'r')) ?? 0) + 1)
    inN.set(sideKey(w.to, 'l'), (inN.get(sideKey(w.to, 'l')) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()

  /* Which corridor each wire crosses. A wire whose source ends at or before the
     zone's left edge is inbound; one whose target starts at or after the zone's
     right edge is outbound; anything else (an author routing a platform-internal
     edge through `wires`) has no corridor and falls back to a plain elbow. */
  type Lane = 'in' | 'out' | 'none'
  const laneOf = (a: Box, b: Box): Lane =>
    a.x + a.w <= zoneX ? 'in' : b.x >= zoneRight ? 'out' : 'none'

  /** 14px of stride keeps two verticals independently traceable — upstream asks
   *  for ≥12 — and 8px of clearance keeps one off the boundary it runs beside. */
  const STAGGER = 14
  const CLEAR = 8
  /** `ArrowLabel`'s own mask width, restated so the corridor can be checked
   *  against it. Duplicating the formula is unpleasant; the alternative is a
   *  component that places labels it cannot measure. */
  const labelHalfW = (text?: string) =>
    text ? Math.max(text.length * 9 * 0.62 + 10, 22) / 2 : 0

  /* PASS 1 — endpoints. Fan indices are assigned in declaration order, so the
     wires leaving one edge stay in the order the author wrote them. */
  const legs = wires.flatMap((w) => {
    const a = boxes.get(w.from)
    const b = boxes.get(w.to)
    if (!a || !b) return []
    const ok = sideKey(w.from, 'r')
    const ik = sideKey(w.to, 'l')
    const oi = outSeen.get(ok) ?? 0
    const ii = inSeen.get(ik) ?? 0
    outSeen.set(ok, oi + 1)
    inSeen.set(ik, ii + 1)
    return [
      {
        w,
        lane: laneOf(a, b),
        p1: { x: a.x + a.w, y: snap(fanPoints(a.y, a.h, outN.get(ok) ?? 1)[oi]) },
        p2: { x: b.x, y: snap(fanPoints(b.y, b.h, inN.get(ik) ?? 1)[ii]) },
      },
    ]
  })

  /* PASS 2 — the stagger, ordered by RISE, LONGEST FIRST.

     The order is not cosmetic. Verticals are staggered outward from the zone, so
     the outer end of the corridor — the end nearest the side column — is exactly
     where the protocol labels have to sit. Assigning the stagger in declaration
     order puts whichever wire happens to be declared last out there, and if that
     wire has a long vertical it sweeps down through every label in the corridor.
     Longest-rise-first puts the long verticals tight against the zone boundary
     and leaves the label end of the corridor to the short ones. */
  const staggerIdx = new Map<number, number>()
  for (const lane of ['in', 'out'] as const) {
    legs
      .map((l, i) => ({ i, rise: Math.abs(l.p2.y - l.p1.y), lane: l.lane }))
      .filter((l) => l.lane === lane)
      .sort((x, y) => y.rise - x.rise)
      .forEach((l, j) => staggerIdx.set(l.i, j))
  }

  const midXOf = (lane: Lane, j: number) =>
    lane === 'in'
      ? snap(Math.max(colW + CLEAR, zoneX - CLEAR - j * STAGGER))
      : snap(Math.min(width - colW - CLEAR, zoneRight + CLEAR + j * STAGGER))

  const verticals = legs.map((l, i) =>
    l.lane === 'none'
      ? null
      : {
          x: midXOf(l.lane, staggerIdx.get(i) ?? 0),
          y0: Math.min(l.p1.y, l.p2.y),
          y1: Math.max(l.p1.y, l.p2.y),
        }
  )

  /* PASS 3 — routes and labels. */
  const routedWires = legs.map((l, i) => {
    const { w, p1, p2, lane } = l
    if (lane === 'none') {
      /* No corridor to stagger in. Route two-segment and label the run at its own
         midpoint — the author is off the type's rails, and a wrong-looking route
         is a better signal than a confidently mis-drawn one. */
      return { w, d: elbow(p1, p2, 'h'), label: { x: snap((p1.x + p2.x) / 2), y: p1.y } }
    }
    const midX = verticals[i]!.x

    /* The label goes on the LONG horizontal leg: the first one inbound (source
       edge → corridor), the second one outbound (corridor → consumer edge). Both
       are open canvas by construction, because a corridor contains nothing but
       connectors. */
    const [lo, hi, y] =
      lane === 'in' ? [p1.x, midX, p1.y] : [midX, p2.x, p2.y]
    const half = labelHalfW(w.label)
    let x = (lo + hi) / 2
    // Keep the whole mask inside the leg it annotates.
    x = Math.min(Math.max(x, lo + 2 + half), hi - 2 - half)

    /* Then walk it clear of any OTHER vertical in the same corridor that its mask
       would cover. A mask that hides a connector is upstream rule 2, and it does
       not matter whose connector it is. The mask band for `side: 'above'` is
       [y-20, y-7] — `ArrowLabel`'s 7px gap plus its 13px box. */
    const maskTop = y - 20
    const maskBottom = y - 7
    for (const v of verticals) {
      if (!v || v.x === midX) continue
      if (v.y1 < maskTop || v.y0 > maskBottom) continue
      if (v.x < x - half - CLEAR || v.x > x + half + CLEAR) continue
      x = lane === 'in' ? v.x - CLEAR - half : v.x + CLEAR + half
    }
    x = Math.min(Math.max(x, lo + 2 + half), hi - 2 - half)

    return { w, d: dogleg(p1, p2, midX), label: { x: snap(x), y } }
  })

  /* Internal wires. Same row → horizontal, in whichever direction the boxes sit;
     a bar and a row node → vertical at the node's centre, which is the only route
     that does not run along the bar's own edge. */
  const routedInternal = internal.flatMap((w) => {
    const a = boxes.get(w.from)
    const b = boxes.get(w.to)
    if (!a || !b) return []
    const sameBand = Math.abs(cy(a) - cy(b)) < 2
    if (sameBand) {
      const forward = b.x > a.x
      const p1 = { x: forward ? a.x + a.w : a.x, y: snap(cy(a)) }
      const p2 = { x: forward ? b.x : b.x + b.w, y: snap(cy(b)) }
      return [{ w, d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}` }]
    }
    const down = cy(b) > cy(a)
    const isBarA = a.w >= barW - 1
    const anchorX = snap(isBarA ? b.x + b.w / 2 : a.x + a.w / 2)
    const p1 = { x: anchorX, y: down ? a.y + a.h : a.y }
    const p2 = { x: anchorX, y: down ? b.y : b.y + b.h }
    return [{ w, d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}` }]
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Platform integration diagram"
      data-diagram="platform-integration"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. The zone, painted first. It is the thing the whole diagram is about
             having an inside and an outside. */}
      <Zone x={zoneX} y={0} w={zoneW} h={bodyH} label={zoneLabel} />

      {/* 2. Wires before boxes. */}
      {routedWires.map((r, i) => (
        <Connector key={`w${i}`} d={r.d} tone={r.w.tone} dashed={r.w.dashed} idPrefix={uid} />
      ))}
      {routedInternal.map((r, i) => (
        <Connector key={`i${i}`} d={r.d} tone={r.w.tone} dashed={r.w.dashed} idPrefix={uid} />
      ))}

      {/* 3. AUTH lines: footer → the zone's bottom EDGE, never a component.
             Staggered by index so two footer services do not share a corridor.

             The footer entry is deliberately NOT read here — the callback takes
             only its index. That is the type's §9 rule expressed in code: the
             geometry of an AUTH line cannot depend on which service it comes
             from, because every one of them terminates at the same place. The
             entry is read once, below, to draw the bar and its label. */}
      {footer.map((_, k) => (
        <Connector
          key={`a${k}`}
          d={`M ${authX(k)} ${footerY(k)} L ${authX(k)} ${bodyH}`}
          tone="accent"
          dashed
          idPrefix={uid}
        />
      ))}

      {/* 4. Side columns. */}
      {sources.map((s, k) => (
        <NodeBox
          key={s.name}
          x={0}
          y={sideY(k)}
          w={colW}
          h={sideH}
          kind={s.kind ?? 'input'}
          name={s.name}
          sublabel={s.sublabel}
        />
      ))}
      {consumers.map((c, k) => (
        <NodeBox
          key={c.name}
          x={width - colW}
          y={sideY(k)}
          w={colW}
          h={sideH}
          kind={c.kind ?? 'external'}
          name={c.name}
          sublabel={c.sublabel}
        />
      ))}

      {/* 5. Platform components. */}
      {rows.map((e, i) =>
        e.kind === 'bar' ? (
          <NodeBox
            key={`b${i}`}
            {...boxes.get(e.name)!}
            kind={e.focal ? 'focal' : 'store'}
            name={e.name}
            sublabel={e.sublabel}
            tag={e.tag}
          />
        ) : (
          e.nodes.map((nd) => (
            <NodeBox
              key={nd.name}
              {...boxes.get(nd.name)!}
              kind={nd.focal ? 'focal' : (nd.nodeKind ?? 'step')}
              name={nd.name}
              sublabel={nd.sublabel}
              tag={nd.tag}
            />
          ))
        )
      )}

      {/* 6. Footer bars, full canvas width — they sit OUTSIDE the zone because
             they gate it from outside, which is the trust model. */}
      {footer.map((f, k) => (
        <NodeBox
          key={f.name}
          x={0}
          y={footerY(k)}
          w={width}
          h={FOOTER_H}
          kind="boundary"
          name={f.name}
          sublabel={f.sublabel}
        />
      ))}

      {/* 7. Labels last. Protocol on the long horizontal leg of each corridor
             wire; AUTH beside its own line in the reserved gap. */}
      {routedWires.map(
        (r, i) =>
          r.w.label && (
            <ArrowLabel
              key={`wl${i}`}
              x={r.label.x}
              y={r.label.y}
              text={r.w.label}
              side="above"
              tone={r.w.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}
      {footer.map((f, k) => (
        <ArrowLabel
          key={`al${k}`}
          x={authX(k)}
          y={snap(bodyH + authGap / 2)}
          text={f.label ?? 'Auth'}
          side="right"
          tone="accent"
        />
      ))}

      {/* 8. Column headers, in the band the three columns share. A FRAME around
             each side column is deliberately not drawn — the zone border is the
             only container in the drawing, and a second one would make the
             sources look like they were inside something too — so the columns are
             named instead, in the zone label's own register. */}
      {sourcesLabel && (
        <DiagramText x={0} y={14} variant="eyebrow" tone="soft" uppercase>
          {sourcesLabel}
        </DiagramText>
      )}
      {consumersLabel && (
        <DiagramText x={width} y={14} variant="eyebrow" tone="soft" anchor="end" uppercase>
          {consumersLabel}
        </DiagramText>
      )}

      {legend?.length ? <Legend x={0} y={height - legendH + 10} width={width} items={legend} /> : null}
    </svg>
  )
}
