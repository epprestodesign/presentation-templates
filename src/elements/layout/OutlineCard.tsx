import type { CSSProperties, ReactNode } from 'react'
import styles from './OutlineCard.module.css'

/**
 * OutlineCard — a panel with no fill at all, drawn only by a hairline white
 * border. The card the closing slide uses to group a person's contact details
 * straight on top of the brand gradient.
 *
 * It is deliberately not a `surface: 'outline'` StatCard. StatCard's outline
 * fill exists so a KPI tile can go transparent inside a row of filled tiles;
 * this is a container that holds arbitrary content, and its geometry is much
 * larger — radius 24 and 40px of padding, both measured off slide 16, versus
 * the 10 / 28 a stat tile uses. Sharing one component would have meant one of
 * the two carrying the other's numbers as overrides on every use.
 *
 * The border is 40% white, which is what the reference samples as
 * (rgb(102,195,203) over rgb(0,155,169) → alpha 0.40). That is expressed as a
 * mix of the on-brand ink token rather than a literal rgba so the value still
 * comes from the palette; `color.ruleOnBrand` is 0.28 and reads visibly
 * fainter than the reference at this size.
 */
export interface OutlineCardProps {
  /** Omit to fill the width the parent gives it. */
  width?: number
  height?: number
  /** Measured at 24 on slide 16 — between `radius.panel` (16) and nothing in
   *  the scale, so it is a number rather than a token here. */
  radius?: number
  padding?: number
  /** Border weight. The 2x reference reads ~4px of ink including antialiasing. */
  border?: number
  /** Centres children on the cross axis, as the contact cards do not. */
  align?: 'start' | 'center'
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function OutlineCard({
  width,
  height,
  radius = 24,
  padding = 40,
  border = 2,
  align = 'start',
  children,
  className,
  style,
}: OutlineCardProps) {
  return (
    <div
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        padding,
        borderRadius: radius,
        borderWidth: border,
        alignItems: align === 'center' ? 'center' : 'stretch',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
