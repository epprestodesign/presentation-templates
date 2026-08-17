import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  elbow,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Scatter (editorial). Two continuous variables against each other,
 * when the RELATIONSHIP is the message.
 *
 * THIS IS NOT A REPLACEMENT FOR `Templates/Charts/*`. The MUI X charts in the
 * deck own the case where the data is live or the axis needs real machinery —
 * self-computing ticks, tooltips, zoom. This one owns the case where the plot is
 * one element inside a drawing: same hairlines as the node boxes beside it, same
 * Poppins, same 4px grid, and quadrant labels that read as diagram type rather
 * than chart chrome.
 *
 * LAYOUT IS DERIVED from the well the template hands down. Both domains are
 * given explicitly rather than inferred, because on a scatter the choice of
 * whether zero is in frame is an editorial decision, not a default: including it
 * is right when absolute position matters and wrong when the cloud is tiny and
 * far from the origin (both are upstream anti-patterns, in opposite directions).
 *
 * DOTS ARE `<circle>`, NOT CONNECTORS. Quadrant dividers and the optional trend
 * line are `<line>`. Nothing here is a `<path>` except the one callout leader,
 * which is a real orthogonal elbow — so the connector rules apply exactly where
 * they should and nowhere they shouldn't.
 *
 * Upstream's rules that are kept: 5–30 points, label the focal point and at most
 * one or two notable outliers, no bubble-size encoding (area perception is
 * unreliable — a third variable belongs in a group colour or a second panel),
 * and a trend line only when the trend is already visible without it.
 */

export interface ScatterPoint {
  x: number
  y: number
  /** Set on the focal point and at most one or two outliers. Never all of them. */
  label?: string
  /** Index into `groups`. Omitted → the neutral treatment. */
  group?: number
  focal?: boolean
  /** Which side of the dot its label sits on. Defaults to the right. */
  labelSide?: 'left' | 'right' | 'above' | 'below'
}

export interface ScatterProps {
  width: number
  height: number
  points: ScatterPoint[]
  /** `[min, max]`. Explicit — see the note above on zero. */
  xDomain: [number, number]
  yDomain: [number, number]
  xTicks?: number
  yTicks?: number
  xFormat?: (v: number) => string
  yFormat?: (v: number) => string
  /** Eyebrows naming the units. `x` sits under the axis, `y` above the plot. */
  xLabel?: string
  yLabel?: string
  groups?: string[]
  /** Median-ish dividers with a name per quadrant, clockwise from top-left. */
  quadrants?: { x: number; y: number; labels: [string, string, string, string] }
  /** Dashed guide from `[x,y]` to `[x,y]` in data space. Only when the trend is
   *  visually obvious — a forced fit is dishonest. */
  trend?: { from: [number, number]; to: [number, number] }
  /** One callout, pointed at a point by an orthogonal leader. */
  annotation?: { point: number; text: string; dx?: number; dy?: number }
  legend?: LegendItem[]
}

