import { grid } from '../tokens/tokens.js'
import type { ImageSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { ImageMosaic } from '../elements/media/ImageMosaic'
import { BulletList } from '../elements/text/BulletList'
import styles from './BulletImage.module.css'

/**
 * Template — Bullets + Image.
 *
 * The product-capability slide: a headline, a checkmark list of what the module
 * does on the left, and photography floating on the right. Rebuilt from slide
 * 2-01 (Hotel RFP & Contract Management), and the shape every other module
 * slide in that section repeats.
 *
 * Imagery is handed over as `ImageSpec[]` and drawn by ImageMosaic, so this
 * template does not care whether the right-hand side is one asset or five. On
 * slide 2-01 it is deliberately ONE: the three photos overlap and their drop
 * shadows merge, so no detector setting separates them and the crop was taken
 * whole (see scripts/crop-images.mjs). It is placed with `radius: 0` because
 * the corners are already rounded inside the pixels — applying the image radius
 * again would clip the shadows.
 *
 * The list sits low on the slide, not directly under the headline: the
 * reference leaves the upper-left quadrant empty so the photo cluster reads as
 * the top half of a diagonal. `bulletsTop` is what tunes that, and it is the
 * one number a new slide of this shape usually has to change.
 */
export interface BulletImageProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  titleWidth?: number

  bullets?: RichText[]
  /** Top of the list. 408 on slide 2-01. */
  bulletsTop?: number
  /** Where the copy wraps. */
  bulletsWidth?: number
  bulletSize?: TypeStep
  /** Space between items. */
  bulletGap?: number
  /** Marker glyph. Filled `check_circle` is the reference's teal disc. */
  bulletIcon?: string
  markerSize?: number

  /** Right-hand imagery, in absolute slide coordinates. */
  images?: ImageSpec[]
}

export function BulletImage({
  fit = 'contain',
  title,
  titleSize = 'h1',
  titleWidth = 760,
  bullets = [],
  bulletsTop = 408,
  bulletsWidth = 492,
  bulletSize = 'h4',
  bulletGap = 27,
  bulletIcon = 'check_circle',
  markerSize = 33,
  images = [],
  ...chrome
}: BulletImageProps) {
  return (
    <SlideFrame fit={fit} {...chrome}>
      {title && <SlideHeading title={title} size={titleSize} width={titleWidth} />}

      {/* Imagery first in the DOM so the copy column wins any overlap. The
          headline runs past the cluster's left edge on slide 2-01, and only
          gets away with it because that corner of the asset is transparent. */}
      {images.length > 0 && <ImageMosaic images={images} />}

      {bullets.length > 0 && (
        <BulletList
          items={bullets}
          icon={bulletIcon}
          markerSize={markerSize}
          gap={bulletGap}
          size={bulletSize}
          width={bulletsWidth}
          className={styles.bullets}
          style={{ top: bulletsTop, left: grid.marginX }}
        />
      )}
    </SlideFrame>
  )
}
