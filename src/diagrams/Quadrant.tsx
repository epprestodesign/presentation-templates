import { useId } from 'react'
import {
  ArrowMarkers,
  DiagramText,
  Legend,
  diagramType,
  nodeStyle,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Quadrant. Two independent drivers, four positions.
 *
 * Ported from the diagram-design skill's `type-quadrant.md`, which ships TWO
 * grammars under one type and is emphatic that they are not interchangeable:
 *
 *  - STANDARD (`items`) — the axes hold a MEASUREMENT and position inside a cell
 *    carries meaning. Items are small labelled dots. This is the prioritisation
 *    frame: impact × effort, reach × frequency.
 *  - CONSULTANT (`cells`) — the axes hold a RANGE and the cells hold named
 *    scenarios. Position inside a cell means nothing, so there are no dots. This
 *    is the scenario-planning frame: four named futures across two drivers.
 *
 * The visible difference is small (double-ended axis arrows, named cells) and
 * the semantic difference is total, which is why both live here rather than
 * being two types: an author who picks the wrong one gets caught by the presence
 * or absence of dots.
 *
 * LAYOUT IS DERIVED. The plot is a rectangle sized off the well, capped to an
 * aspect ratio so it never degenerates into a letterbox, then centred. Nothing
 * is hand-placed; items are given in normalised 0–1 space and the component
 * resolves them against the plot it computed.
 *
 * THERE ARE NO CONNECTORS IN THIS TYPE. The axis cross and its arrows are the
 * figure, not connectors, so they are drawn as `<line>` — which also keeps the
 * geometry gate from reading an axis as a diagonal path. Axis labels sit beyond
 * the arrow tips on open canvas and use `DiagramText`, not `ArrowLabel`: they
 * annotate an axis, not a route between two nodes, and there is no stroke under
 * them to mask.
 */

export interface QuadrantItem {
  name: string
  /** 0–1 along the x axis, left → right. */
  x: number
  /** 0–1 along the y axis, BOTTOM → TOP, so 1 is the high end. */
  y: number
  /** Metadata line under the name. */
  sublabel?: string
  /** The one "do first" item. At most one per diagram. */
  focal?: boolean
  /** Which way the label sits off the dot. Pick the side facing open canvas. */
  labelSide?: 'left' | 'right' | 'above' | 'below'
}

export interface QuadrantCell {
  /** `NN · DRIVER-A / DRIVER-B`. The driver words MUST match the axis labels —
   *  a tag that disagrees with its axes reads as a bug in three seconds. */
  tag: string
  name: string
  /** One to three short lines. Left-aligned inside the cell. */
  lines?: string[]
  /** Exactly one cell. None makes it a blank template; two erases the signal. */
  focal?: boolean
}

/** One word per arrow tip. `low` present ⇒ the axis is double-ended. */
export interface QuadrantAxis {
  /** The word at the right (x) or top (y) tip. */
  high: string
  /** The word at the left (x) or bottom (y) tip. Omit for a single-ended axis. */
  low?: string
}

export interface QuadrantProps {
  width: number
  height: number
  xAxis: QuadrantAxis
  yAxis: QuadrantAxis
  /** STANDARD variant: positioned dots. */
  items?: QuadrantItem[]
  /** CONSULTANT variant: four named scenarios, in reading order TL, TR, BL, BR. */
  cells?: [QuadrantCell, QuadrantCell, QuadrantCell, QuadrantCell]
  /** Short corner tags for the standard variant, same reading order. */
  cornerTags?: [string, string, string, string]
  /** Which corner carries the accent tint, same reading order. */
  focalCorner?: 0 | 1 | 2 | 3
  legend?: LegendItem[]
}

export function Quadrant({
  width,
  height,
  xAxis,
  yAxis,
  items = [],
  cells,
  cornerTags,
  focalCorner,
  legend,
}: QuadrantProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  /* Bands reserved OUTSIDE the plot for the arrow tips and the words beyond
     them. TIP is how far the arrow overshoots the plot edge; LAB is the gap
     from tip to word. Both come straight from upstream (~20px / ~12px). */
  const TIP = 20
  const LAB = 12
  const PAD_Y = TIP + LAB + 10
  const PAD_X = 104

  /* A 2×2 reads honestly at any aspect — position within a cell is relative, not
     absolute — but a plot four times wider than it is tall stops reading as a
     square frame. Cap it against the height, then centre what is left.

     BOTH DIMENSIONS SNAP TO 8, NOT 4. The axis cross sits at the plot's midpoint,
     so a plot width that is an odd multiple of 4 puts the cross two pixels off
     the cell boundary it is supposed to run along — visible as a hairline sliver
     down the side of the focal tint. Snapping the plot to 8 keeps every half also
     on the 4px grid. */
  const snap8 = (v: number) => 8 * Math.round(v / 8)
  const plotH = snap8(drawH - PAD_Y * 2)
  const plotW = snap8(Math.min(width - PAD_X * 2, plotH * (cells ? 3 : 2.8)))
  const x0 = snap((width - plotW) / 2)
  const y0 = snap((drawH - plotH) / 2)
  const cx = x0 + plotW / 2
  const cy = y0 + plotH / 2

  /* Corner boxes in reading order: TL, TR, BL, BR. Used for the focal tint, the
     corner tags and — in the consultant variant — the cells themselves. */
  const corner = (i: number) => ({
    x: i % 2 === 0 ? x0 : cx,
    y: i < 2 ? y0 : cy,
    w: plotW / 2,
    h: plotH / 2,
  })

  /* Cells clear the axis cross by CELL_GAP on each side, so the cross passes
     BETWEEN them and never through a box. Outer edges stay flush with the plot,
     which is what keeps the four cells reading as one frame. */
  const CELL_GAP_X = 24
  const CELL_GAP_Y = 20
  const cellBox = (i: number) => {
    const c = corner(i)
    return {
      x: snap(i % 2 === 0 ? c.x : c.x + CELL_GAP_X),
      y: snap(i < 2 ? c.y : c.y + CELL_GAP_Y),
      w: snap(c.w - CELL_GAP_X),
      h: snap(c.h - CELL_GAP_Y),
    }
  }

  /* Arrow tips. A tip exists only where there is a word for it: the standard
     variant is single-ended (right + up), the consultant variant double-ended. */
  const tips = {
    right: { on: true, x: x0 + plotW + TIP, y: cy },
    left: { on: Boolean(xAxis.low), x: x0 - TIP, y: cy },
    top: { on: true, x: cx, y: y0 - TIP },
    bottom: { on: Boolean(yAxis.low), x: cx, y: y0 + plotH + TIP },
  }
  const axisStroke = cells ? role.ink : role.ruleSolid
  const axisWidth = cells ? 1.2 : 1

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Quadrant diagram"
      data-diagram="quadrant"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Focal tint, painted first so everything else sits on top of it. One
             quadrant, not four — colouring all four is the anti-pattern that
             turns position into noise. */}
      {focalCorner !== undefined && (
        <rect {...corner(focalCorner)} fill={withAlpha(role.accent, 0.04)} />
      )}
      {cells?.map((c, i) =>
        c.focal ? <rect key={`tint${i}`} {...corner(i)} fill={withAlpha(role.accent, 0.04)} /> : null
      )}

      {/* 2. The axis cross, drawn as four half-lines from the centre outward.
             Two half-lines rather than one line per axis because the arrowhead
             has to point OUTWARD at each tip, and `orient="auto"` resolves off
             the direction of travel — so each direction needs its own stroke.
             These are <line> elements: the cross is the figure itself, not a
             connector, and drawing it as a path would put a legitimate axis in
             front of the geometry gate's diagonal test. */}
      {(
        [
          ['right', tips.right],
          ['left', tips.left],
          ['top', tips.top],
          ['bottom', tips.bottom],
        ] as const
      ).map(([key, t]) => (
        <line
          key={key}
          x1={cx}
          y1={cy}
          x2={t.on ? t.x : key === 'right' ? x0 + plotW : key === 'left' ? x0 : cx}
          y2={t.on ? t.y : key === 'top' ? y0 : key === 'bottom' ? y0 + plotH : cy}
          stroke={axisStroke}
          strokeWidth={axisWidth}
          {...(t.on ? { markerEnd: `url(#${uid}-arrow)` } : {})}
        />
      ))}

      {/* 3. Axis labels — Jobs-minimal. One word per tip, beyond the tip, never
             on the line and never at the midpoint. No glyphs, no HIGH/LOW
             parentheticals: the word IS the label. */}
      <DiagramText x={tips.right.x + LAB} y={cy} variant="eyebrow" tone="ink" uppercase>
        {xAxis.high}
      </DiagramText>
      {xAxis.low && (
        <DiagramText x={tips.left.x - LAB} y={cy} variant="eyebrow" tone="ink" anchor="end" uppercase>
          {xAxis.low}
        </DiagramText>
      )}
      <DiagramText x={cx} y={tips.top.y - LAB} variant="eyebrow" tone="ink" anchor="middle" uppercase>
        {yAxis.high}
      </DiagramText>
      {yAxis.low && (
        <DiagramText
          x={cx}
          y={tips.bottom.y + LAB}
          variant="eyebrow"
          tone="ink"
          anchor="middle"
          uppercase
        >
          {yAxis.low}
        </DiagramText>
      )}

      {/* 4a. STANDARD variant — corner tags in the outer corner of each cell,
              held off the plot edge so they never sit on the axis. */}
      {cornerTags?.map((tag, i) => {
        const c = corner(i)
        const right = i % 2 === 1
        const bottom = i >= 2
        return (
          <DiagramText
            key={`tag${i}`}
            x={right ? c.x + c.w - 12 : c.x + 12}
            y={bottom ? c.y + c.h - 12 : c.y + 12}
            variant="eyebrow"
            tone={focalCorner === i ? 'accent' : 'soft'}
            anchor={right ? 'end' : 'start'}
            uppercase
          >
            {tag}
          </DiagramText>
        )
      })}

      {/* 4b. CONSULTANT variant — named scenarios. Two rects per cell (opaque
              mask, then the styled box) so the cell reads as a node to anything
              measuring overlap, which is what it is. */}
      {cells?.map((c, i) => {
        const b = cellBox(i)
        const s = c.focal ? nodeStyle.focal : nodeStyle.store
        return (
          <g key={`cell${i}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={role.paper} />
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={6}
              fill={s.fill}
              stroke={s.stroke}
              strokeWidth={c.focal ? 1.2 : 1}
            />
            <DiagramText
              x={b.x + 16}
              y={b.y + 18}
              variant="eyebrow"
              tone={c.focal ? 'accent' : 'soft'}
              uppercase
            >
              {c.tag}
            </DiagramText>
            <DiagramText x={b.x + 16} y={b.y + 44} variant="nodeName" tone="ink">
              {c.name}
            </DiagramText>
            {c.lines?.map((line, li) => (
              <DiagramText key={li} x={b.x + 16} y={b.y + 66 + li * 16} variant="sublabel" tone="muted">
                {line}
              </DiagramText>
            ))}
          </g>
        )
      })}

      {/* 5. STANDARD variant — items. Small dots, label held 10px off so it
             never touches the mark, and the focal dot is the only accent. */}
      {items.map((it) => {
        const px = snap(x0 + it.x * plotW)
        const py = snap(y0 + (1 - it.y) * plotH)
        const r = it.focal ? 5 : 4
        const gap = r + 10
        const side = it.labelSide ?? 'right'
        const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle'
        const lx = side === 'left' ? px - gap : side === 'right' ? px + gap : px
        const ly = side === 'above' ? py - gap - 2 : side === 'below' ? py + gap + 2 : py
        return (
          <g key={it.name}>
            <circle
              cx={px}
              cy={py}
              r={r}
              fill={it.focal ? role.accent : role.muted}
              stroke={role.paper}
              strokeWidth={1}
            />
            <text
              x={lx}
              y={it.sublabel ? ly - 6 : ly}
              fill={it.focal ? role.accentDeep : role.ink}
              fontFamily={diagramType.family}
              fontSize={diagramType.nodeName.size}
              fontWeight={diagramType.nodeName.weight}
              textAnchor={anchor}
              dominantBaseline="central"
            >
              {it.name}
            </text>
            {it.sublabel && (
              <text
                x={lx}
                y={ly + 9}
                fill={role.muted}
                fontFamily={diagramType.family}
                fontSize={diagramType.sublabel.size}
                fontWeight={diagramType.sublabel.weight}
                letterSpacing={`${diagramType.sublabel.tracking}em`}
                textAnchor={anchor}
                dominantBaseline="central"
              >
                {it.sublabel}
              </text>
            )}
          </g>
        )
      })}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}
