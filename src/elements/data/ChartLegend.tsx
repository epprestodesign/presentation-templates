import styles from './ChartLegend.module.css'

/**
 * ChartLegend — the key for a chart carrying more than one colour.
 *
 * MUI's own legend is switched off everywhere in this system (`hideLegend`),
 * and correctly so: it sizes itself from the chart's box, re-flows at widths a
 * slide never has, and puts its swatches in MUI's metrics rather than the
 * deck's. This is the deck's legend — fixed type, brand swatches, laid out on
 * one line and wrapping only when it must.
 *
 * WHY IT EXISTS AT ALL: a stacked bar with three segments and no key is
 * undecodable. The reader can see that the bar has parts and cannot learn what
 * any part IS. That is not a styling gap, it is a chart that fails to say
 * anything, so `SlideChart` shows this automatically once a chart has three or
 * more named series rather than leaving it to each template to remember.
 */
export interface ChartLegendItem {
  label: string
  color: string
}

export interface ChartLegendProps {
  items: ChartLegendItem[]
  /** 'start' aligns to the plot's left edge; 'end' tucks it under the right. */
  align?: 'start' | 'end'
  className?: string
}

export function ChartLegend({ items, align = 'start', className }: ChartLegendProps) {
  if (!items.length) return null
  return (
    <div
      className={[styles.legend, align === 'end' ? styles.end : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((it) => (
        <span key={it.label} className={styles.item}>
          {/* A rounded square, not a dot: at 10px a circle loses enough area to
              read a shade lighter than the series it stands for, which is the
              one thing a legend swatch must not do. */}
          <span className={styles.swatch} style={{ background: it.color }} />
          <span className={`${styles.label} ds-text-body-sm`}>{it.label}</span>
        </span>
      ))}
    </div>
  )
}
