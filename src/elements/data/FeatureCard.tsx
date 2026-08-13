import type { CSSProperties } from 'react'
import { radius } from '../../tokens/tokens.js'
import type { CardSurface, RichText, TypeStep } from '../../types'
import { AccentText } from '../text/AccentText'
import { typeClass } from '../../lib/typeClass'
import { img } from '../../assets/imagery'
import styles from './FeatureCard.module.css'

/**
 * FeatureCard — a photo, a title and a short body, in a card.
 *
 * Two layouts, ONE component. The reference deck uses these on slides that
 * look quite different at a glance — slide 03 bleeds the photo to the card's
 * top edge, scrims it, and reverses the title onto it; slide 10 keeps the card
 * flat #f5f5f5, sets the title in ink at the top and insets the photo along the
 * bottom — but the *data* behind them is identical: a title, some copy, and one
 * named photo. Splitting that into two components would duplicate the surface
 * fills, the radius, the padding contract and the row geometry in the template
 * above, and would make the two slides' stories look like unrelated shapes
 * when they are the same idea told in two directions. So the stacking order and
 * the ink flip are a `layout` variant, and everything else is shared.
 *
 * Geometry is measured, not guessed — see the numbers on each prop.
 */

/** Which way the card stacks. */
export type FeatureCardLayout =
  /** Slide 03: photo bleeds to the top edge, scrimmed, title reversed on it. */
  | 'photo-top'
  /** Slide 10: title and copy at the top, photo inset along the bottom. */
  | 'photo-bottom'

export interface FeatureCardSpec {
  title?: RichText
  /** Paragraphs of copy. Used by the photo-bottom layout. */
  body?: RichText[]
  /** A ruled list. Each entry gets the cool vertical rule slide 03 uses
   *  instead of a bullet glyph. */
  bullets?: RichText[]
  /** Imagery name, e.g. 'operating-layer/contract-signing'. */
  image?: string
  alt?: string
  /** `object-position` for the crop, e.g. '50% 30%'. Photos are cropped hard
   *  by these cards, so a card occasionally has to name its focal point. */
  focus?: string
  surface?: CardSurface
}

export interface FeatureCardProps extends FeatureCardSpec {
  layout?: FeatureCardLayout
  titleSize?: TypeStep
  bodySize?: TypeStep
  /** Inset from the card edge to its content. */
  padding?: number
  /** Top inset, when it differs from `padding`. Slide 10 runs 20/16/16. */
  paddingTop?: number
  /** Height of the photo band, in slide px. */
  imageHeight?: number
  /** Strength of the black veil under a reversed title. 0 removes it. */
  scrim?: number
  /** Gap between body paragraphs, and between ruled list items. */
  itemGap?: number
}

export function FeatureCard({
  layout = 'photo-top',
  title,
  body,
  bullets,
  image,
  alt = '',
  focus,
  surface = 'muted',
  titleSize = 'h3',
  bodySize = 'bodySm',
  padding = 16,
  paddingTop,
  imageHeight = layout === 'photo-top' ? 255 : 183,
  scrim = 1,
  itemGap = 8,
}: FeatureCardProps) {
  const onBrand = surface === 'brand' || surface === 'brandAlt'
  const photoTop = layout === 'photo-top'

  const cardStyle: CSSProperties = {
    borderRadius: radius.panel,
    // The photo-top layout bleeds its photo to three edges, so the card holds
    // no padding of its own; each band pads itself instead.
    ...(photoTop ? {} : { padding: `${paddingTop ?? padding}px ${padding}px ${padding}px` }),
  }

  const photo = image && (
    <img
      className={styles.photo}
      src={img(image)}
      alt={alt}
      {...(focus ? { style: { objectPosition: focus } } : {})}
    />
  )

  const titleNode = title && (
    <AccentText
      as="h3"
      content={title}
      className={[
        typeClass(titleSize),
        // Reversed on the scrimmed photo; ink on a light card.
        photoTop || onBrand ? 'ds-text-on-brand' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )

  return (
    <div className={[styles.card, styles[surface]].filter(Boolean).join(' ')} style={cardStyle}>
      {photoTop ? (
        <>
          <div className={styles.media} style={{ height: imageHeight }}>
            {photo}
            {scrim > 0 && <div className={styles.scrim} style={{ opacity: scrim }} />}
            {titleNode && (
              <div
                className={styles.mediaTitle}
                style={{ left: padding, right: padding, bottom: padding }}
              >
                {titleNode}
              </div>
            )}
          </div>

          {bullets && bullets.length > 0 && (
            <ul
              className={styles.list}
              style={{
                gap: itemGap,
                // 20 at the top rather than a symmetric inset: measured on
                // slide 03, whose first rule starts 23px under the photo and
                // whose last one ends 16px off the floor.
                padding: `${(paddingTop ?? padding) + 4}px ${padding}px ${padding}px`,
              }}
            >
              {bullets.map((item, i) => (
                <li key={i} className={styles.bullet}>
                  <AccentText as="p" content={item} className={typeClass(bodySize)} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className={styles.copy} style={{ gap: itemGap / 2 }}>
            {titleNode}
            {body?.map((para, i) => (
              <AccentText
                key={i}
                as="p"
                content={para}
                className={[styles.para, typeClass(bodySize), onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-cool']
                  .filter(Boolean)
                  .join(' ')}
              />
            ))}
          </div>

          {photo && (
            <div className={styles.thumb} style={{ height: imageHeight, borderRadius: radius.panel }}>
              {photo}
            </div>
          )}
        </>
      )}
    </div>
  )
}
