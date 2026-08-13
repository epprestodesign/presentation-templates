import { radius } from '../../tokens/tokens.js'
import type { StatSpec, TypeStep } from '../../types'
import { Icon } from '../brand/Icon'
import { typeClass } from '../../lib/typeClass'
import styles from './StatCard.module.css'

/**
 * StatCard — one KPI tile: a label, a big number, optional supporting copy and
 * a corner icon.
 *
 * The reference deck uses two fills interchangeably — the #f5f5f5 muted card
 * and the brand gradient — and reverses the ink on the second. Both are one
 * component so a row of six tiles (slide 07) can mix them without drifting.
 *
 * Label/value order flips between slides: the traction tiles put the label
 * above the number, the revenue-durability tiles put it below. That is the
 * `order` prop rather than two components.
 */
export interface StatCardProps extends StatSpec {
  padding?: number
  /** Type step for the label. Defaults to h4. Exposed so a slide whose figure
   *  and label sit at an unusual ratio can fold back into StatCard instead of
   *  hand-setting two lines of type in its template. */
  labelSize?: TypeStep
}

export function StatCard({
  label,
  value,
  description,
  surface = 'muted',
  order = 'label-first',
  icon,
  valueSize = 'stat',
  align = 'bottom',
  padding = 28,
  labelSize = 'h4',
}: StatCardProps) {
  const onBrand = surface === 'brand' || surface === 'brandAlt'

  return (
    <div
      className={[styles.card, styles[surface]].filter(Boolean).join(' ')}
      style={{
        padding,
        ['--stat-card-padding' as string]: `${padding}px`,
        borderRadius: radius.card,
        justifyContent: align === 'bottom' ? 'flex-end' : 'flex-start',
      }}
    >
      {icon && (
        <Icon
          name={icon}
          size={42}
          weight={300}
          className={styles.icon}
          color={onBrand ? 'var(--slide-color-text-on-brand)' : 'var(--slide-color-accent)'}
        />
      )}

      <div className={[styles.body, order === 'value-first' ? styles.reversed : ''].filter(Boolean).join(' ')}>
        {label && (
          <div className={[typeClass(labelSize), onBrand ? 'ds-text-on-brand' : ''].filter(Boolean).join(' ')}>
            {label}
          </div>
        )}
        {value && (
          <div className={[typeClass(valueSize), onBrand ? 'ds-text-on-brand' : 'ds-text-accent-deep'].join(' ')}>
            {value}
          </div>
        )}
        {description && (
          <p
            className={[
              styles.desc,
              'ds-text-body-sm',
              onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-cool',
            ].join(' ')}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
