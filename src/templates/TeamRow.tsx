import type { CSSProperties } from 'react'
import { grid, radius } from '../tokens/tokens.js'
import type { PersonSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { PersonCard } from '../elements/media/PersonCard'
import styles from './TeamRow.module.css'

/**
 * Template — Team Row.
 *
 * The leadership slide: headline, then one muted panel holding a row of people,
 * each a rounded-square headshot over name, role and a strip of prior-employer
 * marks.
 *
 * The row is a CSS grid inside the panel, so `columns` re-flows it rather than
 * needing new coordinates — five founders or seven, the panel and the gaps
 * stay measured.
 *
 * Geometry is straight off scripts/detect-images.mjs on references/15.png and
 * it is unusually self-confirming. Measured headshot lefts are 72, 265, 458,
 * 651, 844, 1037 — a 193px pitch. A panel from the 40px margin to the 85px
 * watermark gutter, inset 32, gives 1091px of track; six columns with a 67px
 * gap makes each column 126 wide, so pitch = 126 + 67 = 193 and the last
 * column's right edge lands on 1163, which is exactly the panel's inner edge.
 * The original panel actually runs 5px further right (to 1200, under the
 * watermark's clear zone); stopping at the gutter is the deck's rule and the
 * columns fit it exactly.
 */
export interface TeamRowProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  people?: PersonSpec[]
  columns?: number

  /** Top edge of the muted panel. 218 on the reference. */
  top?: number
  /** Bottom edge. Defaults to the page's bottom margin, which is where every
   *  full-height panel in the deck lands. */
  bottom?: number
  inset?: number
  /** Right inset. Defaults to the watermark gutter so the panel never runs
   *  under the wordmark. */
  insetRight?: number
  /** Panel padding. 32 is the measured value and the one the columns fit. */
  padding?: number
  /** Space between columns. See the note above on why this is 67. */
  gap?: number

  photoSize?: number
  nameSize?: TypeStep
  roleSize?: TypeStep
  /** Reserved heights for the name and role blocks, so every column's
   *  prior-employer strip starts on the same line however each person's copy
   *  wraps. Defaults are two lines of h3 (55) and three lines of bodySm (58) —
   *  three because Poppins runs wider than the face the original used and
   *  'Chief Technology Officer & Co-founder' takes a third line here that it does
   *  not take there. Reserving the worst case keeps the strips aligned; letting
   *  the blocks grow would drop one column's logos 20px below its neighbours. */
  nameHeight?: number
  roleHeight?: number
  /** Gap between the role block and the logo strip. 12 rather than the
   *  element's default 18: with the worst-case role height reserved above, 18
   *  pushed a four-mark strip 6px past the panel's bottom padding. */
  trailingGap?: number
  /** Prior-employer strip: row height and the cap on each mark. Measured row
   *  pitch is 36; marks in the original run 17–21 tall. */
  logoRowHeight?: number
  logoMaxHeight?: number
}

export function TeamRow({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1100,
  people = [],
  columns = 6,
  top = 218,
  bottom = grid.marginBottom,
  inset = grid.marginX,
  insetRight,
  padding = 32,
  gap = 67,
  photoSize = 108,
  nameSize = 'h3',
  roleSize = 'bodySm',
  nameHeight = 55,
  roleHeight = 58,
  trailingGap = 12,
  logoRowHeight = 36,
  logoMaxHeight = 19,
  ...chrome
}: TeamRowProps) {
  const panelStyle: CSSProperties = {
    left: inset,
    top,
    bottom,
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
    padding,
    borderRadius: radius.panel,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.panel} style={panelStyle}>
        <div
          className={styles.row}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, columnGap: gap }}
        >
          {people.map((person, i) => (
            <PersonCard
              key={i}
              {...person}
              layout="stack"
              shape={person.shape ?? 'rounded'}
              photoSize={photoSize}
              nameSize={nameSize}
              roleSize={roleSize}
              nameHeight={nameHeight}
              roleHeight={roleHeight}
              trailingGap={trailingGap}
              logoRowHeight={logoRowHeight}
              logoMaxHeight={logoMaxHeight}
            />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}
