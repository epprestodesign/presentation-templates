import type { ElementType } from 'react'
import type { RichText, TextRun } from '../../types'
import styles from './AccentText.module.css'

/**
 * AccentText — a headline where part of the sentence is set in the brand
 * teal, which is the deck's single most repeated typographic move
 * ("The core software business is growing <teal>before the new layers
 * arrive.</teal>").
 *
 * Content is a plain array so a slide stays data, never markup:
 *
 *   content={['The core software business is growing ',
 *             { accent: 'before the new layers arrive.' }]}
 *
 * Keeping runs as data is what lets the PPTX emitter rebuild them as styled
 * text runs inside one editable text box, rather than flattening the headline
 * to an image.
 */

const RUN_CLASS: Record<string, string> = {
  accent: styles.accent,
  bold: styles.bold,
  italic: styles.italic,
  underline: styles.underline,
  muted: styles.muted,
}

/** A run's text may sit under `text` or under the style key itself. */
function unpack(run: TextRun): { text: string; className?: string } {
  if (typeof run === 'string') return { text: run }
  for (const key of Object.keys(RUN_CLASS)) {
    if (key in run) {
      return { text: (run as Record<string, string>)[key], className: RUN_CLASS[key] }
    }
  }
  return { text: (run as { text: string }).text ?? '' }
}

export interface AccentTextProps {
  content: RichText
  /** Element to render as — headlines should stay real headings. */
  as?: ElementType
  className?: string
}

export function AccentText({ content, as: Tag = 'h1', className }: AccentTextProps) {
  const runs = Array.isArray(content) ? content : [content]

  return (
    <Tag className={[styles.root, className].filter(Boolean).join(' ')}>
      {runs.map((run, i) => {
        const { text, className: runClass } = unpack(run)
        return (
          <span key={i} className={runClass}>
            {text}
          </span>
        )
      })}
    </Tag>
  )
}
