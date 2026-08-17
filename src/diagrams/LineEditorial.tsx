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
 * Diagram — Line (editorial). A continuous trend over an ordered index.
 *
 * THIS IS NOT A REPLACEMENT FOR `Templates/Charts/*`. The deck already has a
 * MUI X chart system, and it is the right tool whenever the data is live, the
 * axis needs real machinery (ticks it computes itself, tooltips, responsive
 * re-scaling) or the chart IS the slide. This one exists for the other case:
 * when a line is one element inside a drawing and has to match the diagram
 * set's hairlines, its 4px grid and its Poppins type — a chart that sits beside
 * node boxes and connectors without looking like a different document.
 *
 * LAYOUT IS DERIVED. Plot margins are computed from the well the template hands
 * down, not from upstream's fixed `0 0 1000 500` viewBox, so the same series
 * renders correctly in a full-width well and in a half-width one.
 *
 * THE SERIES IS A `<polyline>`, DELIBERATELY. A line between two points that
 * share neither x nor y is a diagonal, and a diagonal <path> is an automatic
 * fail under the connector rules — correctly, because a connector must be
 * orthogonal. But a data mark is not a connector: the slant IS the information.
 * Drawing the series as <polyline> keeps that distinction honest and keeps the
 * geometry gate, which only parses <path> `d` strings, looking at connectors.
 *
 * Upstream's rules that are kept: 4–12 points, ≤5 series, vertex dots on the
 * focal series only, no splines (a spline invents values between samples), and
 * a legend strip below the plot rather than inside it.
 */

/** Nice round ceiling for the y domain, so gridlines land on readable numbers
 *  instead of `1,247`. Local rather than shared because it is the only place in
 *  the diagram set that needs a data domain at all. */
function niceCeil(max: number, ticks: number): number {
  if (max <= 0) return ticks
  const raw = max / ticks
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag
  return step * ticks
}

export interface LineSeries {
  name: string
  /** One value per x position. Length must match `xLabels`. */
  points: number[]
  /** The one series the slide is about. Accent, thicker, and the only one with
   *  vertex dots — upstream's rule, and the reason a 4-series chart still has a
   *  subject. */
  focal?: boolean
  /** Tint under the focal series. Only when the AREA means something (a
   *  cumulative total does; a rate does not). */
  area?: boolean
}

export interface LineEditorialProps {
  width: number
  height: number
  series: LineSeries[]
  xLabels: string[]
  /** Top of the y domain. Defaults to a nice round ceiling over the data. */
  yMax?: number
  yTicks?: number
  yFormat?: (v: number) => string
  /** Eyebrow naming the y unit, set above the plot. Replaces a rotated axis
   *  title, which at 8.5px in Poppins reads as a smudge. */
  valueLabel?: string
  /** Shades a run of x positions — a booking window, a freeze period. */
  band?: { from: number; to: number; label?: string }
  /** One callout, pointed at a vertex by an orthogonal leader. `dx`/`dy` place
   *  the leader's open end; the label rides its horizontal leg. */
  annotation?: { series?: number; point: number; text: string; dx?: number; dy?: number }
  legend?: LegendItem[]
}

