import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec, TypeStep } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { AccentText } from '../elements/text/AccentText'
import { typeClass } from '../lib/typeClass'
import styles from './SectionDivider.module.css'

/**
 * Template — Section Divider.
 *
 * The slide that announces a new part of the deck: a label, a big title and an
 * optional supporting line, on the brand plate. Two forms, both in the
 * reference deck:
 *
 *   `panel: false` — copy straight onto the gradient plate (20.png IS the bare
 *      plate, so this variant is that artwork plus the copy).
 *   `panel: true`  — a white card over the plate (19.png), which is how the
 *      deck opens a section that then continues on white.
 *
 * The copy is vertically centred inside whichever box it is in — the panel
 * rect, or the slide's margins — rather than pinned to a headline anchor. A
 * divider carries one to three lines and nothing else, so centring is what
 * keeps a one-line and a three-line divider both looking deliberate; the fixed
 * `titleY` anchor exists to align a headline with the *body* content below it,
 * and a divider has none.
 *
 * The label is the divider's own, not `SlideChrome`'s eyebrow: with a panel,
 * the chrome's corners fall on white where its white ink would vanish, so a
 * divider states its section in the copy stack where the ink can follow the
 * surface.
 */
export interface SectionDividerProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  /** Brand background plate. */
  plate?: string

  /** Tracked caps line above the title, e.g. 'SECTION 02'. */
  label?: string
  title?: RichText
  lead?: RichText
  titleSize?: TypeStep
  /** Width of the copy column. */
  width?: number
  /** Left edge of the copy. Defaults to the page margin, or a step inside it
   *  when the panel is showing. */
  left?: number

  /** Lay a white card over the plate. */
  panel?: boolean
  /** Panel rect, measured off 19.png: inset 20 top / right / bottom, and the
   *  left edge bleeds off the artboard. */
  panelTop?: number
  panelRight?: number
  panelBottom?: number
  /** 24px, measured off the bottom-right arc of 19.png. The panel's left
   *  corners are pushed off-canvas by exactly this much, which is what makes
   *  its left edge read as a bleed rather than a card floating in the middle. */
  panelRadius?: number
}

export function SectionDivider({
  fit = 'contain',
  plate = 'backgrounds/brand-hex',
  label,
  title,
  lead,
  titleSize = 'display',
  width = 900,
  left,
  panel = false,
  panelTop = 20,
  panelRight = 20,
  panelBottom = 20,
  panelRadius = 24,
  ...chrome
}: SectionDividerProps) {
  const panelStyle: CSSProperties = {
    // Left corners live off-canvas so the visible left edge is straight.
    left: -panelRadius,
    top: panelTop,
    right: panelRight,
    bottom: panelBottom,
    borderRadius: panelRadius,
  }

  // Copy is centred in the panel when there is one, otherwise in the slide's
  // own margins.
  const wellStyle: CSSProperties = {
    left: left ?? (panel ? grid.marginX + 40 : grid.marginX),
    width,
    top: panel ? panelTop : grid.marginTop,
    bottom: panel ? panelBottom : grid.marginBottom,
  }

  // Ink follows the surface under the copy, not the surface of the slide.
  const onDark = !panel
  const titleInk = onDark ? 'ds-text-on-brand' : ''
  const labelInk = onDark ? 'ds-text-on-brand-subtle' : 'ds-text-accent'
  const leadInk = onDark ? 'ds-text-on-brand-subtle' : 'ds-text-muted'

  return (
    <SlideFrame fit={fit} surface="brand" plate={plate} {...chrome}>
      {panel && <div className={styles.panel} style={panelStyle} />}

      <div className={styles.well} style={wellStyle}>
        {label && <div className={`${styles.label} ds-text-eyebrow ${labelInk}`}>{label}</div>}
        {title && <AccentText content={title} className={`${typeClass(titleSize)} ${titleInk}`} />}
        {lead && <AccentText as="p" content={lead} className={`ds-text-lead ${leadInk}`} />}
      </div>
    </SlideFrame>
  )
}
