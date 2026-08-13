import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import {
  FinancialGrid,
  type FinancialFormat,
  type FinancialRowSpec,
} from '../elements/data/FinancialGrid'

/**
 * Template — Financial Table.
 *
 * Headline block, a lead that says what the numbers mean, then the model
 * table: teal period headings, a highlighted summary block carrying the two
 * lines the audience should leave with, and grey detail rows underneath.
 *
 * The one deliberately dense layout in the deck. Everything else here is built
 * to be read from the back of the room; this one is built to be read by
 * somebody who came to check the arithmetic, which is why it is the only
 * template that drops to body size and puts nine columns on a slide.
 *
 * Rebuilt from references/slide-decks/345.png.
 */
export interface FinancialTableProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  lead?: RichText
  titleWidth?: number

  /** `headers[0]` captions the label column — the reference uses it for the
   *  unit note, "Figures in thousands (USD $000s)". */
  headers: string[]
  /** Rows inside the highlighted block: bookings and total revenue. */
  summaryRows?: FinancialRowSpec[]
  /** The product lines that add up to them. */
  rows?: FinancialRowSpec[]
  columnFormats?: (FinancialFormat | null)[]

  columnWidth?: number
  labelWidth?: number
  groupAfter?: number
  /** Top edge of the header row. Below the deck's `bodyY` anchor, because a
   *  nine-column table needs a four-line lead to be worth reading. */
  tableTop?: number
}

export function FinancialTable({
  fit = 'contain',
  title,
  titleSize = 'h1',
  lead,
  titleWidth = 1000,
  headers,
  summaryRows,
  rows,
  columnFormats,
  columnWidth = 113,
  labelWidth,
  groupAfter = 6,
  tableTop = 288,
  ...chrome
}: FinancialTableProps) {
  // A full-width well on a watermarked slide stops at the watermark gutter, or
  // its right-hand column runs under the wordmark.
  //
  // The summary block's fill bleeds ~20px outside that on both sides, which is
  // measured off the reference and safe here for a reason worth writing down:
  // the wordmark's ink starts at x=1224 and y=531, and the block sits in the
  // 334–424 band. Only the *columns* have to respect the gutter.
  const right = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const width = 1280 - grid.marginX - right

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} size={titleSize} lead={lead} width={titleWidth} />
      )}

      <FinancialGrid
        headers={headers}
        summaryRows={summaryRows}
        rows={rows}
        columnFormats={columnFormats}
        width={width}
        columnWidth={columnWidth}
        labelWidth={labelWidth}
        groupAfter={groupAfter}
        style={{ left: grid.marginX, top: tableTop }}
      />
    </SlideFrame>
  )
}
