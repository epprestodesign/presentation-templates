import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  Legend,
  NodeBox,
  diagramType,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Loop / flywheel. Work advances around a ring; every pass writes back
 * to one shared centre.
 *
 * Ported from the diagram-design skill's `type-loop.md`. The type exists for the
 * case where the reader must see BOTH motions at once, and the dashed write-back
 * spokes are what distinguish it: take them away and this is only a circular
 * process, which upstream calls Cycle. Take away the return to station 0 and it
 * is a flowchart bent into a circle, which is worse.
 *
 * TWO DOCUMENTED EXCEPTIONS TO THE ORTHOGONAL-CONNECTOR RULE, both of them
 * upstream's, both of them load-bearing:
 *
 *  1. THE RING IS ONE CURVE. Every ring segment is an SVG arc on the same ellipse
 *     with the same sweep, so the six visible gaps read as pieces of one
 *     continuous ring. Mixing in an orthogonal elbow turns the ring into a
 *     rounded rectangle, which is the anti-pattern. Arcs are emitted as `A`
 *     commands, which is also what keeps the geometry gate — it inspects `L`
 *     segments inside `<path>` `d` strings — from reading a legitimate ring as a
 *     diagonal connector.
 *
 *  2. THE SPOKES ARE TRUE RADII. A write-back runs straight from a station's
 *     inner edge toward the hub; routed orthogonally it would cross its
 *     neighbours and stop reading as "inward". These are drawn as `<line>`
 *     elements rather than paths — the correct element for a straight segment,
 *     and it keeps the exception legible to a reader of the SVG instead of
 *     hiding a slanted `L` inside a path that the rest of the library forbids.
 *
 * THE RING IS AN ELLIPSE, NOT A CIRCLE. Upstream's canonical geometry is a
 * circle in a 1040×680 canvas. The deck's diagram well is roughly 1155×380 —
 * three to one — and a circle inscribed in that uses a third of the width, which
 * pushes the stations into the hub and leaves the radius too short for a legible
 * spoke. So the ring takes the well's aspect, capped at 2.6:1 so it stays a ring
 * rather than becoming a racetrack. Every other invariant holds: equal angular
 * spacing from `-90°`, one hub, at most one focal station, arcs on one curve.
 *
 * LAYOUT IS DERIVED. Radii, station boxes, arc endpoints and spoke endpoints are
 * all computed from the well plus the station size; adding a seventh station
 * re-spaces the ring instead of needing seven new coordinates.
 */

export interface LoopStation {
  name: string
  sublabel?: string
  /** Uppercase, ≤14 characters. Labels this station's write-back. Label a
   *  curated subset — six labels crowd the hub halo and say nothing. */
  spokeLabel?: string
  /** At most one across the whole loop. Zero is fine when no gate deserves it. */
  focal?: boolean
}

export interface LoopProps {
  width: number
  height: number
  /** Exactly one. Accumulated state — memory, standards, a record. NOT a step. */
  hub: { name: string; sublabel?: string }
  /** Five to eight, clockwise from the top. The last returns to the first. */
  stations: LoopStation[]
  stationW?: number
  stationH?: number
  hubW?: number
  hubH?: number
  legend?: LegendItem[]
}

/** Ring aspect ceiling. Past this the ellipse stops reading as a loop. */
const ASPECT_CAP = 2.6
/** Gap the spoke's arrowhead keeps from the hub stroke. Upstream: 4–8px. */
const HUB_GAP = 6

