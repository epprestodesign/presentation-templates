import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import { EpLogo } from '../elements/brand/EpLogo'
import { typeClass } from '../lib/typeClass'
import styles from './Statement.module.css'

/**
 * Template — Statement.
 *
 * The closing slide: one sentence at display size on the brand plate, a
 * supporting paragraph, and a row of contact columns along the floor with the
 * horizontal lockup opposite them.
 *
 * The lockup is the reason this template renders a logo at all. Every other
 * slide gets the rotated watermark from `SlideChrome`; the closing slide is the
 * one place the mark reads horizontally at size, because it is the last thing
 * on screen and it is the sign-off rather than a page furniture mark. Measured
 * off 18.png at 228px wide, sitting on the page margin — so stories pass
 * `watermark: false` and let this take the corner instead.
 *
 * Contact columns are a grid rather than a repeated absolute box, so a slide
 * with three contacts spaces itself.
 *
 * The copy stack is built here rather than with `SlideHeading`, which cannot
 * render a headline on a dark surface: its `onDark` flag reaches the lead and
 * the body but not the title, and `ds-text-display` sets `color` to the
 * on-light ink, so a display headline inside it comes out black on the brand
 * plate. `Agenda` sets its own title for the same reason.
 */

/** One labelled contact column, e.g. 'Website' / 'www.eventpipe.com'. */
export interface StatementContact {
  label: string
  value: string
}

export interface StatementProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  /** Brand background plate. */
  plate?: string

  title?: RichText
  lead?: RichText
  titleSize?: TypeStep
  /** Width of the copy column. */
  width?: number
  /** Cap-height anchor for the statement. Measured at 136 in the reference,
   *  which is where a two-line statement balances against the contact row. */
  top?: number
  /** Left edge of the copy column. */
  left?: number
  /** Gap between the statement and its supporting paragraph. Wider than a
   *  content slide's because the statement's lines are so much taller — the
   *  reference leaves about a full line of air there. */
  gap?: number

  contacts?: StatementContact[]
  /** Top of the contact row. */
  contactsTop?: number
  /** Column pitch for the contact row. Measured: the reference's two columns
   *  start at x = 40 and x = 435. */
  contactColumnWidth?: number

  /** Horizontal lockup, bottom-right. Long edge in slide px. */
  logoSize?: number
  /** Suppress the lockup for a statement that is not a sign-off. */
  logo?: boolean
}

export function Statement({
  fit = 'contain',
  plate = 'backgrounds/brand-hex',
  title,
  lead,
  titleSize = 'display',
  width = 1120,
  top = 136,
  left = grid.marginX,
  gap = 30,
  contacts = [],
  contactsTop = 486,
  contactColumnWidth = 395,
  logoSize = 228,
  logo = true,
  ...chrome
}: StatementProps) {
  const contactStyle: CSSProperties = {
    left: grid.marginX,
    top: contactsTop,
    gridTemplateColumns: `repeat(${contacts.length}, ${contactColumnWidth}px)`,
  }

  return (
    <SlideFrame fit={fit} surface="brand" plate={plate} {...chrome}>
      <div className={styles.copy} style={{ left, top, width, gap }}>
        {title && (
          <AccentText content={title} className={`${typeClass(titleSize)} ds-text-on-brand`} />
        )}
        {lead && (
          <AccentText as="p" content={lead} className="ds-text-lead ds-text-on-brand-subtle" />
        )}
      </div>

      {contacts.length > 0 && (
        <dl className={styles.contacts} style={contactStyle}>
          {contacts.map((contact, i) => (
            <div key={i} className={styles.contact}>
              <dt className="ds-text-body ds-text-on-brand-subtle">{contact.label}</dt>
              <dd className="ds-text-h3 ds-text-on-brand">{contact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {logo && (
        <div className={styles.logo}>
          <EpLogo variant="full" orientation="horizontal" tone="white" size={logoSize} />
        </div>
      )}
    </SlideFrame>
  )
}
