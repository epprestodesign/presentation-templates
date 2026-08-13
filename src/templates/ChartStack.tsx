import { grid } from '../tokens/tokens.js'
import type { ChartSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { SlideChart } from '../elements/data/SlideChart'
import styles from './ChartStack.module.css'

/**
 * Template — Chart Stack.
 *
 * Two charts stacked vertically, each the full width of the content well.
 * For a metric and its driver: bookings above, room nights below, both on the
 * same years, so the reader compares by dropping a finger down the slide
 * instead of scanning across two side-by-side x-axes.
 *
 * That is the reason this is not just Chart Duo rotated. Shared categories are
 * the precondition, not a nicety — stacking two charts with different x-axes
 * invites a comparison that is not there. Pass the same `categories` to both.
 *
 * The rows are equal by construction rather than by two hand-tuned heights:
 * anything else makes the upper series look larger than the lower one at a
 * glance, which is exactly the misreading a stack is supposed to prevent.
 */
export interface ChartStackProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleSize?: TypeStep
  titleWidth?: number

  /** Two, normally. Three fit, but the plot area gets thin enough that only a
   *  line chart still reads. */
  charts?: ChartSpec[]
  /** Top of the stack. */
  top?: number
  /** Bottom edge of the stack. Rows divide the space between the two. */
  bottom?: number
  /** Vertical gap between rows. */
  gap?: number
  /** Narrower than the full well, when a stack should not run edge to edge. */
  wellWidth?: number

  footnote?: string
}

/** Height the footnote band reserves when one is present. */
const FOOTNOTE_BAND = 36

export function ChartStack({
  fit = 'contain',
  title,
  lead,
  titleSize = 'h2',
  titleWidth = 900,
  charts = [],
  /* Clears a two-line h2 headline. Raise it as little as possible — every
     pixel here comes straight out of both plots. */
  top = 184,
  bottom = 680,
  gap = 26,
  wellWidth,
  footnote,
  ...chrome
}: ChartStackProps) {
  /* A full-width row is precisely the case the watermark gutter exists for. */
  const wellRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const width = wellWidth ?? 1280 - grid.marginX - wellRight

  const count = Math.max(charts.length, 1)
  const wellHeight = bottom - top - (footnote ? FOOTNOTE_BAND : 0)
  const rowHeight = (wellHeight - gap * (count - 1)) / count

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} lead={lead} size={titleSize} width={titleWidth} />
      )}

      <div className={styles.well} style={{ left: grid.marginX, top, width, gap }}>
        {charts.map((spec, i) => (
          <SlideChart key={i} spec={spec} width={width} height={rowHeight} />
        ))}
      </div>

      {footnote && (
        <div
          className={`${styles.footnote} ds-text-body-sm ds-text-subtle`}
          style={{ left: grid.marginX, width }}
        >
          {footnote}
        </div>
      )}
    </SlideFrame>
  )
}
