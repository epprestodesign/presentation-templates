import { grid, radius, tableTint } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import styles from './UseOfFunds.module.css'

/**
 * Template — Use of Funds.
 *
 * Tier rows on the left (amount, title, description), a brand-gradient spec
 * panel on the right (labelled sections of key/value rows).
 *
 * Built as its own template rather than folded into FinancialTable, which was
 * the obvious-looking move and the wrong one: it shares nothing structural with
 * a model table — no period columns, no summary block, no variance group, no
 * right-aligned figures. Forcing it in would have meant a second element for the
 * panel and a row shape carrying a description line, i.e. a different template
 * wearing FinancialTable's name.
 *
 * The reference fills the panel's values with {{TOKEN}} placeholders, so this is
 * a slide designed to be filled in. `value` is deliberately a plain string —
 * pass the token through and it renders, which is what you want while a round is
 * still being negotiated.
 */
export interface FundTier {
  /** Pre-formatted, e.g. '$5.0M'. */
  amount: string
  title: RichText
  description?: RichText
}

export interface SpecRow {
  label: string
  /** Any string, including a {{TOKEN}} placeholder. */
  value: string
}

export interface SpecSection {
  label: string
  rows: SpecRow[]
}

export interface UseOfFundsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  titleWidth?: number

  tiers?: FundTier[]
  /** Left column: where the tier table starts and how wide it runs. */
  tiersTop?: number
  tiersWidth?: number
  /** Width of the amount cell inside each tier row. */
  amountWidth?: number

  sections?: SpecSection[]
  /** The gradient panel's rect. Measured off the reference. */
  panel?: { x: number; y: number; w: number; h: number }
}

export function UseOfFunds({
  fit = 'contain',
  title,
  lead,
  titleWidth = 1120,
  tiers = [],
  tiersTop = 280,
  tiersWidth = 658,
  amountWidth = 188,
  sections = [],
  // The panel runs 7px past the watermark gutter, as the reference does. It is
  // not a full-width well and the wordmark's ink starts at x=1224, so it clears.
  panel = { x: 705, y: 256, w: 497, h: 434 },
  ...chrome
}: UseOfFundsProps) {
  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={titleWidth} />}

      {tiers.length > 0 && (
        <div
          className={styles.tiers}
          style={{ left: grid.marginX, top: tiersTop, width: tiersWidth }}
        >
          {tiers.map((tier, i) => (
            <div key={i} className={styles.tier}>
              <div
                className={`${styles.amount} ds-text-stat-md ds-text-accent-deep`}
                style={{
                  width: amountWidth,
                  // The lightest step of the measured table ramp — the same
                  // #f6ffff the reference uses here, so it is one value rather
                  // than two that happen to match.
                  background: tableTint.rows[tableTint.rows.length - 1],
                }}
              >
                {tier.amount}
              </div>
              <div className={styles.tierCopy}>
                <AccentText as="h3" content={tier.title} className="ds-text-h3" />
                {tier.description && (
                  <AccentText
                    as="p"
                    content={tier.description}
                    className="ds-text-body ds-text-cool"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <div
          className={styles.panel}
          // Mapped explicitly, not spread: the rect uses x/y/w/h (the same
          // vocabulary as ImageSpec and the PPTX emitter), and CSS has no such
          // properties — spreading it silently drops all four and the panel
          // collapses to the top-left corner.
          style={{
            left: panel.x,
            top: panel.y,
            width: panel.w,
            height: panel.h,
            borderRadius: radius.panelLg,
          }}
        >
          {sections.map((section, i) => (
            <div key={i} className={styles.section}>
              <div className={`${styles.sectionLabel} ds-text-body-sm ds-text-on-brand`}>
                {section.label}
              </div>
              {section.rows.map((row, ri) => (
                <div key={ri} className={styles.specRow}>
                  <span className="ds-text-body ds-text-on-brand">{row.label}</span>
                  <span className="ds-text-body ds-text-on-brand">{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </SlideFrame>
  )
}
