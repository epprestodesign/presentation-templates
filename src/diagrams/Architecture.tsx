import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  Legend,
  NodeBox,
  Zone,
  elbow,
  fanPoints,
  role,
  snap,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
} from './primitives'

/**
 * Diagram — Architecture. Components and the connections between them.
 *
 * LAYOUT IS DERIVED, NOT HAND-PLACED. Zones are columns across the well; nodes
 * stack inside their zone; every coordinate snaps to the 4px grid. That is the
 * difference between a diagram library and 27 hand-drawn SVGs: adding a node
 * re-flows its column instead of requiring new x values for everything to its
 * right.
 *
 * Edges are addressed by node id and routed automatically:
 *  - same row → a straight horizontal line, the one legitimate straight case.
 *  - different row → a rounded orthogonal elbow, never a diagonal.
 *  - several edges leaving one node's edge → attach points fanned along it, so
 *    no two connectors share a point (upstream rule 4).
 *
 * The focal rule is enforced by convention, not code: give `kind: 'focal'` to
 * one or two nodes. If four nodes are focal, nothing is.
 */

export interface ArchNode {
  id: string
  name: string
  sublabel?: string
  tag?: string
  kind?: NodeKind
  /** Node height, when it needs to differ from the zone default. */
  height?: number
}

export interface ArchZone {
  label?: string
  nodes: ArchNode[]
  /** Column width as a share of the whole. Defaults to an equal split. */
  flex?: number
  tone?: 'default' | 'boundary'
}

export interface ArchEdge {
  from: string
  to: string
  label?: string
  tone?: ArrowTone
  dashed?: boolean
  /** Route from the node's bottom rather than its right edge. */
  fromSide?: 'right' | 'bottom' | 'left' | 'top'
  toSide?: 'left' | 'top' | 'right' | 'bottom'
}

export interface ArchitectureProps {
  width: number
  height: number
  zones: ArchZone[]
  edges?: ArchEdge[]
  legend?: LegendItem[]
  /** Gutter between zone columns. Wide enough for a label to sit in it. */
  zoneGap?: number
  /** Vertical gap between nodes inside a zone. */
  nodeGap?: number
  nodeHeight?: number
}

interface Placed extends ArchNode {
  x: number
  y: number
  w: number
  h: number
}

