import { Agenda } from '../../templates/Agenda'
import type { DeckSlide } from '../types'
import { SectionDivider } from '../../templates/SectionDivider'
import { TintTable } from '../../templates/TintTable'
import { NumberedRows } from '../../templates/NumberedRows'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Swimlane } from '../../diagrams/Swimlane'
import { LayerStack } from '../../diagrams/LayerStack'

/**
 * PART ONE — source slides 01–12: the title, the overview, and the first two
 * sections ("The shift", "The foundation").
 *
 * Every slide carries `fit="none"` and the SOURCE deck's page number. See the
 * header of src/deck/slides.tsx for why both are non-negotiable.
 *
 * FOUR CONVERSION DECISIONS worth knowing before editing these:
 *
 *  1. The source's `.kicker` (the question a slide answers, above the headline)
 *     has a real home only on `NumberedRows`, which has a `kicker` prop. On the
 *     two table slides it becomes the `lead` — or, on 02, the tracked `note`
 *     above the table, which is exactly that prop's job.
 *
 *  2. The source's `.gap-note` closing line has no band under a full-width
 *     table, so on 02 and 09 it is folded into the `lead` as the accented
 *     clause. That keeps it as the slide's argument rather than demoting it to a
 *     caption, and it is why both those leads run two lines. On 06, which is
 *     `NumberedRows`, it sits in `note` where it belongs.
 *
 *  3. TWO tables in twelve slides, both `variant="ruled"`. The cyan ramp only
 *     means emphasis if it is the exception, and neither of these slides is
 *     making the argument — 02 is a contents page and 09 is a reference matrix.
 *     05 and 06 were tables in an early pass and are now `NumberedRows`, which
 *     is what their content always was.
 *
 *  4. The source over-accents by our standards — slide 06 marks two of seven
 *     rows, and slide 04 accents three separate strings. Each slide here spends
 *     its accent once, on the clause that carries the claim.
 */

/** Slides 05 and 06 are the same list twice — the seven questions, then the
 *  seven answers — so they share their geometry, and reading identically is the
 *  point of the pair.
 *
 *  `NumberedRows` rather than a table: the content IS an ordered list ("seven
 *  questions, in order"), and the template auto-numbers 01–07, so the source's
 *  own "1 ·" prefixes become the numeral column for free. The step name is the
 *  term; the source's bold sub-heading rides at the head of the detail as a bold
 *  run rather than claiming a third column, because seven rows only fit if every
 *  detail stays on ONE line — and 180px of term column is what buys that.
 *
 *  `rowsTop` is 10px above the default so slide 06's closing note clears the
 *  content floor; both slides use it so the pair still lines up row for row. */
const SEVEN_GEOMETRY = { termWidth: 180, rowsTop: 226 } as const

