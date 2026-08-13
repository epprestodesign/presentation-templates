import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import { typeClass } from '../lib/typeClass'
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
  /** How far the frame holds the photo off the top, right and bottom edges.
   *  20px is what the recovered compositions measure; the left edge is 0,
   *  because the photo runs off it. */
  frameInset?: number
  /** Radius on the photo's two right corners. Measured at 24. */
  frameRadius?: number
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
  frameInset = 20,
  frameRadius = 24,
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
      // 'image' without an `image` of its own: the photo is rendered as an
      // <img> below so its alt text survives (and the frame variant needs a
      // wrapper regardless), but the surface still has to be declared
      // photographic or the chrome would keep its dark ink over the picture.
      surface="image"
      {...chrome}
    >
      <div
        className={[styles.bleed, frame ? styles.framed : ''].filter(Boolean).join(' ')}
        style={
          frame
            ? {
                ['--fullbleed-inset' as string]: `${frameInset}px`,
                ['--fullbleed-radius' as string]: `${frameRadius}px`,
              }
            : undefined
        }
      >
        <img src={img(image)} alt={alt} className={styles.photo} />
      </div>

      {scrim > 0 && <div className={styles.scrim} style={{ opacity: scrim }} />}

      {/* The headline is built here rather than handed to SlideHeading because
          SlideHeading's `onDark` recolours only the lead — the title keeps
          `ds-text-*`'s black ink, which is invisible over a photograph. The
          stack is otherwise the same: title, then lead beneath it. */}
      {(title || lead) && (
        <div className={styles.heading} style={{ top: titleTop, width: titleWidth }}>
          {title && (
            <AccentText
              content={title}
              className={`${typeClass(titleSize)} ds-text-on-brand`}
            />
          )}
          {lead && (
            <AccentText as="p" content={lead} className="ds-text-lead ds-text-on-brand-subtle" />
          )}
        </div>
      )}
    </SlideFrame>
  )
}