export function Architecture({
  width,
  height,
  zones,
  edges = [],
  legend,
  zoneGap = 56,
  nodeGap = 16,
  nodeHeight = 68,
}: ArchitectureProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  const totalFlex = zones.reduce((n, z) => n + (z.flex ?? 1), 0)
  const gaps = zoneGap * (zones.length - 1)
  const unit = (width - gaps) / totalFlex

  /* Zone columns, then nodes stacked inside. A zone reserves 30px of header for
     its label so the first node never rides under it. */
  const ZONE_PAD = 16
  const ZONE_HEAD = 30

  let cursorX = 0
  const placed: Placed[] = []
  const zoneBoxes = zones.map((z) => {
    const w = unit * (z.flex ?? 1)
    const box = { x: snap(cursorX), y: 0, w: snap(w), h: drawH, label: z.label, tone: z.tone }
    const innerW = box.w - ZONE_PAD * 2
    const count = z.nodes.length
    const heights = z.nodes.map((n) => n.height ?? nodeHeight)
    const stackH = heights.reduce((a, b) => a + b, 0) + nodeGap * (count - 1)
    // Centred in the zone body, so a 2-node column and a 4-node column agree
    // on their optical middle.
    let y = box.y + ZONE_HEAD + Math.max(0, (drawH - ZONE_HEAD - stackH) / 2)
    z.nodes.forEach((n, i) => {
      placed.push({
        ...n,
        x: snap(box.x + ZONE_PAD),
        y: snap(y),
        w: snap(innerW),
        h: heights[i],
      })
      y += heights[i] + nodeGap
    })
    cursorX += w + zoneGap
    return box
  })

  const byId = new Map(placed.map((n) => [n.id, n]))

  /* Fan attach points: group edges by (node, side) so each connector on a shared
     edge gets its own point. */
  const edgeKey = (id: string, side: string) => `${id}:${side}`
  const outCount = new Map<string, number>()
  const inCount = new Map<string, number>()
  for (const e of edges) {
    const fs = e.fromSide ?? 'right'
    const ts = e.toSide ?? 'left'
    outCount.set(edgeKey(e.from, fs), (outCount.get(edgeKey(e.from, fs)) ?? 0) + 1)
    inCount.set(edgeKey(e.to, ts), (inCount.get(edgeKey(e.to, ts)) ?? 0) + 1)
  }
  const outSeen = new Map<string, number>()
  const inSeen = new Map<string, number>()

  const anchor = (n: Placed, side: string, index: number, total: number) => {
    if (side === 'right' || side === 'left') {
      const ys = fanPoints(n.y, n.h, total)
      return { x: side === 'right' ? n.x + n.w : n.x, y: ys[index] }
    }
    const xs = fanPoints(n.x, n.w, total)
    return { x: xs[index], y: side === 'bottom' ? n.y + n.h : n.y }
  }

  const routed = edges.map((e) => {
    const a = byId.get(e.from)
    const b = byId.get(e.to)
    if (!a || !b) return null

    /* SAME-COLUMN EDGES ROUTE VERTICALLY, unless the author says otherwise.
       
       Defaulting to right→left is correct across columns and wrong within one:
       two nodes stacked in the same zone have identical x ranges, so the gutter
       between them is empty and the label's only home is the geometric midpoint
       — which is inside both boxes. `api → core` did exactly that and printed
       WRITES on top of the API node. Overlapping x ranges therefore flip the
       default to bottom→top, where there IS open canvas between the two. */
    const sameColumn = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > Math.min(a.w, b.w) * 0.6
    const downward = b.y > a.y
    const fs = e.fromSide ?? (sameColumn ? (downward ? 'bottom' : 'top') : 'right')
    const ts = e.toSide ?? (sameColumn ? (downward ? 'top' : 'bottom') : 'left')
    const fk = edgeKey(e.from, fs)
    const tk = edgeKey(e.to, ts)
    const fi = outSeen.get(fk) ?? 0
    const ti = inSeen.get(tk) ?? 0
    outSeen.set(fk, fi + 1)
    inSeen.set(tk, ti + 1)

    const p1 = anchor(a, fs, fi, outCount.get(fk) ?? 1)
    const p2 = anchor(b, ts, ti, inCount.get(tk) ?? 1)
    // Horizontal-first when the run is mostly sideways, which puts the corner
    // in the zone gutter rather than inside a column.
    const bias = Math.abs(p2.x - p1.x) >= Math.abs(p2.y - p1.y) ? 'h' : 'v'

    /* The label goes in the GUTTER between the two boxes, not at the geometric
       midpoint of the path.
       
       The midpoint is wrong whenever the columns are wide and the gap between
       them is narrow: it lands inside one of the nodes, the node paints over the
       mask, and the text renders as a fragment on the box's border — upstream
       rule 6. The open canvas on a left-to-right edge is exactly the span from
       the source's right edge to the target's left edge, so that is where the
       label sits, and with an 'h' bias the connector's horizontal leg runs at
       p1.y through it. */
    const gapFrom = fs === 'right' ? a.x + a.w : fs === 'left' ? a.x : p1.x
    const gapTo = ts === 'left' ? b.x : ts === 'right' ? b.x + b.w : p2.x
    const horizontalRun = fs === 'right' || fs === 'left'
    const mid = horizontalRun
      ? { x: (gapFrom + gapTo) / 2, y: bias === 'h' ? p1.y : p2.y }
      : { x: p1.x, y: (p1.y + p2.y) / 2 }

    /* If the label's home is inside a node that is NOT an endpoint, walk it back
       toward the source until it clears.
       
       This happens when an edge skips a column — `card → vault` crosses the
       Platform zone, and the gutter midpoint lands inside the API node. Upstream
       rule 5 allows the crossing but requires the label to sit at the VISIBLE
       end of the connector, near the source. Rather than make every author
       notice, the component walks the label back in 24px steps and takes the
       first position that is clear of every non-endpoint box. */
    const others = placed.filter((n) => n.id !== e.from && n.id !== e.to)
    const clears = (x: number, y: number) => {
      const halfW = Math.max((e.label?.length ?? 0) * 3.2 + 6, 12)
      return !others.some(
        (n) => x + halfW > n.x && x - halfW < n.x + n.w && y > n.y - 12 && y < n.y + n.h + 12
      )
    }
    let label = mid
    if (e.label && horizontalRun && !clears(mid.x, mid.y)) {
      const dir = Math.sign(p2.x - p1.x) || 1
      for (let step = 1; step <= 24; step++) {
        const cx = mid.x - dir * step * 24
        if (clears(cx, mid.y)) {
          label = { x: cx, y: mid.y }
          break
        }
      }
    }

    return { e, d: elbow(p1, p2, bias), mid: label, straight: Math.abs(p1.y - p2.y) < 0.5, horizontalRun }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Architecture diagram"
      /* Marks this as a ported diagram so scripts/check-diagram.mjs can scope
         its geometry checks to the drawing. Without it the checker also walked
         the logo watermark's paths and reported the wordmark's curves as
         diagonal connectors. Every diagram type must carry it. */
      data-diagram="architecture"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Zones first — painted behind everything, so a label mask landing on a
          zone is harmless. */}
      {zoneBoxes.map((z, i) => (
        <Zone key={i} {...z} />
      ))}

      {/* Connectors BEFORE nodes, so strokes sit behind the boxes. */}
      {routed.map((r, i) => r && <Connector key={i} d={r.d} tone={r.e.tone} dashed={r.e.dashed} idPrefix={uid} />)}

      {placed.map((n) => (
        <NodeBox
          key={n.id}
          x={n.x}
          y={n.y}
          w={n.w}
          h={n.h}
          kind={n.kind}
          name={n.name}
          sublabel={n.sublabel}
          tag={n.tag}
        />
      ))}

      {/* Labels last, so their masks sit above the strokes they interrupt but
          the nodes above them still win — which is why a label must be placed on
          open canvas (upstream rule 6). */}
      {routed.map(
        (r, i) =>
          r?.e.label && (
            <ArrowLabel
              key={i}
              x={r.mid.x}
              y={r.mid.y}
              text={r.e.label}
              /* A label beside a VERTICAL run goes to the side; one above a
                 horizontal run goes above. Same 7px gap either way. */
              side={r.horizontalRun ? 'above' : 'right'}
              tone={r.e.tone === 'accent' ? 'accent' : 'soft'}
            />
          )
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

export { role }
