import { grid } from '../tokens/tokens.js'
import type { ChartSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { SlideChart } from '../elements/data/SlideChart'
import styles from './ChartHero.module.css'

/**
 * Template — Chart Hero.
 *
 * One chart, nearly the whole slide. For the case where the trend IS the
 * argument and the words are only a caption for it.
 *
 * The headline therefore defaults to `h2`, not the deck's usual `h1`. That is
 * the whole point of the template: a 40px headline over a 500px plot makes the
 * eye read the sentence first and the curve second, which inverts what this
 * slide is for. If a slide needs the headline to lead, it wants
 * Headline + Chart instead.
 *
 * Geometry, not markup — the chart takes explicit px, because a
 * percentage-height MUI X container collapses to zero inside the fixed
 * artboard.
 */
export interface ChartHeroProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  /** One line under the headline. Kept short — the plot needs the height. */
  lead?: RichText
  /** Deliberately h2. See the note above before stepping it up. */
  titleSize?: TypeStep
  titleWidth?: number

  chart?: ChartSpec
  /** Top of the plot well. */
  chartTop?: number
  /** Height of the plot well. Derived from `chartTop` and the footnote when
   *  omitted, so moving the chart down does not silently push it off the
   *  bottom of the artboard. */
  chartHeight?: number

  /** Source or methodology line on the floor of the slide. */
  footnote?: string
}

/** Height the footnote band reserves when one is present. */
const FOOTNOTE_BAND = 40

export function ChartHero({
  fit = 'contain',
  title,
  lead,
  titleSize = 'h2',
  titleWidth = 880,
  chart,
  /* Clears a two-line h2 headline with air to spare. A chart header set hard
     under the last line reads as a third line of the headline — measured at
     168, where it did exactly that. */
  chartTop = 196,
  chartHeight,
  footnote,
  ...chrome
}: ChartHeroProps) {
  /* The watermark owns an 85px right gutter. A full-width well that stops at
     marginX instead runs under the wordmark — the trap CLAUDE.md records. */
  const wellRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const wellWidth = 1280 - grid.marginX - wellRight
  const wellHeight =
    chartHeight ?? 720 - chartTop - grid.marginBottom - (footnote ? FOOTNOTE_BAND : 0)

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} lead={lead} size={titleSize} width={titleWidth} />
      )}

      {chart && (
        <div className={styles.well} style={{ left: grid.marginX, top: chartTop }}>
          <SlideChart spec={chart} width={wellWidth} height={wellHeight} />
        </div>
      )}

      {footnote && (
        <div
          className={`${styles.footnote} ds-text-body-sm ds-text-subtle`}
          style={{ left: grid.marginX, width: wellWidth }}
        >
          {footnote}
        </div>
      )}
    </SlideFrame>
  )
}
