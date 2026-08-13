import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { CardSurface, ChartSpec, RichText, SlideChromeSpec, StatSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { SlideChart } from '../elements/data/SlideChart'
import { StatCard } from '../elements/data/StatCard'
import styles from './ChartStats.module.css'

/**
 * Template — Chart + Stats.
 *
 * One chart with a rail of three or four stat callouts beside it or beneath
 * it. The chart carries the shape of the story; the rail carries the figures
 * the audience is meant to leave with.
 *
 * Two placements rather than two templates, because the choice is driven by
 * the chart, not by the content: a bar chart with five or more categories
 * needs the width and pushes the rail to the floor, while a line with a long
 * y-range can give up a column. Both keep the same StatCard the rest of the
 * deck uses, so a figure here matches a figure on the Stat Grid slide.
 *
 * The rail's type steps are stepped down from StatCard's defaults — `statSm`
 * over `bodySm`, not `stat` over `h4`. A 68px number in a 300px rail beside a
 * chart out-shouts the plot it is annotating. Any card can still override.
 */
export interface ChartStatsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleSize?: TypeStep
  titleWidth?: number

  chart?: ChartSpec
  /** 3–4 callouts. Five in a column go under 90px each and the figure and its
   *  label start to collide. */
  stats?: StatSpec[]
  /** 'right' gives up a column; 'bottom' gives up height. */
  railPlacement?: 'right' | 'bottom'
  /** Width of the rail when it sits to the right. */
  railWidth?: number
  /** Height of the rail when it sits beneath. */
  railHeight?: number
  /** Gap between the chart and the rail. */
  gap?: number
  /** Gap between the cards. Separate from `gap` because it is load-bearing:
   *  four cards in a 490px column at gap 24 leave 103px each, and a `statSm`
   *  figure over a `bodySm` label needs 110 — the label clips instead of
   *  overflowing, so it fails silently. */
  cardGap?: number
  /** Fill for any card that does not name its own. */
  surface?: CardSurface

  /** Top of the whole well — chart and rail share it. */
  top?: number
  bottom?: number
}

export function ChartStats({
  fit = 'contain',
  title,
  lead,
  titleSize = 'h2',
  titleWidth = 900,
  chart,
  stats = [],
  railPlacement = 'right',
  railWidth = 300,
  railHeight = 132,
  gap = 24,
  cardGap = 16,
  surface = 'muted',
  /* Clears a two-line h2 headline. */
  top = 192,
  bottom = 680,
  ...chrome
}: ChartStatsProps) {
  const wellRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const wellWidth = 1280 - grid.marginX - wellRight
  const wellHeight = bottom - top

  const beside = railPlacement === 'right'
  /* Whichever axis the rail takes, the chart takes the remainder. Deriving one
     from the other is what stops a rail edit from quietly overlapping the plot. */
  const chartWidth = beside ? wellWidth - railWidth - gap : wellWidth
  const chartHeight = beside ? wellHeight : wellHeight - railHeight - gap

  const railStyle: CSSProperties = beside
    ? {
        left: grid.marginX + chartWidth + gap,
        top,
        width: railWidth,
        height: wellHeight,
        gap: cardGap,
      }
    : {
        left: grid.marginX,
        top: top + chartHeight + gap,
        width: wellWidth,
        height: railHeight,
        gap: cardGap,
      }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} lead={lead} size={titleSize} width={titleWidth} />
      )}

      {chart && (
        <div className={styles.chart} style={{ left: grid.marginX, top }}>
          <SlideChart spec={chart} width={chartWidth} height={chartHeight} />
        </div>
      )}

      {stats.length > 0 && (
        <div
          className={[styles.rail, beside ? styles.column : styles.row].join(' ')}
          style={railStyle}
        >
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              {...stat}
              surface={stat.surface ?? surface}
              valueSize={stat.valueSize ?? 'statSm'}
              labelSize={stat.labelSize ?? 'bodySm'}
              padding={20}
            />
          ))}
        </div>
      )}
    </SlideFrame>
  )
}
