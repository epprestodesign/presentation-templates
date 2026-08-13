import type { CSSProperties, ReactNode } from 'react'
import { canvas, grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './Timeline.module.css'

/**
 * Template — Timeline.
 *
 * Dated milestones strung along a single rule: a roadmap by quarter, the
 * company's history, the lifecycle of a room block from contract to
 * reconciliation.
 *
 * Two things carry the meaning and are worth knowing before changing anything:
 *
 *  - **The rule is one continuous element, not a segment per milestone.** It is
 *    drawn once across the whole well, behind the markers, with a teal fill
 *    stopping at the current milestone. Segments-between-items was the first
 *    shape tried and it cannot survive a gap between columns without leaving
 *    breaks in the line, and it re-introduces the connector-width bug the flow
 *    diagram already paid for.
 *  - **State is derived from position, not declared per milestone.** One
 *    milestone says `state: 'current'` and everything before it is done,
 *    everything after is upcoming. A deck that restated the state on all six
 *    entries would eventually ship a roadmap with two "todays" in it.
 *
 * Horizontal is the default because that is what a roadmap is. Vertical exists
 * for the same data when the descriptions run long — six lines of copy under a
 * horizontal column wraps to a stripe two words wide.
 */

/** Where a milestone sits relative to now. Derived; see `resolveState`. */
export type TimelineState = 'done' | 'current' | 'upcoming'

export interface TimelineMilestone {
  /** The period label — 'Q1 2026', 'Day 0', 'T-90'. Sits above the rule. */
  date?: RichText
  title: RichText
  description?: RichText
  /** Material Symbols glyph above the date. */
  icon?: string
  /** Pins the state instead of deriving it. Exactly one milestone should be
   *  `'current'`; the rest are inferred from where they fall around it. */
  state?: TimelineState
}

export interface TimelineProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  milestones?: TimelineMilestone[]
  orientation?: 'horizontal' | 'vertical'
  /** Badge on the milestone marked `current`. Set to '' to suppress it. */
  currentLabel?: string

  /** Top edge of the milestone well. */
  top?: number
  /** Height of the well. Horizontal milestones distribute across its width;
   *  vertical ones split its height evenly. */
  height?: number
  left?: number
  /** Right inset. Defaults to the watermark gutter when the watermark shows, so
   *  the rule never runs under the wordmark. */
  insetRight?: number
  /** Gap between milestone columns (horizontal) or rows (vertical). */
  gap?: number
  /** Vertical rhythm inside one milestone — icon → date → marker → copy. */
  stackGap?: number

  /** Diameter of a milestone marker. */
  markerSize?: number
  /** Thickness of the rule. */
  ruleSize?: number
  iconSize?: number
  /** Height reserved for the date band, so a two-word date and a one-word date
   *  still put their markers on the same line. */
  dateHeight?: number
  /** Width of the date column in the vertical orientation. */
  dateWidth?: number

  dateSize?: TypeStep
  titleSize?: TypeStep
  bodySize?: TypeStep
}

/** Position decides state: before the current milestone is done, after it is
 *  upcoming. With nothing marked current the whole line reads as history, which
 *  is what a company-story timeline wants. An explicit `state` still wins — a
 *  roadmap sometimes has a slipped item behind the marker. */
function resolveState(
  milestone: TimelineMilestone,
  index: number,
  currentIndex: number
): TimelineState {
  if (milestone.state) return milestone.state
  if (currentIndex < 0) return 'done'
  if (index < currentIndex) return 'done'
  if (index > currentIndex) return 'upcoming'
  return 'current'
}

const MARKER_CLASS: Record<TimelineState, string> = {
  done: styles.markerDone,
  current: styles.markerCurrent,
  upcoming: styles.markerUpcoming,
}

