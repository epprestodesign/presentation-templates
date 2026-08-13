import { BarChart } from '@mui/x-charts/BarChart'
import { LineChart } from '@mui/x-charts/LineChart'
import { barClasses } from '@mui/x-charts/BarChart'
import { color, gradient, type as typeTokens } from '../../tokens/tokens.js'
import type { ChartSpec } from '../../types'
import { ChartCallout } from './ChartCallout'
import { ChartLegend } from './ChartLegend'
import styles from './SlideChart.module.css'

/**
 * SlideChart — renders a ChartSpec with MUI X Charts.
 *
 * This is the HTML renderer only. The same ChartSpec also feeds PptxGenJS's
 * native `addChart`, which is why the spec carries data and intent
 * ('valueLabels', 'fill: brandVertical') rather than chart-library props: a
 * chart specified this way arrives in Google Slides as a real chart object
 * whose numbers can be edited, instead of a flat picture.
 *
 * Four deliberate departures from library defaults, all matching the deck:
 *  - `skipAnimation` always. Non-negotiable: the export scripts screenshot in
 *    headless Chromium, and an animating chart rasterises mid-transition.
 *  - bars take a vertical brand gradient with `gradientUnits="userSpaceOnUse"`,
 *    so the gradient is revealed in proportion to each bar's value rather than
 *    restretched inside every bar.
 *  - every value is printed above its bar (`barLabel` + 'outside') rather than
 *    hidden behind a tooltip — a slide is read from across a room, never
 *    hovered.
 *  - no tooltips, no highlighting, no interactivity, for the same reason.
 */

const AXIS_TICK_STYLE = {
  fontFamily: typeTokens.fontFamily,
  fontSize: typeTokens.scale.caption.size,
  fontWeight: 500,
}

export interface SlideChartProps {
  spec: ChartSpec
  /** Plot size in slide px. Charts live in a fixed artboard, so they take
   *  explicit dimensions rather than filling a fluid parent — MUI X needs a
   *  numeric height regardless. */
  width: number
  height: number
  /** Show the key. Defaults to AUTO: on as soon as a chart has three or more
   *  named series, because at that point the colours carry meaning the reader
   *  has no other way to recover. Pass false to suppress it where the series
   *  are named elsewhere on the slide. */
  legend?: boolean
}

export function SlideChart({ spec, width, height, legend }: SlideChartProps) {
  /* A stack gets the sequential ramp; everything else gets the alternating one.
     See the note on `seriesSequential` in tokens.js — the two orderings solve
     opposite problems, and using one palette for both is what made the stacked
     bar's segments clash. */
  const seriesColors = (
    spec.kind === 'stackedBar' ? color.seriesSequential : color.series
  ) as string[]
  const g = gradient.brandVertical
  const fmt = spec.format ?? ((v: number) => String(v))
  // Ids must not collide when two charts share a slide (slide 16 has two).
  const gradientId = `slide-chart-grad-${spec.title?.replace(/\W+/g, '-').toLowerCase() ?? 'x'}`
  const useGradient = spec.kind === 'bar' && spec.fill !== 'flat'

  /* Only series that actually carry a name can appear in a key. */
  const named = spec.series.filter((s) => Boolean(s.name))
  const showLegend = legend ?? named.length >= 3
  const legendItems = showLegend
    ? named.map((s, i) => ({
        label: s.name as string,
        color: s.color ?? seriesColors[i % seriesColors.length],
      }))
    : []

  /** Plot area height, after the header block and any key take their share. */
  const plotHeight =
    height - (spec.title || spec.unit ? 58 : 0) - (legendItems.length ? 30 : 0)

  const yAxis = [
    {
      width: 48,
      min: spec.yMin,
      max: spec.yMax,
      valueFormatter: (v: number) => fmt(v),
      tickLabelStyle: { ...AXIS_TICK_STYLE, fill: color.axisLabel as string },
      disableLine: true,
      disableTicks: true,
    },
  ]

  const header = (spec.title || spec.unit) && (
    <div className={styles.header}>
      <div>
        {spec.title && <div className="ds-text-h4">{spec.title}</div>}
        {spec.subtitle && <div className="ds-text-body ds-text-subtle">{spec.subtitle}</div>}
      </div>
      {spec.unit && (
        <div className={styles.legend}>
          <span className={styles.dot} />
          <span className="ds-text-body-sm">{spec.unit}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.chart} style={{ width, height }}>
      {header}

      <div className={styles.plot}>
        {spec.kind === 'line' ? (
          <LineChart
            width={width}
            height={plotHeight}
            skipAnimation
            grid={{ horizontal: true }}
            margin={{ top: 28, right: 16, bottom: 0, left: 0 }}
            xAxis={[
              {
                scaleType: 'point',
                data: spec.categories,
                tickLabelStyle: { ...AXIS_TICK_STYLE, fill: color.text as string },
                disableTicks: true,
              },
            ]}
            yAxis={yAxis}
            series={spec.series.map((s, i) => ({
              data: s.data,
              label: s.name,
              color: s.color ?? seriesColors[i % seriesColors.length],
              showMark: true,
              valueFormatter: (v: number | null) => (v === null ? '' : fmt(v)),
            }))}
            hideLegend
            slotProps={{ tooltip: { trigger: 'none' } }}
          />
        ) : (
          <BarChart
            width={width}
            height={plotHeight}
            skipAnimation
            grid={{ horizontal: true }}
            borderRadius={4}
            margin={{ top: 28, right: 16, bottom: 0, left: 0 }}
            xAxis={[
              {
                scaleType: 'band',
                data: spec.categories,
                categoryGapRatio: 0.55,
                barGapRatio: 0.1,
                tickLabelStyle: { ...AXIS_TICK_STYLE, fill: color.text as string },
                disableTicks: true,
              },
            ]}
            yAxis={yAxis}
            series={spec.series.map((s, i) => ({
              data: s.data,
              label: s.name,
              stack: spec.kind === 'stackedBar' ? 'stack' : undefined,
              color: s.color ?? seriesColors[i % seriesColors.length],
              // Only single-series bars carry value labels; on a stack they
              // would collide with the segment boundaries.
              barLabel: spec.valueLabels && spec.kind === 'bar' ? ('value' as const) : undefined,
              barLabelPlacement: 'outside' as const,
              valueFormatter: (v: number | null) => (v === null ? '' : fmt(v)),
            }))}
            hideLegend
            slotProps={{ tooltip: { trigger: 'none' } }}
            sx={{
              // The gradient is applied via CSS rather than the series color so
              // it can use userSpaceOnUse: stretched across the whole plot, then
              // clipped to each bar, so a short bar shows only the dark end.
              // A stacked chart keeps flat series colours instead.
              ...(useGradient
                ? { [`& .${barClasses.element}`]: { fill: `url(#${gradientId})` } }
                : {}),
              [`& .${barClasses.label}`]: {
                fontFamily: typeTokens.fontFamily,
                fontSize: typeTokens.scale.bodySm.size,
                fontWeight: 600,
                fill: color.text as string,
              },
              '& .MuiChartsGrid-line': { stroke: color.gridline as string },
              '& .MuiChartsAxis-line': { stroke: color.axis as string },
            }}
          >
            {useGradient && (
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={plotHeight}
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to} />
                </linearGradient>
              </defs>
            )}
          </BarChart>
        )}

        {spec.callout && (
          <ChartCallout value={spec.callout.value} label={spec.callout.label} />
        )}
      </div>

      {legendItems.length > 0 && <ChartLegend items={legendItems} className={styles.chartLegend} />}
    </div>
  )
}
