import { DiagramText, Legend, role, snap, withAlpha, type LegendItem } from './primitives'

/**
 * Diagram — Radar / spider. Three to five entities across three to five
 * criteria, on one normalised scale.
 *
 * Ported from the diagram-design skill's `type-radar.md`. This is the ONE type
 * in the library allowed more than one non-focal colour, because it is the one
 * type whose whole job is telling entities apart — so the non-focal series come
 * from `role.series`, the deck's own categorical palette, and `role.accent` stays
 * reserved for the recommended option. `role.series[0]` is skipped on purpose: it
 * IS the accent, and a non-focal series wearing the focal colour is the whole
 * failure this rule exists to prevent.
 *
 * RADAR COMPARES SHAPES, NOT NUMBERS. Every axis must therefore be normalised to
 * the same 0–`scale` range before it gets here. Mixing a 0–100 axis with a 0–1
 * axis produces a polygon that looks like data and means nothing, and starting
 * the inner ring above zero to amplify a difference is upstream's zero-baseline
 * trick — if the shapes look similar, that IS the finding.
 *
 * THE RINGS AND SPOKES ARE THE FIGURE, NOT CONNECTORS. Rings are `<polygon>`
 * closed at the axis vertices, spokes are `<line>` from the centre, and series
 * are `<polygon>`. None of them is a route between two nodes, so the
 * orthogonal-connector rule does not apply and the geometry gate — which reads
 * `<path>` `d` strings — has nothing to misread. There are no connectors and
 * therefore no arrow labels in this type.
 *
 * LAYOUT IS DERIVED. The radius is whatever the well's height allows once the
 * legend strip and the axis-label bands are taken out, and the chart is centred
 * in what is left.
 */

export interface RadarSeries {
  name: string
  /** One value per axis, in axis order, on the 0–`scale` range. */
  values: number[]
  /** At most one. The recommended option, in `accent`, with vertex dots. */
  focal?: boolean
}

export interface RadarProps {
  width: number
  height: number
  /** One word per spoke — Jobs-minimal. First is at the top, then clockwise.
   *  Three to five; above five, split the chart or use a table. */
  axes: string[]
  /** Up to five. Two is a bar chart's job; six is mush. */
  series: RadarSeries[]
  scale?: number
  /** Tick values on the FIRST (top) axis only. Numbers on every spoke is the
   *  fastest way to make a radar unreadable. Defaults to fifths of the scale. */
  ticks?: number[]
  /** Trailing note on the legend strip, e.g. why one series is the accent. */
  legendNote?: string
}

/** Five concentric rings at fifths of the radius. The outer one is a hint
 *  stronger, which is what stops the chart floating. */
const RING_FRACTIONS = [0.2, 0.4, 0.6, 0.8, 1]

