import type { CSSProperties } from 'react'
import { radius } from '../../tokens/tokens.js'
import type { RichText } from '../../types'
import { AccentText } from '../text/AccentText'
import styles from './FinancialGrid.module.css'

/**
 * FinancialGrid — the model table.
 *
 * Three bands, top to bottom: a teal column header, a highlighted #f5f5f5
 * summary block holding the one or two lines the audience is meant to read,
 * then quiet grey detail rows that back them up. Every figure is
 * right-aligned on its column so the digits stack.
 *
 * Why this is not the shared DataTable's 'financial' variant: DataTable is one
 * flat run of rows, and the whole point of this slide is that two of its rows
 * sit inside a filled block that bleeds outside the text column and is cut by
 * a white channel before the variance group. That is a different geometry, not
 * a different skin, and bolting it onto DataTable would put a summary-block
 * concept into a component four other templates already depend on.
 *
 * Built from divs rather than a <table>, for the same reason DataTable is:
 * a slide table is fixed geometry in slide px, and CSS grid gives exact
 * control over it. ARIA roles keep the markup readable as a table.
 *
 * Geometry is measured off references/slide-decks/345.png at 2x; see the
 * default values on each prop.
 */

/** How a numeric cell is rendered. Negatives always come out in parentheses —
 *  the accounting convention the reference follows, and the one thing in a
 *  90-cell table you do not want 90 hand-typed chances to get wrong. */
export type FinancialFormat = 'number' | 'currency' | 'percent'

/** A cell value. A number is formatted by the component; a string is printed
 *  verbatim (for anything the formatter should not be guessing at); null is
 *  the "no figure" dash. */
export type FinancialValue = number | string | null

export interface FinancialRowSpec {
  label: RichText
  /** One entry per column after the label. */
  cells: FinancialValue[]
  /** Format for this row's numbers. Revenue lines are 'currency', unit counts
   *  are 'number'. A column-level override still wins — see `columnFormats`. */
  format?: FinancialFormat
}

/** The dash the reference prints where a product had no revenue in a period.
 *  An en dash, not a hyphen: it is a "nothing here" mark, not punctuation. */
const NO_FIGURE = '–'

/** Thousands separators without Intl.NumberFormat.
 *
 *  The exporter rasterises slides in headless Chromium and the PPTX emitter
 *  runs in Node; both can be built with a trimmed ICU, where a locale-aware
 *  formatter silently falls back and "1,440" comes out "1440". A slide figure
 *  must render identically on every machine, so the grouping is done here. */
function group(value: number): string {
  const [whole, fraction] = String(Math.abs(value)).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fraction ? `${grouped}.${fraction}` : grouped
}

function formatCell(value: FinancialValue, format: FinancialFormat): string {
  if (value === null || value === undefined) return NO_FIGURE
  if (typeof value === 'string') return value

  const magnitude = group(value)
  const body =
    format === 'currency' ? `$${magnitude}` : format === 'percent' ? `${magnitude}%` : magnitude
  // The sign lives in the parentheses, never in a leading minus, and the
  // currency mark stays inside them: ($32), not -$32 or $(32).
  return value < 0 ? `(${body})` : body
}

export interface FinancialGridProps {
  /** `headers[0]` captions the label column; the rest name the periods. */
  headers: string[]
  /** Rows drawn inside the highlighted summary block. */
  summaryRows?: FinancialRowSpec[]
  /** Detail rows below it. */
  rows?: FinancialRowSpec[]
  /** Per-column format override, aligned to the columns after the label.
   *  `null` defers to the row's own format. The reference's last column is a
   *  variance percentage on every row, whatever that row's figures are. */
  columnFormats?: (FinancialFormat | null)[]

  /** Overall width in slide px. Column maths needs the number, so it is a
   *  prop rather than a CSS width. */
  width: number
  /** Width of each period column. Equal by default: a model's columns are one
   *  period each, and unequal ones read as a mistake. */
  columnWidth?: number
  /** Label column width. Defaults to whatever the period columns leave. */
  labelWidth?: number
  /** Number of columns before the variance group — 6 on the reference, where
   *  2024A…2025B are followed by B/(W) $ and B/(W) %. Omit for a table with
   *  no variance group. */
  groupAfter?: number
  /** Width of the white channel that opens before the variance group. */
  groupGap?: number

