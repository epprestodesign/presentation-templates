import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './Process.module.css'

/**
 * Template — Process.
 *
 * Numbered steps that explain how something works: onboarding, an approval
 * chain, what happens to a room block between contract and reconciliation.
 *
 * It overlaps `Diagram`'s flow variant and is deliberately not folded into it.
 * A flow node is a label and a glyph — it names the participants in a chain.
 * A process step is a number, a title AND a paragraph, because the argument is
 * "here is what happens, in order, and here is what each part involves". Adding
 * body copy to a flow card would have pushed one template to cover both, and the
 * two want different geometry the moment the copy exists: flow cards are tall
 * brand panels built around a 150px glyph, process cards are text.
 *
 * The number is the spine of the template, so it is generated from position
 * rather than typed per step. A deck that hand-numbered its steps ships a
 * 1-2-3-3-5 eventually, and inserting a step in the middle means retyping the
 * rest. `number` remains overridable for the genuine exceptions — a step '0', or
 * a pair of steps that happen at once.
 *
 * Two arrangements:
 *   'row'  — steps side by side, for three or four short steps.
 *   'list' — a two-column list, for four or five steps whose descriptions run
 *            to two or three lines. A row of five 220px columns cannot hold a
 *            sentence without wrapping it to a stripe.
 */

export interface ProcessStep {
  title: RichText
  description?: RichText
  /** Material Symbols glyph. Sits opposite the number. */
  icon?: string
  /** Overrides the position-derived number, e.g. '0' or '3a'. */
  number?: string
}

/** How the step number is set. 'chip' is a filled teal disc with the figure
 *  reversed out; 'ghost' is a large teal numeral with no container — quieter,
 *  and the better choice when the cards already carry a fill. */
export type ProcessNumberStyle = 'chip' | 'ghost'

/** Fill behind a step. Kept to the three that read at slide scale: `plain` is
 *  for a row that should look like type on paper. */
export type ProcessSurface = 'muted' | 'plain' | 'outline'

export interface ProcessProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  steps?: ProcessStep[]
  variant?: 'row' | 'list'
  numberStyle?: ProcessNumberStyle
  surface?: ProcessSurface
  /** Glyph drawn between steps in a row. `false` leaves the gap empty — right
   *  for steps that are stages rather than a hand-off. */
  connector?: string | false

  /** Top edge of the step well. */
  top?: number
  /** Height of the well. */
  height?: number
  left?: number
  /** Right inset. Defaults to the watermark gutter when the watermark shows. */
  insetRight?: number
  /** Gap between steps. In a row this is also the connector's column width. */
  gap?: number
  /** Padding inside a step. */
  padding?: number
  /** Columns in the 'list' variant. */
  columns?: number

  iconSize?: number
  /** Diameter of a 'chip' number. */
  chipSize?: number
  numberSize?: TypeStep
  titleSize?: TypeStep
  bodySize?: TypeStep
}

/* Per-variant defaults. Held in one table rather than as branches inside the
 * signature so the two arrangements can be compared at a glance — the same shape
 * Diagram's WELL uses. */
const WELL = {
  row: {
    top: 288,
    height: 320,
    gap: 44,
    padding: 28,
    numberStyle: 'ghost' as ProcessNumberStyle,
    surface: 'muted' as ProcessSurface,
    titleSize: 'h3' as TypeStep,
    bodySize: 'body' as TypeStep,
  },
  list: {
    /* Taller and higher than the row: three rows of title-plus-two-lines need
       ~130px each, and a two-column list has no headline sitting beside it to
       balance against, so it starts closer to the lead. */
    top: 236,
    height: 420,
    gap: 16,
    padding: 24,
    numberStyle: 'chip' as ProcessNumberStyle,
    surface: 'muted' as ProcessSurface,
    titleSize: 'h4' as TypeStep,
    bodySize: 'body' as TypeStep,
  },
} as const

const SURFACE_CLASS: Record<ProcessSurface, string> = {
  muted: styles.surfaceMuted,
  plain: styles.surfacePlain,
  outline: styles.surfaceOutline,
}

