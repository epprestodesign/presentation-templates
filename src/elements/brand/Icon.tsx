import styles from './Icon.module.css'

/**
 * Icon — one glyph from Material Symbols.
 *
 * The whole ~3,700-glyph library ships as three variable fonts (rounded,
 * outlined, sharp), self-hosted from the `material-symbols` package. Naming a
 * glyph is enough: no per-icon import, no sprite to maintain, which is what
 * makes an agent-authored slide cheap to write.
 *
 * Rounded at weight 300 is the default because it matches the thin geometric
 * line icons in the reference deck.
 */
export interface IconProps {
  /** Material Symbols glyph name, e.g. 'arrow_outward', 'stadium', 'hotel'. */
  name: string
  style?: 'rounded' | 'outlined' | 'sharp'
  /** Rendered size in slide px. Also drives optical sizing. */
  size?: number
  /** Stroke weight, 100–700. The reference icons read as 300. */
  weight?: number
  /** Solid rather than outlined. */
  filled?: boolean
  /** Any CSS colour. Defaults to inheriting from the slide. */
  color?: string
  className?: string
}

export function Icon({
  name,
  style = 'rounded',
  size = 24,
  weight = 300,
  filled = false,
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
