import type { CSSProperties } from 'react'
import type { TypeStep } from '../../types'
import { Icon } from '../brand/Icon'
import { typeClass } from '../../lib/typeClass'
import styles from './ArrowStatRow.module.css'

/**
 * ArrowStatRow — one line of the "by the Numbers" left column: a teal arrow, a
 * big teal figure, and the thing it measures.
 *
 * Three fixed columns rather than a flowing line, because the reference's
 * labels all start at the same x (measured 205) whatever their figure's width.
 * A flowing row would put "40%+ increase in reservations made" a few px right
 * of the line above it and the column would visibly ripple.
 *
 * Geometry measured off references/slide-decks/11-33.png at 2x.
 */
export interface ArrowStatSpec {
  /** The figure, pre-formatted — '35%+'. A string so the deck controls the
   *  rounding and the "+", as StatSpec does. */
  value: string
  label: string
}

export interface ArrowStatRowProps extends ArrowStatSpec {
  height?: number
  /** Width of the arrow column, from the page margin to the figure. */
  arrowColumn?: number
  /** Width of the figure column, from the figure to the label. */
  valueColumn?: number
  /** Material Symbols glyph. The reference's is a plain long arrow. */
  icon?: string
  iconSize?: number
  /** Type step for the figure.
   *
   *  h1 rather than a `stat` step on purpose: the reference's figures measure
   *  27px tall, i.e. ~39px of Poppins, and the scale's stat steps are 68 and
   *  44 with nothing between. h1 (40) is the step that matches; statSm would
   *  run the figure 10% large and crowd the label column. */
  valueSize?: TypeStep
  /** Type step for the label.
   *
   *  bodyLg (18/400) rather than the h3 (22) this used to carry. At 22 the
   *  label competed with the 40px figure beside it for attention, and the
   *  column read as two headlines rather than as a figure and the thing it
   *  measures. 18 at regular weight puts it clearly second, which is the
   *  hierarchy the row is for. */
  labelSize?: TypeStep
  className?: string
  style?: CSSProperties
}

export function ArrowStatRow({
  value,
  label,
  height = 56,
  /* 40, not the 51.5 measured off the reference. The reference's arrow is drawn
     artwork sitting tight to its figure; the Material Symbol has side bearings
     the drawing does not, so matching the measured column left a visible gulf
     between the glyph and the number it points at. */
  arrowColumn = 40,
  valueColumn = 113.5,
  icon = 'arrow_forward',
  iconSize = 40,
  valueSize = 'h1',
  labelSize = 'bodyLg',
  className,
  style,
}: ArrowStatRowProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(' ')}
      style={{ ...style, height, gridTemplateColumns: `${arrowColumn}px ${valueColumn}px 1fr` }}
    >
      <Icon
        name={icon}
        size={iconSize}
        weight={400}
        color="var(--slide-color-accent)"
        className={styles.arrow}
      />
      <div className={`${typeClass(valueSize)} ds-text-accent`}>{value}</div>
      <div className={`${styles.label} ${typeClass(labelSize)}`}>{label}</div>
    </div>
  )
}
