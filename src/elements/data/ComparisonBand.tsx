import { Fragment, type CSSProperties } from 'react'
import type { CardSurface, RichText, TypeStep } from '../../types'
import { AccentText } from '../text/AccentText'
import { Icon } from '../brand/Icon'
import { typeClass } from '../../lib/typeClass'
import styles from './ComparisonBand.module.css'

/**
 * ComparisonBand — one horizontal side of a before/after panel: a side label
 * and the sequence of steps that side goes through.
 *
 * Two bands stacked make the argument the deck keeps making — "here is the old
 * way, here is the way with EventPipe" — and the reference always builds it the
 * same way: the neutral band on top in #f5f5f5 with grey ink, the EventPipe
 * band beneath it on the brand gradient with the ink reversed to white. That
 * inversion is the whole rhetorical move, so it lives in `surface` and nothing
 * else about the band changes with it.
 *
 * The interior comes in two variants, measured off the two reference slides:
 *
 *   'inline'  (slide 02) — the steps run across one line, separated by a
 *             three-dash rule. Nothing boxes them; the band is the container.
 *   'stepped' (slide 13) — a dotted rail carries a centred label and a
 *             trailing chevron, and the steps sit in cards below it.
 *
 * They are variants of one element rather than two elements because
 * everything that carries meaning is shared: the panel geometry, the two
 * surfaces, the ink inversion, and the "label plus ordered steps" content
 * shape. Only the furniture around the steps differs, which is exactly what a
 * variant is for.
 */
export type ComparisonVariant = 'inline' | 'stepped'

export interface ComparisonBandProps {
  variant?: ComparisonVariant
  /** 'inline': the left-hand side label. 'stepped': the rail label. */
  label?: RichText
  /** The steps this side goes through, left to right. */
  steps?: RichText[]
  /** 'muted' is the old-way band, 'brand' the EventPipe band. */
  surface?: Extract<CardSurface, 'muted' | 'brand'>
  /** Band height in slide px. 206 on slide 02, 145 on slide 13. */
  height?: number

  /* --- 'inline' only ------------------------------------------------- */
  /** The reference sets the whole old-way band in italic — the typographic
   *  tell that this side is the past. A flag rather than italic runs in the
   *  content, since it applies to every word on the side. */
  italic?: boolean
  /** Space above the first line of copy. Measured at 78px on slide 02, which
   *  is deliberately more than the 38px below it: the copy sits low in the
   *  band rather than centred. */
  paddingTop?: number
  /** Fixed width of the side-label cell. Fixed rather than content-sized so
   *  the dashes and step columns land in the same place in both bands, which
   *  is what makes the two sides read as a comparison.
   *
   *  152, measured off slide 02, which with a 16px gap lands the five step
   *  columns at x = 275, 466, 657, 848, 1039 against the reference's 272.5,
   *  456.5, 664.5, 848.5, 1032.5. Where the label itself breaks is left to
   *  `text-wrap: balance` on the cell rather than a tighter width — see the
   *  CSS, the two bands disagree about how wide their label is. */
  labelWidth?: number
  /** Type step for the label and the steps. */
  size?: TypeStep

  /* --- 'stepped' only ----------------------------------------------- */
  /** Glyph closing the rail. The reference uses a light chevron. */
  railIcon?: string
  /** Height of the rail row above the cards. */
  railHeight?: number
  /** Height of the step cards. */
  cardHeight?: number
}

export function ComparisonBand({
  variant = 'inline',
  label,
  steps = [],
  surface = 'muted',
  height = variant === 'stepped' ? 145 : 206,
  italic = false,
  paddingTop = 78,
  labelWidth = 152,
  size = 'lead',
  railIcon = 'chevron_right',
  railHeight = 54,
  cardHeight = 75,
}: ComparisonBandProps) {
  const onBrand = surface === 'brand'
  /** Ink class for anything set directly on the band. */
  const ink = onBrand ? 'ds-text-on-brand' : 'ds-text-muted'

  const bandClass = [
    styles.band,
    styles[surface],
    italic ? styles.italic : '',
  ]
    .filter(Boolean)
    .join(' ')

  const bandStyle: CSSProperties = { height }

  if (variant === 'stepped') {
    return (
      <div className={bandClass} style={bandStyle}>
        <div
          className={[styles.rail, onBrand ? styles.railOnBrand : ''].filter(Boolean).join(' ')}
          style={{ height: railHeight }}
        >
          <span className={styles.dots} />
          {label && (
            <AccentText
              as="span"
              content={label}
              className={['ds-text-eyebrow', onBrand ? 'ds-text-on-brand' : ''].filter(Boolean).join(' ')}
            />
          )}
          <span className={styles.dots} />
          {railIcon && <Icon name={railIcon} size={30} weight={300} />}
        </div>

        <div className={styles.cards}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={[styles.card, onBrand ? styles.cardOnBrand : ''].filter(Boolean).join(' ')}
              style={{ height: cardHeight }}
            >
              {/* As a grid item this span is blockified, so AccentText's
                  `text-wrap: balance` does apply here — which is what we want
                  for centred card copy, where two even lines read better than a
                  long line over a short one. */}
              <AccentText as="span" content={step} className="ds-text-body" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={bandClass} style={bandStyle}>
      <div className={styles.row} style={{ paddingTop }}>
        {label && (
          <div className={styles.labelCell} style={{ width: labelWidth }}>
            <AccentText as="span" content={label} className={[typeClass(size), ink].join(' ')} />
          </div>
        )}
        {steps.map((step, i) => (
          // A Fragment, not a wrapper element: the dash must be a *sibling* of
          // the step cells. Wrapped, dash + cell would be one flex item and
          // the dash width would come out of the step's column instead of
          // sitting between columns.
          <Fragment key={i}>
            <span className={styles.dashes} aria-hidden="true" />
            <span className={styles.stepCell}>
              <AccentText as="span" content={step} className={[typeClass(size), ink].join(' ')} />
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
