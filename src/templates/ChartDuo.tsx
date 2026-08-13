import { grid, radius } from '../tokens/tokens.js'
import type { ChartSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { SlideChart } from '../elements/data/SlideChart'
import { AccentText } from '../elements/text/AccentText'
import styles from './ChartDuo.module.css'

/**
 * Template — Chart Duo.
 *
 * Two charts side by side, each carrying its own caption. For a claim that
 * needs a pair to stand up: volume beside rate, revenue beside margin.
 *
 * A panel is `{ chart, caption }` rather than a bare ChartSpec because the
 * caption is the template's, not the chart's. ChartSpec's `title`/`subtitle`
 * are the plot's own header and sit ABOVE it; the caption is the sentence a
 * reader takes away and sits below, where it can be RichText and carry an
 * accented clause. Folding it into ChartSpec would also have meant a change to
 * the shared spec that the PPTX emitter reads.
 *
 * Give the two charts different `title`s. SlideChart derives its gradient's
 * SVG id from the title, so two untitled charts on one slide share an id and
 * the second silently takes the first one's geometry.
 */
export interface ChartPanelSpec {
  chart: ChartSpec
  /** The takeaway, under the plot. RichText so a clause can be accented. */
  caption?: RichText
}

export interface ChartDuoProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  /** Compact by default — two plots are the slide, the headline introduces. */
  titleSize?: TypeStep
  titleWidth?: number

  panels?: ChartPanelSpec[]
  /** Top of the panel well. */
  top?: number
  /** Bottom edge of the well. Charts are sized from the gap between the two,
   *  so a slide moves its well rather than doing height arithmetic. */
  bottom?: number
  /** Horizontal gap between the panels. */
  gap?: number
  /** Seat each panel on the muted card fill. Useful when the two charts use
   *  different units and need to read as separate objects. */
  framed?: boolean
}

/** Caption band height. Sized for TWO lines of `body` plus the rule and its
 *  clearance, because the band is reserved on every panel and a one-line
 *  caption beside a two-line one must not shorten its plot. */
const CAPTION_BAND = 116
/** Inset when `framed`, matching the deck's card padding. */
const FRAME_PADDING = 20

export function ChartDuo({
  fit = 'contain',
  title,
  lead,
  titleSize = 'h2',
  titleWidth = 900,
  panels = [],
  /* Sized to clear a two-line h2 headline. A slide with a one-line headline
     pulls this up rather than living with the gap. */
  top = 192,
  bottom = 680,
  gap = 32,
  framed = false,
  ...chrome
}: ChartDuoProps) {
  /* Stop at the watermark gutter, never at marginX — the right-hand panel is
     the one that would run under the wordmark. */
  const wellRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const wellWidth = 1280 - grid.marginX - wellRight
  const wellHeight = bottom - top

  const count = Math.max(panels.length, 1)
  const panelWidth = (wellWidth - gap * (count - 1)) / count

  /* Every panel reserves the caption band if ANY panel has a caption, so the
     two plots stay the same height when only one is captioned. */
  const anyCaption = panels.some((panel) => panel.caption)
  const inset = framed ? FRAME_PADDING * 2 : 0
  const chartWidth = panelWidth - inset
  const chartHeight = wellHeight - inset - (anyCaption ? CAPTION_BAND : 0)

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} lead={lead} size={titleSize} width={titleWidth} />
      )}

      <div
        className={styles.well}
        style={{ left: grid.marginX, top, width: wellWidth, height: wellHeight, gap }}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            className={[styles.panel, framed ? styles.framed : ''].filter(Boolean).join(' ')}
            style={framed ? { padding: FRAME_PADDING, borderRadius: radius.card } : undefined}
          >
            <SlideChart spec={panel.chart} width={chartWidth} height={chartHeight} />
            {panel.caption && (
              /* The BAND owns the spacing, not the paragraph.
               *
               * AccentText's own module sets `margin: 0` on its root, and module
               * CSS is injected in an order that put that reset after this
               * template's rule — so `.caption { margin-top }` computed to 0 and
               * the sentence sat flush against the legend with no gap at all.
               * Same trap as the `font: inherit` note in AccentText.module.css.
               * A wrapper cannot be overridden by the child's reset. */
              <div className={styles.captionBand}>
                <AccentText as="p" content={panel.caption} className="ds-text-body" />
              </div>
            )}
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}