export function Loop({
  width,
  height,
  hub,
  stations,
  stationW = 160,
  stationH = 60,
  hubW = 200,
  hubH = 88,
  legend,
}: LoopProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH
  const n = stations.length

  const MARGIN = 8
  const cx = snap(width / 2)
  const cy = snap(drawH / 2)
  const ry = snap((drawH - stationH) / 2 - MARGIN)
  const rx = snap(Math.min((width - stationW) / 2 - MARGIN, ry * ASPECT_CAP))

  const theta = (k: number) => -Math.PI / 2 + (2 * Math.PI * k) / n
  const ptAt = (t: number) => ({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) })

  /* Station boxes, snapped to the grid after the ideal geometry is computed. */
  const boxes = stations.map((s, k) => {
    const p = ptAt(theta(k))
    return {
      s,
      k,
      x: snap(p.x - stationW / 2),
      y: snap(p.y - stationH / 2),
      w: stationW,
      h: stationH,
      cxs: p.x,
      cys: p.y,
    }
  })

  /* Where the ring leaves and re-enters each station.

     Upstream solves circle/rectangle intersections in closed form. An ellipse
     against a snapped rectangle has no equally tidy closed form, so the
     parameter is walked outward from the station's own angle until the ring
     point clears the box. Same result, deterministic for the same inputs, and it
     keeps working when the box is snapped to the 4px grid and the analytic
     solution no longer lands exactly on an edge. */
  const clears = (t: number, b: (typeof boxes)[number]) => {
    const p = ptAt(t)
    return p.x < b.x - 0.5 || p.x > b.x + b.w + 0.5 || p.y < b.y - 0.5 || p.y > b.y + b.h + 0.5
  }
  const walk = (t0: number, dir: 1 | -1, b: (typeof boxes)[number]) => {
    let t = t0
    for (let i = 0; i < 3000; i++) {
      t += dir * 0.0015
      if (clears(t, b)) return t
    }
    return t0 + dir * 0.15
  }
  const exitT = boxes.map((b) => walk(theta(b.k), 1, b))
  const entryT = boxes.map((b) => walk(theta(b.k), -1, b))

  /* The arrowhead's tip sits 1.2px past the path end (refX=7, tip at x=8), so the
     arc stops that far short and the tip lands ON the destination stroke rather
     than through it. */
  const avgR = (rx + ry) / 2
  const arcs = boxes.map((_b, k) => {
    const j = (k + 1) % n
    const from = ptAt(exitT[k])
    const to = ptAt(entryT[j] - 1.2 / avgR)
    return {
      k,
      /* Large-arc 0 (an adjacent-station gap is always under 180°), sweep 1
         (clockwise in SVG's y-down space). Same rx/ry/sweep on every segment is
         what makes the six pieces read as one ring. */
      d: `M ${from.x.toFixed(3)} ${from.y.toFixed(3)} A ${rx} ${ry} 0 0 1 ${to.x.toFixed(3)} ${to.y.toFixed(3)}`,
    }
  })

  /* Write-back spokes. `boxDistance` is the distance from a rectangle's centre to
     its edge along a unit vector — the term whose denominator is zero drops out,
     which is how a straight-up spoke resolves to half the height. */
  const boxDistance = (ux: number, uy: number, halfW: number, halfH: number) => {
    const cands: number[] = []
    if (Math.abs(ux) > 1e-6) cands.push(halfW / Math.abs(ux))
    if (Math.abs(uy) > 1e-6) cands.push(halfH / Math.abs(uy))
    return Math.min(...cands)
  }
  const spokes = boxes.map((b) => {
    const vx = b.cxs - cx
    const vy = b.cys - cy
    const len = Math.hypot(vx, vy) || 1
    const ux = vx / len
    const uy = vy / len
    const dStation = boxDistance(ux, uy, b.w / 2, b.h / 2)
    const dHub = boxDistance(ux, uy, hubW / 2, hubH / 2)
    const start = { x: b.cxs - ux * dStation, y: b.cys - uy * dStation }
    const end = { x: cx + ux * (dHub + HUB_GAP), y: cy + uy * (dHub + HUB_GAP) }
    /* Label side follows the run: a mostly-horizontal spoke takes its label
        above, a mostly-vertical one takes it to whichever side the spoke leans
        away from.

        THE GAP HAS TO BE COMPENSATED FOR THE SLANT. `ArrowLabel` measures its gap
        from the anchor point, which sits ON the stroke at the spoke's midpoint, so
        on an axis-aligned connector a gap of 8 is 8px of clearance everywhere
        along the mask. On a slanted spoke the stroke climbs across the mask's
        width, and the far corner loses `slope × halfWidth` of that clearance —
        which on a 71px label at a 12° lean is 8px, i.e. all of it. Adding the
        slant term back keeps the whole mask at least 8px clear, which is what
        rule 2 actually asks for. */
    const horizontal = Math.abs(ux) >= Math.abs(uy)
    const labelW = Math.max((b.s.spokeLabel?.length ?? 0) * 9 * 0.62 + 10, 22)
    const LABEL_H = 13
    const slantGap = horizontal
      ? (Math.abs(uy) / Math.abs(ux || 1e-6)) * (labelW / 2)
      : (Math.abs(ux) / Math.abs(uy || 1e-6)) * (LABEL_H / 2)
    return {
      k: b.k,
      s: b.s,
      start,
      end,
      label: {
        /* NOT the spoke's midpoint. The halo the label lives in is narrowest at
           the hub, because the hub is wider than a station and its corner reaches
           further out along a slanted spoke than its edge does — a mask centred on
           the midpoint clips that corner. Sitting the label 72% of the way back
           toward the station puts the whole mask in open canvas without moving it
           far enough to reach the station box either. */
        x: end.x + (start.x - end.x) * 0.72,
        y: end.y + (start.y - end.y) * 0.72,
        side: horizontal ? ('above' as const) : ux > 0 ? ('right' as const) : ('left' as const),
        gap: 8 + slantGap,
      },
    }
  })

  const hubBox = {
    x: snap(cx - hubW / 2),
    y: snap(cy - hubH / 2),
    w: hubW,
    h: hubH,
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Loop diagram"
      data-diagram="loop"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Ring flow — solid, clockwise, one ellipse. */}
      {arcs.map((a) => (
        <Connector key={a.k} d={a.d} tone="default" idPrefix={uid} />
      ))}

      {/* 2. Write-back spokes — dashed and inward. Solid spokes would read as
             primary flow and the loop would lose the distinction it exists for. */}
      {spokes.map((sp) => (
        <line
          key={sp.k}
          x1={sp.start.x.toFixed(3)}
          y1={sp.start.y.toFixed(3)}
          x2={sp.end.x.toFixed(3)}
          y2={sp.end.y.toFixed(3)}
          stroke={role.soft}
          strokeWidth={1.1}
          strokeDasharray="5,4"
          markerEnd={`url(#${uid}-arrow-soft)`}
        />
      ))}

      {/* 3. Stations. Drawn after the connectors, so a fractional arc overshoot
             is masked by the box it lands on. */}
      {boxes.map((b) => (
        <NodeBox
          key={b.k}
          x={b.x}
          y={b.y}
          w={b.w}
          h={b.h}
          kind={b.s.focal ? 'focal' : 'step'}
          name={b.s.name}
          sublabel={b.s.sublabel}
        />
      ))}

      {/* 4. The hub — the one dark element in the drawing, and the only one. It
             is accumulated state, not a seventh step, which is why it is the
             single inverted box rather than another node kind. */}
      <g>
        <rect x={hubBox.x} y={hubBox.y} width={hubBox.w} height={hubBox.h} rx={6} fill={role.paper} />
        <rect x={hubBox.x} y={hubBox.y} width={hubBox.w} height={hubBox.h} rx={6} fill={role.ink} />
        <text
          x={cx}
          y={hub.sublabel ? cy - 8 : cy}
          fill={role.paper}
          fontFamily={diagramType.family}
          fontSize={diagramType.nodeName.size}
          fontWeight={diagramType.nodeName.weight}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {hub.name}
        </text>
        {hub.sublabel && (
          <text
            x={cx}
            y={cy + 10}
            fill={withAlpha(role.paper, 0.72)}
            fontFamily={diagramType.family}
            fontSize={diagramType.sublabel.size}
            fontWeight={diagramType.sublabel.weight}
            letterSpacing={`${diagramType.sublabel.tracking}em`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {hub.sublabel}
          </text>
        )}
      </g>

      {/* 5. Spoke labels last, so their masks sit over the dashes they interrupt.
             That ordering is why each one has to land on open canvas — the halo
             between the station ring and the hub. */}
      {spokes.map(
        (sp) =>
          sp.s.spokeLabel && (
            <ArrowLabel
              key={`l${sp.k}`}
              x={snap(sp.label.x)}
              y={snap(sp.label.y)}
              text={sp.s.spokeLabel}
              side={sp.label.side}
              gap={Math.round(sp.label.gap)}
            />
          )
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}
