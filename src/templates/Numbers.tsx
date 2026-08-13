import { grid, radius } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { ArrowStatRow, type ArrowStatSpec } from '../elements/data/ArrowStatRow'
import { CompareBars, type CompareBarSpec } from '../elements/data/CompareBars'
import { typeClass } from '../lib/typeClass'
import styles from './Numbers.module.css'

/**
 * Template — Numbers.
 *
 * The traction slide, in two voices. Down the left, growth rates as bare
 * arrowed lines. Down the right, the absolute figures, each in a card with the
 * two-bar comparison that shows where it came from.
 *
 * The split is the point: the percentages are the claim and the cards are the
 * evidence, so they are two columns rather than one list. The left column
 * anchors to the floor of the slide and the cards to its ceiling, which is what
 * gives the layout its diagonal.
 *
 * Rebuilt from references/slide-decks/11-33.png.
 */
export interface NumbersCardSpec {
  /** The headline figure, pre-formatted — '480K', '$214M'. */
  value: string
  label: string
  /** Prior and current year, drawn as two bars beside the figure. */
  prior?: CompareBarSpec
  current?: CompareBarSpec
}

export interface NumbersProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  titleWidth?: number

  /** Left column — arrowed growth rates. */
  stats?: ArrowStatSpec[]
  /** Right column — stacked comparison cards. */
  cards?: NumbersCardSpec[]

  /** Top of the left column. It sits low by default: the reference leaves the
   *  upper-left quiet so the headline has room and the eye starts at the cards. */
  statsTop?: number
  statRowHeight?: number

  /** Left edge of the card column, and where the left column has to stop. */
  cardsLeft?: number
  cardsTop?: number
  cardHeight?: number
  cardGap?: number
  /** Type step for both the card figures and the left column's percentages —
   *  see the note on ArrowStatRow's `valueSize`. */
  valueSize?: TypeStep
}

export function Numbers({
  fit = 'contain',
  title,
  titleSize = 'h1',
  titleWidth = 620,
  stats = [],
  cards = [],
  statsTop = 465,
  statRowHeight = 56,
  cardsLeft = 700,
  cardsTop = 40,
  cardHeight = 202,
  cardGap = 17,
  valueSize = 'h1',
  ...chrome
}: NumbersProps) {
  /* The card column runs to x=1200 — 15px past the watermark gutter, and
     measured. It is not a full-width well and it clears the wordmark, whose ink
     starts at x=1224 and y=531 on this slide; the bottom card ends at y=680 but
     stops 24px short of it horizontally. */
  const cardsWidth = 500

  return (
    <SlideFrame fit={fit} {...chrome}>
      {title && <SlideHeading title={title} size={titleSize} width={titleWidth} />}

      {stats.length > 0 && (
        <div
          className={styles.stats}
          style={{ left: grid.marginX, top: statsTop, width: cardsLeft - grid.marginX - 80 }}
        >
          {stats.map((stat, i) => (
            <ArrowStatRow key={i} {...stat} height={statRowHeight} valueSize={valueSize} />
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div
          className={styles.cards}
          style={{ left: cardsLeft, top: cardsTop, width: cardsWidth, gap: cardGap }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              className={styles.card}
              style={{ height: cardHeight, borderRadius: radius.panel }}
            >
              <div className={styles.copy}>
                <div className={`${typeClass(valueSize)} ds-text-accent`}>{card.value}</div>
                <div className="ds-text-h3">{card.label}</div>
              </div>

              {card.prior && card.current && (
                <CompareBars prior={card.prior} current={card.current} className={styles.bars} />
              )}
            </div>
          ))}
        </div>
      )}
    </SlideFrame>
  )
}