export function Timeline({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1080,
  milestones = [],
  orientation = 'horizontal',
  currentLabel = 'Today',
  top,
  height,
  left = grid.marginX,
  insetRight,
  gap = 24,
  stackGap = 14,
  markerSize = 18,
  ruleSize = 3,
  iconSize = 30,
  dateHeight = 22,
  dateWidth = 116,
  dateSize = 'caption',
  titleSize = 'h4',
  bodySize = 'bodySm',
  ...chrome
}: TimelineProps) {
  const vertical = orientation === 'vertical'

  /* Per-orientation well defaults. Horizontal sits low, under a headline and a
   * lead; vertical needs the height so it starts higher and runs to the floor.
   *
   * 320 rather than the deck's `bodyY` of 264: a horizontal timeline is a band
   * roughly 240px tall, not a well that fills to the floor, so anchoring it at
   * bodyY leaves the whole bottom third empty and the slide reads top-heavy.
   * 320 centres the band in the space a two-line headline and a lead leave. */
  const wellTop = top ?? (vertical ? 196 : 320)
  const wellHeight = height ?? (vertical ? 464 : 314)

  const right = insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter)
  const wellWidth = canvas.width - left - right

  const declaredCurrent = milestones.findIndex((milestone) => milestone.state === 'current')
  const states = milestones.map((milestone, i) => resolveState(milestone, i, declaredCurrent))
  /* Icons are all-or-nothing per row. The slot is reserved for every milestone
   * as soon as ONE of them carries a glyph, and only the glyph is hidden — the
   * same reservation the flow diagram needs for its arrows, for the same
   * reason: an item that skips the slot ends up shorter than its neighbours. */
  const hasIcons = milestones.some((milestone) => milestone.icon)

  const count = milestones.length || 1
  const columnWidth = (wellWidth - gap * (count - 1)) / count
  const rowHeight = (wellHeight - gap * (count - 1)) / count

  /* Distance from the start of the rule to milestone i's marker. Computed here
   * rather than read back off the DOM: every term is a prop, so the fill lands
   * on the dot at export time as well as in the browser. */
  const markerAt = (i: number) =>
    vertical ? i * (rowHeight + gap) + dateHeight / 2 : i * (columnWidth + gap) + markerSize / 2

  /* Where the rule crosses each column, measured from the top of the well by
   * summing the same slot heights the columns are given below — so the line and
   * the markers cannot drift apart when a caller retunes `dateHeight`. */
  const railCenter =
    (hasIcons ? iconSize + stackGap : 0) + dateHeight + stackGap + markerSize / 2

  /* The teal fill stops at the marker we have reached. A fully-shipped line
   * fills edge to edge instead of stopping short of its last dot, which would
   * read as unfinished. */
  const current = states.indexOf('current')
  const reached = current >= 0 ? current : states.lastIndexOf('done')
  const allDone = reached === count - 1 && !states.includes('upcoming')
  const fillLength =
    reached < 0 ? 0 : allDone ? (vertical ? wellHeight : wellWidth) : markerAt(reached)

  const wellStyle: CSSProperties = { left, top: wellTop, width: wellWidth, height: wellHeight }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.well} style={wellStyle}>
        {vertical ? (
          <>
            {/* The rail hangs off the date column's right edge, which is where
                every row's marker centres. */}
            <div
              className={styles.railV}
              style={{ left: dateWidth + gap + markerSize / 2 - ruleSize / 2, width: ruleSize }}
            >
              <div className={styles.railFill} style={{ height: fillLength }} />
            </div>

            <div className={styles.rows} style={{ gap }}>
              {milestones.map((milestone, i) => (
                <div key={i} className={styles.row}>
                  <div
                    className={styles.rowDate}
                    style={{ width: dateWidth, height: dateHeight, marginRight: gap }}
                  >
                    <DateBand
                      milestone={milestone}
                      state={states[i]}
                      currentLabel={currentLabel}
                      dateSize={dateSize}
                      align="right"
                    />
                  </div>

                  <div
                    className={styles.rowMarker}
                    style={{ width: markerSize, height: dateHeight, marginRight: gap }}
                  >
                    <span
                      className={[styles.marker, MARKER_CLASS[states[i]]].join(' ')}
                      style={{ width: markerSize, height: markerSize }}
                    />
                  </div>

                  {/* The glyph sits BESIDE the title here, not above it as in a
                      column. A row is only wellHeight/n tall, and stacking the
                      icon spends 36 of those px on nothing — enough to push a
                      two-line description into the row below. */}
                  <Copy
                    milestone={milestone}
                    titleSize={titleSize}
                    bodySize={bodySize}
                    gap={stackGap / 2}
                    leading={
                      hasIcons ? (
                        <span className={styles.rowIcon} style={{ width: iconSize, height: iconSize }}>
                          {milestone.icon && (
                            <Icon
                              name={milestone.icon}
                              size={iconSize}
                              weight={250}
                              color="var(--slide-color-accent)"
                            />
                          )}
                        </span>
                      ) : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div
              className={styles.rail}
              style={{ top: railCenter - ruleSize / 2, height: ruleSize }}
            >
              <div className={styles.railFill} style={{ width: fillLength }} />
            </div>

            <div className={styles.columns} style={{ gap }}>
              {milestones.map((milestone, i) => (
                <div key={i} className={styles.column} style={{ gap: stackGap }}>
                  {hasIcons && (
                    <span className={styles.iconSlot} style={{ height: iconSize }}>
                      {milestone.icon && (
                        <Icon
                          name={milestone.icon}
                          size={iconSize}
                          weight={250}
                          color="var(--slide-color-accent)"
                        />
                      )}
                    </span>
                  )}

                  <div className={styles.dateSlot} style={{ height: dateHeight }}>
                    <DateBand
                      milestone={milestone}
                      state={states[i]}
                      currentLabel={currentLabel}
                      dateSize={dateSize}
                    />
                  </div>

                  <div className={styles.markerSlot} style={{ height: markerSize }}>
                    <span
                      className={[styles.marker, MARKER_CLASS[states[i]]].join(' ')}
                      style={{ width: markerSize, height: markerSize }}
                    />
                  </div>

                  <Copy
                    milestone={milestone}
                    titleSize={titleSize}
                    bodySize={bodySize}
                    gap={stackGap / 2}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </SlideFrame>
  )
}

/** The date, plus the "Today" badge when this is where we are. The badge lives
 *  inside the date band rather than above it so it cannot push one column's
 *  marker off the line. */
function DateBand({
  milestone,
  state,
  currentLabel,
  dateSize,
  align = 'left',
}: {
  milestone: TimelineMilestone
  state: TimelineState
  currentLabel: string
  dateSize: TypeStep
  align?: 'left' | 'right'
}) {
  return (
    <>
      {align === 'right' && state === 'current' && currentLabel && (
        <span className={`${styles.badge} ds-text-caption`}>{currentLabel}</span>
      )}
      {milestone.date && (
        <AccentText
          as="span"
          content={milestone.date}
          className={[
            typeClass(dateSize),
            styles.date,
            state === 'upcoming' ? 'ds-text-subtle' : 'ds-text-accent-deep',
          ].join(' ')}
        />
      )}
      {align === 'left' && state === 'current' && currentLabel && (
        <span className={`${styles.badge} ds-text-caption`}>{currentLabel}</span>
      )}
    </>
  )
}

/** Title over description, shared by both orientations. `leading` is set inline
 *  with the title rather than above it — the vertical rows have no height to
 *  spare for a stacked glyph. */
function Copy({
  milestone,
  titleSize,
  bodySize,
  gap,
  leading,
}: {
  milestone: TimelineMilestone
  titleSize: TypeStep
  bodySize: TypeStep
  gap: number
  leading?: ReactNode
}) {
  const title = (
    <AccentText
      as="h3"
      content={milestone.title}
      className={[typeClass(titleSize), styles.title].join(' ')}
    />
  )

  return (
    <div className={styles.copy} style={{ gap }}>
      {leading ? (
        <div className={styles.titleRow}>
          {leading}
          {title}
        </div>
      ) : (
        title
      )}
      {milestone.description && (
        <AccentText
          as="p"
          content={milestone.description}
          className={[typeClass(bodySize), styles.description, 'ds-text-muted'].join(' ')}
        />
      )}
    </div>
  )
}
