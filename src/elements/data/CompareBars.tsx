import type { CSSProperties } from 'react'
import { radius } from '../../tokens/tokens.js'
import styles from './CompareBars.module.css'

/**
 * CompareBars — the two-bar year-over-year comparison beside each stat on the
 * "by the Numbers" slide: a flat grey prior-year bar and a gradient
 * current-year bar, each labelled with its figure and its year.
 *
 * Divs and CSS rather than MUI X Charts. The reasons are specific, not
 * aesthetic:
 *
 *  - Two categories, one series, no axis, no gridlines, no ticks, no legend.
 *    Nearly everything MUI X draws would have to be switched back off.
 *  - The bars take different fills — one flat grey, one brand gradient — which
 *    in MUI X means a per-bar `fill` override plus a `userSpaceOnUse`
 *    linearGradient in `defs` (see SlideChart) to stop the gradient being
 *    restretched inside each bar.
 *  - The labels are two-line blocks that sit *above* one bar and *inside* the
 *    other in reversed ink. `barLabel` gives you one line, in one place.
 *
 *  So it would be more code doing less. It is also one fewer thing that can
 *  animate: SlideChart must pass `skipAnimation` because the export scripts
 *  screenshot in headless Chromium — a div cannot forget to.
 *
 * Geometry measured off references/slide-decks/11-33.png at 2x.
 */
export interface CompareBarSpec {
  /** The figure printed with the bar, pre-formatted — '352K', '$196M'. Kept a
   *  string so the deck controls rounding and units, as StatSpec does. */
  value: string
  /** The period it belongs to, e.g. '’23'. */
  period: string
  /** The magnitude the bar's height is drawn from. Separate from `value`
   *  because '$196M' is for reading and 283 is for measuring. */
  amount: number
}

export interface CompareBarsProps {
  prior: CompareBarSpec
  current: CompareBarSpec
  /** Plot box in slide px. Bars are bottom-aligned inside it and the taller
   *  one fills its height. */
  width?: number
  height?: number
  barWidth?: number
  className?: string
  style?: CSSProperties
}

/** Gap from the prior-year label's last baseline up to its bar's top edge,
 *  measured at 6.5px — expressed here net of the ~3.2px of below-baseline space
 *  the label's own line box carries. */
const PRIOR_LABEL_LIFT = 3

export function CompareBars({
  prior,
  current,
  width = 212,
  height = 161,
  barWidth = 94,
  className,
  style,
}: CompareBarsProps) {
  /* Heights are proportional to the amounts, off a zero baseline.
   *
   *  Worth flagging: the reference's own bars are not. Its grey bars come out
   *  at 0.57 / 0.65 / 0.68 of the teal ones where the figures say 0.71 / 0.76 /
   *  0.75, so they were drawn by eye. Reproducing that would mean shipping a
   *  chart that understates every year-over-year gain it is there to show,
   *  which is the one thing a bar is not allowed to do — so this scales. */
  const peak = Math.max(prior.amount, current.amount) || 1
  const priorHeight = (height * prior.amount) / peak
  const currentHeight = (height * current.amount) / peak

  const label = (spec: CompareBarSpec, className: string, labelStyle?: CSSProperties) => (
    <div className={`${styles.label} ${className} ds-text-body`} style={labelStyle}>
      <div>{spec.value}</div>
      <div>{spec.period}</div>
    </div>
  )

  return (
    <div className={[styles.plot, className].filter(Boolean).join(' ')} style={{ ...style, width, height }}>
      <div className={styles.column} style={{ width: barWidth }}>
        {/* The prior year's label sits above its bar, so it rides up and down
            with the bar's height rather than being pinned to the plot. */}
        {label(prior, styles.priorLabel, { bottom: priorHeight + PRIOR_LABEL_LIFT })}
        <div
          className={`${styles.bar} ${styles.prior}`}
          style={{ height: priorHeight, borderRadius: radius.panel }}
        />
      </div>

      <div className={styles.column} style={{ width: barWidth }}>
        <div
          className={`${styles.bar} ${styles.current}`}
          style={{ height: currentHeight, borderRadius: radius.panel }}
        >
          {label(current, styles.currentLabel)}
        </div>
      </div>
    </div>
  )
}
