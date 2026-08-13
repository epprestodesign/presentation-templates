import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import styles from './Agenda.module.css'

/**
 * Template — Agenda.
 *
 * A numbered running order on the brand background: display title, then rows of
 * a large outlined-looking numeral, a bold heading and a supporting line.
 *
 * Rows are evenly distributed down the available height rather than pinned to
 * fixed anchors, so a 4-item agenda and a 6-item agenda both look deliberate.
 * That is the one place a slide in this system flexes vertically — an agenda's
 * length is genuinely variable, unlike a headline's position.
 *
 * Numbers are zero-padded to two digits to match the deck's page numbering.
 */
export interface AgendaItem {
  /** Heading. */
  title: RichText
  /** Supporting line under the heading. */
  detail?: RichText
  /** Overrides the automatic 01, 02, 03… numbering. */
  number?: string
}

export interface AgendaProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'
  /** Display title, e.g. 'Agenda'. */
  title?: string
  items?: AgendaItem[]
  /** Brand background plate. */
  plate?: string
  /** Top of the item list. */
  top?: number
  /** Width of the numeral column. */
  numberWidth?: number
}

export function Agenda({
  fit = 'contain',
  title = 'Agenda',
  items = [],
  plate = 'backgrounds/brand-hex',
  top = 200,
  numberWidth = 140,
  ...chrome
}: AgendaProps) {
  return (
    <SlideFrame fit={fit} surface="brand" plate={plate} {...chrome}>
      <h1 className={`${styles.title} ds-text-display ds-text-on-brand`}>{title}</h1>

      <ol
        className={styles.list}
        style={{
          left: grid.marginX,
          top,
          // Stop clear of the watermark like every other full-width well.
          right: chrome.watermark === false ? grid.marginX : grid.watermarkGutter,
          bottom: grid.marginBottom,
        }}
      >
        {items.map((item, i) => (
          <li key={i} className={styles.row}>
            <div className={`${styles.number} ds-text-on-brand`} style={{ width: numberWidth }}>
              {item.number ?? String(i + 1).padStart(2, '0')}
            </div>
            <div className={styles.copy}>
              <AccentText as="h3" content={item.title} className="ds-text-h3 ds-text-on-brand" />
              {item.detail && (
                <AccentText
                  as="p"
                  content={item.detail}
                  className="ds-text-lead ds-text-on-brand"
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </SlideFrame>
  )
}
