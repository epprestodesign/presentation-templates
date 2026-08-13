/* RichText → PptxGenJS text runs.
 *
 * This is the payoff for keeping slide copy as data. A headline written as
 * `['The core business is growing ', { accent: 'before the layers arrive.' }]`
 * becomes ONE PowerPoint text box containing two styled runs — so in Google
 * Slides the presenter clicks it, edits the words, and the teal emphasis
 * survives. Had the headline been HTML, the only export would have been a
 * picture of a headline.
 */
import { color, type as typeTokens } from '../../tokens/tokens.js'
import type { RichText, TextRun, TypeStep } from '../../types'
import { hex, pt } from './geometry'

/** One PptxGenJS text run. */
export interface PptxRun {
  text: string
  options: {
    fontFace: string
    fontSize: number
    bold?: boolean
    italic?: boolean
    underline?: { style: 'sng' }
    color: string
    breakLine?: boolean
  }
}

const FONT = 'Poppins'

/** The style flags a run carries, in the two accepted shapes. */
function unpack(run: TextRun): { text: string; styles: Set<string> } {
  if (typeof run === 'string') return { text: run, styles: new Set() }
  const entries = run as Record<string, unknown>
  let text = typeof entries.text === 'string' ? entries.text : ''
  const styles = new Set<string>()
  for (const key of ['accent', 'bold', 'italic', 'underline', 'muted']) {
    const value = entries[key]
    if (value === undefined || value === false) continue
    if (typeof value === 'string') text = value
    styles.add(key)
  }
  return { text, styles }
}

export interface RunOptions {
  step: TypeStep
  /** Ink for unstyled runs. Defaults to the on-light text colour. */
  ink?: string
  /** Set on brand/photographic surfaces. `accent` runs are switched to white
   *  there: the brand teal on the brand gradient is effectively invisible, so
   *  emphasis on that surface has to come from weight, not hue. */
  onDark?: boolean
  bold?: boolean
}

/** Convert RichText into runs, honouring "\n" as an explicit line break.
 *
 *  PowerPoint has no equivalent of `white-space: pre-line`; a break is a
 *  property of the run that precedes it. So each "\n" is split out and becomes
 *  `breakLine` on the run before it — which is why this cannot be a simple
 *  string pass-through. */
export function toRuns(content: RichText, opts: RunOptions): PptxRun[] {
  const scale = typeTokens.scale[opts.step as keyof typeof typeTokens.scale]
  const size = pt(scale.size)
  const baseInk = opts.ink ?? (opts.onDark ? (color.textOnBrand as string) : (color.text as string))

  const list = Array.isArray(content) ? content : [content]
  const runs: PptxRun[] = []

  for (const item of list) {
    const { text, styles } = unpack(item)
    // Split on newlines so each becomes a breakLine on the preceding run.
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      const isAccent = styles.has('accent')
      const ink = isAccent
        ? opts.onDark
          ? (color.textOnBrand as string)
          : (color.accent as string)
        : styles.has('muted')
          ? (color.textSubtle as string)
          : baseInk

      runs.push({
        text: line,
        options: {
          fontFace: FONT,
          fontSize: size,
          bold: styles.has('bold') || opts.bold || scale.weight >= 600 || undefined,
          italic: styles.has('italic') || undefined,
          underline: styles.has('underline') ? { style: 'sng' } : undefined,
          color: hex(ink),
          // Last line of a run does not break; interior ones do.
          breakLine: i < lines.length - 1 || undefined,
        },
      })
    })
  }

  // PptxGenJS renders an empty run as a stray blank line.
  return runs.filter((r) => r.text.length > 0 || r.options.breakLine)
}

/** Line spacing in points for a step, so a multi-line box matches the HTML. */
export function lineSpacing(step: TypeStep): number {
  const scale = typeTokens.scale[step as keyof typeof typeTokens.scale]
  return pt(scale.size * scale.lineHeight)
}

/** Letter-spacing in points. Tokens express tracking in em. */
export function charSpacing(step: TypeStep): number {
  const scale = typeTokens.scale[step as keyof typeof typeTokens.scale]
  const em = parseFloat(String(scale.tracking)) || 0
  return +(em * scale.size * 0.75).toFixed(2)
}
