import type { DeckMeta, DeckSlide } from '../types'
import { partOne } from './part-one'
import { partTwo } from './part-two'
import { partThree } from './part-three'
import { partFour } from './part-four'

/**
 * THE PRESENTATION — "The design process".
 *
 * A SECOND deck, not a revision of the first. "Design production" argues that
 * three request shapes turn around in hours; this one answers the narrower
 * question of where design sits between a product requirement and an engineering
 * build, and where the judgment is inside that. Converted from a hand-built
 * 1600x900 HTML deck of twelve slides, and now twenty-five across four sections.
 *
 * TWO RULES FOR EVERY SLIDE IN THE PARTS:
 *
 *  1. `fit="none"`. The template would otherwise scale to its container while
 *     the player is also scaling the artboard; the two compound and the slide
 *     renders small and soft.
 *  2. Page numbers are SEQUENTIAL, 1–25 — NOT the source deck's, which is what
 *     the other deck does. That rule exists so a reviewer holding the original
 *     printout can follow along, and it stops paying for itself the moment slides
 *     are added: two are new here (04, the named demand; 07, the pipeline) and the
 *     source's own numbering has no room for them. Sequential numbering is now the
 *     authority, and the source HTML is history rather than a parallel copy.
 *
 * ELEVEN OF THE TWENTY-FIVE ARE DIAGRAMS OR FIGURES, which is the other change from
 * the conversion. The first pass had one diagram and seven consecutive slides of
 * hairline-ruled lists — faithful to a source deck that only had one shape
 * available, and monotonous in a system that has twenty-seven. Each swap is
 * justified on its own slide; the test applied was whether the diagram makes a
 * claim the list could not, not whether it looks better.
 *
 * THE FOUR-MOVEMENT STRUCTURE IS NOT THE SOURCE DECK'S. It builds foundationally:
 * the team and its demand (I), where that jams (II), what the system does about it
 * (III), and how each department differs (IV). Each opens on a full-bleed brand
 * cover. The source deck had no sections and no bottleneck slide at all — it went
 * from the demand straight to the design system, which asks the audience to accept
 * a mechanism before hearing the problem.
 *
 * SECTIONS II AND IV ARE NEW WORK, NOT A CONVERSION. They have no source slide:
 * II diagnoses what Section I describes, and IV answers the question slide 05
 * raises: product is one of seven request types, so what do the other five look like.
 * The answer turned out to be that they do not have a
 * comparable shape at all — they are low-refinement graphic-design work whose only
 * real property is volume — so IV plots them rather than diagramming each one.
 *
 * ONE PROJECT CARRIES THE EVIDENCE. Slides 16, 21 and 22 are the same fee change —
 * its inventory tree, its component matrix, and its totals. An earlier cut totalled
 * a different project on 22, which left the deck's only figures slide unverifiable
 * against anything in front of it and contradicted the other deck's account of that
 * project. Every figure on 22 is now derivable from a slide already seen, except
 * total work time, which is why that is the one carrying the claim.
 */

export const meta: DeckMeta = {
  title: 'The design process',
  subtitle: 'Between the requirement and the build',
}

export const slides: DeckSlide[] = [...partOne, ...partTwo, ...partThree, ...partFour]