export function LineEditorial({
  width,
  height,
  series,
  xLabels,
  yMax,
  yTicks = 4,
  yFormat = (v) => String(Math.round(v)),
  valueLabel,
  band,
  annotation,
  legend,
}: LineEditorialProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  /* Non-focal series take the categorical palette in declaration order —
     upstream's "apply in order, don't skip" rule, which is what keeps two
     charts on adjacent slides agreeing on what series 2 looks like. Computed
     before the legend so the swatch and the stroke cannot drift apart.

     THE ACCENT IS REMOVED FROM THE PALETTE FIRST. `seriesCategorical[0]` is
     fountain-blue-600, which is also `color.accent` — so applying the palette
     from index 0 painted the second series in the focal colour and the slide had
     two teal lines with only a weight difference between them. Filtering rather
     than starting at index 1 keeps it true even if the palette is reordered. */
  const palette = role.series.filter((c) => c !== role.accent)
  let seriesIndex = 0
  const stroked = series.map((s) => {
    const stroke = s.focal ? role.accent : palette[seriesIndex++ % palette.length]
    return { s, stroke }
  })

  /* Reserve the legend only when there is more than one series to name. A
     one-series legend is a restatement of the title. */
  const autoLegend: LegendItem[] | undefined =
    legend ??
    (stroked.length > 1 ? stroked.map(({ s, stroke }) => ({ label: s.name, swatch: stroke })) : undefined)
  const legendH = autoLegend?.length ? 48 : 0

  /* Plot margins, derived. Left is the widest y label plus its gap; top leaves
     room for the value eyebrow; bottom holds one row of x labels. */
  const padL = snap(Math.max(48, Math.min(84, width * 0.06)))
  const padR = snap(28)
  const padT = snap(valueLabel ? 28 : 16)
  const padB = snap(36)

  const plotX = padL
  const plotY = padT
  const plotW = snap(width - padL - padR)
  const plotH = snap(height - legendH - padT - padB)
  const baseY = plotY + plotH

  const dataMax = Math.max(...series.flatMap((s) => s.points))
  const top = yMax ?? niceCeil(dataMax, yTicks)

  const n = xLabels.length
  const xAt = (i: number) => snap(plotX + (plotW * i) / Math.max(n - 1, 1))
  const yAt = (v: number) => snap(baseY - (plotH * v) / top)

  const ticks = Array.from({ length: yTicks + 1 }, (_, k) => (top * k) / yTicks)

  const focal = stroked.find((x) => x.s.focal) ?? stroked[0]
  const annSeries = annotation ? (stroked[annotation.series ?? stroked.indexOf(focal)] ?? focal) : undefined

  /* The callout leader: an orthogonal elbow out of open canvas and INTO the
     vertex from the side, with the label centred on that final horizontal run.

     `bias: 'v'` — vertical first, then horizontal — rather than the other way
     round. Horizontal-first puts the corner directly above the vertex and drops
     the last leg straight down through the mark, which on a peak means the
     arrowhead buries itself in the vertex dot and the long horizontal leg cuts
     across whichever flank it passes. Approaching from the side keeps the final
     leg parallel to the curve at its extreme, where there is always clearance.

     `dy: 0` is the cleanest case and worth reaching for: the leader degenerates
     to a single straight rule from the label to the mark, which is what an
     editorial callout looks like when the geometry allows it. */
  let leader: { d: string; lx: number; ly: number; side: 'above' | 'below' } | undefined
  if (annotation && annSeries) {
    const px = xAt(annotation.point)
    const py = yAt(annSeries.s.points[annotation.point])
    const from = { x: snap(px + (annotation.dx ?? -160)), y: snap(py + (annotation.dy ?? 0)) }
    const stop = px + Math.sign(from.x - px || -1) * 10
    leader = {
      d: elbow(from, { x: stop, y: py }, 'v'),
      lx: snap((from.x + stop) / 2),
      ly: py,
      side: from.y < py ? 'above' : 'below',
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Line chart"
      data-diagram="line-editorial"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Band first — it is ground, and everything else reads on top of it. */}
      {band && (
        <rect
          x={xAt(band.from)}
          y={plotY}
          width={xAt(band.to) - xAt(band.from)}
          height={plotH}
          fill={withAlpha(role.accent, 0.05)}
        />
      )}
      {band?.label && (
        <DiagramText
          x={snap((xAt(band.from) + xAt(band.to)) / 2)}
          y={plotY + 10}
          variant="eyebrow"
          tone="accent"
          anchor="middle"
          uppercase
        >
          {band.label}
        </DiagramText>
      )}

      {/* 2. Gridlines and their labels. <line>, not <path> — a gridline is not a
             connector and must not be read as one. */}
      {ticks.map((v) => (
        <g key={v}>
          <line
            x1={plotX}
            y1={yAt(v)}
            x2={plotX + plotW}
            y2={yAt(v)}
            stroke={v === 0 ? role.ruleSolid : role.rule}
            strokeWidth={v === 0 ? 1 : 0.8}
          />
          <DiagramText x={plotX - 10} y={yAt(v)} variant="eyebrow" tone="soft" anchor="end">
            {yFormat(v)}
          </DiagramText>
        </g>
      ))}

      {valueLabel && (
        <DiagramText x={plotX - 10} y={plotY - 14} variant="eyebrow" tone="soft" anchor="start" uppercase>
          {valueLabel}
        </DiagramText>
      )}

      {/* 3. x labels, centred on their point. */}
      {xLabels.map((l, i) => (
        <DiagramText key={i} x={xAt(i)} y={baseY + 18} variant="eyebrow" tone="soft" anchor="middle" uppercase>
          {l}
        </DiagramText>
      ))}

      {/* 4. Area under the focal series, when the area means something. */}
      {stroked.map(
        ({ s, stroke }, i) =>
          s.area && (
            <polygon
              key={`a${i}`}
              points={[
                `${plotX},${baseY}`,
                ...s.points.map((v, k) => `${xAt(k)},${yAt(v)}`),
                `${plotX + plotW},${baseY}`,
              ].join(' ')}
              fill={withAlpha(stroke, 0.08)}
            />
          )
      )}

      {/* 5. Series. Non-focal first, so the focal line is never crossed over. */}
      {stroked
        .filter((x) => !x.s.focal)
        .concat(stroked.filter((x) => x.s.focal))
        .map(({ s, stroke }, i) => (
          <polyline
            key={`s${i}`}
            points={s.points.map((v, k) => `${xAt(k)},${yAt(v)}`).join(' ')}
            fill="none"
            stroke={stroke}
            strokeWidth={s.focal ? 1.8 : 1.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

      {/* 6. Vertex dots on the focal series ONLY. Dots everywhere is upstream's
             named anti-pattern and reads as noise at four series. */}
      {focal?.s.points.map((v, k) => (
        <circle key={`d${k}`} cx={xAt(k)} cy={yAt(v)} r={3.5} fill={focal.stroke} />
      ))}

      {/* 7. Callout last, so its mask sits above the gridlines it interrupts. */}
      {leader && <Connector d={leader.d} tone="accent" idPrefix={uid} />}
      {leader && annotation && (
        <ArrowLabel x={leader.lx} y={leader.ly} text={annotation.text} side={leader.side} tone="accent" />
      )}

      {autoLegend?.length ? <Legend x={plotX} y={height - legendH + 8} width={plotW} items={autoLegend} /> : null}
    </svg>
  )
}
