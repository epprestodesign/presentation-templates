import type { DeckMeta, DeckSlide } from './types'
import { partOne } from './parts/part-one'
import { partTwo } from './parts/part-two'
import { partThree } from './parts/part-three'
import { partFour } from './parts/part-four'

/**
 * THE PRESENTATION — "Design production: three request types, one system".
 *
 * Converted from a 1600x900 hand-built HTML deck into this design system. Split
 * across three part files purely so it can be authored in parallel; the order
 * here is the order of the talk and is the only thing that decides it.
 *
 * TWO RULES FOR EVERY SLIDE IN THE PARTS:
 *
 *  1. `fit="none"`. The template would otherwise scale to its container while
 *     the player is also scaling the artboard; the two compound and the slide
 *     renders small and soft.
 *  2. Page numbers are the SOURCE deck's numbering, so a reviewer holding the
 *     original can follow along. The source ran 36 slides at 1600x900; this runs
 *     the same 36 at 1280x720, which is the same 16:9.
 */

export const meta: DeckMeta = {
  title: 'Design production',
  subtitle: 'Three request types, one system',
}

export const slides: DeckSlide[] = [...partOne, ...partTwo, ...partThree, ...partFour]
