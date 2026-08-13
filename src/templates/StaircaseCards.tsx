import type { CardSurface, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { StaircaseCard, type StaircaseCardSpec } from '../elements/data/StaircaseCard'
import styles from './StaircaseCards.module.css'

/**
 * Template — Staircase Cards.
 *
 * A headline, then gradient cards stepped up and to the right: each card sits
 * `step` px higher than the one before it, so the row reads as an ascent. The
 * integration roadmap and the implementation & support model slides are both
 * this shape.
 *
 * The cards are absolutely positioned rather than laid out in a grid, because
 * the stagger IS the layout — a grid would need a per-cell translate, which is
 * the same arithmetic with an extra indirection. The template takes the first
 * (lowest) card's top edge and one rise, and derives the rest, so a deck adding
 * a fourth step gets it for free.
 */
export interface StaircaseCardsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  cards?: StaircaseCardSpec[]

  /** Top edge of the FIRST card — the lowest one, on the left. */
  top?: number
  /** How far each card rises above the one before it. */
  step?: number
  cardWidth?: number
  cardHeight?: number
  /** Horizontal gap between cards. Wide by design: the reference leaves 53px so
   *  the steps read as separate stages rather than one striped block. */
  gap?: number
  /** Left inset. Three 348px cards at a 53px gap starting here end at x=1193,
   *  which is 2px clear of the 85px watermark gutter — change either number and
   *  the last card starts running under the wordmark. */
  inset?: number

  /** Numbers the cards 1..n in the ghost numeral. Off for a deck whose steps are
   *  not a sequence — the client onboarding slide has no numerals. */
  numbered?: boolean

  /* Passed straight through to every card. */
  titleSize?: TypeStep
  bodySize?: TypeStep
  cardPadding?: number
  paragraphGap?: number
  numeralSize?: number
  /** Fill applied to any card that does not name its own `surface`. */
  surface?: CardSurface
}

export function StaircaseCards({
  fit = 'contain',
  title,
  lead,
  titleWidth = 900,
  cards = [],
  // Measured off slide 24: cards at x = 43 / 444 / 845, y = 279 / 240 / 191,
  // 348x360 each. The reference's own rises are 39 then 49 px — hand-placed, not
  // a system — so a single 44px step is used instead: it lands the third card
  // exactly where the reference has it and the middle one 5px low, which is
  // closer than either of the reference's two values would be if applied twice.
  top = 279,
  step = 44,
  cardWidth = 348,
  cardHeight = 360,
  gap = 53,
  inset = 43,
  numbered = true,
  titleSize,
  bodySize,
  cardPadding,
  paragraphGap,
  numeralSize,
  surface = 'brand',
  ...chrome
}: StaircaseCardsProps) {
  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      {cards.map((card, i) => (
        <div
          key={i}
          className={styles.step}
          style={{
            left: inset + i * (cardWidth + gap),
            top: top - i * step,
            width: cardWidth,
            height: cardHeight,
          }}
        >
          <StaircaseCard
            {...card}
            surface={card.surface ?? surface}
            numeral={card.numeral ?? (numbered ? i + 1 : undefined)}
            {...(titleSize ? { titleSize } : {})}
            {...(bodySize ? { bodySize } : {})}
            {...(cardPadding !== undefined ? { padding: cardPadding } : {})}
            {...(paragraphGap !== undefined ? { paragraphGap } : {})}
            {...(numeralSize !== undefined ? { numeralSize } : {})}
          />
        </div>
      ))}
    </SlideFrame>
  )
}
