import type { ArchitectureProps } from '../../diagrams/Architecture'
import type { SectionDividerProps } from '../../templates/SectionDivider'

/**
 * Constants shared across the four section files.
 *
 * SHAPE and BOUNDARY_LEGEND had four callers — product on 05 plus three department
 * slides in Section IV — and now have one. Those three were replaced: giving
 * marketing, the exec deck and support a full boundary diagram each implied they
 * are as involved as product work, when they are largely graphic-design requests
 * with minimal refinement. See the header of part-four.tsx.
 *
 * They stay here rather than being inlined into 05 because the shape is a deck-level
 * decision, not that slide's: any future boundary diagram must match it or the two
 * will not read as the same picture. WELL and COVER still have several callers.
 */

/** Held constant across every boundary diagram. */
export const SHAPE = {
  nodeHeight: 92,
  nodeGap: 16,
  /** 112, not the default 56. `ArrowLabel` masks the stroke it sits on, and a
   *  mask wider than the gutter lands on the node boxes either side — upstream's
   *  rule 6. Measured: a 186px label in a 72px gutter overlapped a node by 106px.
   *  Every edge label on these slides is written to fit this number. */
  zoneGap: 112,
} as const

/** Solid forward, dashed back, one focal step. Identical on all four so the
 *  fourth one reads in four seconds. */
export const BOUNDARY_LEGEND: ArchitectureProps['legend'] = [
  { label: 'The step that sets scope', kind: 'focal' },
  { label: 'Handoff forward', line: 'accent' },
  { label: 'What comes back', line: 'default', dashed: true },
]

/** Well geometry for a boundary slide: one-line headline, one-line lead, footnote. */
export const WELL = { wellTop: 216, wellBottom: 666 } as const

/**
 * The four section covers.
 *
 * `panel: false` — copy straight onto the brand plate, NOT the white card the
 * title slide uses. Both are documented variants of `SectionDivider`, and the
 * split here is deliberate: the deck's content slides are white, so a full-bleed
 * brand slide is the strongest punctuation available between movements. Five
 * white-card dividers would read as five title slides.
 *
 * `watermark: false` because the covers carry no page furniture — the section
 * number in `label` is the orientation, and a rotated wordmark competes with a
 * headline set at `display`.
 *
 * NO ACCENT RUN IN A COVER TITLE. Every other headline in this deck accents the
 * clause carrying the claim, and on a brand plate that rule inverts: measured
 * against the plate, `--slide-color-accent` gives 1.96:1 where the white line gives
 * 5.38:1. That is under the 3:1 floor for large text, applied to the half of the
 * headline that matters most — the accent was reading as de-emphasis. On the plate
 * the emphasis is the plate; cover titles are plain white with a `\n` break, and
 * the accent stays on the white content slides where it measures properly.
 */
export const COVER = {
  fit: 'none',
  panel: false,
  watermark: false,
  width: 880,
} satisfies Partial<SectionDividerProps>
