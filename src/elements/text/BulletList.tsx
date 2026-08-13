import type { CSSProperties } from 'react'
import type { RichText, TypeStep } from '../../types'
import { AccentText } from '../text/AccentText'
import { Icon } from '../brand/Icon'
import { typeClass } from '../../lib/typeClass'
import styles from './BulletList.module.css'

/**
 * BulletList — the deck's feature list: a filled teal marker, then a short
 * bold claim, repeated down the left column of a product slide.
 *
 * The marker is a single Material Symbols glyph, not a disc with a tick drawn
 * on top of it. `check_circle` in its filled form *is* a solid disc with the
 * check knocked out of it, so one glyph in the accent colour reproduces the
 * reference exactly and any other glyph (`star`, `bolt`, a numbered step) drops
 * in without the element changing.
 *
 * A real `ul`/`li`, because it is a real list — the marker is decoration, so
 * the glyph is aria-hidden inside Icon and the list structure carries the
 * meaning instead.
 */
export interface BulletListProps {
  items: RichText[]
  /** Material Symbols glyph used as the marker. */
  icon?: string
  /** Filled glyphs read as a solid disc; outlined ones as a ring. */
  filled?: boolean
  /** Rendered marker size in slide px. The reference disc measures 28px
   *  across, and a filled Material Symbol fills roughly 5/6 of its box, so the
   *  glyph is set a little larger than the disc it draws. */
  markerSize?: number
  /** Gap between marker and copy. */
  markerGap?: number
  /** Space between items. 27px on slide 2-01, which lands the four markers on
   *  a 74px pitch. */
  gap?: number
  /** Type step for the copy. */
  size?: TypeStep
  /** Marker against the middle of the whole item, or against its first line.
   *
   *  'center' is what the reference does and is right while items are one or
   *  two lines; a three-line item wants 'top' so the marker does not float
   *  into the middle of a paragraph. */
  align?: 'center' | 'top'
  /** Column width in slide px — where the copy wraps. */
  width?: number
  className?: string
  style?: CSSProperties
}

export function BulletList({
  items,
  icon = 'check_circle',
  filled = true,
  markerSize = 33,
  markerGap = 18,
  gap = 27,
  size = 'h4',
  align = 'center',
  width,
  className,
  style,
}: BulletListProps) {
  return (
    <ul
      className={[styles.list, className].filter(Boolean).join(' ')}
      style={{ gap, width, ...style }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          className={styles.item}
          style={{ gap: markerGap, alignItems: align === 'top' ? 'flex-start' : 'center' }}
        >
          <Icon
            name={icon}
            filled={filled}
            size={markerSize}
            weight={400}
            color="var(--slide-color-accent)"
          />
          {/* The wrapper is load-bearing, not markup for its own sake.
              AccentText's root carries `text-wrap: balance`, which is right for
              a headline and wrong here — the reference breaks these items
              long-line-then-short, not into two even halves. Balancing applies
              to block containers, and a bare flex child is blockified into one;
              wrapped, the copy column is the block container and the
              AccentText span stays a plain inline whose `balance` is inert. */}
          <span className={`${styles.text} ${typeClass(size)}`}>
            <AccentText as="span" content={item} />
          </span>
        </li>
      ))}
    </ul>
  )
}