export function Radar({ width, height, axes, series, scale = 10, ticks, legendNote }: RadarProps) {
  const legendH = 52
  const drawH = height - legendH
  const n = axes.length

  /* Axis labels claim a band above and below the outer ring; the radius is what
     survives. A word beside the chart costs horizontal room too, which is only
     binding on a narrow well — hence the second term. */
  const LABEL_BAND = 34
  const R = snap(Math.min((drawH - LABEL_BAND * 2) / 2, (width - 320) / 2))
  const cx = snap(width / 2)
  const cy = snap(drawH / 2)

  /* Upstream's math, unchanged: axis i at `-90° + 360°·i/n`, so axis 0 is at the
     top and the reading order is clockwise. */
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n
  const at = (i: number, f: number) => ({
    x: cx + f * R * Math.cos(angle(i)),
    y: cy + f * R * Math.sin(angle(i)),
  })
  const ring = (f: number) =>
    axes.map((_, i) => {
      const p = at(i, f)
      return `${Math.round(p.x)},${Math.round(p.y)}`
    }).join(' ')

  const seriesPoints = (s: RadarSeries) =>
    s.values.map((v, i) => {
      const p = at(i, Math.max(0, Math.min(1, v / scale)))
      return { x: Math.round(p.x), y: Math.round(p.y) }
    })

  /* Shoelace area, used only for draw order. Upstream draws the non-focal series
     smallest-first so the accent lands on top of everything. */
  const area = (pts: { x: number; y: number }[]) =>
    Math.abs(
      pts.reduce((sum, p, i) => {
        const q = pts[(i + 1) % pts.length]
        return sum + (p.x * q.y - q.x * p.y)
      }, 0) / 2
    )

  /* `role.series[0]` is the accent itself — see the note at the top. */
  const palette = role.series.slice(1)
  const resolved = series.map((s, i) => ({
    s,
    pts: seriesPoints(s),
    colour: s.focal ? role.accent : palette[i % palette.length],
  }))
  const nonFocal = resolved.filter((r) => !r.s.focal).sort((a, b) => area(a.pts) - area(b.pts))
  const focal = resolved.filter((r) => r.s.focal)

  const tickValues = ticks ?? RING_FRACTIONS.map((f) => Math.round(f * scale))

  /* The legend keeps the entity order the author gave, not the draw order — the
     reader matches names to the list, and re-sorting it to match z-order would
     shuffle the names for a reason invisible on the page. */
  const legendItems: LegendItem[] = resolved.map((r) => ({ label: r.s.name, swatch: r.colour }))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Radar diagram"
      data-diagram="radar"
    >
      {/* 1. Grid rings — closed polygons through the axis vertices, so the grid
             has the same silhouette as the data drawn on it. */}
      {RING_FRACTIONS.map((f, i) => (
        <polygon
          key={f}
          points={ring(f)}
          fill="none"
          stroke={i === RING_FRACTIONS.length - 1 ? role.ruleSolid : role.rule}
          strokeWidth={i === RING_FRACTIONS.length - 1 ? 1 : 0.8}
        />
      ))}

      {/* 2. Spokes. No arrowheads — a spoke is a scale, not a direction. */}
      {axes.map((_, i) => {
        const p = at(i, 1)
        return (
          <line
            key={`sp${i}`}
            x1={cx}
            y1={cy}
            x2={Math.round(p.x)}
            y2={Math.round(p.y)}
            stroke={role.rule}
            strokeWidth={0.8}
          />
        )
      })}

      {/* 3. Axis labels, 18px outside the outer ring along the axis vector. One
             word each: a radar with a phrase on every spoke reads as a paragraph
             arranged in a circle. */}
      {axes.map((label, i) => {
        const p = at(i, 1)
        const ux = Math.cos(angle(i))
        const uy = Math.sin(angle(i))
        const anchor = ux > 0.2 ? 'start' : ux < -0.2 ? 'end' : 'middle'
        return (
          <DiagramText
            key={`ax${i}`}
            x={snap(p.x + ux * 18)}
            y={snap(p.y + uy * 18 + (anchor === 'middle' ? (uy > 0 ? 6 : -6) : 0))}
            variant="nodeName"
            tone="ink"
            anchor={anchor}
          >
            {label}
          </DiagramText>
        )
      })}

      {/* 4. Scale ticks on the FIRST axis only. */}
      {tickValues.map((v) => (
        <DiagramText
          key={`tk${v}`}
          x={cx - 8}
          y={snap(cy - (v / scale) * R)}
          variant="eyebrow"
          tone="soft"
          anchor="end"
        >
          {String(v)}
        </DiagramText>
      ))}

      {/* 5. Non-focal series, smallest area first, then the focal on top. */}
      {nonFocal.map((r) => (
        <polygon
          key={r.s.name}
          points={r.pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={withAlpha(r.colour, 0.18)}
          stroke={r.colour}
          strokeWidth={1.5}
        />
      ))}
      {focal.map((r) => (
        <polygon
          key={r.s.name}
          points={r.pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={withAlpha(r.colour, 0.18)}
          stroke={r.colour}
          strokeWidth={1.8}
        />
      ))}

      {/* 6. Vertex dots on the FOCAL SERIES ONLY. This is the load-bearing rule
             that keeps four or five overlapping polygons readable: dots on every
             series turns the chart into a bead curtain. */}
      {focal.map((r) =>
        r.pts.map((p, i) => <circle key={`${r.s.name}${i}`} cx={p.x} cy={p.y} r={4} fill={r.colour} />)
      )}

      <Legend x={0} y={drawH + 8} width={width} items={legendItems} />
      {legendNote && (
        <DiagramText x={width} y={drawH + 26} variant="legend" tone="soft" anchor="end">
          {legendNote}
        </DiagramText>
      )}
    </svg>
  )
}
