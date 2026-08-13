import { grid } from '../tokens/tokens.js'
import type { ChartSpec, RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { SlideChart } from '../elements/data/SlideChart'
import styles from './HeadlineChart.module.css'

/**
 * Template — Headline + Chart.
 *
 * Copy column on the left, chart (or two) on the right. Optionally a
 * before/after figure pair on the floor of the copy column, which is how the
 * core-business slide carries "$5.2M → $8.4M" under its paragraph.
 *
 * Charts are given explicit pixel sizes rather than filling a fluid parent,
 * because the artboard is fixed and a percentage-height Recharts container
 * collapses to zero inside one.
 */
export interface HeadlineChartProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  /** Paragraph under the headline, narrower than the lead. */
  body?: RichText
  titleWidth?: number

  /** One chart fills the right half; two split it. */
  charts?: ChartSpec[]
  /** Left edge of the chart well. */
  chartLeft?: number
  chartTop?: number
  chartHeight?: number

  /** A before → after pair, e.g. 2026 $5.2M → 2027 $8.4M. */
  delta?: {
    label?: string
    from: { value: string; caption?: string }
    to: { value: string; caption?: string }
  }
}

export function HeadlineChart({
  fit = 'contain',
  title,
  lead,
  body,
  titleWidth = 460,
  charts = [],
  chartLeft = 640,
  chartTop = 150,
  chartHeight = 470,
  delta,
  ...chrome
}: HeadlineChartProps) {
  const wellRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const wellWidth = 1280 - chartLeft - wellRight
  const gap = 32
  const each = charts.length > 1 ? (wellWidth - gap * (charts.length - 1)) / charts.length : wellWidth

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead || body) && (
        <SlideHeading title={title} lead={lead} body={body} width={titleWidth} />
      )}


      {delta && (
        <div className={styles.delta}>
          {delta.label && <div className="ds-text-h4">{delta.label}</div>}
          <div className={styles.deltaRow}>
            <div>
              <div className="ds-text-stat ds-text-accent-deep">{delta.from.value}</div>
              {delta.from.caption && <div className="ds-text-lead">{delta.from.caption}</div>}
            </div>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
            <div>
              <div className="ds-text-stat ds-text-accent-deep">{delta.to.value}</div>
              {delta.to.caption && <div className="ds-text-lead">{delta.to.caption}</div>}
            </div>
          </div>
        </div>
      )}

      <div className={styles.chartWell} style={{ left: chartLeft, top: chartTop, gap }}>
        {charts.map((spec, i) => (
          <SlideChart key={i} spec={spec} width={each} height={chartHeight} />
        ))}
      </div>
    </SlideFrame>
  )
}
