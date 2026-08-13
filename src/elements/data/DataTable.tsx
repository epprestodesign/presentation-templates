import type { CSSProperties } from 'react'
import { tableTint } from '../../tokens/tokens.js'
import type { TableCell, TableRowSpec } from '../../types'
import { AccentText } from '../text/AccentText'
import styles from './DataTable.module.css'

/**
 * DataTable — the two table treatments in the deck.
 *
 * 'tint' is the integration-deck table: a pure black header, then rows filled
 * from a measured 5-step cyan ramp, lightest last. The tint comes from the
 * row's index rather than from the row's data, so a row never names its own
 * colour and reordering rows keeps the ramp intact.
 *
 * 'financial' is the model table: no fills, hairline rules between rows, and
 * an optional highlighted total row in the brand teal.
 *
 * Built from divs rather than a real <table> on purpose. A slide table is a
 * fixed-geometry layout, not tabular data being queried — CSS grid gives exact
 * control over column widths in slide px, and the PPTX emitter maps a grid to
 * `addTable` just as cleanly. Row/column semantics are preserved with ARIA
 * roles so the markup is still readable as a table.
 */
/** A cell is bulleted when it declares a `bullets` array. Narrowing lives in
 *  one place so the JSX stays readable. */
function isBulletCell(cell: TableCell): cell is { bullets: import('../../types').RichText[] } {
  return typeof cell === 'object' && cell !== null && !Array.isArray(cell) && 'bullets' in cell
}

export interface DataTableProps {
  headers?: string[]
  rows: TableRowSpec[]
  /** 'tint' cyan-ramped rows · 'financial' ruled rows */
  variant?: 'tint' | 'financial'
  /** Column widths in slide px. Omit to distribute evenly. */
  columnWidths?: number[]
  /** Index of a row to highlight as a total (financial variant). */
  totalRow?: number
  /** Minimum row height, so short rows keep the deck's rhythm. */
  minRowHeight?: number
  className?: string
  style?: CSSProperties
}

export function DataTable({
  headers,
  rows,
  variant = 'tint',
  columnWidths,
  totalRow,
  minRowHeight = 76,
  className,
  style,
}: DataTableProps) {
  const columnCount = headers?.length ?? (rows[0] ? rows[0].cells.length + 1 : 1)
  const template = columnWidths
    ? columnWidths.map((w) => `${w}px`).join(' ')
    : `repeat(${columnCount}, 1fr)`

  return (
    <div
      className={[styles.table, styles[variant], className].filter(Boolean).join(' ')}
      style={{ ...style, gridTemplateColumns: template }}
      role="table"
    >
      {headers && (
        <div className={styles.headerRow} role="row">
          {headers.map((header, i) => (
            <div key={i} className={`${styles.headerCell} ds-text-body-sm`} role="columnheader">
              {header}
            </div>
          ))}
        </div>
      )}

      {rows.map((row, ri) => {
        // Rows walk the ramp top-to-bottom; a table longer than the ramp
        // holds the lightest step rather than wrapping back to the darkest.
        const tint =
          variant === 'tint'
            ? tableTint.rows[Math.min(ri, tableTint.rows.length - 1)]
            : undefined

        return (
          <div
            key={ri}
            className={[
              styles.row,
              variant === 'financial' && ri === totalRow ? styles.totalRow : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ background: tint, minHeight: minRowHeight }}
            role="row"
          >
            <div className={`${styles.labelCell} ds-text-h4`} role="cell">
              <AccentText as="span" content={row.label} className={styles.label} />
            </div>

            {row.cells.map((cell, ci) => (
              <div key={ci} className={`${styles.cell} ds-text-body`} role="cell">
                {isBulletCell(cell) ? (
                  <ul className={styles.bullets}>
                    {cell.bullets.map((item, bi) => (
                      <li key={bi} className={styles.bullet}>
                        <AccentText as="span" content={item} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <AccentText as="span" content={cell} />
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

