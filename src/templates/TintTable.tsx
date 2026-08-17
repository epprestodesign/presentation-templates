import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TableRowSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { DataTable } from '../elements/data/DataTable'
import styles from './TintTable.module.css'

/**
 * Template — Tint Table.
 *
 * Headline block, then a full-width table with a black header and rows filled
 * from the measured cyan ramp. This is the integration deck's workhorse: five
 * of the reference slides are this one layout, differing only in column count
 * and row content.
 *
 * The table is left at auto height and anchored by its top edge rather than
 * being fitted to a fixed box, because row heights follow their copy. A row
 * floor (`minRowHeight`) keeps short rows on the deck's rhythm so a two-row
 * table still reads like the five-row one.
 */
export interface TintTableProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  /** How the rows are filled.
   *
   *  'tint' is the reference deck's own treatment — the measured cyan ramp,
   *  lightest last. It is emphatic, and it is meant to be: the integration
   *  slides it came from are the ones a reader is supposed to study.
   *
   *  'ruled' drops the fills for hairline rules on white. Use it when a deck has
   *  SEVERAL tables. Ten tinted tables in one presentation stop reading as
   *  emphasis and start reading as wallpaper — the ramp only means something if
   *  it is the exception. A long reference table is also easier to scan on white,
   *  because the row tint competes with the eye's own line-tracking. */
  variant?: 'tint' | 'ruled'

  title?: RichText
  titleSize?: TypeStep
  lead?: RichText
  titleWidth?: number

  /** Small tracked note between the lead and the table, as on the
   *  event-graphics slide ("THE ONLY REQUIRED GRAPHIC IS…"). */
  note?: string

  headers?: string[]
  rows?: TableRowSpec[]
  /** Column widths in slide px, including the label column. */
  columnWidths?: number[]
  minRowHeight?: number
  /** Top edge of the table. */
  tableTop?: number
}

export function TintTable({
  fit = 'contain',
  variant = 'tint',
  title,
  titleSize = 'h2',
  lead,
  titleWidth = 1000,
  note,
  headers,
  rows = [],
  columnWidths,
  minRowHeight = 76,
  tableTop = 254,
  ...chrome
}: TintTableProps) {
  // Stop short of the watermark, or the table's right edge runs under it.
  const right = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const width = 1280 - grid.marginX - right

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} size={titleSize} lead={lead} width={titleWidth} />
      )}

      {note && (
        <div className={`${styles.note} ds-text-eyebrow`} style={{ top: tableTop - 30 }}>
          {note}
        </div>
      )}

      <DataTable
        variant={variant === 'ruled' ? 'financial' : 'tint'}
        headers={headers}
        rows={rows}
        columnWidths={columnWidths}
        minRowHeight={minRowHeight}
        className={styles.table}
        style={{ left: grid.marginX, top: tableTop, width }}
      />
    </SlideFrame>
  )
}
