import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { CardSurface, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './KpiBoard.module.css'

/**
 * Template — KPI Board.
 *
 * The "state of the business" slide: one headline metric held large on the
 * brand gradient, with the supporting metrics tiled beside it, every tile
 * carrying a delta against plan.
 *
 * The hierarchy is the point. A row of six equal tiles says all six matter
 * equally, which is almost never what an operating review means — one number is
 * the story and the rest explain it. So the board is a large primary cell plus
 * a grid of secondaries rather than a uniform grid, and `primary` is its own
 * prop rather than the first entry in `tiles`, so the emphasis cannot be lost
 * by reordering an array.
 *
 * ## Deltas carry meaning, not decoration
 *
 * A delta reads green when it is *better than plan* and coral when it is worse,
 * from `color.positive` / `color.negative`. That is deliberately not the same
 * question as which way the arrow points: churn falling and bookings rising are
 * both good, and a template that colours by direction gets one of them wrong
 * every time. Hence `direction` (the arrow) and `intent` (the colour) are
 * separate fields, with intent defaulting to the common case — up is good.
 *
 * Coral rather than a true red is the token's own decision; see the note beside
 * `color.negative` in tokens.js.
 */

export interface KpiDeltaSpec {
  /** Pre-formatted, sign included — '+12.4%', '-180 bps', '2.1x'. */
  value: string
  /** Which way the arrow points. */
  direction?: 'up' | 'down' | 'flat'
  /** Whether that movement is good news. Defaults from `direction` — up is
   *  positive — which is right for most metrics and wrong for churn, cost and
   *  cycle time, so those state it. */
  intent?: 'positive' | 'negative' | 'neutral'
  /** What the delta is measured against, e.g. 'vs plan'. */
  label?: string
}

export interface KpiTileSpec {
  label?: string
  /** Pre-formatted figure. */
  value?: string
  /** One qualifying line under the figure. */
  note?: string
  icon?: string
  delta?: KpiDeltaSpec
  surface?: CardSurface
}

export interface KpiBoardProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  /** The headline metric. Rendered large, on the gradient by default. */
  primary?: KpiTileSpec
  /** The supporting metrics. */
  tiles?: KpiTileSpec[]
  /** Which side the large cell sits on. */
  primarySide?: 'left' | 'right'
  /** Width of the large cell, in slide px. */
  primaryWidth?: number
  /** Columns in the secondary grid. Rows come from the tile count. */
  secondaryColumns?: number

  primarySurface?: CardSurface
  /** Fill for any secondary tile that does not name its own. */
  surface?: CardSurface

  /** Top edge of the board. */
  top?: number
  /** Height of the board. */
  height?: number
  gap?: number
  inset?: number
  /** Right inset. Defaults to the watermark gutter whenever the watermark
   *  shows, so the board never runs under the wordmark. */
  insetRight?: number

  /** Basis line under the board — what "plan" means, as of when. Deltas are
   *  meaningless without it, so it sits on the slide rather than in the notes. */
  footnote?: string

  primaryValueSize?: TypeStep
  /** Figure size in the secondary tiles. Defaults from `secondaryColumns`. */
  tileValueSize?: TypeStep
}

/** Arrow per direction. One lookup so a tile never names a glyph and no two
 *  slides end up with different arrows for the same movement. */
const DELTA_ICON: Record<'up' | 'down' | 'flat', string> = {
  up: 'trending_up',
  down: 'trending_down',
  flat: 'trending_flat',
}

function deltaIntent(delta: KpiDeltaSpec): 'positive' | 'negative' | 'neutral' {
  if (delta.intent) return delta.intent
  if (delta.direction === 'down') return 'negative'
  if (delta.direction === 'flat') return 'neutral'
  return 'positive'
}

