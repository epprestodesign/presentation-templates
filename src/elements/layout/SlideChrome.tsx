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

/** Long edge of the watermark, measured off the reference slides.
 *
 *  The source artwork IS the vertical watermark lockup (wordmark above glyph,
 *  already rotated), so this is one mark at one size — no rotating a clipped
 *  wordmark and stacking it above a separately sized glyph, which is what the
 *  previous logo file forced. */
const WATERMARK_SIZE = 142

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
        <div className={styles.watermark}>
          {coBrand && (
            <div className={styles.coBrand}>
              <CoBrandLockup coBrand={coBrand} onDark={onDark} />
            </div>
          )}

          <EpLogo variant="full" orientation="vertical" tone={tone} size={WATERMARK_SIZE} />
        </div>
      )}
    </div>
  )
}

/** Re-exported so templates can reserve the right-hand gutter the watermark
 *  occupies without importing the token module themselves. */
export const watermarkGutter = grid.watermarkGutter
