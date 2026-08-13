import { grid } from '../../tokens/tokens.js'
import type { RichText, TypeStep } from '../../types'
import { AccentText } from '../text/AccentText'
import { typeClass } from '../../lib/typeClass'
import styles from './SlideHeading.module.css'

/**
 * SlideHeading — the title block that opens almost every content slide:
 * headline, then an optional lead paragraph beneath it.
 *
 * It anchors to the measured grid rather than accepting coordinates, because
 * the whole point of the anchors is that 40 slides put their headline in the
 * same place. Templates choose a width and a size step; nothing else.
 */
export interface SlideHeadingProps {
  title?: RichText
  lead?: RichText
  /** A body paragraph below the lead.
   *
   *  It belongs in this stack rather than being positioned separately: the
   *  headline's height depends on where its copy wraps, so anything anchored
   *  to a fixed y below it eventually collides. Keeping the whole copy column
   *  in one flex stack makes that impossible. */
  body?: RichText
  /** Several paragraphs at ONE size, which `lead` + `body` cannot express —
   *  those are deliberately 17px and 15px, so using them for two equal
   *  paragraphs silently steps the second one down. Rendered at `body` unless
   *  `paragraphSize` says otherwise. */
  paragraphs?: RichText[]
  paragraphSize?: TypeStep
  /** Type step for the headline: 'display' | 'h1' | 'h2'. */
  size?: TypeStep
  /** How wide the copy column runs, in slide px. */
  width?: number
  /** Vertical start. Defaults to the deck's standard headline anchor. */
  top?: number
  /** Anchor by the BOTTOM edge instead, growing upward.
   *
   *  Wins over `top` when both are given. Use it wherever the headline sits low
   *  on the slide: anchored from above, a title that wraps to a second line
   *  grows DOWNWARD and runs off the artboard, and it does so only for the one
   *  string that happens to be long — so it survives review and breaks later. */
  bottom?: number
  left?: number
  /** Gap between headline and lead. */
  gap?: number
  /** Set on brand / photographic surfaces so the lead keeps its contrast. */
  onDark?: boolean
}

export function SlideHeading({
  title,
  lead,
  body,
  paragraphs,
  paragraphSize = 'body',
  size = 'h1',
  width = 720,
  top = grid.titleY,
  bottom,
  left = grid.marginX,
  gap = 18,
  onDark = false,
}: SlideHeadingProps) {
  return (
    <div
      className={styles.heading}
      style={{ left, width, gap, ...(bottom === undefined ? { top } : { bottom }) }}
    >
      {/* The title needs `onDark` as much as the lead does. It previously did
          not get it, and because the shared ds-text-* rule sets `color` to the
          on-light ink, a display title on the brand plate rendered BLACK on
          teal — invisible in review only if you were not looking for it. */}
      {title && (
        <AccentText
          content={title}
          className={[typeClass(size), onDark ? 'ds-text-on-brand' : ''].filter(Boolean).join(' ')}
        />
      )}
      {lead && (
        <AccentText
          as="p"
          content={lead}
          className={['ds-text-lead', onDark ? 'ds-text-on-brand-subtle' : ''].filter(Boolean).join(' ')}
        />
      )}
      {body && (
        <AccentText
          as="p"
          content={body}
          className={['ds-text-body', onDark ? 'ds-text-on-brand-subtle' : ''].filter(Boolean).join(' ')}
        />
      )}
      {paragraphs?.map((paragraph, i) => (
        <AccentText
          key={i}
          as="p"
          content={paragraph}
          className={[typeClass(paragraphSize), onDark ? 'ds-text-on-brand-subtle' : '']
            .filter(Boolean)
            .join(' ')}
        />
      ))}
    </div>
  )
}
