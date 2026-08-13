import { Icon } from '../brand/Icon'
import styles from './ContactIconRow.module.css'

/**
 * ContactIconRow — the email / phone / LinkedIn strip under a name on the
 * account-team slide.
 *
 * Only the channels actually supplied render, so a person without a published
 * phone number gets a two-icon row rather than a dead glyph. The href is kept
 * live: these slides are also viewed in a browser, where a clickable mailto is
 * the whole point of putting the icon there.
 *
 * LinkedIn is drawn as a filled teal tile with the "in" letterform rather than
 * a Material Symbols glyph — Material Symbols carries no brand marks, and the
 * reference slide shows exactly this tile. Set in the brand teal rather than
 * LinkedIn blue, which is what the original does.
 */
export interface ContactIconRowProps {
  email?: string
  phone?: string
  linkedin?: string
  /** Glyph size in slide px. The reference row measures 21. */
  size?: number
  /** Space between channels. Reference pitch is ~34px at size 21. */
  gap?: number
  className?: string
}

export function ContactIconRow({
  email,
  phone,
  linkedin,
  size = 21,
  gap = 13,
  className,
}: ContactIconRowProps) {
  if (!email && !phone && !linkedin) return null

  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} style={{ gap }}>
      {email && (
        <a className={styles.link} href={`mailto:${email}`} aria-label={`Email ${email}`}>
          <Icon name="mail" size={size} filled weight={400} color="var(--slide-color-accent)" />
        </a>
      )}
      {phone && (
        <a
          className={styles.link}
          href={`tel:${phone.replace(/[^+\d]/g, '')}`}
          aria-label={`Call ${phone}`}
        >
          <Icon name="call" size={size} filled weight={400} color="var(--slide-color-accent)" />
        </a>
      )}
      {linkedin && (
        <a
          className={styles.link}
          href={linkedin}
          aria-label="LinkedIn profile"
          // The tile is square at the glyph size so all three channels sit on
          // one optical baseline.
          style={{ width: size, height: size }}
        >
          <span className={styles.linkedin} style={{ fontSize: size * 0.62 }}>
            in
          </span>
        </a>
      )}
    </div>
  )
}
