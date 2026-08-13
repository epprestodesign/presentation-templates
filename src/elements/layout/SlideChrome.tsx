import { grid } from '../../tokens/tokens.js'
import type { SlideChromeSpec } from '../../types'
import { EpLogo } from '../brand/EpLogo'
import { CoBrandLockup } from '../brand/CoBrandLockup'
import styles from './SlideChrome.module.css'

/**
 * SlideChrome — the four fixed marks that make a slide part of the deck:
 * eyebrow (top-left), page number (top-right), classification tag
 * (bottom-left) and the rotated wordmark watermark (bottom-right).
 *
 * Every coordinate here was measured off the reference deck rather than
 * chosen, so a rebuilt slide puts its chrome exactly where the original did.
 * They live in one component so no template can drift.
 */

/** Length of the rotated wordmark, measured off the reference watermark. */
const WORDMARK_LENGTH = 101
/** The wordmark window is 93.44 viewBox units wide inside a 33-unit tall box
 *  (see EpLogo's measured SPLIT), so scaling it to WORDMARK_LENGTH makes the
 *  rotated band this wide. The box carries transparent padding above and
 *  below the ~20-unit ink, which is why the stripe reads thinner than 36px. */
const WORDMARK_BAND = Math.round((WORDMARK_LENGTH * 33) / 93.44)

export interface SlideChromeProps extends SlideChromeSpec {
  /** Flips the chrome ink to white for brand / photographic surfaces. */
  onDark?: boolean
}

/** The deck zero-pads page numbers to two digits ("01", not "1"). Strings
 *  pass through untouched so a slide can label itself "A6". */
function pageLabel(pageNumber: number | string | undefined): string {
  if (pageNumber === undefined || pageNumber === null || pageNumber === '') return ''
  return typeof pageNumber === 'number' ? String(pageNumber).padStart(2, '0') : pageNumber
}

export function SlideChrome({
  eyebrow,
  pageNumber,
  tag,
  watermark = true,
  coBrand,
  onDark = false,
}: SlideChromeProps) {
  const label = pageLabel(pageNumber)
  const tone = onDark ? 'white' : 'color'

  return (
    <div className={[styles.chrome, onDark ? styles.onDark : ''].filter(Boolean).join(' ')}>
      {eyebrow && <div className={`${styles.eyebrow} ds-text-eyebrow`}>{eyebrow}</div>}
      {label && <div className={`${styles.page} ds-text-page-number`}>{label}</div>}
      {tag && <div className={`${styles.tag} ds-text-eyebrow`}>{tag}</div>}

      {watermark && (
        <div className={styles.watermark} style={{ bottom: 39 }}>
          {coBrand && (
            <div className={styles.coBrand}>
              <CoBrandLockup coBrand={coBrand} onDark={onDark} />
            </div>
          )}

          {/* The wordmark reads bottom-to-top. Rotating in place would leave
              the pre-rotation box in flow (101px wide instead of 101px tall),
              so it sits in a slot sized to its rotated footprint. */}
          <div className={styles.wordmarkSlot} style={{ width: WORDMARK_BAND, height: WORDMARK_LENGTH }}>
            <EpLogo variant="wordmark" tone={tone} width={WORDMARK_LENGTH} />
          </div>

          <EpLogo variant="glyph" tone={tone} height={35} />
        </div>
      )}
    </div>
  )
}

/** Re-exported so templates can reserve the right-hand gutter the watermark
 *  occupies without importing the token module themselves. */
export const watermarkGutter = grid.watermarkGutter