function DeltaChip({ delta, onBrand }: { delta: KpiDeltaSpec; onBrand: boolean }) {
  const intent = deltaIntent(delta)
  const direction = delta.direction ?? 'up'

  return (
    <div className={styles.deltaRow}>
      <span
        className={[styles.delta, styles[intent], onBrand ? styles.onBrandChip : '']
          .filter(Boolean)
          .join(' ')}
      >
        {/* No `color` prop: the glyph inherits the chip's semantic ink, so the
            arrow and the figure can never disagree. */}
        <Icon name={DELTA_ICON[direction]} size={18} weight={500} />
        <span className="ds-text-caption">{delta.value}</span>
      </span>
      {delta.label && (
        <span className={['ds-text-caption', onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-subtle'].join(' ')}>
          {delta.label}
        </span>
      )}
    </div>
  )
}

function KpiTile({
  tile,
  surface,
  valueSize,
  labelSize,
  padding,
  iconSize,
}: {
  tile: KpiTileSpec
  surface: CardSurface
  valueSize: TypeStep
  labelSize: TypeStep
  padding: number
  iconSize: number
}) {
  const fill = tile.surface ?? surface
  const onBrand = fill === 'brand' || fill === 'brandAlt'

  return (
    <div className={[styles.tile, styles[fill]].filter(Boolean).join(' ')} style={{ padding }}>
      <div className={styles.head}>
        {tile.label && (
          <div
            className={[typeClass(labelSize), onBrand ? 'ds-text-on-brand' : ''].filter(Boolean).join(' ')}
          >
            {tile.label}
          </div>
        )}
        {tile.icon && (
          <Icon
            name={tile.icon}
            size={iconSize}
            weight={400}
            className={styles.icon}
            color={onBrand ? 'var(--slide-color-text-on-brand)' : 'var(--slide-color-accent)'}
          />
        )}
      </div>

      {/* The figure block is pushed to the tile floor so the numbers sit on one
          line across the board regardless of how many lines each label took. */}
      <div className={styles.figure}>
        {tile.value && (
          <div className={[typeClass(valueSize), onBrand ? 'ds-text-on-brand' : 'ds-text-accent-deep'].join(' ')}>
            {tile.value}
          </div>
        )}
        {tile.delta && <DeltaChip delta={tile.delta} onBrand={onBrand} />}
        {tile.note && (
          <div
            className={['ds-text-body-sm', onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-cool'].join(' ')}
          >
            {tile.note}
          </div>
        )}
      </div>
    </div>
  )
}

export function KpiBoard({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1000,
  primary,
  tiles = [],
  primarySide = 'left',
  primaryWidth = 430,
  secondaryColumns = 2,
  primarySurface = 'brand',
  surface = 'muted',
  top = 264,
  height = 372,
  gap = 16,
  inset = grid.marginX,
  insetRight,
  footnote,
  primaryValueSize = 'stat',
  tileValueSize,
  ...chrome
}: KpiBoardProps) {
  const boardStyle: CSSProperties = {
    left: inset,
    top,
    height,
    gap,
    flexDirection: primarySide === 'right' ? 'row-reverse' : 'row',
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
  }

  const secondaryStyle: CSSProperties = {
    // minmax(0, …), not 1fr: a bare 1fr is minmax(auto, 1fr), so one long value
    // widens its own track and the tiles stop being equal. Equal rows come from
    // gridAutoRows on a board of definite height.
    gridTemplateColumns: `repeat(${secondaryColumns}, minmax(0, 1fr))`,
    gridAutoRows: 'minmax(0, 1fr)',
    gap,
  }

  // A 2-up secondary tile is ~347px wide and a 3-up one ~226px, which is the
  // point where a 44px figure plus a delta chip stops fitting on one line.
  const secondaryValueSize: TypeStep = tileValueSize ?? (secondaryColumns >= 3 ? 'statMd' : 'statSm')
  const dense = secondaryColumns >= 3

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.board} style={boardStyle}>
        {primary && (
          <div className={styles.primary} style={{ width: primaryWidth }}>
            <KpiTile
              tile={primary}
              surface={primarySurface}
              valueSize={primaryValueSize}
              labelSize="subhead"
              padding={30}
              iconSize={40}
            />
          </div>
        )}

        <div className={styles.secondary} style={secondaryStyle}>
          {tiles.map((tile, i) => (
            <KpiTile
              key={i}
              tile={tile}
              surface={surface}
              valueSize={secondaryValueSize}
              labelSize={dense ? 'body' : 'h4'}
              padding={dense ? 18 : 22}
              iconSize={dense ? 24 : 28}
            />
          ))}
        </div>
      </div>

      {footnote && (
        <div
          className={`${styles.footnote} ds-text-caption ds-text-subtle`}
          style={{
            top: top + height + 14,
            left: inset,
            right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
          }}
        >
          {footnote}
        </div>
      )}
    </SlideFrame>
  )
}