  headerHeight?: number
  /** Gap between the header row and the summary block. */
  headerGap?: number
  summaryRowHeight?: number
  /** Vertical padding inside the summary block. */
  summaryPadY?: number
  /** Gap between the summary block and the first detail row. */
  summaryGap?: number
  rowHeight?: number
  /** How far the summary block bleeds outside the text column, each side. */
  panelBleed?: number

  className?: string
  style?: CSSProperties
}

export function FinancialGrid({
  headers,
  summaryRows = [],
  rows = [],
  columnFormats,
  width,
  columnWidth = 113,
  labelWidth,
  groupAfter,
  groupGap = 17,
  headerHeight = 34,
  headerGap = 12,
  summaryRowHeight = 33,
  summaryPadY = 12,
  summaryGap = 2,
  rowHeight = 30,
  panelBleed = 20,
  className,
  style,
}: FinancialGridProps) {
  const columnCount = headers.length - 1
  const grouped = groupAfter !== undefined && groupAfter > 0 && groupAfter < columnCount
  const gap = grouped ? groupGap : 0

  // The label column takes the remainder, so a table keeps its right edge on
  // the grid whatever its column count is.
  const labelCol = labelWidth ?? width - columnCount * columnWidth - gap

  // The channel is carried as extra width on the variance group's first
  // column rather than as a spacer column, so every row still maps 1:1 over
  // its cells and no row has to know the group exists.
  const template = [
    `${labelCol}px`,
    ...Array.from({ length: columnCount }, (_, i) =>
      i === groupAfter ? `${columnWidth + gap}px` : `${columnWidth}px`,
    ),
  ].join(' ')

  /* The white channel sits flush against the variance group's first column and
     runs half the channel's width — measured 965.5→974 on the reference, with
     the group's figures right-aligned to 1078. It is drawn as a white bar over
     the block rather than as two blocks, so the block stays one rect and only
     its outer corners round. */
  const channelRight = labelCol + (groupAfter ?? 0) * columnWidth + gap

  /* Summary rows are set in h4 and black; detail rows in body and the deck's
     subtle grey (measured #808080 on the reference). The step difference is
     what does the work — the block's fill only reinforces it. */
  const renderRow = (row: FinancialRowSpec, key: number, height: number, kind: 'summary' | 'detail') => {
    const text = kind === 'summary' ? 'ds-text-h4' : 'ds-text-body ds-text-subtle'
    const rowClass = kind === 'summary' ? ` ${styles.summaryRow}` : ''
    return (
      <div key={key} className={`${styles.row}${rowClass}`} style={{ height }} role="row">
        <div className={`${styles.cell} ${styles.labelCell} ${text}`} role="rowheader">
          <AccentText as="span" content={row.label} />
        </div>
        {Array.from({ length: columnCount }, (_, i) => (
          <div key={i} className={`${styles.cell} ${text}`} role="cell">
            {formatCell(row.cells[i] ?? null, columnFormats?.[i] ?? row.format ?? 'number')}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={[styles.table, className].filter(Boolean).join(' ')}
      style={{ ...style, width, ['--fin-columns' as string]: template }}
      role="table"
    >
      <div className={styles.headerRow} style={{ height: headerHeight, marginBottom: headerGap }} role="row">
        <div className={`${styles.cell} ${styles.labelCell} ${styles.headerLabel} ds-text-body ds-text-subtle`}>
          {headers[0]}
        </div>
        {headers.slice(1).map((header, i) => (
          <div key={i} className={`${styles.cell} ${styles.headerCell} ds-text-h4 ds-text-accent`} role="columnheader">
            {header}
          </div>
        ))}
      </div>

      {summaryRows.length > 0 && (
        <div className={styles.block} style={{ padding: `${summaryPadY}px 0`, marginBottom: summaryGap }}>
          <div
            className={styles.panel}
            style={{ left: -panelBleed, right: -panelBleed, borderRadius: radius.panel }}
          />
          {grouped && (
            <div className={styles.channel} style={{ left: channelRight - gap / 2, width: gap / 2 }} />
          )}
          {summaryRows.map((row, i) => renderRow(row, i, summaryRowHeight, 'summary'))}
        </div>
      )}

      {rows.map((row, i) => renderRow(row, i, rowHeight, 'detail'))}
    </div>
  )
}
