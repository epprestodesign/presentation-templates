import { type as typeScale } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { ArrowGlyph } from '../elements/brand/ArrowGlyph'
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
  /** Imagery name, e.g. 'full-bleed/demo-dashboard-review'. */
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
  /** Copy measure for the headline.
   *
   *  1080, not the 760 this used at the smaller `display` step. At 85px a
   *  two-word title like "Platform Walkthrough" needs ~830px, so 760 wrapped it
   *  to two lines — and a two-line headline anchored at 512 finishes 17px off
   *  the bottom of the artboard. The ceiling is ~1116 (the arrow starts at
   *  1188), so 1080 leaves a comfortable gap before the mark. */
  titleWidth?: number
  lead?: RichText
  /** Where the headline sits vertically, measured from the BOTTOM of the slide
   *  to the bottom of the headline's line box.
   *
   *  Anchored from below rather than above for two reasons. A headline this low
   *  that wraps to a second line would otherwise grow downward off the artboard;
   *  and 'how far up from the bottom' is the thing being judged by eye here, so
   *  it is the number worth exposing. */
  titleBottom?: number
  /** A down arrow at the right of the title row — the deck's own mark for a
   *  section opener, meaning "the section starts here". Off by default, since
   *  a full-bleed slide is not always a divider. */
  arrow?: boolean
  /** Drawn height of that mark, in slide px. Defaults to the cap height of the
   *  headline beside it, so the two read as one line of the same voice. */
  arrowSize?: number
  /** Distance from the RIGHT edge of the slide to the right edge of the mark.
   *
   *  64, not the 40 the copy margin uses. The arrow is artwork sitting on a
   *  photograph, not text in a column, so lining it up with the headline's own
   *  margin pushed it visually harder into the corner than the type ever
   *  looks — and on the framed slides it left only 20px between the mark and
   *  the gradient edge. */
  arrowRight?: number
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
  titleSize = 'displayLg',
  titleWidth = 1080,
  lead,
  titleBottom = 78,
  arrow = false,
  arrowSize,
  arrowRight = 64,
  ...chrome
}: FullBleedProps) {
  /* Cap height of the headline, which is what the arrow is sized and aligned to.
   *
   * 0.781 is Poppins' cap-to-em ratio, measured when the display step was
   * derived (see tokens.js). Matching the arrow to the CAP rather than to the
   * font size matters: an em-tall arrow beside a 85px headline overshoots the
   * letters by a fifth and reads as a separate, larger object rather than as
   * punctuation on the same line. */
  const titleSizePx = typeScale.scale[titleSize]?.size ?? 64
  const titleCap = Math.round(titleSizePx * 0.781)

  /* The arrow takes the SAME bottom offset as the heading, which lands it
     exactly on the text baseline.
     
     That is not a coincidence worth relying on blindly, so: the heading is a
     flex column whose box ends at the last line's baseline, with the descent
     and half-leading overflowing below it. Anchoring both to the same `bottom`
     therefore puts the arrow's foot on the baseline and, since the arrow is
     drawn to the cap height, its head on the cap line.
     
     Verified with a zero-width baseline probe: baseline 656, arrow 590 to 656,
     cap top 656 - 66. The previous version aligned the arrow to the box TOP,
     which sat it 22px above the cap — close enough to look deliberate, wrong
     enough that the arrow and the letters never shared a line. */

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

      {arrow && title && (
        // Sits on the title's own line at the right margin rather than inside
        // SlideHeading, because the heading's width is the copy measure — an
        // arrow inside it would track the text, not the slide.
        <div
          className={styles.arrow}
          style={{ bottom: titleBottom, right: arrowRight, height: titleCap }}
        >
          <ArrowGlyph size={arrowSize ?? titleCap} />
        </div>
      )}

      {(title || lead) && (
        <SlideHeading
          title={title}
          size={titleSize}
          lead={lead}
          width={titleWidth}
          bottom={titleBottom}
          onDark
        />
      )}
    </SlideFrame>
  )
}
