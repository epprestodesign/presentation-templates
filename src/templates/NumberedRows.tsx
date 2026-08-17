import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import styles from './NumberedRows.module.css'

/**
 * Template — Numbered Rows.
 *
 * A hairline-ruled list of `01 · term · explanation`. Built because it is the
 * single most repeated slide in a real internal deck — eight of thirty-six —
 * and nothing in the library covered it: `StaircaseCards` is four gradient
 * cards, `Pillars` is icon-led columns, and a table implies its columns are
 * comparable values rather than a term and its gloss.
 *
 * The row is a THREE-COLUMN GRID, not a flex line, so every term starts at the
 * same x whatever the numeral or the term's length. A flowing row would ripple
 * the column down the slide, which is the specific ugliness this shape is prone
 * to.
 *
 * Rows are auto-numbered from their position. Passing the index in would let a
 * reordered list keep stale numbers, which is exactly the kind of error nobody
 * proofreads for.
 */
export interface NumberedRow {
  /** The term. Set in the deck's heading register, so keep it short. */
  term: RichText
  /** The gloss. One or two lines; three means the term is doing too little. */
  detail: RichText
  /** Mark this row as the one that CHANGED.
   *
   *  Exists for the pair of slides that show the same list twice — once as
   *  questions, once as answers — where the whole argument is that only two of
   *  the seven moved. Without it the reader has to diff two slides from memory,
   *  which is exactly the work a slide should be doing for them.
   *
   *  Deliberately restrained: an accent rule on the left edge and the term in
   *  accent ink, not a filled row. A fill would make the changed rows the
   *  subject and the unchanged ones background, when the point is that five of
   *  seven are unchanged. */
  changed?: boolean
  /** Override the displayed numeral.
   *
   *  Auto-numbering is right for a plain list, and wrong for a list that has been
   *  RE-ORDERED and wants to show it: the seven-questions slide moves Solve from
   *  sixth position to second, and the whole point is that it is still question
   *  six. Numbering it `02` because it now sits second erases the move. Pass the
   *  original number and let the position carry the change. */
  numberLabel?: string
}

export interface NumberedRowsProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  /** Small grey line above the headline — the question this slide answers.
   *  Distinct from `eyebrow`, which is the section label in the chrome. */
  kicker?: string
  title?: RichText
  titleSize?: TypeStep
  /** A paragraph between the headline and the rows, when the list needs a
   *  premise before it starts. */
  lead?: RichText

  rows?: NumberedRow[]
  /** The closing line — the implication, set in accent.
   *
   *  Set at `caption`, deliberately matching DiagramSlide's `footnote`. Every
   *  slide in a deck has at most one qualifying line at the bottom — the caveat,
   *  the source, the implication — and they were arriving at two different sizes
   *  depending on which template the slide happened to use. One size makes them
   *  read as the same kind of statement wherever they appear. */
  note?: RichText
  /** Make the note a live link.
   *
   *  The deck renders in a browser, so a URL printed as text is the one thing on
   *  a slide that an audience can see and cannot use. With this set the note
   *  becomes an anchor opening in a new tab.
   *
   *  Note that the PowerPoint export cannot carry it — the emitter writes styled
   *  text runs, not hyperlinks — so a slide whose only call to action is a link
   *  is a web-deck slide. That is the right trade for an appendix. */
  noteHref?: string

  /** Width of the term column. Widen it for longer terms rather than letting
   *  them wrap, which breaks the row's single-line rhythm. */
  termWidth?: number
  /** Top of the list. Defaults below a two-line headline. */
  rowsTop?: number
}

export function NumberedRows({
  fit = 'contain',
  kicker,
  title,
  titleSize = 'h2',
  lead,
  rows = [],
  note,
  noteHref,
  termWidth = 300,
  rowsTop,
  ...chrome
}: NumberedRowsProps) {
  const right = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const width = 1280 - grid.marginX - right

  return (
    <SlideFrame fit={fit} {...chrome}>
      <div className={styles.head} style={{ left: grid.marginX, top: 84, width: width - 40 }}>
        {kicker && <div className={`${styles.kicker} ds-text-body-sm`}>{kicker}</div>}
        {title && <AccentText content={title} className={`ds-text-${kebab(titleSize)}`} />}
        {lead && <AccentText as="p" content={lead} className={`${styles.lead} ds-text-lead`} />}
      </div>

      {/* The list is a flow stack under the head rather than absolutely
          positioned, so a two-line headline pushes it down instead of colliding
          with it. `rowsTop` overrides for the slides that need a fixed anchor. */}
      <div
        className={styles.list}
        style={{
          left: grid.marginX,
          width,
          ...(rowsTop === undefined ? { top: 236 } : { top: rowsTop }),
          ['--nr-term' as string]: `${termWidth}px`,
        }}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className={[styles.row, row.changed ? styles.changed : ''].filter(Boolean).join(' ')}
          >
            <span className={`${styles.index} ds-text-caption`}>
              {row.numberLabel ?? String(i + 1).padStart(2, '0')}
            </span>
            <AccentText as="div" content={row.term} className={`${styles.term} ds-text-h4`} />
            <AccentText as="div" content={row.detail} className={`${styles.detail} ds-text-body`} />
          </div>
        ))}

        {note &&
          (noteHref ? (
            <a
              className={`${styles.note} ${styles.noteLink} ds-text-caption`}
              href={noteHref}
              target="_blank"
              rel="noreferrer"
            >
              {typeof note === 'string' ? note : String(note)}
            </a>
          ) : (
            <AccentText as="p" content={note} className={`${styles.note} ds-text-caption`} />
          ))}
      </div>
    </SlideFrame>
  )
}

/** 'bodyLg' → 'body-lg', matching the generated ds-text-* classes. */
const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
