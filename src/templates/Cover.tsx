import type { CSSProperties } from 'react'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import { img } from '../assets/imagery'
import { typeClass } from '../lib/typeClass'
import styles from './Cover.module.css'

/**
 * Template — Cover.
 *
 * The opening slide: brand gradient with the hex tessellation, a title well
 * top-left, a placeholder panel top-right, and a strip of photography along
 * the floor.
 *
 * Everything sits in ONE four-column CSS grid rather than absolute rects,
 * because that is what the reference actually is. Measured off
 * `0-01-*.png`: the composition is inset 16px on all four sides with 16px
 * gutters, and every element lands on a 300px column — the title well and the
 * panel each span two columns (2 × 300 + 16 = 616), the wide crowd photo spans
 * two, and the two narrow photos take one each. Expressing it as a grid means
 * a cover with four equal photos, or a panel that spans three columns, needs a
 * span count rather than a fresh set of coordinates.
 *
 * The top row is `1fr` so `stripHeight` alone decides the split: 720 - 32
 * (insets) - 16 (row gap) - 287 = 385, which is exactly the reference.
 */

/** The right-hand panel is a placeholder in all three reference variants —
 *  black, white, or brand — waiting for a product shot or a video still. */
export type CoverPanelFill = 'brand' | 'black' | 'white' | 'none'

/** One photo in the floor strip. `span` is in grid columns. */
export interface CoverImage {
  /** Imagery name, e.g. 'cover-crowd'. */
  src: string
  alt?: string
  /** Columns to occupy. Defaults to 1; the reference's wide shot uses 2. */
  span?: number
}

export interface CoverProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  /** Brand background plate. The hex tessellation is the cover's own motif. */
  plate?: string

  /** Deck title, set in the well top-left. */
  title?: RichText
  /** Supporting line under the title. */
  subtitle?: RichText
  /** Bottom line of the well — date, audience, confidentiality. */
  meta?: string
  titleSize?: TypeStep

  /** Fill for the top-right placeholder panel. */
  panel?: CoverPanelFill
  /** Columns the title well occupies. */
  titleSpan?: number
  /** Columns the panel occupies. */
  panelSpan?: number

  /** The floor strip, left to right. */
  media?: CoverImage[]

  /** Columns across the composition. */
  columns?: number
  /** Outer inset, all four sides. */
  inset?: number
  /** Gutter between columns and between the two rows. */
  gutter?: number
  /** Height of the photo strip; the top row takes the rest. */
  stripHeight?: number
  /** Corner radius on the panels and photos. Measured at 8px in the 2x
   *  reference, so 4 here — deliberately tighter than `radius.image`, which
   *  is the radius the *content* slides' photos use. */
  radius?: number
  /** Opacity of the teal wash that lifts the title well off the plate.
   *  Fitted to the sampled difference between the well and the plate beside
   *  it — a wash of `--slide-color-accent`, not white: the reference's well
   *  holds R at 0 across its whole area, so whatever is over the plate there
   *  carries no red. It is what makes the well read as a well at all without
   *  becoming a second panel. */
  wash?: number
  /** Black scrim over the plate, under everything else.
   *
   *  The reference cover sits about 4% darker than the bare
   *  `backgrounds/brand-hex` artwork at every point outside the panels —
   *  sampled corner by corner against 20.png, which is that artwork. The
   *  photos and panels are NOT darkened, and the recovered cover crops already
   *  carry whatever the original did, so the scrim has to sit under the grid
   *  rather than over the slide. `SlideFrame` puts it exactly there. */
  scrim?: number
}

export function Cover({
  fit = 'contain',
  plate = 'backgrounds/brand-hex',
  title,
  subtitle,
  meta,
  titleSize = 'display',
  panel = 'brand',
  titleSpan = 2,
  panelSpan = 2,
  media = [],
  columns = 4,
  inset = 16,
  gutter = 16,
  stripHeight = 287,
  radius = 4,
  wash = 0.22,
  scrim = 0.04,
  ...chrome
}: CoverProps) {
  const gridStyle: CSSProperties = {
    inset,
    gap: gutter,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `1fr ${stripHeight}px`,
  }

  return (
    <SlideFrame fit={fit} surface="brand" plate={plate} scrim={scrim} {...chrome}>
      <div className={styles.grid} style={gridStyle}>
        <div
          className={styles.well}
          style={{ gridColumn: `span ${titleSpan}`, borderRadius: radius }}
        >
          <div className={styles.wash} style={{ opacity: wash }} />

          {title && (
            <AccentText
              content={title}
              className={`${typeClass(titleSize)} ds-text-on-brand ${styles.copy}`}
            />
          )}
          {subtitle && (
            <AccentText
              as="p"
              content={subtitle}
              className={`ds-text-lead ds-text-on-brand-subtle ${styles.copy}`}
            />
          )}
          {meta && <div className={`ds-text-eyebrow ds-text-on-brand ${styles.meta}`}>{meta}</div>}
        </div>

        {panel !== 'none' && (
          <div
            className={`${styles.panel} ${styles[panel]}`}
            style={{ gridColumn: `span ${panelSpan}`, borderRadius: radius }}
          />
        )}

        {media.map((image, i) => (
          <img
            key={i}
            src={img(image.src)}
            alt={image.alt ?? ''}
            className={styles.photo}
            style={{ gridColumn: `span ${image.span ?? 1}`, borderRadius: radius }}
          />
        ))}
      </div>
    </SlideFrame>
  )
}
