import { radius } from '../../tokens/tokens.js'
import type { ImageSpec } from '../../types'
import { img } from '../../assets/imagery'
import styles from './ImageMosaic.module.css'

/**
 * ImageMosaic — a hand-composed cluster of photos in absolute slide
 * coordinates.
 *
 * Deliberately not a grid. The reference mosaics are asymmetric by design (a
 * wide establishing shot over two unequal columns, one tall frame breaking the
 * rhythm), and every attempt to express that as rows and columns ends up
 * fighting the layout. Since the rects came out of
 * scripts/detect-images.mjs reading the original pixels, absolute placement
 * *is* the faithful description — it reproduces the original exactly rather
 * than approximating it with a grid that nearly fits.
 *
 * A `gap`-based grid is still the right call for genuinely regular rows; those
 * use CardGrid instead.
 */
export interface ImageMosaicProps {
  /** Each entry needs x/y/w/h in slide px, and an imagery name as `src`. */
  images: ImageSpec[]
  /** Applied to any image that does not set its own. */
  radiusPx?: number
  className?: string
}

export function ImageMosaic({ images, radiusPx = radius.image, className }: ImageMosaicProps) {
  return (
    <div className={[styles.mosaic, className].filter(Boolean).join(' ')}>
      {images.map((image, i) => (
        <img
          key={i}
          src={img(image.src)}
          alt={image.alt ?? ''}
          className={styles.image}
          style={{
            left: image.x,
            top: image.y,
            width: image.w,
            height: image.h,
            borderRadius: image.radius ?? radiusPx,
          }}
        />
      ))}
    </div>
  )
}
