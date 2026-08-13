import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import styles from './StaticGrid.module.css'

/**
 * StaticGrid — MUI X Data Grid with every interactive affordance removed, so a
 * product screen can be put on a slide.
 *
 * The Data Grid is a great way to render a realistic PipeSights table without
 * hand-building one, but out of the box it is the wrong THING for a slide: it
 * paginates ("1–10 of 60" under a static image is a broken promise), it sorts on
 * click, it shows a column menu on hover, and it draws a focus ring on the first
 * cell. A slide is a photograph of a screen, not the screen.
 *
 * Two settings here are load-bearing rather than cosmetic:
 *
 *   `disableVirtualization` — the grid normally renders only the rows in view
 *      and recycles the rest on scroll. Both export paths rasterise the slide in
 *      headless Chromium, where nothing ever scrolls, so a virtualised grid
 *      exports with blank space where its off-screen rows should be. This is the
 *      single most important prop on this component.
 *
 *   `autoHeight` — sizes the grid to its rows instead of to a viewport, which
 *      removes the internal scroller. With a scroller, any row past the fold is
 *      simply absent from the export even with virtualisation off.
 *
 * Row count is therefore the author's problem, not the component's: pass a slice
 * that fits. `maxRows` makes that explicit and adds the "+N more" line, because
 * a table that just stops looks like a bug, whereas one that says how much it
 * left out reads as a deliberate excerpt.
 */
export interface StaticGridProps<R extends GridValidRowModel = GridValidRowModel> {
  rows: R[]
  columns: GridColDef<R>[]
  /** Truncate to this many rows and note the remainder beneath. */
  maxRows?: number
  density?: 'compact' | 'standard' | 'comfortable'
  /** Alternating row fill. Off by default — it reads as product UI, and on a
   *  slide the tinted rows can fight the brand. */
  zebra?: boolean
  /** 'product' keeps the light UI chrome of a real screen. 'slide' drops the
   *  outer border and puts the header on the brand navy, for a table that is
   *  the subject of the slide rather than a screenshot of one. */
  variant?: 'product' | 'slide'
  className?: string
  style?: React.CSSProperties
}

export function StaticGrid<R extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  maxRows,
  density = 'standard',
  zebra = false,
  variant = 'product',
  className,
  style,
}: StaticGridProps<R>) {
  const shown = maxRows ? rows.slice(0, maxRows) : rows
  const hidden = rows.length - shown.length

  return (
    <div
      className={[styles.wrap, styles[variant], zebra ? styles.zebra : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      /* The whole grid is inert. Not merely visual: without this a reviewer can
         still tab into a cell and move the focus ring around a "static" slide. */
      aria-readonly="true"
    >
      <DataGrid
        rows={shown}
        columns={columns}
        density={density}
        autoHeight
        disableVirtualization
        hideFooter
        rowSelection={false}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSorting
        disableColumnFilter
        disableColumnSelector
        disableColumnResize
        disableDensitySelector
        disableAutosize
        /* No `disableColumnReorder`: column reordering is a Pro feature, so the
           Community grid has neither the behaviour nor the prop to turn it off.
           `showToolbar` is deliberately absent too — a toolbar is entirely
           interactive and has no meaning on a slide. */
      />
      {hidden > 0 && (
        <div className={`${styles.more} ds-text-caption`}>
          +{hidden} more {hidden === 1 ? 'row' : 'rows'} not shown
        </div>
      )}
    </div>
  )
}
