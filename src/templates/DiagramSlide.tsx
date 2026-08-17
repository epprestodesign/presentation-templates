import type { ReactNode } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import styles from './DiagramSlide.module.css'

/**
 * Template — Diagram Slide.
 *
 * The frame every ported diagram type sits in: deck chrome, a headline, and a
 * well whose exact pixel dimensions are handed to the diagram so it can lay
 * itself out rather than scale.
 *
 * THAT IS THE WHOLE POINT. A diagram scaled to fit gets soft hairlines and
 * fractional type sizes; a diagram TOLD its box draws crisp 1px rules and lands
 * every coordinate on the 4px grid. So this template computes `wellWidth` and
 * `wellHeight` and passes them down, and the diagram renders an SVG whose
 * viewBox equals its box — 1 user unit = 1 slide px = 1/96in, the same identity
 * the PowerPoint export depends on.
 *
 * Copy is deliberately part of the template rather than left to the diagram. A
 * diagram alone is not a slide: the reader needs the claim in words and the
 * drawing as evidence. `title` carries the claim, `lead` the one sentence that
 * says what to look at, and `footnote` the caveat or source.
 */
export interface DiagramSlideProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  lead?: RichText
  titleWidth?: number

  /** Small note under the diagram — a source, a caveat, a definition. */
  footnote?: RichText

  /** Top edge of the diagram well. Defaults below a one-line headline + lead. */
  wellTop?: number
  /** Bottom edge. Defaults to the deck's content floor. */
  wellBottom?: number
  /** Right inset. Defaults to the watermark gutter, like every other
   *  full-width well in the deck. */
  insetRight?: number

  /** Receives the exact well size. A diagram must use these rather than
   *  assuming 1280x720, because the headline block's height varies. */
  children: (size: { width: number; height: number }) => ReactNode
}

/** Height reserved for the footnote band when there is one: one line of
 *  `caption` plus its gap above. */
const FOOTNOTE_BAND = 34

export function DiagramSlide({
  fit = 'contain',
  title,
  titleSize = 'h2',
  lead,
  titleWidth = 1000,
  footnote,
  wellTop = 246,
  wellBottom = 660,
  insetRight,
  children,
  ...chrome
}: DiagramSlideProps) {
  const right = insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter)
  const width = 1280 - grid.marginX - right
  const height = wellBottom - wellTop - (footnote ? FOOTNOTE_BAND : 0)

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} size={titleSize} lead={lead} width={titleWidth} />
      )}

      <div className={styles.well} style={{ left: grid.marginX, top: wellTop, width, height }}>
        {children({ width, height })}
      </div>

      {footnote && (
        <AccentText
          as="p"
          content={footnote}
          className={`${styles.footnote} ds-text-caption`}
          style={{ left: grid.marginX, top: wellTop + height + 14, width: width - 60 }}
        />
      )}
    </SlideFrame>
  )
}
