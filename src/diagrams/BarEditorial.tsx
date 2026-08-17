import {
  ArrowLabel,
  DiagramText,
  Legend,
  diagramType,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Bar (editorial). A bar chart drawn in the diagram register.
 *
 * The deck already has a full MUI X chart system at `Templates/Charts/*`, and
 * that is still the right answer whenever the data is live, the axis needs a
 * real scale library, or the chart has to respond to a tooltip. This exists for
 * the other case: a chart that sits in a diagram, next to a topology and an
 * architecture, and has to be drawn in the same ink — same hairlines, same
 * eyebrow tracking, same one-focal-element rule, same 4px grid. A charting
 * library's defaults are a different visual language, and switching languages
 * mid-deck is more expensive than re-drawing four bars.
 *
 * WHAT THE PORT ENFORCES, because these are the ways a bar chart lies:
 *
 *  - THE VALUE AXIS STARTS AT ZERO. Not optional and not a prop. A truncated
 *    baseline turns a 6% difference into a 3x one, which is upstream's second
 *    listed anti-pattern and the single most common chart deception.
 *  - ONE FOCAL BAR. `kind: 'focal'` is the accent; everything else is
 *    `muted @ 0.15`. Accent on four bars is accent on nothing.
 *  - BARS ARE AT LEAST HALF THE PITCH, so the gap never outweighs the mark.
 *  - TICKS LAND ON ROUND NUMBERS via a 1/2/2.5/5 nice-scale, because a gridline
 *    at 4,317 is a gridline nobody reads.
 *
 * HORIZONTAL IS A FIRST-CLASS ORIENTATION, not a fallback. Upstream's rule is
 * that long category labels or more than eight categories mean horizontal bars,
 * and EventPipe's categories are things like "Youth sports — multi-night" which
 * cannot be set under a 90px column at any honest angle. Rotated labels are the
 * anti-pattern; a different orientation is the fix.
 *
 * No <path> is emitted. Bars, gridlines and the baseline are shapes and rules.
 */

export interface BarDatum {
  label: string
  value: number
  /** Second series, for the grouped variant. Enables grouping when present. */
  value2?: number
  /** `focal` is the accent. Exactly one, in single-series mode. */
  kind?: 'bar' | 'focal'
}

export interface BarEditorialProps {
  width: number
  height: number
  data: BarDatum[]
  orientation?: 'vertical' | 'horizontal'
  /** Eyebrow naming the unit, set beside the value axis. */
  valueLabel?: string
  /** Formats ticks and value labels. Defaults to grouped thousands. */
  format?: (n: number) => string
  /** Dashed rule across the plot — a plan, a target, a prior-year actual. Its
   *  label gets a reserved margin rather than a slot inside the plot. */
  reference?: { value: number; label: string }
  /** Legend names for a grouped chart: [neutral series, accent series]. */
  seriesNames?: [string, string]
  legend?: LegendItem[]
  /** Gridline intervals. 4–6; more turns the plot into graph paper. */
  gridlines?: number
}

/* ------------------------------------------------------------------- scale */

/**
 * Round the axis top UP to a readable step, spending as little headroom as
 * possible doing it.
 *
 * The naive version — fix the interval count, snap the step up — wastes the
 * plot. A 148,000 peak over five intervals snaps to a 50,000 step and a 250,000
 * ceiling, so the tallest bar reaches 59% of the plot height and two fifths of
 * the chart is empty air. That is not a rounding artefact, it is a chart that
 * has thrown away its own dynamic range.
 *
 * So the interval COUNT is a preference, not a constraint: every (step, count)
 * pair whose product clears the peak is a candidate, and the one with the lowest
 * ceiling wins, ties going to the count the caller asked for. The same peak now
 * takes a 25,000 step over six intervals — a 150,000 ceiling, 99% filled.
 * Steps stay on 1 / 2 / 2.5 / 5 mantissas either way, because the point of a
 * nice scale is arithmetic the reader can do in their head.
 */
function niceScale(
  max: number,
  preferred: number
): { top: number; step: number; count: number } {
  if (!(max > 0)) return { top: preferred, step: 1, count: preferred }
  const mag = 10 ** Math.floor(Math.log10(max / preferred))
  let best: { top: number; step: number; count: number } | null = null
  for (const mult of [1, 2, 2.5, 5, 10, 20]) {
    const step = mult * mag
    for (let count = 4; count <= 7; count++) {
      const top = step * count
      if (top < max) continue
      const better =
        !best ||
        top < best.top ||
        (top === best.top && Math.abs(count - preferred) < Math.abs(best.count - preferred))
      if (better) best = { top, step, count }
    }
  }
  return best ?? { top: max, step: max / preferred, count: preferred }
}

const measure = (text: string, size: number) => text.length * size * 0.62
const floorGrid = (n: number) => Math.floor(n / 4) * 4

/**
 * Category label wrapped to at most two lines.
 *
 * Vertical columns give a label exactly one pitch of width, and "Youth sports"
 * does not fit under a 90px column on one line. Two lines is the ceiling: a
 * three-line label under a column is taller than the axis band and starts
 * competing with the bars for the reader's eye. Anything longer than two lines
 * is the signal to switch orientation.
 */
function wrapTwo(text: string, maxW: number, size: number): string[] {
  if (measure(text, size) <= maxW) return [text]
  const words = text.split(' ')
  const lines: string[] = ['']
  for (const word of words) {
    const trial = lines[0] ? `${lines[0]} ${word}` : word
    if (lines.length === 1 && measure(trial, size) <= maxW) lines[0] = trial
    else if (lines.length === 1) lines.push(word)
    else lines[1] = `${lines[1]} ${word}`
  }
  return lines.filter(Boolean)
}

const defaultFormat = (n: number) =>
  n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : String(n)

export function BarEditorial({
  width,
  height,
  data,
  orientation = 'vertical',
  valueLabel,
  format = defaultFormat,
  reference,
  seriesNames,
  legend,
  gridlines = 5,
}: BarEditorialProps) {
  const grouped = data.some((d) => d.value2 !== undefined)

  /* A grouped chart cannot be read without a key, so it gets one whether or not
     the caller passed `legend` — the series names ARE the legend. */
  const legendItems: LegendItem[] =
    legend?.length
      ? legend
      : grouped && seriesNames
        ? [
            { label: seriesNames[0], swatch: role.muted },
            { label: seriesNames[1], kind: 'focal' },
          ]
        : []
  const legendH = legendItems.length ? 52 : 0
  const drawH = height - legendH

  const peak = Math.max(
    ...data.map((d) => Math.max(d.value, d.value2 ?? 0)),
    reference?.value ?? 0
  )
  const { top, step, count } = niceScale(peak, gridlines)
  const ticks = Array.from({ length: count + 1 }, (_, i) => i * step)
  const tickW = Math.max(...ticks.map((t) => measure(format(t), diagramType.eyebrow.size)))

  /* A reference rule's label gets its own margin outside the plot. Squeezing it
     between the last bar and the plot edge either overlaps a bar or lands on the
     rule it names; a reserved
     gutter always works and costs less width than a redraw. */
  const refW = reference
    ? snap(measure(reference.label, diagramType.arrowLabel.size) + 26)
    : 0

  /* --------------------------------------------------------- vertical bars */
  if (orientation === 'vertical') {
    const axisW = snap(Math.min(96, Math.max(40, tickW + 14)))
    const plotX = axisW
    const plotW = width - axisW - refW
    const pitch = plotW / Math.max(data.length, 1)

    const wrapped = data.map((d) => wrapTwo(d.label, pitch - 10, diagramType.nodeName.size))
    const catLines = Math.max(...wrapped.map((w) => w.length))
    const catBandH = catLines > 1 ? 44 : 28
    /* Value labels live above the bars, so the plot ceiling is inset — and far
       enough down that the top tick label clears the axis eyebrow above it. */
    const plotTop = 28
    const plotH = floorGrid(drawH - plotTop - catBandH)
    const baseY = plotTop + plotH
    const y = (v: number) => baseY - (v / top) * plotH

    /* 60% of the pitch, capped so a four-bar chart does not draw slabs — but
       never below 50%, which is upstream's floor: once the gap outweighs the
       bar the reader starts comparing whitespace. */
    const barW = grouped
      ? Math.max(12, floorGrid(pitch * 0.62) / 2 - 3)
      : Math.max(floorGrid(pitch * 0.5), Math.min(120, floorGrid(pitch * 0.6)))

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Bar chart"
        data-diagram="bar-editorial"
      >
        {valueLabel && (
          <DiagramText x={0} y={8} variant="eyebrow" tone="soft" uppercase>
            {valueLabel}
          </DiagramText>
        )}

        {/* Gridlines and their labels — ground, drawn first. */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={plotX}
              y1={snap(y(t))}
              x2={plotX + plotW}
              y2={snap(y(t))}
              stroke={t === 0 ? role.ruleSolid : role.rule}
              strokeWidth={t === 0 ? 1 : 0.8}
            />
            <text
              x={plotX - 10}
              y={snap(y(t))}
              fill={role.soft}
              fontFamily={diagramType.family}
              fontSize={diagramType.eyebrow.size}
              fontWeight={diagramType.eyebrow.weight}
              letterSpacing={`${diagramType.eyebrow.tracking}em`}
              textAnchor="end"
              dominantBaseline="central"
            >
              {format(t)}
            </text>
          </g>
        ))}
        <line
          x1={plotX}
          y1={plotTop}
          x2={plotX}
          y2={baseY}
          stroke={role.ruleSolid}
          strokeWidth={1}
        />

        {/* The reference rule is GROUND, so it draws with the gridlines rather
            than over the bars. It is a scale marking the bars are read against,
            not an annotation on top of them — and drawing it late put the dashed
            stroke straight through a value label. Toned `muted` rather than
            `negative`: red on a plan line reads as a verdict, and this rule is
            a datum. */}
        {reference && (
          <line
            x1={plotX}
            y1={snap(y(reference.value))}
            x2={plotX + plotW}
            y2={snap(y(reference.value))}
            stroke={role.muted}
            strokeWidth={1}
            strokeDasharray="5,4"
          />
        )}

        {data.map((d, i) => {
          const band = plotX + i * pitch
          const focal = d.kind === 'focal'
          /* Grouped pairs sit either side of the band centre; a single bar is
             centred in it. Same pitch either way, so the category label always
             lines up with what it names. */
          const bars = grouped
            ? [
                { v: d.value, x: band + pitch / 2 - barW - 3, accent: false },
                { v: d.value2 ?? 0, x: band + pitch / 2 + 3, accent: true },
              ]
            : [{ v: d.value, x: band + (pitch - barW) / 2, accent: focal }]

          return (
            <g key={d.label}>
              {bars.map((b, k) => {
                const bh = Math.max(1, baseY - y(b.v))
                return (
                  /* One rect per group, rx=4: two rects in a group is how the
                     geometry gate recognises a node box, and a single rx=2 rect
                     beside a single text is how it recognises a label mask. A
                     bar is neither. */
                  <g key={k}>
                    <rect
                      x={snap(b.x)}
                      y={snap(y(b.v))}
                      width={snap(barW)}
                      height={snap(bh)}
                      rx={4}
                      fill={b.accent ? role.accentTint : withAlpha(role.muted, 0.15)}
                      stroke={b.accent ? role.accent : role.muted}
                      strokeWidth={1}
                    />
                  </g>
                )
              })}
              {/* Value labels in their own masked groups.

                  The mask is not decoration: a bar whose value sits just under a
                  gridline or the reference rule prints its label straight across
                  that rule, and the first render put "24,000" on top of the
                  dashed reference. rx=4 rather than rx=2 keeps the geometry gate
                  from reading it as an arrow label — it is a value, and the gate
                  should not be checking it for connector clearance. */}
              {bars.map((b, k) => {
                const vw = measure(format(b.v), diagramType.eyebrow.size) + 8
                return (
                  <g key={`v${k}`}>
                    <rect
                      x={snap(b.x + barW / 2 - vw / 2)}
                      y={snap(y(b.v)) - 16}
                      width={snap(vw)}
                      height={14}
                      rx={4}
                      fill={role.paper}
                    />
                    <text
                      x={snap(b.x + barW / 2)}
                      y={snap(y(b.v)) - 9}
                      fill={b.accent ? role.accent : role.muted}
                      fontFamily={diagramType.family}
                      fontSize={diagramType.eyebrow.size}
                      fontWeight={diagramType.eyebrow.weight}
                      letterSpacing={`${diagramType.eyebrow.tracking}em`}
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {format(b.v)}
                    </text>
                  </g>
                )
              })}
              {wrapped[i].map((line, li) => (
                <text
                  key={li}
                  x={snap(band + pitch / 2)}
                  y={baseY + 16 + li * 15}
                  fill={focal ? role.accentDeep : role.ink}
                  fontFamily={diagramType.family}
                  fontSize={diagramType.nodeName.size}
                  fontWeight={diagramType.nodeName.weight}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {line}
                </text>
              ))}
            </g>
          )
        })}

        {reference && (
          <ArrowLabel
            x={plotX + plotW}
            y={snap(y(reference.value))}
            text={reference.label}
            side="right"
          />
        )}

        {legendItems.length ? (
          <Legend x={0} y={drawH + 8} width={width} items={legendItems} />
        ) : null}
      </svg>
    )
  }

  /* ------------------------------------------------------- horizontal bars */
  const nameW = Math.max(...data.map((d) => measure(d.label, diagramType.nodeName.size)))
  const labelW = snap(Math.min(width * 0.34, Math.max(120, nameW + 16)))
  /* Value labels sit past the bar's end, so the plot stops short of the edge. */
  const valuePad = snap(Math.max(48, tickW + 20))
  const plotX = labelW
  const plotW = width - labelW - valuePad
  const topPad = reference ? 24 : 8
  const axisBandH = 26
  const plotTop = topPad
  const plotH = floorGrid(drawH - topPad - axisBandH)
  const pitch = plotH / Math.max(data.length, 1)
  const barH = Math.min(40, Math.max(floorGrid(pitch * 0.5), floorGrid(pitch * 0.6)))
  const x = (v: number) => plotX + (v / top) * plotW

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Bar chart"
      data-diagram="bar-editorial"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={snap(x(t))}
            y1={plotTop}
            x2={snap(x(t))}
            y2={plotTop + plotH}
            stroke={t === 0 ? role.ruleSolid : role.rule}
            strokeWidth={t === 0 ? 1 : 0.8}
          />
          <text
            x={snap(x(t))}
            y={plotTop + plotH + 14}
            fill={role.soft}
            fontFamily={diagramType.family}
            fontSize={diagramType.eyebrow.size}
            fontWeight={diagramType.eyebrow.weight}
            letterSpacing={`${diagramType.eyebrow.tracking}em`}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {format(t)}
          </text>
        </g>
      ))}
      {/* The axis title goes under the CATEGORY column, not at the axis's right
          end: right-aligned to `plotX + plotW` it lands exactly on the last tick
          label, which is where "PICKUP RATE" and "100%" printed over each other
          in the first render. The category column has no ticks beneath it. */}
      {valueLabel && (
        <DiagramText x={0} y={plotTop + plotH + 14} variant="eyebrow" tone="soft" uppercase>
          {valueLabel}
        </DiagramText>
      )}

      {/* Reference rule with the gridlines — ground, for the same reason as in
          the vertical branch. */}
      {reference && (
        <line
          x1={snap(x(reference.value))}
          y1={plotTop}
          x2={snap(x(reference.value))}
          y2={plotTop + plotH}
          stroke={role.muted}
          strokeWidth={1}
          strokeDasharray="5,4"
        />
      )}

      {data.map((d, i) => {
        const focal = d.kind === 'focal'
        const cy = plotTop + i * pitch + pitch / 2
        const bw = Math.max(1, x(d.value) - plotX)
        return (
          <g key={d.label}>
            <text
              x={0}
              y={snap(cy)}
              fill={focal ? role.accentDeep : role.ink}
              fontFamily={diagramType.family}
              fontSize={diagramType.nodeName.size}
              fontWeight={diagramType.nodeName.weight}
              dominantBaseline="central"
            >
              {d.label}
            </text>
            <rect
              x={plotX}
              y={snap(cy - barH / 2)}
              width={snap(bw)}
              height={barH}
              rx={4}
              fill={focal ? role.accentTint : withAlpha(role.muted, 0.15)}
              stroke={focal ? role.accent : role.muted}
              strokeWidth={1}
            />
            {/* Masked, because a bar ending just short of the reference rule
                otherwise prints its value across it. Nested in its own group so
                this row still presents ONE rect to the geometry gate — two rects
                in a group is how it recognises a node box, and a row is not one. */}
            <g>
            <rect
              x={snap(plotX + bw) + 6}
              y={snap(cy) - 7}
              width={snap(measure(format(d.value), diagramType.eyebrow.size) + 8)}
              height={14}
              rx={4}
              fill={role.paper}
            />
            <text
              x={snap(plotX + bw) + 10}
              y={snap(cy)}
              fill={focal ? role.accent : role.muted}
              fontFamily={diagramType.family}
              fontSize={diagramType.eyebrow.size}
              fontWeight={diagramType.eyebrow.weight}
              letterSpacing={`${diagramType.eyebrow.tracking}em`}
              dominantBaseline="central"
            >
              {format(d.value)}
            </text>
            </g>
          </g>
        )
      })}

      {reference && (
        <ArrowLabel
          x={snap(x(reference.value))}
          y={plotTop}
          text={reference.label}
          side="above"
          gap={6}
        />
      )}

      {legendItems.length ? (
        <Legend x={0} y={drawH + 8} width={width} items={legendItems} />
      ) : null}
    </svg>
  )
}

export { role }
