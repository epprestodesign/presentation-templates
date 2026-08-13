import { radius } from '../../tokens/tokens.js'
import type { StatSpec } from '../../types'
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
  iconBadge = false,
  note,
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
      {icon &&
        (iconBadge ? (
          <span
            className={`${styles.icon} ${styles.badge}`}
            style={{ background: onBrand ? 'var(--slide-color-text-on-brand)' : 'var(--slide-color-accent-deep)' }}
          >
            <Icon
              name={icon}
              size={26}
              weight={500}
              filled
              color={onBrand ? 'var(--slide-color-accent-deep)' : 'var(--slide-color-surface)'}
            />
          </span>
        ) : (
          <Icon
            name={icon}
            size={42}
            weight={300}
            className={styles.icon}
            color={onBrand ? 'var(--slide-color-text-on-brand)' : 'var(--slide-color-accent)'}
          />
        ))}

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
        {note && (
          <div className={[styles.note, 'ds-text-caption', onBrand ? 'ds-text-on-brand-subtle' : 'ds-text-accent-deep'].join(' ')}>
            {note}
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
