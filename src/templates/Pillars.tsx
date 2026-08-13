import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './Pillars.module.css'

/**
 * Template — Pillars.
 *
 * Three muted panels side by side, each a coloured column heading over a stack
 * of white cards, with one pill-shaped banner laid across all three tops.
 *
 * Two things about it are not obvious from looking at it:
 *
 *  - It is three panels, not one. Probing slide 357-45 shows white running
 *    floor-to-ceiling between them at x=421–429 and x=811–819, so the columns
 *    are separated at panel level by an 8px gap rather than being cells inside
 *    a single #f5f5f5 box.
 *  - The banner therefore has to sit above them as its own layer, which is why
 *    the panels carry a top padding big enough to clear it instead of the
 *    banner being the first child of the first panel.
 *
 * The card stacks distribute: column one has three cards at 105px, column
 * three has five at 62px, and both stacks start at y=330 and end at y=658. So
 * cards are `flex: 1` and a column takes as many as it needs.
 *
 * The tone per column (teal / navy / black) is applied to the heading *and* its
 * cards, because in the reference they always match — it reads as one column
 * colour, not two decisions.
 */

/** Column ink. Named by role, not colour, so a re-tone is a token change. */
export type PillarTone = 'accent' | 'navy' | 'ink'

export interface PillarColumn {
  title: RichText
  /** Card labels, top to bottom. */
  cards: RichText[]
  tone?: PillarTone
}

export interface PillarsBanner {
  /** Centred, uppercase, tracked. */
  label: string
  /** Material Symbols glyph at the right end. */
  icon?: string
}

export interface PillarsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  /** The pill across the top of the panels. Omit for panels with no banner. */
  banner?: PillarsBanner
  columns?: PillarColumn[]

  /** Top edge of the panel row. */
  top?: number
  /** Height of the panel row. */
  height?: number
  /** Gap between panels — 8, measured. */
  gap?: number
  /** Panel padding — 16, measured. */
  padding?: number
  /** Gap between cards inside a column — 5, measured. */
  cardGap?: number
  bannerHeight?: number
  /** Distance from the banner's bottom edge to the column heading. */
  headingGap?: number
  /** Distance from the heading to the top of the card stack. */
  stackGap?: number
  headingSize?: TypeStep
  cardSize?: TypeStep
}

/** All three tones live in the module rather than one of them borrowing the
 *  global `ds-text-accent`, so the column colour is a single lookup. */
const TONE_CLASS: Record<PillarTone, string> = {
  accent: styles.accent,
  navy: styles.navy,
  ink: styles.ink,
}

export function Pillars({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1080,
  banner,
  columns = [],
  top = 203,
  height = 470,
  gap = 8,
  padding = 16,
  cardGap = 5,
  bannerHeight = 40,
  /* 26 and 17 are what land the heading's cap-top on the reference's 289.5 and
     the top of the card stack on its 330. They are a pair: headingGap feeds the
     panel's top padding, so raising it pushes the stack down too. */
  headingGap = 26,
  stackGap = 17,
  headingSize = 'h3',
  cardSize = 'h3',
  ...chrome
}: PillarsProps) {
  const wellStyle: CSSProperties = {
    left: grid.marginX,
    top,
    height,
    gap,
    // Every full-width well in the deck stops at the watermark gutter.
    right: chrome.watermark === false ? grid.marginX : grid.watermarkGutter,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.well} style={wellStyle}>
        {banner && (
          <div
            className={styles.banner}
            style={{ height: bannerHeight, top: padding, left: padding, right: padding }}
          >
            <span className={styles.leader} />
            <span className={`${styles.bannerLabel} ds-text-eyebrow ds-text-accent`}>
              {banner.label}
            </span>
            <span className={styles.leader} />
            {banner.icon && (
              <Icon name={banner.icon} size={24} weight={400} color="var(--slide-color-accent)" />
            )}
          </div>
        )}

        {columns.map((column, i) => {
          const tone = TONE_CLASS[column.tone ?? 'ink']
          return (
            <div
              key={i}
              className={styles.panel}
              style={{
                padding,
                // Clears the banner laid over the panel tops.
                paddingTop: banner ? padding + bannerHeight + headingGap : padding,
              }}
            >
              <AccentText
                as="h3"
                content={column.title}
                className={[styles.heading, typeClass(headingSize), tone].filter(Boolean).join(' ')}
              />

              <div className={styles.stack} style={{ gap: cardGap, marginTop: stackGap }}>
                {column.cards.map((card, j) => (
                  <div key={j} className={styles.card}>
                    <AccentText
                      as="p"
                      content={card}
                      className={[styles.cardLabel, typeClass(cardSize), tone]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </SlideFrame>
  )
}
