import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { CardSurface, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { FeatureCard, type FeatureCardLayout, type FeatureCardSpec } from '../elements/data/FeatureCard'
import styles from './FeatureCards.module.css'

/**
 * Template — Feature Cards.
 *
 * Headline block up top, then a row of photo cards across the floor of the
 * slide. Covers the operating-layer slide (five cards, photo bleeding to the
 * card's top edge with a reversed title on it, ruled list beneath) and the
 * four-ways-to-create-value slide (four flat cards, title and copy at the top,
 * photo inset along the bottom).
 *
 * Like StatGrid, the row is a CSS grid inside an absolutely positioned well, so
 * the template takes a column count rather than coordinates — going from four
 * cards to five re-flows the row instead of needing five new x values.
 */
export interface FeatureCardsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  cards?: FeatureCardSpec[]
  /** Which way every card in the row stacks. */
  layout?: FeatureCardLayout
  /** Defaults to one column per card, which is what both reference slides do. */
  columns?: number

  /** Top edge of the card row. */
  top?: number
  /** Height of the card row. */
  height?: number
  gap?: number
  /** Left inset. Defaults to the page margin; slide 10 runs its row 17px wider
   *  than the text column, so this is exposed. */
  inset?: number
  /** Right inset. Defaults to the watermark gutter when the watermark shows, so
   *  the row never runs under the wordmark. */
  insetRight?: number
  /** Pins the row to an explicit width instead of filling to `insetRight`. */
  wellWidth?: number

  /* Passed straight through to every card. */
  titleSize?: TypeStep
  bodySize?: TypeStep
  cardPadding?: number
  cardPaddingTop?: number
  imageHeight?: number
  scrim?: number
  itemGap?: number
  /** Fill applied to any card that does not name its own `surface`. */
  surface?: CardSurface
}

export function FeatureCards({
  fit = 'contain',
  title,
  lead,
  titleWidth = 900,
  cards = [],
  layout = 'photo-top',
  columns,
  top = 274,
  height = 406,
  gap = 8,
  inset = grid.marginX,
  insetRight,
  wellWidth,
  titleSize,
  bodySize,
  cardPadding,
  cardPaddingTop,
  imageHeight,
  scrim,
  itemGap,
  surface = 'muted',
  ...chrome
}: FeatureCardsProps) {
  const wellStyle: CSSProperties = {
    left: inset,
    top,
    height,
    gridTemplateColumns: `repeat(${columns ?? cards.length ?? 1}, 1fr)`,
    gap,
    ...(wellWidth
      ? { width: wellWidth }
      : { right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter) }),
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.well} style={wellStyle}>
        {cards.map((card, i) => (
          <FeatureCard
            key={i}
            {...card}
            layout={layout}
            surface={card.surface ?? surface}
            {...(titleSize ? { titleSize } : {})}
            {...(bodySize ? { bodySize } : {})}
            {...(cardPadding !== undefined ? { padding: cardPadding } : {})}
            {...(cardPaddingTop !== undefined ? { paddingTop: cardPaddingTop } : {})}
            {...(imageHeight !== undefined ? { imageHeight } : {})}
            {...(scrim !== undefined ? { scrim } : {})}
            {...(itemGap !== undefined ? { itemGap } : {})}
          />
        ))}
      </div>
    </SlideFrame>
  )
}
