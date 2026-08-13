import type { CSSProperties, ReactNode } from 'react'
import { grid } from '../tokens/tokens.js'
import type { CardSurface, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './ColumnGrid.module.css'

/**
 * Template — Column Grid.
 *
 * The general N-across data row: headline block up top, then 2–5 equal cells
 * each carrying a label, a figure, an optional glyph and one supporting line.
 *
 * It exists alongside StatGrid rather than inside it because the two answer
 * different questions. StatGrid is a row of KPI *tiles* whose count happens to
 * vary; this one is the deck's general column device, so the column count is
 * the primary decision and everything else — type step, padding, gutter —
 * follows from it. Wiring that dependency into StatGrid would have meant either
 * changing its existing slides' metrics or bolting a second sizing mode onto a
 * template that currently has none.
 *
 * Two things are load-bearing:
 *
 *  - **Density steps with the column count.** A cell is 567px wide at 2 columns
 *    and 221px at 5. Holding `stat` (68px) across that range puts a five-glyph
 *    figure past the cell's inner width at 5-up, and a 22px label wraps to three
 *    lines. So `DENSITY` maps the count to a type/padding/gutter set, and a
 *    story only overrides it when a specific slide needs to.
 *  - **Cells are exactly equal.** Track sizing is `minmax(0, 1fr)`, never a bare
 *    `1fr`. A bare `1fr` is `minmax(auto, 1fr)`, so a single long value grows
 *    its own track and the row silently stops being a grid of equal columns —
 *    which is the unequal-card defect this repo has reported twice.
 */

/** The counts the density table covers. Typed rather than `number` so a story
 *  asking for 6 fails at compile time instead of silently falling back. */
export type ColumnCount = 2 | 3 | 4 | 5

export interface ColumnCellSpec {
  /** The metric's name. Accepts '\n' for an explicit break. */
  label?: string
  /** Pre-formatted figure — '$4.1M', '92%', '1.31x'. A string, so the deck owns
   *  rounding and currency rather than a formatter guessing at render time. */
  value?: string
  /** Material Symbols glyph above the stack. */
  icon?: string
  /** One qualifying line under the figure — the unit, the basis, the period. */
  note?: string
  /** Overrides the row's fill for this cell alone. */
  surface?: CardSurface
}

export interface ColumnGridProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number
  /** Label sitting above the row, e.g. 'FY26 plan'. */
  sublabel?: string

  cells?: ColumnCellSpec[]
  columns?: ColumnCount
  /** Fill for any cell that does not name its own. 'plain' drops the card and
   *  rules each column instead — see the module CSS. */
  surface?: CardSurface
  /** Figure above the label rather than below it. */
  order?: 'label-first' | 'value-first'
  /** Where the label/value stack sits inside the cell.
   *
   *  Only matters once `height` is set — at the default auto height the cell is
   *  exactly as tall as the tallest cell's content, so there is no slack to
   *  distribute. With a fixed height, 'bottom' puts the glyph at the top of the
   *  card and the figure on its floor; the cost is that it aligns the LAST line
   *  across the row, so a row whose notes run to different depths steps its
   *  figures. 'top' aligns the labels instead. */
  align?: 'top' | 'bottom'

  /** Vertical placement.
   *
   *  By default the row is pinned by its BOTTOM edge to the deck's content floor
   *  and grows upward to whatever its content needs. That is deliberate: this
   *  started with a fixed 324px well, and since the content of a stat cell is
   *  only ~150px tall, every card rendered with half its interior empty — a
   *  hollow box that read as a layout bug rather than as breathing room. Sizing
   *  to content while keeping the floor fixed holds the row on the same baseline
   *  as the rest of the deck without inventing the emptiness.
   *
   *  Pass `top` to anchor from above instead, or `height` to force a fixed well
   *  — a tall card IS right when the cell carries a paragraph rather than a
   *  figure, which is when `align` starts to matter. */
  top?: number
  /** Fixed row height. Auto by default — see `top`. */
  height?: number
  /** Gutter between cells. Defaults to the density set for `columns`. */
  gap?: number
  inset?: number
  /** Right inset. Defaults to the watermark gutter whenever the watermark
   *  shows, so the row never runs under the wordmark. */
  insetRight?: number

  /* Density escapes. Each defaults to the entry for `columns`. */
  valueSize?: TypeStep
  labelSize?: TypeStep
  noteSize?: TypeStep
  padding?: number
  iconSize?: number
}

/** The deck's content floor — the y the reference slides rest their bottom-most
 *  content on. 60px of clearance below it, which is the bottom margin plus the
 *  breathing room the watermark occupies on slides that show one. */
const CONTENT_FLOOR = 660

interface Density {
  value: TypeStep
  label: TypeStep
  note: TypeStep
  padding: number
  icon: number
  gap: number
  /** Gap inside the label/value/note stack. */
  stackGap: number
}

/** Sized against the real cell widths this template produces on a full-width
 *  well (40 → 1195): 567px at 2-up, 374 at 3, 277 at 4, 221 at 5. The step down
 *  at 5 is the one that matters — everything above it is comfortable. */
