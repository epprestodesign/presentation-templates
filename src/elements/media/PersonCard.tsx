import type { CSSProperties } from 'react'
import { radius } from '../../tokens/tokens.js'
import type { PersonSpec, TypeStep } from '../../types'
import { typeClass } from '../../lib/typeClass'
import { ContactIconRow } from './ContactIconRow'
import { LogoGrid } from './LogoGrid'
import styles from './PersonCard.module.css'

/**
 * PersonCard — one person: headshot, name, role, and whatever hangs off them.
 *
 * The deck introduces the team twice and the two slides are the same content in
 * two arrangements, so they are one component with a `layout`:
 *
 *   'stack' — leadership slide (15). Rounded-square photo, name over role,
 *             then a vertical strip of prior-employer marks.
 *   'row'   — account-team slide. Circular photo on the left, name / role /
 *             contact icons stacked to its right.
 *
 * Two components would have duplicated the name-and-role pair, which is the
 * part most likely to be restyled deck-wide.
 *
 * `shape` is separate from `layout` on purpose: it is a property of the
 * artwork, not the arrangement. The supplied headshots already carry their mask
 * baked in (RGBA with transparent corners), so the CSS radius here only matters
 * for an unmasked photo dropped in later — it can never fight the asset.
 */

/* Every headshot in src/assets/team, keyed by path without extension —
 * 'rounded/tim-brown', 'circle/samantha-barnes'.
 *
 * A local glob rather than `img()`: that helper globs src/assets/imagery only,
 * and the team directory sits outside it. Moving src/assets/team under
 * src/assets/imagery/team would let `img()` cover both and delete this block —
 * neither file is this component's to change. */
const photos = import.meta.glob<string>('../../assets/team/**/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const byName: Record<string, string> = Object.fromEntries(
  Object.entries(photos).map(([path, url]) => [
    path.replace('../../assets/team/', '').replace(/\.(png|jpe?g)$/, ''),
    url,
  ])
)

/** Resolve a headshot name to a URL, failing loudly with the list of what
 *  exists — the same contract as `img()`, so a typo never renders blank. */
export function teamPhoto(name: string): string {
  const url = byName[name]
  if (!url) {
    throw new Error(
      `Unknown headshot "${name}". Available:\n  ${Object.keys(byName).sort().join('\n  ')}`
    )
  }
  return url
}

/** All headshot names, for documentation stories. */
export const teamPhotoNames = Object.keys(byName).sort()

export interface PersonCardProps extends PersonSpec {
  layout?: 'stack' | 'row'
  /** Photo edge in slide px. Both reference slides measure 108. */
  photoSize?: number
  /** Type step for the name. h3 on the leadership row, h2 on the pair grid. */
  nameSize?: TypeStep
  roleSize?: TypeStep
  /** Gap between the photo and the copy block. */
  photoGap?: number
  /** Gap between the name and the role. */
  roleGap?: number
  /** Reserved height for the name block, and for the role block.
   *
   *  Set by TeamRow so every column's prior-employer strip starts on the same
   *  line. Without them a one-line name or a three-line role shifts that
   *  column's logos up or down and the row reads ragged — which the reference
   *  does not, because its six roles all happen to wrap to two lines and
   *  Poppins' third one does not exist there. Left undefined for the row
   *  layout, where each person is on their own line anyway. */
  nameHeight?: number
  roleHeight?: number
  /** Gap between the role and whatever follows it — logos or contact icons. */
  trailingGap?: number
  /** Prior-employer strip: marks per row, and the row height. */
  logoColumns?: number
  logoRowHeight?: number
  logoMaxHeight?: number
  contactSize?: number
  className?: string
}

export function PersonCard({
  name,
  role,
  photo,
  shape = 'rounded',
  priorLogos,
  email,
  phone,
  linkedin,
  layout = 'stack',
  photoSize = 108,
  nameSize = 'h3',
  roleSize = 'bodySm',
  photoGap = 20,
  roleGap = 10,
  nameHeight,
  roleHeight,
  trailingGap = 18,
  logoColumns = 1,
  logoRowHeight = 36,
  logoMaxHeight = 22,
  contactSize = 21,
  className,
}: PersonCardProps) {
  const photoStyle: CSSProperties = {
    width: photoSize,
    height: photoSize,
    borderRadius: shape === 'circle' ? radius.pill : radius.panel,
  }

  return (
    <div
      className={[styles.card, styles[layout], className].filter(Boolean).join(' ')}
      style={{ gap: photoGap }}
    >
      {photo && <img src={teamPhoto(photo)} alt={name} className={styles.photo} style={photoStyle} />}

      <div className={styles.copy} style={{ gap: roleGap }}>
        {/* h4 rather than h3/h2 as the ELEMENT regardless of the type step: a
            slide's headline is the h1 and these names sit under it, so the
            visual size and the heading level are decided separately. */}
        <h4 className={typeClass(nameSize)} style={{ minHeight: nameHeight }}>
          {name}
        </h4>

        {role && (
          <div className={`${typeClass(roleSize)} ds-text-subtle`} style={{ minHeight: roleHeight }}>
            {role}
          </div>
        )}

        {/* Both trailing blocks hang off the same wrapper so `trailingGap`
            means the same thing whichever one a person has. The stack's gap
            already covers `roleGap`, so only the difference is added. */}
        {(priorLogos?.length || email || phone || linkedin) && (
          <div style={{ marginTop: trailingGap - roleGap }}>
            {priorLogos && priorLogos.length > 0 && (
              <LogoGrid
                logos={priorLogos}
                columns={logoColumns}
                rowHeight={logoRowHeight}
                maxHeight={logoMaxHeight}
                cellPadding={0}
                align="start"
              />
            )}
            <ContactIconRow
              email={email}
              phone={phone}
              linkedin={linkedin}
              size={contactSize}
            />
          </div>
        )}
      </div>
    </div>
  )
}