export function Scatter({
  width,
  height,
  points,
  xDomain,
  yDomain,
  xTicks = 4,
  yTicks = 4,
  xFormat = (v) => String(v),
  yFormat = (v) => String(v),
  xLabel,
  yLabel,
  groups,
  quadrants,
  trend,
  annotation,
  legend,
}: ScatterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  /* THE ACCENT IS REMOVED FROM THE GROUP PALETTE. `seriesCategorical[0]` is
     fountain-blue-600, which is also `color.accent` — so group 0 came out in the
     focal colour and the focal dot stopped being distinguishable from its own
     cluster. Filter rather than offset, so it stays true if the palette moves.

     `groupColor` must return a HEX, never an rgba() string: the returned value is
     fed back through `withAlpha()` for the dot fill, and withAlpha() parses
     `#rrggbb`. Handing it an rgba() gave `rgba(NaN, NaN, NaN, 0.22)`, which the
     browser dropped to black — every ungrouped dot rendered as a black disc. */
  const palette = role.series.filter((c) => c !== role.accent)
  const groupColor = (g?: number) => (g === undefined ? role.muted : palette[g % palette.length])

  const autoLegend: LegendItem[] | undefined =
    legend ?? (groups?.length ? groups.map((g, i) => ({ label: g, swatch: groupColor(i) })) : undefined)
  const legendH = autoLegend?.length ? 48 : 0

  const padL = snap(Math.max(48, Math.min(84, width * 0.06)))
  const padR = snap(36)
  const padT = snap(yLabel ? 28 : 16)
  const padB = snap(xLabel ? 50 : 36)

  const plotX = padL
  const plotY = padT
  const plotW = snap(width - padL - padR)
  const plotH = snap(height - legendH - padT - padB)
  const baseY = plotY + plotH

  const xAt = (v: number) => snap(plotX + (plotW * (v - xDomain[0])) / (xDomain[1] - xDomain[0]))
  const yAt = (v: number) => snap(baseY - (plotH * (v - yDomain[0])) / (yDomain[1] - yDomain[0]))

  const xTickVals = Array.from(
    { length: xTicks + 1 },
    (_, k) => xDomain[0] + ((xDomain[1] - xDomain[0]) * k) / xTicks
  )
  const yTickVals = Array.from(
    { length: yTicks + 1 },
    (_, k) => yDomain[0] + ((yDomain[1] - yDomain[0]) * k) / yTicks
  )

  /* The callout leader. Always `bias: 'v'` — vertical away from the open end,
     then horizontal INTO the point — so the last leg is predictable and the
     label always has the same home: centred on that horizontal run, one side or
     the other. A leader whose approach angle depends on the offsets is a leader
     whose label placement has to be re-argued for every story. */
  let leader: { d: string; lx: number; ly: number; side: 'above' | 'below' } | undefined
  if (annotation) {
    const p = points[annotation.point]
    if (p) {
      const px = xAt(p.x)
      const py = yAt(p.y)
      const from = { x: snap(px + (annotation.dx ?? -160)), y: snap(py + (annotation.dy ?? 0)) }
      /* Stop 10px short of the dot on the side the leader arrives from, so the
         arrowhead points at the mark instead of burying itself in it. */
      const stop = px + Math.sign(from.x - px || -1) * 10
      leader = {
        d: elbow(from, { x: stop, y: py }, 'v'),
        lx: snap((from.x + stop) / 2),
        ly: py,
        side: from.y < py ? 'above' : 'below',
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Scatter plot"
      data-diagram="scatter"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Gridlines. <line>, so nothing here can be mistaken for a connector. */}
      {yTickVals.map((v) => (
        <g key={`y${v}`}>
          <line
            x1={plotX}
            y1={yAt(v)}
            x2={plotX + plotW}
            y2={yAt(v)}
            stroke={v === yDomain[0] ? role.ruleSolid : role.rule}
            strokeWidth={v === yDomain[0] ? 1 : 0.8}
          />
          <DiagramText x={plotX - 10} y={yAt(v)} variant="eyebrow" tone="soft" anchor="end">
            {yFormat(v)}
          </DiagramText>
        </g>
      ))}
      {xTickVals.map((v) => (
        <DiagramText key={`x${v}`} x={xAt(v)} y={baseY + 18} variant="eyebrow" tone="soft" anchor="middle">
          {xFormat(v)}
        </DiagramText>
      ))}
      <line x1={plotX} y1={plotY} x2={plotX} y2={baseY} stroke={role.ruleSolid} strokeWidth={1} />

      {yLabel && (
        <DiagramText x={plotX - 10} y={plotY - 14} variant="eyebrow" tone="soft" anchor="start" uppercase>
          {yLabel}
        </DiagramText>
      )}
      {xLabel && (
        <DiagramText
          x={snap(plotX + plotW / 2)}
          y={baseY + 40}
          variant="eyebrow"
          tone="soft"
          anchor="middle"
          uppercase
        >
          {xLabel}
        </DiagramText>
      )}

      {/* 2. Quadrant dividers, then their names in the corners of each quadrant —
             far enough in that a dot near a divider does not collide with type. */}
      {quadrants && (
        <>
          <line
            x1={xAt(quadrants.x)}
            y1={plotY}
            x2={xAt(quadrants.x)}
            y2={baseY}
            stroke={withAlpha(role.ink, 0.18)}
            strokeWidth={0.8}
            strokeDasharray="4,3"
          />
          <line
            x1={plotX}
            y1={yAt(quadrants.y)}
            x2={plotX + plotW}
            y2={yAt(quadrants.y)}
            stroke={withAlpha(role.ink, 0.18)}
            strokeWidth={0.8}
            strokeDasharray="4,3"
          />
          <DiagramText x={plotX + 10} y={plotY + 12} variant="eyebrow" tone="soft" uppercase>
            {quadrants.labels[0]}
          </DiagramText>
          <DiagramText x={plotX + plotW - 10} y={plotY + 12} variant="eyebrow" tone="soft" anchor="end" uppercase>
            {quadrants.labels[1]}
          </DiagramText>
          <DiagramText x={plotX + plotW - 10} y={baseY - 12} variant="eyebrow" tone="soft" anchor="end" uppercase>
            {quadrants.labels[2]}
          </DiagramText>
          <DiagramText x={plotX + 10} y={baseY - 12} variant="eyebrow" tone="soft" uppercase>
            {quadrants.labels[3]}
          </DiagramText>
        </>
      )}

      {/* 3. Trend guide, under the dots. */}
      {trend && (
        <line
          x1={xAt(trend.from[0])}
          y1={yAt(trend.from[1])}
          x2={xAt(trend.to[0])}
          y2={yAt(trend.to[1])}
          stroke={withAlpha(role.ink, 0.25)}
          strokeWidth={1}
          strokeDasharray="4,3"
        />
      )}

      {/* 4. Dots. Paper disc first, so a dot over a gridline reads as a dot and
             not as a translucent smudge — upstream's two-circle pattern. Focal
             last, so it is never overdrawn. */}
      {points
        .map((p, i) => ({ p, i }))
        .sort((a, b) => Number(Boolean(a.p.focal)) - Number(Boolean(b.p.focal)))
        .map(({ p, i }) => {
          const c = p.focal ? role.accent : groupColor(p.group)
          const r = p.focal ? 6 : 5
          return (
            <g key={i}>
              <circle cx={xAt(p.x)} cy={yAt(p.y)} r={r} fill={role.paper} />
              <circle
                cx={xAt(p.x)}
                cy={yAt(p.y)}
                r={r}
                fill={withAlpha(c, p.focal ? 0.18 : 0.22)}
                stroke={c}
                strokeWidth={p.focal ? 1.4 : 1}
              />
            </g>
          )
        })}

      {/* 5. Point labels. Free-standing type, not a masked arrow label — these
             annotate a mark, not a connector, and a mask here would punch holes
             in the gridlines for no reason. */}
      {points.map((p, i) => {
        if (!p.label) return null
        const side = p.labelSide ?? 'right'
        const r = p.focal ? 6 : 5
        const dx = side === 'left' ? -(r + 8) : side === 'right' ? r + 8 : 0
        const dy = side === 'above' ? -(r + 10) : side === 'below' ? r + 12 : 0
        return (
          <DiagramText
            key={`l${i}`}
            x={xAt(p.x) + dx}
            y={yAt(p.y) + dy}
            variant="sublabel"
            tone={p.focal ? 'accentDeep' : 'muted'}
            anchor={side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle'}
          >
            {p.label}
          </DiagramText>
        )
      })}

      {/* 6. Callout last. */}
      {leader && <Connector d={leader.d} tone="accent" idPrefix={uid} />}
      {leader && annotation && (
        <ArrowLabel x={leader.lx} y={leader.ly} text={annotation.text} side={leader.side} tone="accent" />
      )}

      {autoLegend?.length ? <Legend x={plotX} y={height - legendH + 8} width={plotW} items={autoLegend} /> : null}
    </svg>
  )
}
