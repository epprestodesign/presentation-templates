import { SectionDivider } from '../../templates/SectionDivider'
import { NumberedRows } from '../../templates/NumberedRows'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Pyramid } from '../../diagrams/Pyramid'
import type { DeckSlide } from '../types'
import { COVER } from './shared'

/**
 * PART TWO — SECTION II, slides 06–08: where the work jams.
 *
 * THE ONLY SECTION WITH NO SOLUTION IN IT, and it has to stay that way. Section I
 * establishes seven sources and one designer; this one says what that costs, in the
 * terms the room already recognises. Section III is the response. Mixing the
 * response into the diagnosis is how a process proposal turns into a tooling
 * pitch — the audience stops evaluating whether the problem is real and starts
 * evaluating whether they like the answer.
 *
 * NEW WORK, NOT A CONVERSION. The source deck has no bottleneck slide: it opens on
 * the demand and moves straight to the design system, which is the gap this
 * section fills.
 *
 * TWO SLIDES, DELIBERATELY: the jam, then what it costs. 07 is structural — the
 * routing, drawn — and 08 is consequential, in prose. Splitting them is what stops
 * either slide having to carry both an argument and its evidence.
 */

export const partTwo: DeckSlide[] = [
  /* ------------------------------------------------------------------ 06 */
  {
    id: 'section-bottlenecks',
    title: 'Section II · Where it jams',
    notes:
      'Section two, and no answers in this one either. Where the work actually stalls, and what that costs. If this section is wrong, nothing after it matters — so push back here rather than later.',
    render: () => (
      <SectionDivider
        {...COVER}
        pageNumber={7}
        label="Section II · Bottlenecks"
        title={'Where the work\njams.'}
        lead="Seven sources, one designer, and no queue between them. This section is the diagnosis — what stalls, and what it costs. Still no answers."
      />
    ),
  },

  /* ------------------------------------------------------------------ 07 */
  {
    id: 'the-bottlenecks',
    title: 'Two in three never become a ticket',
    notes:
      'Roughly a month of demand, sorted by how much process each request gets. And the shape is the argument: the drop happens at the FIRST boundary, not at capacity.\n\nAbout twenty-four requests a month. Eight of them arrive as something written down — the product requirements, which come as tickets against the roadmap. The other sixteen are Slack messages: Presto page graphics for sales and support every week, sales and exec decks, Webflow page edits, print collateral. None of those becomes a tracked item, so none of them can be scheduled, counted or pointed at later.\n\nFive get scoped before work starts, and two reach a published coverage document. That is not a failure rate — those two are the ones that needed it. The problem is that nothing decides which five, because there is no queue to decide in.\n\nBe honest about the numbers when you present this. Two coverage docs and four projects with a screen inventory are counted from the Storybook — you can open them. The monthly arrival rate is my estimate from the recurring work, and I would rather be corrected on it than have it quoted as measured.\n\nThe last thing, and it is the one that makes ranking impossible: every one of these is due right away. Not "this sprint" — right away. So there is no ordering to be had even in the eight that do get written down.',
    /* `Pyramid` in funnel orientation, and the type imposes a discipline worth naming:
       widths are PROPORTIONAL TO THE VALUES with no minimum floor, because clamping a
       narrow stage to something legible "turns a 12× funnel into a 3× funnel" and is
       upstream's dishonest-widths anti-pattern. So the stage set had to be chosen to
       survive its own arithmetic rather than the numbers chosen to fit the picture.
     *
     * THREE STAGES, NOT FOUR, FOR EXACTLY THAT REASON. The natural fourth — 2 published
     * coverage docs — is 8% of the top, which draws at 8% of the base and cannot hold a
     * label. Upstream's instruction when a stage genuinely will not fit is that the
     * subject wants two diagrams, not a fudged width; here the cheaper answer was to
     * carry that figure in the third band's annotation, where it still reads.
     *
     * THE FOCAL BAND IS THE SECOND ONE, NOT THE NARROWEST. A funnel's focal marks the
     * conversion or the bottleneck, and the bottleneck is the 24 → 8 drop: two thirds of
     * requests never become a tracked item. Marking the narrowest band instead would
     * argue that too little gets a coverage doc, which is not the claim — those two
     * needed one and the rest did not.
     *
     * WAS A `CurrentState` three-column diagram. That version carried more detail — pain
     * flags, hand-off formats — but it asserted causality without quantity, so "the
     * bottleneck is routing" was a claim rather than a measurement. The consequences it
     * used to draw are slide 09's job in prose.
     *
     * A LABEL MUST FIT THE BAND IT SITS IN, AND THE BANDS NARROW. That is the cost of
     * honest widths: the third band is 20.8% of the top, so 144px, and copy written for
     * the first band's 692px overflows it. Measured before trimming — 'Scoped before work
     * starts' at 172px in 144, and band two's sublabel at 244px in 232. Every string here
     * is now inside its own band. Changing a VALUE re-widths the bands and invalidates
     * these, so re-measure after any change to the numbers.
     *
     * NUMBER PROVENANCE, and the notes state it out loud too: 2 coverage docs and 4
     * projects with a screen inventory are COUNTED from eventpipe-prototype-ds's live
     * index. 12 and 7 requirements are the two coverage docs' own records. The monthly
     * arrival rate is ESTIMATED from the named recurring work — weekly Presto page
     * graphics for sales and support, sales and exec decks, Webflow edits, print
     * collateral — and is the one figure on the slide that cannot be checked. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="The bottleneck"
        pageNumber={8}
        title={['Two in three requests ', { accent: 'never become a ticket.' }]}
        lead="About a month of demand, by how much process each request gets. Product requirements arrive written down. Nothing else does."
        wellTop={216}
        wellBottom={666}
        footnote="Every one of them is due right away, so there is no ordering to be had even among the eight that are written down. The drop is at the first boundary, which is routing — not capacity."
        children={({ width, height }) => (
          <Pyramid
            width={width}
            height={height}
            orientation="funnel"
            axisLabel="Requests per month"
            layers={[
              {
                name: 'Everything that arrives',
                sublabel: 'Seven sources, every channel',
                value: 24,
                note: 'Estimated',
              },
              {
                name: 'Written down as an issue',
                sublabel: 'Product requirements only',
                value: 8,
                note: 'The bottleneck',
                focal: true,
              },
              {
                name: 'Scoped up front',
                sublabel: 'A screen list agreed',
                value: 5,
                note: '2 reach a coverage doc',
              },
            ]}
            legend={[{ label: 'Where the drop happens', kind: 'focal' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 08 */
  {
    id: 'what-it-costs',
    title: 'What it costs',
    notes:
      'Four failure modes, and the point is that none of them is a tooling problem or a speed problem. Working faster produces the wrong thing sooner.\n\nThe third one is the one people underrate: building exactly what was asked for is a failure mode, and it is the only one nobody flags — because from the outside it looks like delivery. The fee change is the concrete case. Support asking for a graphic is the recurring case.\n\nThe fourth is the honest one about me: with no queue, the only lever left is working longer, and that is not a schedule problem, it is a routing one.',
    /* Prose, not a diagram, and that is the right call. These four are consequences
       rather than structure — there is no flow, hierarchy or sequence between them,
       and a diagram would imply one. 07 carries the structure; this carries the cost.
     *
     * The note is the section's hinge into Section III: it names what all four have
     * in common, which is the thing the system is built to fix. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="What it costs"
        pageNumber={9}
        kicker="Four failure modes, none of them a tooling problem"
        title={['Working faster produces ', { accent: 'the wrong thing sooner.' }]}
        titleSize="h2"
        termWidth={260}
        rowsTop={230}
        rows={[
          {
            term: 'Rework, not work',
            detail:
              'A layout composed around placeholder copy gets rebuilt when the real headline arrives. The hours are spent twice, and neither pass is design.',
          },
          {
            term: 'Scope found late',
            detail:
              'The surface nobody listed turns up during the build, which is the most expensive moment to change it. On the fee change, that surface would have deleted a fee across every hotel in the event.',
          },
          {
            term: 'The wrong thing, built well',
            detail:
              'Support asks for a graphic; the answer is usually the copy. Building exactly what was asked for is the only failure mode nobody flags, because from the outside it looks like delivery.',
            changed: true,
          },
          {
            term: 'No way to say no',
            detail:
              'With no queue every request is equally urgent, so the only remaining lever is working longer. That is not a scheduling problem.',
          },
        ]}
        note="All four are the same problem: a request that arrives without a shape cannot be scoped, scheduled or refused. Section III is what gives it one."
      />
    ),
  },
]