export function Process({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1080,
  steps = [],
  variant = 'row',
  numberStyle,
  surface,
  connector = 'chevron_right',
  top,
  height,
  left = grid.marginX,
  insetRight,
  gap,
  padding,
  columns,
  iconSize = 32,
  chipSize = 40,
  numberSize,
  titleSize,
  bodySize,
  ...chrome
}: ProcessProps) {
  const base = WELL[variant]
  const resolved = {
    top: top ?? base.top,
    height: height ?? base.height,
    gap: gap ?? base.gap,
    padding: padding ?? base.padding,
    numberStyle: numberStyle ?? base.numberStyle,
    surface: surface ?? base.surface,
    titleSize: titleSize ?? base.titleSize,
    bodySize: bodySize ?? base.bodySize,
  }

  /* A ghost numeral is the graphic; a chip is a marker beside the title, so it
   * sets at body scale. Wrong-way round and a chip becomes a 44px disc that
   * outweighs everything it labels. */
  const figureSize = numberSize ?? (resolved.numberStyle === 'ghost' ? 'statSm' : 'h4')

  /* Icons are reserved for every step as soon as one step carries a glyph, and
   * only the glyph is hidden. Dropping the element instead lets a step without
   * an icon give the space to its title, so its measure differs from its
   * neighbours' — the same failure as an unrendered connector. */
  const hasIcons = steps.some((step) => step.icon)

  /* The row's first item leads with a hidden connector slot, so without this the
   * first CARD starts one gap inside the well and the whole row hangs 44px to
   * the right of the headline above it. Pulling the well left by exactly the
   * connector width lands card one on the page margin and card four on the
   * watermark gutter. The overhang holds nothing but the hidden slot. */
  const wellStyle: CSSProperties = {
    left: variant === 'row' ? left - resolved.gap : left,
    top: resolved.top,
    height: resolved.height,
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
  }

  const surfaceClass = SURFACE_CLASS[resolved.surface]

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      <div className={styles.well} style={wellStyle}>
        {variant === 'row' ? (
          <div className={styles.row}>
            {steps.map((step, i) => (
              <div key={i} className={styles.item}>
                {/* The connector sits in the gap BEFORE its card, and the slot
                    is ALWAYS rendered — only the glyph is hidden on the first
                    step. Skipping the element makes the first card wider than
                    the rest by exactly the connector column, because each item
                    is flex:1 and splits its width between connector and card.
                    This repo has shipped that bug twice; reserving the slot is
                    what keeps the cards equal. */}
                <div
                  className={styles.connector}
                  style={{ width: resolved.gap, visibility: i === 0 ? 'hidden' : undefined }}
                  aria-hidden={i === 0}
                >
                  {connector && (
                    <Icon
                      name={connector}
                      size={28}
                      weight={300}
                      color="var(--slide-color-accent)"
                    />
                  )}
                </div>

                <div
                  className={[styles.card, surfaceClass].join(' ')}
                  style={{ padding: resolved.padding }}
                >
                  <div className={styles.head}>
                    <Figure
                      step={step}
                      index={i}
                      style={resolved.numberStyle}
                      size={figureSize}
                      chipSize={chipSize}
                    />
                    {hasIcons && (
                      <span className={styles.iconSlot} style={{ width: iconSize, height: iconSize }}>
                        {step.icon && (
                          <Icon
                            name={step.icon}
                            size={iconSize}
                            weight={250}
                            color="var(--slide-color-accent)"
                          />
                        )}
                      </span>
                    )}
                  </div>

                  <AccentText
                    as="h3"
                    content={step.title}
                    className={[typeClass(resolved.titleSize), styles.title].join(' ')}
                  />
                  {step.description && (
                    <AccentText
                      as="p"
                      content={step.description}
                      className={[typeClass(resolved.bodySize), styles.body, 'ds-text-cool'].join(
                        ' '
                      )}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={styles.list}
            style={{
              gap: resolved.gap,
              // `|| 1`: an empty deck would otherwise emit repeat(0, 1fr),
              // which is invalid and silently drops the grid.
              gridTemplateColumns: `repeat(${columns || 2}, 1fr)`,
              // Equal rows whatever the copy does — an odd number of steps
              // leaves an empty cell, not a taller one.
              gridAutoRows: '1fr',
            }}
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className={[styles.cell, surfaceClass].join(' ')}
                style={{ padding: resolved.padding }}
              >
                <Figure
                  step={step}
                  index={i}
                  style={resolved.numberStyle}
                  size={figureSize}
                  chipSize={chipSize}
                />

                <div className={styles.cellCopy}>
                  <AccentText
                    as="h3"
                    content={step.title}
                    className={[typeClass(resolved.titleSize), styles.title].join(' ')}
                  />
                  {step.description && (
                    <AccentText
                      as="p"
                      content={step.description}
                      className={[typeClass(resolved.bodySize), styles.body, 'ds-text-cool'].join(
                        ' '
                      )}
                    />
                  )}
                </div>

                {hasIcons && (
                  <span className={styles.iconSlot} style={{ width: iconSize, height: iconSize }}>
                    {step.icon && (
                      <Icon
                        name={step.icon}
                        size={iconSize}
                        weight={250}
                        color="var(--slide-color-accent)"
                      />
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideFrame>
  )
}

/** The step number. Position-derived unless the step overrides it, and padded
 *  to two digits to match the deck's page numbers — '01', not '1'. */
function Figure({
  step,
  index,
  style,
  size,
  chipSize,
}: {
  step: ProcessStep
  index: number
  style: ProcessNumberStyle
  size: TypeStep
  chipSize: number
}) {
  const label = step.number ?? String(index + 1).padStart(2, '0')

  if (style === 'chip') {
    return (
      <span
        className={[styles.chip, typeClass(size)].join(' ')}
        style={{ width: chipSize, height: chipSize }}
      >
        {label}
      </span>
    )
  }

  return <span className={[styles.ghost, typeClass(size)].join(' ')}>{label}</span>
}
