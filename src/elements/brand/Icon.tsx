import styles from './Icon.module.css'

/**
 * Icon — one glyph from Material Symbols.
 *
 * The whole ~3,700-glyph library ships as three variable fonts (rounded,
 * outlined, sharp), self-hosted from the `material-symbols` package. Naming a
 * glyph is enough: no per-icon import, no sprite to maintain, which is what
 * makes an agent-authored slide cheap to write.
 *
 * Rounded and SOLID at weight 400 is the default.
 *
 * It started outlined at 300, matching the thin geometric line icons in the
 * reference deck. That was faithful and, at slide scale, wrong: a 300-weight
 * hairline glyph beside a 40px figure or on a brand gradient reads as a
 * rendering artefact rather than as a symbol, and it is the first thing to
 * disappear when a deck is projected or printed. Solid holds its shape at any
 * size and against any background.
 *
 * Pass `filled={false}` for the outlined cut where a slide genuinely wants the
 * lighter texture.
 *
 * Note that FILL is a no-op on glyphs with no enclosed counters — the plain
 * arrows are strokes and look identical either way, which is why the arrow
 * call sites already set their own weight instead.
 */
export interface IconProps {
  /** Material Symbols glyph name, e.g. 'arrow_outward', 'stadium', 'hotel'. */
  name: string
  style?: 'rounded' | 'outlined' | 'sharp'
  /** Rendered size in slide px. Also drives optical sizing. */
  size?: number
  /** Stroke weight, 100–700. */
  weight?: number
  /** Solid rather than outlined. Solid by default — see the note above. */
  filled?: boolean
  /** Any CSS colour. Defaults to inheriting from the slide. */
  color?: string
  className?: string
}

export function Icon({
  name,
  style = 'rounded',
  size = 24,
  weight = 400,
  filled = true,
  color,
  className,
}: IconProps) {
  return (
    <span
      className={[styles.icon, `material-symbols-${style}`, className].filter(Boolean).join(' ')}
      style={{
        fontSize: size,
        width: size,
        height: size,
        color,
        // `opsz` has to track the rendered size or small icons look spindly.
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
