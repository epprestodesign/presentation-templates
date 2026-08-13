import type { ImageSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { ImageMosaic } from '../elements/media/ImageMosaic'
import { AccentText } from '../elements/text/AccentText'
import styles from './HeadlineImage.module.css'

/**
 * Template — Headline + Image.
 *
 * Copy column on the left, photo mosaic on the right. Covers the opening
 * "system of record" slide and the youth-sports TAM slide, which share a
 * mosaic geometry but differ in how the copy column is built: one stacks a
 * headline and a large teal statement, the other a headline, a bold claim, and
 * two body paragraphs.
 *
 * Rather than invent a prop per variant, the copy column takes an array of
 * `blocks`, each with its own type step. That covers both slides and anything
 * between them without the template growing a new prop each time a deck wants
 * a different stack.
 */
export interface CopyBlock {
  text: RichText
  /** Type step. Defaults to 'body'. */
  size?: TypeStep
  /** Extra space above this block, in slide px. */
  spaceBefore?: number
}

export interface HeadlineImageProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  titleWidth?: number

  /** Additional copy blocks under the headline, in order. */
  blocks?: CopyBlock[]
  /** Where the copy blocks start. Defaults below a two-line headline. */
  blocksTop?: number
  /** Distance from the bottom of the slide to the last line of copy. The column
   *  spans blocksTop → this, and the text is pushed to the bottom of it. */
  blocksBottom?: number
  /** 'bottom' (default) rests the last line on the content floor; 'top' hangs
   *  the copy off the headline the way it used to. */
  blocksAlign?: 'top' | 'bottom'

  /** Mosaic images, in absolute slide coordinates. */
  images?: ImageSpec[]
}

/** statSm → stat-sm */
const stepClass = (step: TypeStep) =>
  `ds-text-${step.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`

export function HeadlineImage({
  fit = 'contain',
  title,
  titleSize = 'h1',
  titleWidth = 620,
  blocks = [],
  blocksTop = 300,
  blocksBottom = 60,
  blocksAlign = 'bottom',
  images = [],
  ...chrome
}: HeadlineImageProps) {
  return (
    <SlideFrame fit={fit} {...chrome}>
      {title && <SlideHeading title={title} size={titleSize} width={titleWidth} />}

      {blocks.length > 0 && (
        <div
          className={[styles.figures, blocksAlign === 'top' ? styles.figuresTop : '']
            .filter(Boolean)
            .join(' ')}
          style={{ top: blocksTop, bottom: blocksBottom, width: titleWidth }}
        >
          {blocks.map((block, i) => (
            <AccentText
              key={i}
              as="p"
              content={block.text}
              className={stepClass(block.size ?? 'body')}
              // spaceBefore is additive on top of the column gap, for the
              // larger breaks the reference makes between thoughts.
              {...(block.spaceBefore ? { style: { marginTop: block.spaceBefore } } : {})}
            />
          ))}
        </div>
      )}

      {images.length > 0 && <ImageMosaic images={images} />}
    </SlideFrame>
  )
}
