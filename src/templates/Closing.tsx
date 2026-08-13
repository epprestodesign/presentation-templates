import { grid } from '../tokens/tokens.js'
import type { PersonSpec, RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { OutlineCard } from '../elements/layout/OutlineCard'
import { img } from '../assets/imagery'
import { IMAGERY_HOST, REMOTE_TEAM } from '../assets/imagery/manifest'
import styles from './Closing.module.css'

/**
 * Template — Closing.
 *
 * The last slide: a thank-you line on the brand gradient, then one outlined
 * card per person carrying a circular headshot, name, role and contact lines.
 *
 * Every number below is measured off slide 16 rather than chosen:
 * cards at y=177, 568x450 with a 24px gap; 40px padding; a 180px portrait; and
 * the four text rows landing on baselines 452.5 / 499 / 549 / 581.5. The gaps
 * are expressed as the flex gaps that put the line boxes there, so changing a
 * type step moves the block coherently instead of breaking one row's spacing.
 *
 * The plate is mirrored. The reference samples bright at top-left and deep at
 * bottom-right with the hex tessellation on its RIGHT half, which is exactly
 * `backgrounds/brand-hex` flipped — same artwork, reversed. Rather than ship a
 * second copy of a 2560px asset, the template draws the plate itself and
 * scales it -1 in x. That is why it does not hand `plate` to SlideFrame.
 */
export interface ClosingProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  titleSize?: TypeStep
  titleWidth?: number
  /** Cap-top of the thank-you line. 72 puts a display-size line's baseline on
   *  the reference's 128, which sits above the standard `titleY` anchor
   *  because this headline is one line, not two. */
  titleTop?: number

  /** One card each. `photo` is a path under src/assets/team; a leading 'team/'
   *  is accepted too, since that is how the asset is named elsewhere. */
  people?: PersonSpec[]

  /** Brand background plate. */
  plate?: string
  /** Flip the plate horizontally. On by default — see the note above. */
  mirrorPlate?: boolean

  /** Top edge of the card row. */
  top?: number
  height?: number
  gap?: number
  /** Right-hand stop for the card row. The watermark gutter, like every other
   *  full-width well in the deck. */
  insetRight?: number

  /** Diameter of the circular headshot. */
  photoSize?: number
  cardRadius?: number
  padding?: number
}

/** Team assets are globbed rather than routed through a shared index so this
 *  template owns its own asset resolution. Same pattern as the Imagery story. */
const teamModules = import.meta.glob<string>('../assets/team/**/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

const team: Record<string, string> = Object.fromEntries(
  Object.entries(teamModules).map(([path, url]) => [
    path.replace(/^\.\.\/assets\/team\//, '').replace(/\.png$/, ''),
    url,
  ])
)

/** Resolve a headshot. `imagery/`-style names ('team/circle/x') and bare paths
 *  ('circle/x') both work.
 *
 *  Local first, then the image host, then null. Throwing was right while
 *  authoring and wrong in a deployed build, where the headshots are gitignored —
 *  it took the whole closing slide down rather than leaving one contact without
 *  a picture. Dev still throws so a misspelt name stops you with the list. */
function portrait(name: string): string | null {
  const key = name.replace(/^team\//, '')
  const url = team[key]
  if (url) return url

  const remote = REMOTE_TEAM[key]
  if (remote) return `${IMAGERY_HOST}/${remote}`

  if (import.meta.env.DEV) {
    throw new Error(
      `Unknown team photo "${name}". Available:\n  ${Object.keys(team).sort().join('\n  ')}`
    )
  }
  return null
}

export function Closing({
  fit = 'contain',
  title = 'Thank you! Reach out to us!',
  titleSize = 'display',
  titleWidth = 920,
  titleTop = 72,
  people = [],
  plate = 'backgrounds/brand-hex',
  mirrorPlate = true,
  top = 177,
  height = 450,
  gap = 24,
  insetRight,
  photoSize = 180,
  cardRadius = 24,
  /** 38, not 40. The reference measures 40px from the card's *outer* edge to the
   *  portrait; the 2px border sits inside that, so the padding is 40 - 2. */
  padding = 38,
  ...chrome
}: ClosingProps) {
  const right = insetRight ?? (chrome.watermark === false ? grid.marginX : grid.watermarkGutter)

  return (
    <SlideFrame fit={fit} surface="brand" {...chrome}>
      {plate && (
        <img
          src={img(plate)}
          alt=""
          className={[styles.plate, mirrorPlate ? styles.mirrored : ''].filter(Boolean).join(' ')}
        />
      )}

      <SlideHeading title={title} size={titleSize} width={titleWidth} top={titleTop} onDark />

      <div className={styles.row} style={{ left: grid.marginX, top, right, height, gap }}>
        {people.map((person, i) => (
          <OutlineCard key={i} radius={cardRadius} padding={padding} className={styles.card}>
            {person.photo && portrait(person.photo) && (
              <img
                src={portrait(person.photo)!}
                alt={person.name}
                className={styles.portrait}
                style={{
                  width: photoSize,
                  height: photoSize,
                  // The reference is circles throughout, but PersonSpec declares
                  // the shape, so honour it rather than silently ignoring it.
                  borderRadius:
                    person.shape === 'rounded'
                      ? 'var(--slide-radius-card)'
                      : 'var(--slide-radius-pill)',
                }}
              />
            )}

            <div className={`${styles.name} ds-text-h1 ds-text-on-brand`}>{person.name}</div>

            {person.role && (
              <div className={`${styles.role} ds-text-h3 ds-text-on-brand`}>{person.role}</div>
            )}

            {(person.email || person.phone || person.linkedin) && (
              <div className={styles.contact}>
                {person.email && <div className="ds-text-lead ds-text-on-brand">{person.email}</div>}
                {person.phone && <div className="ds-text-lead ds-text-on-brand">{person.phone}</div>}
                {person.linkedin && (
                  <div className="ds-text-lead ds-text-on-brand">{person.linkedin}</div>
                )}
              </div>
            )}
          </OutlineCard>
        ))}
      </div>
    </SlideFrame>
  )
}
