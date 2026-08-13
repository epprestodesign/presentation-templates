import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { img } from '../assets/imagery'
import styles from './FullBleed.module.css'

/**
 * Template — Full Bleed.
 *
 * A photograph filling the slide, optionally inside the branded gradient frame
 * the reference uses, and optionally carrying a headline over a scrim.
 *
 * Two ways to use it, which exist for a specific reason:
 *
 *  - `image` alone reproduces a reference slide exactly. Those slides are a
 *    photo inside a gradient frame with one large rounded corner, which is not
 *    a simple inset, so the recovered asset is the whole composition and the
 *    frame is already baked in.
 *  - `image` + `frame` applies the frame in CSS to a *new* photograph that
 *    arrives without one. That is the path for future decks.
 *
 * Setting both would double the frame, so `frame` is off by default and the
 * story for each reference slide leaves it off.
 */
export interface FullBleedProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'
  /** Imagery name, e.g. 'full-bleed/demo-dashboard'. */
  image: string
  alt?: string
  /** Apply the branded gradient frame in CSS. Leave off for the recovered
   *  reference assets, which already include it. */
  frame?: boolean
  /** Darkening scrim under any text, 0–1. */
  scrim?: number
  title?: RichText
  titleSize?: TypeStep
  titleWidth?: number
  lead?: RichText
  /** Where the headline sits vertically. */
  titleTop?: number
}

export function FullBleed({
  fit = 'contain',
  image,
  alt = '',
  frame = false,
  scrim = 0,
  title,
  titleSize = 'display',
  titleWidth = 760,
  lead,
  titleTop = 420,
  ...chrome
}: FullBleedProps) {
  return (
    <SlideFrame
      fit={fit}
      // The photo is rendered as an <img> rather than a background so its alt
      // text survives; the frame variant needs a wrapper regardless.
      {...chrome}
    >
      <div className={[styles.bleed, frame ? styles.framed : ''].filter(Boolean).join(' ')}>
        <img src={img(image)} alt={alt} className={styles.photo} />
      </div>

      {scrim > 0 && <div className={styles.scrim} style={{ opacity: scrim }} />}

      {(title || lead) && (
        <SlideHeading
          title={title}
          size={titleSize}
          lead={lead}
          width={titleWidth}
          top={titleTop}
          onDark
        />
      )}
    </SlideFrame>
  )
}
