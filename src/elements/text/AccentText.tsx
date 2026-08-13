import type { CSSProperties, ElementType } from 'react'
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

const RUN_CLASS = {
  accent: styles.accent,
  bold: styles.bold,
  italic: styles.italic,
  underline: styles.underline,
  muted: styles.muted,
} as const

type StyleKey = keyof typeof RUN_CLASS

/** Resolve a run into its text and every style class that applies.
 *
 *  Styles compose: a run can be teal *and* underlined, which the opening
 *  slide's figures need. The two forms are distinguished by the type of the
 *  style key's value — a string means the shorthand `{ accent: 'text' }`,
 *  where the value IS the text; `true` means the explicit
 *  `{ text: '...', accent: true }` form. */
function unpack(run: TextRun): { text: string; className: string } {
  if (typeof run === 'string') return { text: run, className: '' }

  const entries = run as Record<string, unknown>
  let text = typeof entries.text === 'string' ? entries.text : ''
  const classes: string[] = []

  for (const key of Object.keys(RUN_CLASS) as StyleKey[]) {
    const value = entries[key]
    if (value === undefined || value === false) continue
    // Shorthand: the style key carries the text.
    if (typeof value === 'string') text = value
    classes.push(RUN_CLASS[key])
  }

  return { text, className: classes.join(' ') }
}

export interface AccentTextProps {
  content: RichText
  /** Element to render as — headlines should stay real headings. */
  as?: ElementType
  className?: string
  style?: CSSProperties
}

export function AccentText({ content, as: Tag = 'h1', className, style }: AccentTextProps) {
  const runs = Array.isArray(content) ? content : [content]

  return (
    <Tag className={[styles.root, className].filter(Boolean).join(' ')} style={style}>
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
