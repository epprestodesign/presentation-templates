import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { CardSurface, RichText, SlideChromeSpec, StatSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { StatCard } from '../elements/data/StatCard'
import { typeClass } from '../lib/typeClass'
import styles from './StatGrid.module.css'

/**
 * Template — Stat Grid.
 *
 * Headline block up top, a row of KPI tiles across the floor of the slide.
 * Covers the traction slide (3 tiles), revenue durability (6 tiles in two
 * rows, mixing muted and brand fills) and the company snapshot (4 tiles).
 *
 * The tile row is a CSS grid inside an absolutely positioned well, so the
 * template takes a column count rather than coordinates — adding a fourth
 * tile re-flows the row instead of needing new numbers.
 */
export interface StatGridProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number
  /** Secondary label above the tiles, e.g. '2026 Estimated Forecast'. */
  sublabel?: string
  sublabelWidth?: number
  /** The traction slide sets this to h2 so the label wraps to two lines. */
  sublabelSize?: TypeStep
  /** Labels sitting above GROUPS of tiles, each spanning `span` columns —
   *  "Q3 2024 Results" over two tiles, "Sales Pipeline" over the next two.
   *  A group label is not the same thing as `sublabel`: it names a subset of
   *  the row, so it has to align to that subset's columns rather than to the
   *  page margin. Spans use the same grid as the tiles, so they stay aligned
   *  when the column count changes. */
  groups?: { label: string; span: number }[]
  groupsSize?: TypeStep

  cards?: StatSpec[]
  columns?: number
  /** Top edge of the tile well. */
  top?: number
  /** Height of the well. Two-row grids should raise this. */
  height?: number
  gap?: number
  /** Left inset. Defaults to the page margin; a few reference slides run
   *  their tiles wider than the text column, so this is exposed. */
  inset?: number
  /** Right inset. Defaults to the watermark gutter when the watermark shows,
   *  so the row never runs under the wordmark. */
  insetRight?: number
  /** Pins the row to an explicit width instead of filling to `insetRight`. */
  wellWidth?: number
  /** Fill applied to any tile that does not name its own `surface`. */
  surface?: CardSurface
}

export function StatGrid({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1000,
  sublabel,
  sublabelWidth = 300,
  sublabelSize = 'h3',
  groups,
  groupsSize = 'h3',
  cards = [],
  columns = 3,
  top = 360,
  height = 317,
  gap = 16,
  inset = grid.marginX,
  insetRight,
  wellWidth,
  surface = 'muted',
  ...chrome
}: StatGridProps) {
  const wellStyle: CSSProperties = {
    left: inset,
    top,
    height,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap,
    ...(wellWidth
      ? { width: wellWidth }
      : { right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter) }),
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      {sublabel && (
        <div
          className={`${styles.sublabel} ${typeClass(sublabelSize)}`}
          style={{ width: sublabelWidth }}
        >
          {sublabel}
        </div>
      )}

      {groups && groups.length > 0 && (
        <div
          className={styles.groups}
          style={{
            ...wellStyle,
            height: undefined,
            top: top - 76,
            gridTemplateColumns: groups.map((g) => `${g.span}fr`).join(' '),
          }}
        >
          {groups.map((group, i) => (
            <div key={i} className={typeClass(groupsSize)}>
              {group.label}
            </div>
          ))}
        </div>
      )}

      <div className={styles.well} style={wellStyle}>
        {cards.map((card, i) => (
          <StatCard key={i} {...card} surface={card.surface ?? surface} />
        ))}
      </div>
    </SlideFrame>
  )
}
