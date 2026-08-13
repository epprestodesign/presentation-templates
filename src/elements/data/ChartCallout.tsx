import type { CSSProperties } from 'react'
import styles from './ChartCallout.module.css'

/**
 * ChartCallout — the floating disc that names the one number a chart is about.
 *
 * Extracted from SlideChart so it is a component in its own right: it is used
 * on chart slides, and a style-guide change to it (size, ink, shadow) should be
 * one edit rather than a hunt through templates.
 *
 * THE GEOMETRY IS THE POINT. Text inside a circle cannot use the circle's
 * width — the widest line that fits inside a circle of diameter d is the
 * inscribed square, d / sqrt(2), which is only 71% of it. The first version set
 * a 132px disc with a 13px label reading "2027 EBITA Margin"; that label
 * measures ~112px, the inscribed square was 93px, and so the words ran to the
 * curve on both sides and looked like a clipping bug.
 *
 * So the content box here is computed as `size / Math.SQRT2` rather than being
 * padding guessed by eye. Change the diameter and the safe measure follows;
 * text can never touch the edge because it is not allowed to be that wide.
 */
export interface ChartCalloutProps {
  /** The figure. */
  value: string
  /** What the figure is. Kept short — it has to fit the inscribed square. */
  label?: string
  /** Diameter in slide px. */
  size?: number
  /** Absolute placement inside the plot. Percentages track the plot as it
   *  resizes, which is why they are the default rather than px. */
  right?: string | number
  bottom?: string | number
  className?: string
  style?: CSSProperties
}

export function ChartCallout({
  value,
  label,
  size = 168,
  right = '6%',
  bottom = '16%',
  className,
  style,
}: ChartCalloutProps) {
  /* The inscribed square, less a hair of optical breathing room. Anything wider
     than this touches the curve. */
  const safe = Math.floor(size / Math.SQRT2) - 6

  return (
    <div
      className={[styles.callout, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, right, bottom, ...style }}
    >
      <div className={styles.inner} style={{ maxWidth: safe }}>
        <div className={`${styles.value} ds-text-stat-md ds-text-accent-deep`}>{value}</div>
        {label && <div className={`${styles.label} ds-text-caption`}>{label}</div>}
      </div>
    </div>
  )
}