export const partOne: DeckSlide[] = [
  /* ------------------------------------------------------------------ 01 */
  {
    id: 'title',
    title: 'One designer, every request',
    notes:
      "What I need to start, how fast each shape moves, and how you see where it stands. I'm the only product designer on the team, so the limit on design throughput isn't taste or tooling — it's how work reaches me.",
    /* SectionDivider's white-panel variant rather than `Cover`: a title well
       plus a brand plate says the same thing as the cover without the photo
       strip, and a talk about how work reaches one person does not open on
       stock photography.

       The frame label is in `label`, NOT `eyebrow`. With `panel` on, the white
       card covers all four corners the chrome occupies, and the chrome's ink is
       white on a brand surface — an eyebrow here renders white on white. Stating
       the section in the copy stack is the variant's own documented answer, and
       it is why `watermark` is off too. */
    render: () => (
      <SectionDivider
        fit="none"
        watermark={false}
        panel
        label="Internal · Product design · How I take in work"
        title={['One designer,\n', { accent: 'every request.' }]}
        lead="I'm the only product designer on the team, so the limit on design throughput isn't taste or tooling — it's how work reaches me. The design system carries the foundations for everything we make — without it every request starts from scratch. Give me a request in one of three shapes and most of them turn around in hours."
        width={820}
      />
    ),
  },

  /* ------------------------------------------------------------------ 02 */
  {
    id: 'overview',
    title: 'Overview',
    notes:
      'Six sections, and what each one answers. One principle underneath all of it: it is better to let people feel a product than to sell them screens.',
    /* Agenda, matching Openers → Agenda → Five Part.
     *
     * The slide-range column is deliberately gone. The source table carried a
     * "Slides 04–06" column, which is a table of contents for a document rather
     * than an agenda for a talk — it invites the audience to work out how far in
     * they are instead of listening to the section they are in. What each section
     * ANSWERS is the useful half, and it is what survives here.
     *
     * Auto-numbering also means the roman numerals are gone; the sections are now
     * 01–06, matching the deck's page numbering rather than fighting it. */
    render: () => (
      <Agenda
        fit="none"
        eyebrow="Overview"
        title="What I need, and what you get back"
        pageNumber={2}
        /* Six items rather than the reference's five, so the numeral gives up
           height and the gap takes it: 42px numerals free ~96px of column, which
           buys a 30px gap instead of the cramped 20 the full-size numerals
           forced. The numeral is an index, not a value — it is the right thing to
           shrink. */
        numberSize={42}
        numberWidth={110}
        rowGap={30}
        items={[
          {
            title: 'The shift',
            detail: 'Why solution-first works now, and which rigor did not change',
          },
          {
            title: 'The foundation',
            detail: 'The design system everything is built on, and what it saves',
          },
          {
            title: 'What I need to start',
            detail: 'The three shapes a request can arrive in — and the bar for each',
          },
          {
            title: 'The three types',
            detail: 'Tweaks, features, ground-up — most of the detail on feature work',
          },
          {
            title: 'What comes back',
            detail: 'The documents that close the loop, and why they hold up',
          },
          {
            title: 'The contract',
            detail: 'What each type needs from you, and what I am asking for',
          },
        ]}
      />
    ),
  },

  {
    id: 'section-shift',
    title: 'Section I — The shift',
    notes:
      'Coming up: 04 the framework, then and now · 05 the seven questions, defined · 06 the same seven, answered.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={3}
        label="Section I"
        title="The shift"
        lead="The same seven questions I was trained on. One of them moved, and everything downstream changed with it."
        width={860}
      />
    ),
  },

  /* ------------------------------------------------------------------ 04 */
  {
    id: 'then-and-now',
    title: 'Same questions, new order',
    notes:
      'This is the framework I was trained on, in its original order, and the order I run it in now. Nothing was dropped. Solve moves from sixth to second, and from being the output of the sequence to being the instrument for answering the rest of it.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="The process I was trained on"
        pageNumber={4}
        title={['Same questions. ', { accent: 'New order.' }]}
        lead="All seven questions survive. Only Solve moves — from the end of the sequence to near the front, where it becomes the instrument for answering the rest."
        footnote={[
          'Steps 2 to 7 are still answered — but against something clickable, not on paper. ',
          { accent: "It's better to let people feel a product than to sell them screens." },
        ]}
        wellTop={214}
        wellBottom={654}
        children={({ width, height }) => (
          <Swimlane
            width={width}
            height={height}
            columns={7}
            labelWidth={112}
            nodeHeight={72}
            lanes={[
              { key: 'then', name: 'Then' },
              { key: 'now', name: 'Now', tint: true },
            ]}
            /* NO EDGE, deliberately. The move IS the slide, but Swimlane routes a
               backwards lane-crossing out of the source's LEFT face and back
               along its own lane — a rule that assumes the cells it crosses are
               empty. Here the lane is full, so the return leg ran behind five
               boxes and surfaced only in the gutters between them, which read as
               "2 · Who drops to Solve". Both positions of the one box carry the
               accent and say where they sit instead; the legend names the device
               and the lead states the movement. */
            legend={[
              { label: 'The one step that moved', kind: 'focal' },
              { label: 'Unchanged in order', kind: 'step' },
            ]}
            nodes={[
              { id: 't1', lane: 'then', col: 0, name: '1 · Why' },
              { id: 't2', lane: 'then', col: 1, name: '2 · Who' },
              { id: 't3', lane: 'then', col: 2, name: '3 · When' },
              { id: 't4', lane: 'then', col: 3, name: '4 · What' },
              { id: 't5', lane: 'then', col: 4, name: '5 · Pick' },
              {
                id: 't6',
                lane: 'then',
                col: 5,
                name: '6 · Solve',
                sublabel: 'sixth of seven',
                kind: 'focal',
              },
              { id: 't7', lane: 'then', col: 6, name: '7 · How' },

              { id: 'n1', lane: 'now', col: 0, name: '1 · Why' },
              {
                id: 'n6',
                lane: 'now',
                col: 1,
                name: '6 · Solve',
                sublabel: 'now second',
                kind: 'focal',
              },
              { id: 'n2', lane: 'now', col: 2, name: '2 · Who' },
              { id: 'n3', lane: 'now', col: 3, name: '3 · When' },
              { id: 'n4', lane: 'now', col: 4, name: '4 · What' },
              { id: 'n5', lane: 'now', col: 5, name: '5 · Pick' },
              { id: 'n7', lane: 'now', col: 6, name: '7 · How' },
            ]}
            /* The move itself, drawn. `edges` would auto-route this and send the
               stroke back along the THEN lane behind five occupied boxes; an
               annotation routes it through the lane boundary, which is open
               canvas. */
            annotations={[{ from: 't6', to: 'n6', label: 'moves to 2nd' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 05 */
  {
    id: 'seven-questions',
    title: 'The seven questions, defined',
    notes:
      'The framework as I was taught it. Worth reading once so the next slide lands — it is these same seven questions with real answers in them.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="The seven questions, defined"
        pageNumber={5}
        kicker="The framework as I was taught it — what each step is actually asking"
        title={['Seven questions, ', { accent: 'in order.' }]}
        {...SEVEN_GEOMETRY}
        rows={[
          {
            term: 'Why',
            detail: [
              { bold: 'Understand the goal. ' },
              'Why does this matter? What problem does it solve? How does it help customer and business?',
            ],
          },
          {
            term: 'Who',
            detail: [
              { bold: 'Define the audience. ' },
              'Who is the target audience? Which groups inside it have different needs and motivations?',
            ],
          },
          {
            term: 'When & where',
            detail: [
              { bold: 'Understand the context. ' },
              'When and where will they use this? What triggers the need? What emotions come with it?',
            ],
          },
          {
            term: 'What',
            detail: [
              { bold: 'List ideas — A, B, C. ' },
              'What could we build — physical or digital, watch to TV, graphic, voice, AR or VR?',
            ],
          },
          {
            term: 'Prioritise',
            detail: [
              { bold: 'Choose an idea. ' },
              'Place the ideas on an impact-versus-effort matrix. High impact, low effort wins.',
            ],
          },
          {
            term: 'Solve',
            detail: [
              { bold: 'Storyboard, task-list, sketch. ' },
              'Map the journey, list the tasks, then sketch four possible interfaces, a minute each.',
            ],
          },
          {
            term: 'Measure success',
            detail: [
              { bold: 'Know if it worked. ' },
              'Task success rate, completion time, engagement, retention, conversion, revenue, NPS.',
            ],
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 06 */
  {
    id: 'seven-answered',
    title: 'The same seven, answered',
    notes:
      'Teams Management Comms Phase 2, run through the same seven questions. Nothing was skipped — steps 1 and 7 run exactly as they always did. What changed is step 5: a guess on a grid became two working models to choose between.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="The same seven, answered"
        pageNumber={6}
        kicker="Teams Management Comms Phase 2, run through the same seven questions"
        title={['Same questions, ', { accent: 'real answers.' }]}
        {...SEVEN_GEOMETRY}
        rows={[
          {
            term: 'Why',
            numberLabel: '01',
            detail: [
              { bold: 'Stay-to-Play compliance. ' },
              'Teams must book inside contracted blocks. This automates a nudge organizers did by hand.',
            ],
          },
          {
            term: 'Solve',
            numberLabel: '06',
            changed: true,
            detail: [
              { bold: 'Twenty prototypes, documented as built. ' },
              'Fifteen components, five surfaces, six shared state modules — all clickable.',
            ],
          },
          {
            term: 'Who',
            numberLabel: '02',
            detail: [
              { bold: 'Two audiences. ' },
              'The housing manager configuring the comms, and the team manager receiving them. One system.',
            ],
          },
          {
            term: 'When & where',
            numberLabel: '03',
            detail: [
              { bold: 'On a cadence, before the event. ' },
              'Configured against a date range relative to event start. Read as email on a phone.',
            ],
          },
          {
            term: 'What',
            numberLabel: '04',
            detail: [
              { bold: 'Twelve requirements. ' },
              'Seeded templates, reminders, scheduling, recipients, preview and test send, a per-team log.',
            ],
          },
          {
            term: 'Pick',
            numberLabel: '05',
            changed: true,
            detail: [
              { bold: 'Two models, side by side. ' },
              'Review pivoted from unlimited named reminders to four numbered tiers; both kept.',
            ],
          },
          {
            term: 'Measure',
            numberLabel: '07',
            detail: [
              { bold: 'Deferred on purpose. ' },
              'The comms dashboard that would measure this is still Needs Spec; forecasting waits for it.',
            ],
          },]}
        note="Nothing was skipped. Steps 1 and 7 run exactly as they always did — what changed is step 5, where a guess on a grid became two working models to choose between."
      />
    ),
  },

  /* ------------------------------------------------------------------ 07 */
  {
    id: 'section-foundation',
    title: 'Section II — The foundation',
    notes:
      'Coming up: 08 three layers · 09 Phase 1 → Phase 2 · 10 Storybook as the record · 11 working from the foundation.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={7}
        label="Section II"
        title="The foundation"
        lead="Without a design system every request starts from scratch. That has always been the bottleneck — and it is the one thing we have already solved."
        width={880}
      />
    ),
  },

  /* ------------------------------------------------------------------ 08 */
  {
    id: 'three-layers',
    title: 'Three layers',
    notes:
      'Three layers, and every request touches all three. The middle one is the only one that is built per request; the bottom one is the reason the middle one is small.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Three layers"
        pageNumber={8}
        title={['The foundation carries\n', { accent: 'everything we make.' }]}
        lead="Every request draws on the foundation and adds to the layer above it. Without that base, each one starts from scratch — which is what the bottleneck always was."
        footnote={[
          'Work moves down into the foundation ',
          { accent: 'when it proves reusable.' },
        ]}
        wellTop={264}
        wellBottom={654}
        children={({ width, height }) => (
          <LayerStack
            width={width}
            height={height}
            direction={{ label: 'Built on', dir: 'down' }}
            layers={[
              {
                index: 'L3',
                name: 'Prototypes & concepts',
                sublabel: 'Clickable screens for every request — the thing people react to',
                note: 'New every time',
              },
              {
                index: 'L2',
                name: 'Project layer',
                sublabel: "Built per request, documented as it's built",
                note: 'Retired when the phase is done',
                focal: true,
              },
              {
                index: 'L1',
                name: 'The foundation',
                sublabel: '41 shared components · tokens · app shell',
                note: 'Never rebuilt',
              },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 09 */
  {
    id: 'phase-one-to-two',
    title: 'Phase 1 → Phase 2',
    notes:
      'Same team, same surface, one phase apart. Phase 2 covered five times the surface for half again the components, and deleted ten of Phase 1s. That gap is the compounding — and it is the argument for the foundation.',
    render: () => (
      /* `Comparison` was tried first and does not fit: it is two bands of
         SEQUENTIAL steps with a side label, and this content is a matrix — five
         named measures × two phases. Mapping the phases onto the two bands
         leaves the row labels ("Stories built", "Deliberately retired") with
         nowhere to live, so "13" above "20" would be paired by position alone;
         and its `inline` interior runs its steps across one line, which the
         longest value here ("2 — Personalization Menu, Text Formatter") will not
         survive. Ruled table instead: the row label is the axis the whole slide
         turns on, and quiet rules keep the cyan for the slides that argue. */
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="Proof · Teams Mgmt Phase 1 → 2"
        pageNumber={9}
        title={['More scope,\n', { accent: 'fewer things built.' }]}
        lead={[
          'The same team, the same surface, one phase apart. ',
          {
            accent:
              'Phase 2 covered five times the surface for half again the components — and shrank the library while doing it. That gap is the compounding.',
          },
        ]}
        headers={['', 'Phase 1 · DES-207', 'Phase 2 · STP Comms']}
        columnWidths={[300, 427, 428]}
        minRowHeight={68}
        rows={[
          {
            label: 'Scope',
            cells: ['One surface, two versions', '12 requirements across five surfaces'],
          },
          { label: 'Stories built', cells: ['13', '20'] },
          {
            label: 'Shared primitives reused',
            cells: ['The foundation as it stood', '9, unchanged'],
          },
          {
            label: 'Carried from Phase 1',
            cells: ['—', '2 — Personalization Menu, Text Formatter'],
          },
          { label: 'Deliberately retired', cells: ['—', '10 Phase 1 components deleted'] },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 10 */
  {
    id: 'storybook-record',
    title: 'Storybook as the record',
    notes:
      'Every concept and every solution ends up in Storybook. That is what makes the system grow from being used rather than from someone finding time to curate it.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Storybook as the record"
        pageNumber={10}
        kicker="Where every concept and solution ends up"
        title={['The system grows\n', { accent: 'from being used.' }]}
        termWidth={300}
        /* 40px below the default. Four rows of two lines only reach y=582 from
           there, and at the default anchor the list finished 140px clear of the
           floor with the headline crowded above it — the list, not the
           whitespace, should own the middle of the slide. */
        rowsTop={276}
        rows={[
          {
            term: 'Every prototype lands here',
            detail:
              'Concepts, rejected options, and the screens that shipped — all in the same place, so nothing useful only exists in a chat thread.',
          },
          {
            term: 'Documented while built',
            detail:
              "Each component's doc says what it replaced on the original screen and what review changed, so the itemisation sits next to the thing rather than in a list that goes stale.",
          },
          {
            term: "It can't drift",
            detail:
              'The documentation lives beside what it describes and deploys with it on every push. There is no second copy to fall out of date.',
          },
          {
            term: 'Anyone can read it',
            detail:
              'A link, no sign-in. The system is the shared reference instead of my memory being the shared reference.',
          },
        ]}
        note="This is why the second phase of anything is faster than the first, and why type 01 requests keep getting quicker."
      />
    ),
  },

  /* ------------------------------------------------------------------ 11 */
  {
    id: 'working-from-foundation',
    title: 'Working from the foundation',
    notes:
      'What working on top of the system actually looks like day to day: a new screen is mostly assembly, and the genuinely new part gets built once.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Working from the foundation"
        pageNumber={11}
        kicker="What working on top of the system actually looks like"
        title={['Composed,\n', { accent: 'not drawn.' }]}
        termWidth={300}
        /* Matches slide 10 — see the note there. */
        rowsTop={276}
        rows={[
          {
            term: 'Components already exist',
            detail:
              "A new screen is mostly assembly. What's genuinely new gets built once and joins the library for the next request.",
          },
          {
            term: 'Named by their screen',
            detail:
              "Component files carry the screen's prefix, so the sidebar mirrors the inventory and nothing ends up orphaned.",
          },
          {
            term: 'Shared state, not copies',
            detail:
              'Two views of one surface import the same module rather than duplicating it, so they cannot disagree.',
          },
          {
            term: 'Retired work gets deleted',
            detail:
              'Components from a previous phase are removed rather than carried forward, so the library reflects what is current.',
          },
        ]}
        note="Each request leaves the system more capable rather than more crowded."
      />
    ),
  },

  /* ------------------------------------------------------------------ 12 */
  {
    id: 'section-what-i-need',
    title: 'Section III — What I need to start',
    notes:
      'Coming up: 13 the three shapes · 14 discussed + Loom · 15 fully written · 16 vague intent · 17 intake → production · 18 the screen inventory.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={12}
        label="Section III"
        title={'What I need\nto start'}
        lead="Three shapes a request can arrive in. Any of them works — what stalls me is a spec with no walkthrough and no appetite to react."
        width={880}
      />
    ),
  },
]