const DENSITY: Record<ColumnCount, Density> = {
  2: { value: 'stat', label: 'h3', note: 'body', padding: 32, icon: 44, gap: 20, stackGap: 10 },
  3: { value: 'statSm', label: 'h4', note: 'bodySm', padding: 26, icon: 38, gap: 16, stackGap: 8 },
  4: { value: 'statSm', label: 'h4', note: 'bodySm', padding: 22, icon: 34, gap: 16, stackGap: 6 },
  5: { value: 'statMd', label: 'body', note: 'caption', padding: 16, icon: 26, gap: 12, stackGap: 4 },
}

export function ColumnGrid({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1000,
  sublabel,
  cells = [],
  columns = 3,
  surface = 'muted',
  order = 'label-first',
  align = 'bottom',
  top,
  height,
  gap,
  inset = grid.marginX,
  insetRight,
  valueSize,
  labelSize,
  noteSize,
  padding,
  iconSize,
  ...chrome
}: ColumnGridProps) {
  const density = DENSITY[columns]

  const step = {
    value: valueSize ?? density.value,
    label: labelSize ?? density.label,
    note: noteSize ?? density.note,
    padding: padding ?? density.padding,
    icon: iconSize ?? density.icon,
  }

  /* The stack owns the placement; the well owns the columns. `bottom` and `top`
     are mutually exclusive here — setting both on an absolutely positioned
     element with no height would stretch the row back to a fixed well, which is
     the hollow-card bug this replaces. */
  const stackStyle: CSSProperties = {
    left: inset,
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
    ...(top === undefined ? { bottom: 720 - CONTENT_FLOOR } : { top }),
  }

  const wellStyle: CSSProperties = {
    ...(height === undefined ? {} : { height }),
    // minmax(0, …) rather than 1fr — see the note at the top of this file.
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: gap ?? density.gap,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.stack} style={stackStyle}>
      {sublabel && (
        <div className={`${styles.sublabel} ds-text-eyebrow ds-text-subtle`}>
          {sublabel}
        </div>
      )}

      <div className={styles.well} style={wellStyle}>
        {cells.map((cell, i) => {
          const fill = cell.surface ?? surface
          const onBrand = fill === 'brand' || fill === 'brandAlt'
          // 'plain' is the ruled variant: no card, so horizontal padding would
          // push the first column off the text margin the headline sits on.
          const ruled = fill === 'plain'

          const labelNode = cell.label ? (
            <div
              key="label"
              className={[typeClass(step.label), onBrand ? 'ds-text-on-brand' : ''].filter(Boolean).join(' ')}
            >
              {cell.label}
            </div>
          ) : null

          const valueNode = cell.value ? (
            <div
              key="value"
              className={[typeClass(step.value), onBrand ? 'ds-text-on-brand' : 'ds-text-accent-deep'].join(' ')}
            >
              {cell.value}
            </div>
          ) : null

          // Visual order IS DOM order here. StatCard flips its pair with
          // `column-reverse` to keep the label first for assistive tech, but its
          // label is a heading; these are plain divs carrying no structure, so
          // the reversal would buy nothing and adds a rule that only reads
          // correctly in CSS.
          const stack: ReactNode[] =
            order === 'value-first' ? [valueNode, labelNode] : [labelNode, valueNode]

          const padTop = ruled ? Math.round(step.padding * 0.55) : step.padding
          const padX = ruled ? 0 : step.padding

          return (
            <div
              key={i}
              className={[styles.cell, styles[fill]].filter(Boolean).join(' ')}
              style={{
                padding: `${padTop}px ${padX}px ${ruled ? 0 : step.padding}px`,
                justifyContent: align === 'bottom' ? 'flex-end' : 'flex-start',
                // The corner glyph reads these so it stays inset with the cell
                // whatever the density set does to padding.
                ['--cg-pad-top' as string]: `${padTop}px`,
                ['--cg-pad-x' as string]: `${padX}px`,
              }}
            >
              {cell.icon && (
                <Icon
                  name={cell.icon}
                  size={step.icon}
                  weight={400}
                  className={styles.icon}
                  color={onBrand ? 'var(--slide-color-text-on-brand)' : 'var(--slide-color-accent)'}
                />
              )}

              <div
                className={styles.body}
                style={{
                  gap: density.stackGap,
                  // Pushes the stack to the cell floor without a spacer div, so
                  // every cell keeps the same child count and the same height.
                  ...(align === 'bottom' ? { marginTop: 'auto' } : {}),
                  // Top-aligned, the stack shares its first line with the corner
                  // glyph, so it has to give the glyph its width back. Bottom-
                  // aligned there is no overlap and the label keeps the full
                  // measure.
                  ...(align === 'top' && cell.icon ? { paddingRight: step.icon + 12 } : {}),
                }}
              >
                {stack}
                {cell.note && (
                  <div
                    className={[
                      styles.note,
                      typeClass(step.note),
                      onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-cool',
                    ].join(' ')}
                  >
                    {cell.note}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </div>
    </SlideFrame>
  )
}
