import type { CSSProperties } from 'react'
import { grid, radius } from '../tokens/tokens.js'
import type { PersonSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { PersonCard } from '../elements/media/PersonCard'
import styles from './TeamGrid.module.css'

/**
 * Template — Team Grid.
 *
 * The account-team slide: headline, a paragraph of framing, then a muted panel
 * holding a 2x2 grid of circular headshots, each beside a name, role and a row
 * of contact icons.
 *
 * Rows are FIXED height and the whole block is centred in the panel, rather
 * than the grid distributing to fill. Measured circle centres on
 * references/Slide-sdfknd.png are y=371 and y=556 inside a panel spanning
 * 244–680: a 185px pitch that is symmetric about the panel's own centre (462).
 * Two 185px rows centred in a 436px panel reproduce that to within 1.5px, and —
 * unlike `1fr` rows — a three-person team still gets the same generous row
 * rather than one stretched to half the slide.
 *
 * Column geometry is the same self-checking fit as TeamRow: panel from the 40px
 * margin to the 85px watermark gutter, inset 56, gives 1043px of track; two
 * columns with a 39px gap makes each 502 wide, so the second column starts at
 * 96 + 541 = 637 — exactly the measured left edge of the right-hand headshots.
 */
export interface TeamGridProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  people?: PersonSpec[]
  columns?: number

  /** Top edge of the muted panel. 244 on the reference — lower than the deck's
   *  usual body anchor because the lead paragraph runs to three lines. */
  top?: number
  bottom?: number
  inset?: number
  insetRight?: number
  /** Horizontal panel padding. 56 is the measured value the columns fit. */
  padding?: number
  /** Fixed row height. See the note above on why this is not `1fr`. */
  rowHeight?: number
  columnGap?: number

  photoSize?: number
  nameSize?: TypeStep
  roleSize?: TypeStep
  /** Gap between headshot and copy. */
  photoGap?: number
  contactSize?: number
}

export function TeamGrid({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1090,
  people = [],
  columns = 2,
  top = 244,
  bottom = grid.marginBottom,
  inset = grid.marginX,
  insetRight,
  padding = 56,
  rowHeight = 185,
  columnGap = 39,
  photoSize = 108,
  nameSize = 'h2',
  roleSize = 'body',
  photoGap = 23,
  contactSize = 21,
  ...chrome
}: TeamGridProps) {
  const panelStyle: CSSProperties = {
    left: inset,
    top,
    bottom,
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
    paddingLeft: padding,
    paddingRight: padding,
    borderRadius: radius.panel,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.panel} style={panelStyle}>
        <div
          className={styles.grid}
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: rowHeight,
            columnGap,
          }}
        >
          {people.map((person, i) => (
            <PersonCard
              key={i}
              {...person}
              layout="row"
              shape={person.shape ?? 'circle'}
              photoSize={photoSize}
              nameSize={nameSize}
              roleSize={roleSize}
              photoGap={photoGap}
              roleGap={6}
              trailingGap={18}
              contactSize={contactSize}
            />
          ))}
        </div>
      </div>
    </SlideFrame>
  )
}
