import logoColor from '../../assets/logo/eventpipe-logo.svg'
import logoWhite from '../../assets/logo/eventpipe-logo-fff.svg'
import logoBlack from '../../assets/logo/eventpipe-logo-000.svg'
import styles from './EpLogo.module.css'

/**
 * EpLogo — the EventPipe mark, in the three parts a slide actually needs.
 *
 * The source artwork (a 128x33 viewBox) is one lockup containing the hex
 * glyph followed by the wordmark. The deck uses them separately — the
 * bottom-right watermark stacks a rotated wordmark above an upright glyph —
 * so rather than maintain three divergent SVG files this clips one source
 * through a window. Vector stays vector, and there is one file to update if
 * the logo changes.
 */

/** Source artwork geometry, in viewBox units.
 *
 *  The split points are real path bounding boxes, measured with
 *  `node scripts/measure-logo.mjs` rather than eyeballed — guessing them cut
 *  the leading "e" off the wordmark and rendered "aventpipe":
 *
 *    path[0] glyph      x  0.00 → 27.85   y  0.00 → 32.01
 *    path[1] "event"    x 33.85 → 85.95   y  8.97 → 23.04
 *    path[2] "pipe"     x 87.95 → 127.29  y  5.87 → 26.14
 *
 *  Re-run that script if the artwork is ever replaced. */
const VIEWBOX = { width: 128, height: 33 }
const SPLIT = {
  glyphEnd: 27.85,
  wordmarkStart: 33.85,
  wordmarkEnd: 127.29,
}

const SOURCES = { color: logoColor, white: logoWhite, black: logoBlack }

export type LogoVariant = 'full' | 'glyph' | 'wordmark'
export type LogoTone = keyof typeof SOURCES

export interface EpLogoProps {
  /** 'full' the whole lockup · 'glyph' the hex only · 'wordmark' the type only */
  variant?: LogoVariant
  /** 'color' on light surfaces · 'white' on brand/photography · 'black' mono */
  tone?: LogoTone
  /** Rendered height in slide px. Width follows the variant's aspect. */
  height?: number
  /** Rendered width in slide px. Takes precedence over `height` — the
   *  watermark is specified by its length, not its weight. */
  width?: number
  className?: string
}

/** The visible window into the artwork, in viewBox units. */
function windowFor(variant: LogoVariant) {
  if (variant === 'glyph') return { width: SPLIT.glyphEnd, offset: 0 }
  if (variant === 'wordmark') {
    return { width: SPLIT.wordmarkEnd - SPLIT.wordmarkStart, offset: SPLIT.wordmarkStart }
  }
  return { width: VIEWBOX.width, offset: 0 }
}

export function EpLogo({
  variant = 'full',
  tone = 'color',
  height = 33,
  width,
  className,
}: EpLogoProps) {
  const win = windowFor(variant)
  // `width` wins when given, so the watermark can be sized by its length.
  const scale = width ? width / win.width : height / VIEWBOX.height

  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(' ')}
      style={{ width: win.width * scale, height: VIEWBOX.height * scale }}
    >
      <img
        src={SOURCES[tone]}
        alt="EventPipe"
        style={{
          width: VIEWBOX.width * scale,
          height: VIEWBOX.height * scale,
          marginLeft: -win.offset * scale,
        }}
      />
    </span>
  )
}
