import type { CoBrandSpec } from '../../types'
import { EpLogo } from './EpLogo'
import styles from './CoBrandLockup.module.css'

/**
 * CoBrandLockup — a partner mark beside the EventPipe wordmark, as on the
 * client onboarding slide ("ON LOCATION | eventpipe").
 *
 * Renders a labelled placeholder when no `src` is supplied, so a co-branded
 * deck is buildable and reviewable before the partner's artwork arrives. The
 * placeholder is deliberately obvious rather than subtle — a missing logo
 * should look wrong in review, not quietly ship.
 */
export interface CoBrandLockupProps {
  coBrand: CoBrandSpec
  /** Flips the divider and placeholder ink for dark surfaces. */
  onDark?: boolean
  /** Ink height of the EventPipe wordmark, which sets the lockup's scale. The
   *  wordmark runs roughly 6x its height, so `size` is derived from this rather
   *  than asked for twice. */
  height?: number
}

export function CoBrandLockup({ coBrand, onDark = false, height = 15 }: CoBrandLockupProps) {
  return (
    <div className={[styles.lockup, onDark ? styles.onDark : ''].filter(Boolean).join(' ')}>
      {coBrand.src ? (
        <img
          src={coBrand.src}
          alt={coBrand.name}
          className={styles.partner}
          style={{ maxHeight: height * 1.6 }}
        />
      ) : (
        <span className={styles.placeholder} style={{ height: height * 1.6 }}>
          {coBrand.name}
        </span>
      )}

      <span className={styles.divider} style={{ height: height * 1.4 }} />

      <EpLogo
        variant="wordmark"
        orientation="horizontal"
        tone={onDark ? 'white' : 'color'}
        size={height * 6}
      />
    </div>
  )
}
