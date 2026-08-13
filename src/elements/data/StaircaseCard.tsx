import { radius } from '../../tokens/tokens.js'
import type { CardSurface, RichText, TypeStep } from '../../types'
import { AccentText } from '../text/AccentText'
import { typeClass } from '../../lib/typeClass'
import styles from './StaircaseCard.module.css'

/**
 * StaircaseCard — one step of a stepped sequence: body copy at the top, a bold
 * title on the floor of the card, and a very large translucent numeral ghosted
 * in behind the title.
 *
 * The inverted order is the point. These cards describe stages ("Static Booking
 * Hyperlinks", "Triggered Post-Purchase Offers"), and the reference deck puts
 * the explanation first and the label last, so the eye runs down each card and
 * then across the row of labels along the bottom edge. That is why the title is
 * `margin-top: auto` rather than the first child.
 *
 * The numeral is decorative — it repeats the position the card already has in
 * the row, so it is `aria-hidden` and the template fills it in from the index
 * rather than each card carrying its own number as content.
 */
export interface StaircaseCardSpec {
  title?: RichText
  /** Paragraphs of copy, top-aligned. Slide 09 runs three short ones per card
   *  with a bold lead-in; slide 24 runs a single long one. */
  body?: RichText[]
  /** The ghost numeral. Omit to leave the card unnumbered — the client
   *  onboarding slide has no numerals at all. */
  numeral?: string | number
  surface?: CardSurface
}

export interface StaircaseCardProps extends StaircaseCardSpec {
  titleSize?: TypeStep
  bodySize?: TypeStep
  padding?: number
  /** Gap between body paragraphs. */
  paragraphGap?: number
  /** Cap height of the ghost numeral, in slide px. */
  numeralSize?: number
  /** How far the numeral is inset from the card's right edge. */
  numeralRight?: number
  /** Distance from the card's bottom edge to the numeral's text box. Small
   *  because a `line-height: 1` box holds ~22px of descender space under the
   *  baseline at this size, which the reference does not. */
  numeralBottom?: number
  numeralOpacity?: number
}

export function StaircaseCard({
  title,
  body,
  numeral,
  surface = 'brand',
  titleSize = 'h3',
  bodySize = 'lead',
  padding = 28,
  paragraphGap = 10,
  numeralSize = 150,
  numeralRight = 36,
  numeralBottom = 8,
  numeralOpacity = 0.15,
}: StaircaseCardProps) {
  return (
    <div className={[styles.card, styles[surface]].filter(Boolean).join(' ')} style={{ padding, borderRadius: radius.panel }}>
      {numeral !== undefined && (
        <span
          aria-hidden="true"
          className={styles.numeral}
          style={{
            fontSize: numeralSize,
            right: numeralRight,
            bottom: numeralBottom,
            opacity: numeralOpacity,
          }}
        >
          {numeral}
        </span>
      )}

      {body && body.length > 0 && (
        <div className={styles.body} style={{ gap: paragraphGap }}>
          {body.map((para, i) => (
            <AccentText
              key={i}
              as="p"
              content={para}
              className={[styles.para, typeClass(bodySize), 'ds-text-on-brand'].join(' ')}
            />
          ))}
        </div>
      )}

      {title && (
        <AccentText
          as="h3"
          content={title}
          className={[styles.title, typeClass(titleSize), 'ds-text-on-brand'].join(' ')}
        />
      )}
    </div>
  )
}
