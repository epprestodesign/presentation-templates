import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { StaticGrid } from '../elements/data/StaticGrid'
import styles from './DataGridSlide.module.css'

/**
 * Template — Data Grid.
 *
 * A headline block over a real MUI X Data Grid, stripped of every interactive
 * affordance by `StaticGrid`. This is how a product screen gets onto a slide
 * without anyone rebuilding the table by hand or pasting a screenshot that goes
 * stale the next time the UI changes.
 *
 * WHEN TO USE THIS RATHER THAN TintTable / FinancialTable:
 *
 *   This one, when the point is *the software* — "here is what an ops manager
 *   sees". It should look like PipeSights, column chrome and all.
 *
 *   TintTable or FinancialTable, when the point is *the data*. Those are built
 *   from the deck's own table element, which the PowerPoint exporter emits as a
 *   NATIVE, editable Google Slides table. This template cannot do that: the Data
 *   Grid is a live React component with no table semantics the emitter can walk,
 *   so it exports as a flat picture. That is the right trade for a screenshot of
 *   a product and the wrong one for a financial model somebody will want to edit
 *   in Slides.
 *
 * The grid is anchored by its top edge and left at auto height, like the other
 * table templates — row count drives the height, so `maxRows` is how an author
 * keeps it on the artboard.
 */
export interface DataGridSlideProps<R extends GridValidRowModel = GridValidRowModel>
  extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  lead?: RichText
  titleWidth?: number

  rows: R[]
  columns: GridColDef<R>[]
  /** Rows to show before the "+N more" note.
   *
   *  Defaults to whatever FITS — see `rowsThatFit` below. Pass a number to show
   *  fewer; passing more than fits will run the grid off the bottom of the
   *  artboard, which nothing here prevents, because a deliberate overflow is
   *  occasionally what an author wants for a cropped-screen look. */
  maxRows?: number
  density?: 'compact' | 'standard' | 'comfortable'
  zebra?: boolean
  gridVariant?: 'product' | 'slide'

  /** Small note under the grid — a source line, or what the screen is. */
  caption?: string
  /** Top edge of the grid. */
  gridTop?: number
}

/** Header and row heights in slide px, MEASURED off the rendered grid at each
 *  density rather than taken from MUI's docs — the numbers there are the row
 *  content height, not the laid-out height including borders.
 *
 *  If MUI's density metrics change in a future major, these go stale silently:
 *  the grid would simply overflow the artboard again. Re-measure by rendering
 *  `Data Grid/Static` at each density and reading the bounding boxes of
 *  `.MuiDataGrid-columnHeaders` and `.MuiDataGrid-row`. */
const DENSITY_METRICS = {
  compact: { header: 40, row: 36 },
  standard: { header: 57, row: 52 },
  comfortable: { header: 73, row: 67 },
} as const

/** How many rows clear the bottom margin.
 *
 *  A fixed default cannot work here. The grid runs at auto height, so its extent
 *  is row count x row height — and row height triples between compact and
 *  comfortable. A default of 8 fits comfortably at compact and overruns the
 *  artboard by two rows at standard, which is exactly the bug this replaces. */
function rowsThatFit(
  density: keyof typeof DENSITY_METRICS,
  gridTop: number,
  hasCaption: boolean,
) {
  const { header, row } = DENSITY_METRICS[density]
  // 34px is the caption's own line plus its 12px top margin.
  const available = 720 - 40 - gridTop - header - (hasCaption ? 34 : 0)
  return Math.max(1, Math.floor(available / row))
}

export function DataGridSlide<R extends GridValidRowModel = GridValidRowModel>({
  fit = 'contain',
  title,
  titleSize = 'h1',
  lead,
  titleWidth = 860,
  rows,
  columns,
  maxRows,
  density = 'standard',
  zebra = false,
  gridVariant = 'product',
  caption,
  gridTop = grid.bodyY,
  ...chrome
}: DataGridSlideProps<R>) {
  // Stop short of the watermark, or the grid's right edge runs under it.
  const right = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const width = 1280 - grid.marginX - right

  const shown = maxRows ?? rowsThatFit(density, gridTop, Boolean(caption))

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading title={title} size={titleSize} lead={lead} width={titleWidth} />
      )}

      <div className={styles.well} style={{ left: grid.marginX, top: gridTop, width }}>
        <StaticGrid
          rows={rows}
          columns={columns}
          maxRows={shown}
          density={density}
          zebra={zebra}
          variant={gridVariant}
        />
        {caption && <div className={`${styles.caption} ds-text-caption`}>{caption}</div>}
      </div>
    </SlideFrame>
  )
}
