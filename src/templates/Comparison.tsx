import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { ComparisonBand, type ComparisonBandProps } from '../elements/data/ComparisonBand'
import { AccentText } from '../elements/text/AccentText'
import { Icon } from '../elements/brand/Icon'
import { typeClass } from '../lib/typeClass'
import styles from './Comparison.module.css'

/**
 * Template — Comparison.
 *
 * A headline over a two-sided panel: the old way on top in muted grey, the
 * same journey with EventPipe beneath it on the brand gradient. Rebuilt from
 * slides 02 (the operational-complexity problem statement) and 13 (the
 * partnership-strategy "today vs with EventPipe" split).
 *
 * ONE template with a band variant, not two templates. The two slides look
 * different at a glance, and the temptation is to call them separate layouts —
 * but the pixels say otherwise. Both are a single 16px-radius panel starting at
 * the page margin, split into two equal-height bands with a hairline of white
 * between them, muted band first, gradient band second, ink inverted on the
 * second. Both carry a side label plus five (02) or four (13) ordered steps.
 * Everything that differs is inside the band: 02 sets its steps as inline copy
 * separated by a three-dash rule, 13 boxes them under a dotted rail. That is a
 * `variant` on ComparisonBand, and splitting it into two templates would
 * duplicate the panel, the surfaces, the gap, and the corner clipping in order
 * to express a difference in furniture.
 *
 * The figures row and the note beside it are slide 13's only extra structure,
 * so they are optional props rather than a third template.
 *
 * The figures are NOT StatCard, which was the first attempt. StatCard locks its
 * label to `ds-text-h4` — 18px semibold, right for a KPI tile — and this slide
 * sets the same label at body weight so it stays one line under a 68px number.
 * Rather than fight it, the pair is two lines of type here; a `labelSize` prop
 * on StatCard would let this fold back into it.
 */
export interface ComparisonFigure {
  /** Pre-formatted, e.g. '$20B+'. A string so the deck owns the rounding. */
  value: string
  label?: RichText
  valueSize?: TypeStep
}
export interface ComparisonProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleWidth?: number
  /** Supporting paragraph under the headline. */
  lead?: RichText
  /** Where the lead starts.
   *
   *  It is positioned rather than stacked under the headline, because the two
   *  need different measures: slide 13's headline breaks after "event" at
   *  700px while its lead runs the full 1140px width. `grid.leadY` is defined
   *  as exactly this anchor — where a lead sits below a two-line headline — so
   *  the fixed y is the documented grid, not a magic number. */
  leadTop?: number
  leadWidth?: number

  /** KPI pair above the panel (slide 13), separated by a vertical rule. */
  figures?: ComparisonFigure[]
  figuresTop?: number
  figuresWidth?: number

  /** Icon + two-line aside beside the figures (slide 13). */
  note?: {
    icon?: string
    title?: RichText
    body?: RichText
    /** Left edge. Defaults to the right two-fifths of the slide. */
    left?: number
    top?: number
    width?: number
  }

  /** The sides of the comparison, top to bottom. */
  bands?: ComparisonBandProps[]
  /** Top edge of the panel. */
  top?: number
  /** Applied to any band that does not set its own `height`. */
  bandHeight?: number
  /** White gutter between bands. 4px on slide 02, 8px on slide 13. */
  bandGap?: number
  inset?: number
  /** Right inset. Defaults to the watermark gutter so the panel never runs
   *  under the wordmark. */
  insetRight?: number
}

export function Comparison({
  fit = 'contain',
  title,
  titleWidth = 1000,
  lead,
  leadTop = grid.leadY,
  leadWidth,
  figures = [],
  figuresTop = 263,
  // Two 363.5px columns. The rule between them lands at x=363.5, measured.
  figuresWidth = 727,
  note,
  bands = [],
  top = 269,
  bandHeight,
  bandGap = 4,
  inset = grid.marginX,
  insetRight,
  ...chrome
}: ComparisonProps) {
  const panelStyle: CSSProperties = {
    left: inset,
    top,
    right: insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter),
    gap: bandGap,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {title && <SlideHeading title={title} width={titleWidth} />}

      {lead && (
        <AccentText
          as="p"
          content={lead}
          className={`${styles.lead} ds-text-lead`}
          style={{ top: leadTop, width: leadWidth ?? titleWidth }}
        />
      )}

      {figures.length > 0 && (
        <div className={styles.figures} style={{ top: figuresTop, width: figuresWidth }}>
          {figures.map((figure, i) => (
            <div key={i} className={styles.figure}>
              <div className={`${typeClass(figure.valueSize ?? 'stat')} ds-text-accent-deep`}>
                {figure.value}
              </div>
              {figure.label && (
                <AccentText as="p" content={figure.label} className="ds-text-body" />
              )}
            </div>
          ))}
        </div>
      )}

      {note && (
        <div
          className={styles.note}
          style={{ left: note.left ?? 828, top: note.top ?? 292, width: note.width ?? 348 }}
        >
          {note.icon && (
            <Icon
              name={note.icon}
              size={36}
              weight={400}
              filled
              color="var(--slide-color-accent)"
            />
          )}
          <div className={styles.noteBody}>
            {note.title && <AccentText as="p" content={note.title} className="ds-text-caption" />}
            {note.body && (
              <AccentText as="p" content={note.body} className="ds-text-caption ds-text-cool" />
            )}
          </div>
        </div>
      )}

      {bands.length > 0 && (
        <div className={styles.panel} style={panelStyle}>
          {bands.map((band, i) => (
            <ComparisonBand key={i} {...band} height={band.height ?? bandHeight} />
          ))}
        </div>
      )}
    </SlideFrame>
  )
}
