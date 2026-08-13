import type { CSSProperties } from 'react'
import type { RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { LogoGrid } from '../elements/media/LogoGrid'
import { img } from '../assets/imagery'
import styles from './LogoWall.module.css'

/**
 * Template — Logo Wall.
 *
 * The customer-proof slide: headline and framing paragraph, then one or two
 * labelled fields of third-party marks side by side.
 *
 * A group's label is centred inside a dotted leader that runs the full width of
 * its field — the deck's own device for separating two walls that would
 * otherwise read as one mass. The leaders are a repeating radial-gradient
 * rather than a row of elements: measured dot diameter is 4.5px on a 13.3px
 * pitch, and a background repeat holds that spacing at any field width, where
 * N flex children would have to be counted and re-counted.
 *
 * Geometry off references/06.png: the dot bands run 98→550 and 688→1140, so the
 * field is 1042 wide starting at x=98 — narrower and more inset than the text
 * column above it, which is what stops 50 small marks reading as clutter. Rows
 * measure a ~78px pitch.
 */
export interface LogoWallGroup {
  /** Uppercase label centred in the dotted leader, e.g. 'CUSTOMERS'. */
  label?: string
  /** Aliases or filenames from src/assets/partners — see `logo()`. */
  logos?: string[]
  /** Overrides the wall's column count for this group alone. */
  columns?: number
  /** A pre-composed wall supplied as ONE transparent image, e.g.
   *  'logos/customers-wall'.
   *
   *  Both routes exist because they answer different needs. The reference wall
   *  carries 26 customer and 22 event marks, laid out and optically sized by
   *  hand — a composite reproduces that exactly and completely, which the
   *  individual-logo path cannot while marks are still missing. But a composite
   *  cannot reflow, so a NEW deck with a different customer list wants `logos`.
   *
   *  Set one or the other. `wall` wins if both are given. */
  wall?: string
}

export interface LogoWallProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  groups?: LogoWallGroup[]
  /** Marks per row, applied to any group that does not set its own. */
  columns?: number

  /** Top of the logo field. 262 on the reference — below a 3-line lead. */
  top?: number
  /** Left edge of the field. */
  left?: number
  /** Field width. 1042 = the measured 98→1140. */
  width?: number
  /** Space between the two groups. 138 on the reference. */
  gap?: number
  /** Row height inside a group. */
  rowHeight?: number
  /** Cap on each mark, so a wide wordmark and a square badge match optically. */
  logoMaxHeight?: number
}

export function LogoWall({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1120,
  groups = [],
  columns = 6,
  top = 262,
  left = 98,
  width = 1042,
  gap = 138,
  rowHeight = 78,
  logoMaxHeight = 46,
  ...chrome
}: LogoWallProps) {
  const wellStyle: CSSProperties = { left, top, width, gap }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.well} style={wellStyle}>
        {groups.map((group, i) => (
          <div key={i} className={styles.group}>
            {group.label && (
              <div className={styles.label}>
                <span className={styles.leader} />
                <span className={`${styles.labelText} ds-text-eyebrow`}>{group.label}</span>
                <span className={styles.leader} />
              </div>
            )}
            {group.wall ? (
              // A pre-composed wall. Width-constrained only, so its own
              // internal spacing and optical sizing survive — re-fitting it to a
              // row height would undo the hand-balancing that makes 26 marks of
              // wildly different aspect ratios read evenly.
              <img src={img(group.wall)} alt={group.label ?? ''} className={styles.wallImage} />
            ) : (
              <LogoGrid
                logos={group.logos ?? []}
                columns={group.columns ?? columns}
                rowHeight={rowHeight}
                maxHeight={logoMaxHeight}
              />
            )}
          </div>
        ))}
      </div>
    </SlideFrame>
  )
}
