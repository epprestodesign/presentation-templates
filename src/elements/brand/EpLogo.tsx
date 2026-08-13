import { BOUNDS, EVENT_PATH, GLYPH_PATH, LOGO_COLORS, PIPE_PATH, VIEWBOX } from '../../assets/logo/logoPaths'

/**
 * EpLogo — the EventPipe mark, in every orientation and part a slide needs.
 *
 * Rendered as inline SVG from one set of paths (src/assets/logo/logoPaths.ts).
 * The source artwork is the vertical watermark lockup; rotating it +90° puts the
 * glyph on the left and the wordmark reading left-to-right, which is the
 * standard horizontal lockup. So one set of paths covers both orientations and
 * there is no second file to drift.
 *
 * Inline SVG rather than <img> because `tone` has to recolour the mark, and an
 * <img> cannot be recoloured — the previous approach needed three near-identical
 * SVG files plus an overflow-clipping window to isolate the glyph and wordmark.
 *
 * `size` always means the mark's LONG edge, whichever way it is oriented, so a
 * caller does not have to know which axis it is asking about.
 */

export type LogoVariant =
  /** The full lockup, wordmark then glyph. */
  | 'full'
  /** The hex glyph only. */
  | 'glyph'
  /** "eventpipe" only, no glyph. */
  | 'wordmark'
export type LogoOrientation = 'vertical' | 'horizontal'
export type LogoTone = 'color' | 'white' | 'black'

export interface EpLogoProps {
  variant?: LogoVariant
  /** 'horizontal' is the conventional lockup and the default — it is how the
   *  mark reads everywhere except one place. 'vertical' is the bottom-right
   *  slide watermark, and is opted into rather than inherited. */
  orientation?: LogoOrientation
  /** 'color' on light surfaces · 'white' on brand/photography · 'black' mono */
  tone?: LogoTone
  /** Length of the mark's long edge in slide px. */
  size?: number
  className?: string
}

/** Ink per tone. In colour, the wordmark's "event" is navy and everything else
 *  is the brand teal — straight from the artwork. */
function inks(tone: LogoTone) {
  if (tone === 'white') return { teal: '#ffffff', navy: '#ffffff' }
  if (tone === 'black') return { teal: '#000000', navy: '#000000' }
  return { teal: LOGO_COLORS.teal, navy: LOGO_COLORS.navy }
}

export function EpLogo({
  variant = 'full',
  orientation = 'horizontal',
  tone = 'color',
  size = 142,
  className,
}: EpLogoProps) {
  const ink = inks(tone)
  const bounds = BOUNDS[variant === 'full' ? 'full' : variant]

  // Crop the viewBox to just the part being shown, so a glyph-only render has
  // no transparent padding and `size` means the glyph itself.
  const vbY = bounds.y
  const vbH = bounds.y2 - bounds.y
  const vbW = VIEWBOX.width

  // `size` is the long edge. Vertically that is the height; rotated, the width.
  const scale = size / Math.max(vbW, vbH)
  const w = vbW * scale
  const h = vbH * scale

  const svg = (
    <svg
      width={w}
      height={h}
      viewBox={`0 ${vbY} ${vbW} ${vbH}`}
      fill="none"
      role="img"
      aria-label="EventPipe"
      style={{ display: 'block' }}
    >
      {(variant === 'full' || variant === 'wordmark') && (
        <>
          <path fillRule="evenodd" clipRule="evenodd" d={PIPE_PATH} fill={ink.teal} />
          <path fillRule="evenodd" clipRule="evenodd" d={EVENT_PATH} fill={ink.navy} />
        </>
      )}
      {(variant === 'full' || variant === 'glyph') && (
        <path fillRule="evenodd" clipRule="evenodd" d={GLYPH_PATH} fill={ink.teal} />
      )}
    </svg>
  )

  if (orientation === 'vertical') {
    return <span className={className} style={{ display: 'block', width: w, height: h }}>{svg}</span>
  }

  // Rotating swaps the footprint, so the wrapper takes the swapped box (h x w)
  // and the SVG is centred inside it absolutely.
  //
  // Absolute rather than a centring grid: the SVG's pre-rotation box is `h`
  // tall, which is far taller than the `w`-tall wrapper for a horizontal
  // lockup. A grid item bigger than its track aligns to the start and overflows
  // downward, which left the mark hanging below its box.
  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'block', width: h, height: w }}
    >
      <span
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          lineHeight: 0,
        }}
      >
        {svg}
      </span>
    </span>
  )
}
