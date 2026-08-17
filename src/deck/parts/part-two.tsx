import { FeatureCards } from '../../templates/FeatureCards'
import type { DeckSlide } from '../types'
import { TintTable } from '../../templates/TintTable'
import { ColumnGrid } from '../../templates/ColumnGrid'
import { NumberedRows } from '../../templates/NumberedRows'
import { SectionDivider } from '../../templates/SectionDivider'
import { StatGrid } from '../../templates/StatGrid'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { DataFlow } from '../../diagrams/DataFlow'
import { Architecture } from '../../diagrams/Architecture'
import { Gantt } from '../../diagrams/Gantt'

/**
 * PART TWO — source slides 13–24.
 *
 * Section III ("What I need to start") from the three shapes through to the
 * screen inventory, then Section IV ("The three types") as far as the Phase 2
 * coverage table.
 *
 * THREE CONVENTIONS THIS FILE FOLLOWS, all of them from the source's own
 * structure rather than invented here:
 *
 *  - `fit="none"` on every slide. The player scales the artboard; a template
 *    scaling itself as well compounds the two.
 *  - `pageNumber` is the SOURCE deck's number, not this deck's index.
 *  - The source's `.kicker` — the question a slide answers — becomes the tracked
 *    caps line above a table (`note`) or `kicker` on NumberedRows, and the
 *    source's `.gap-note` closing line becomes `lead` under the headline on the
 *    templates that have no after-the-content slot. The closing line is the
 *    argument of the slide, so it keeps the more prominent position of the two.
 */
export const partTwo: DeckSlide[] = [
  /* ------------------------------------------------------------------ 13 */
  {
    id: 'three-shapes',
    title: 'The three shapes',
    notes:
      'However a request arrives, it is one of these three. All three are fine — I would rather have the vague one early than the complete one late. What does not work is a written spec with no walkthrough and no appetite to react.',
    /* FeatureCards photo-bottom, matching Narrative/Feature Cards → Four Ways To
     * Create Value.
     *
     * Photo-bottom rather than photo-top because on this slide the WORDS are the
     * content: each shape is a give-and-get contract, and photo-top reverses the
     * title onto the image and pushes the copy below it, which subordinates the
     * text to the picture. Here the claim reads first and the photograph supports
     * it — which is also why the copy is a paragraph rather than bullets.
     *
     * The photo still earns its place: the three shapes are three ways of
     * COMMUNICATING, so a recording, a written record and a whiteboard say what
     * they are faster than the labels do. */
    render: () => (
      <FeatureCards
        fit="none"
        eyebrow="The three shapes"
        pageNumber={13}
        title={['Any shape works. ', { accent: "Silence doesn't." }]}
        lead="However it arrives, one of these three. I'd rather have the vague one early than the complete one late."
        titleWidth={1010}
        layout="photo-bottom"
        columns={3}
        top={322}
        height={323}
        cardPaddingTop={20}
        cards={[
          {
            title: 'Discussed + Loom',
            body: [
              'A conversation and a 3–5 min recording. You get something clickable to react to, same day.',
            ],
            image: 'deck/discussed-loom',
            alt: 'A screen-recorded walkthrough on a laptop',
          },
          {
            title: 'Fully written',
            body: [
              'Requirements in Linear — tickets, ACs, roadmap link. You get screens in batches, plus status I can report.',
            ],
            image: 'deck/fully-written',
            alt: 'A desk with written requirements and a laptop',
          },
          {
            title: 'Vague intent',
            body: [
              'A problem and a rough direction, no spec. You get two or three options built to react to.',
            ],
            image: 'deck/vague-intent',
            alt: 'A whiteboard of rough planning notes',
          },
        ]}
      />
    ),
  },
  {
    id: 'shape-01-loom',
    title: 'Shape 01 · discussed + Loom',
    notes:
      'The fastest shape. A requirement gives me the rule; the Loom gives me the order — which screen you open first, what you check next, where you hesitate. That sequence is the screen inventory, and it is almost never in the ticket. One recording also answers design, engineering and QA at once.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Shape 01 · discussed + Loom"
        pageNumber={14}
        kicker="The fastest way to get something in front of people"
        title={['Requirements tell me what. ', { accent: 'A Loom tells me why.' }]}
        lead={[
          'A written requirement gives me the rule. The Loom gives me the ',
          { bold: 'order' },
          ' — which screen you open first, what you check next, where you hesitate. That sequence is the screen inventory, and it’s almost never in the ticket.',
        ]}
        termWidth={280}
        /* Two rows only, so the list is dropped toward the middle of the slide
           rather than left hanging under the headline with 200px of floor. */
        rowsTop={392}
        rows={[
          {
            term: 'A short conversation',
            detail:
              'The constraint behind the ask, and what breaks if we get it wrong. Five minutes is usually enough.',
          },
          {
            term: 'A 3–5 minute Loom',
            detail:
              'Click through the surfaces this touches and think out loud. Not a demo — the reasoning.',
          },
        ]}
        note="It also scales past me. One recording answers questions from design, engineering, and QA without three separate meetings."
      />
    ),
  },

  /* ------------------------------------------------------------------ 15 */
  {
    id: 'shape-02-written',
    title: 'Shape 02 · fully written',
    notes:
      'The shape I need for anything on the roadmap. Speed is useful; traceability is what makes design plannable alongside engineering.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Shape 02 · fully written"
        pageNumber={15}
        kicker="When the work has to be visible, not just fast"
        title={['Written requirements, ', { accent: 'tracked against the roadmap.' }]}
        termWidth={280}
        rowsTop={252}
        rows={[
          {
            term: 'Requirements in Linear',
            detail:
              'Tickets and acceptance criteria in one place, so design work carries the same record as engineering work instead of living in my notes.',
          },
          {
            term: 'Status I can report',
            detail:
              'Inventoried, in design, in review, answered. You can see where every request stands without asking me for an update.',
          },
          {
            term: 'Tied to the roadmap',
            detail:
              'Design progress reads against the plan rather than as a separate list nobody reconciles.',
          },
          {
            term: 'Closed in writing',
            detail:
              'Every ticket gets an answer in the coverage doc when the screens land, so the record is complete rather than implied.',
          },
        ]}
        note="This is the shape I need for anything on the roadmap. Speed is useful; traceability is what makes design plannable alongside engineering."
      />
    ),
  },

  /* ------------------------------------------------------------------ 16 */
  {
    id: 'shape-03-vague',
    title: 'Shape 03 · vague intent',
    notes:
      'A rough intent now beats a complete specification in three weeks. Give me the problem and a direction and I will build two or three things to react to — the reaction is the requirements gathering. Same design thinking, reordered.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Shape 03 · vague intent"
        pageNumber={16}
        kicker="When we don't know enough yet to write a spec"
        title={['Vague is fine. ', { accent: "Waiting isn't." }]}
        lead={[
          'I’d rather have a rough intent now than a complete specification in three weeks. Give me the problem and a direction, and I’ll build two or three things to react to — the reaction ',
          { italic: 'is' },
          ' the requirements gathering.',
        ]}
        termWidth={280}
        rowsTop={302}
        rows={[
          {
            term: 'Lower the bar to start',
            detail:
              'A problem, who it’s for, and one constraint is enough to begin. Precision this early is usually invented anyway.',
          },
          {
            term: 'Solutions build empathy',
            detail:
              'People discover what they need by using something, not by describing it in a meeting.',
          },
          {
            term: 'The reaction is research',
            detail:
              'What someone reaches for first, and what they ignore entirely, is the finding worth having.',
          },
          {
            term: 'Then we write it down',
            detail:
              'Once a direction survives, requirements get written against something real and become shape 02.',
          },
        ]}
        note="Same design thinking, reordered: empathy built through solutions rather than established before them."
      />
    ),
  },

  /* ------------------------------------------------------------------ 17 */
  {
    id: 'intake-to-production',
    title: 'Intake → production',
    notes:
      'The path every request takes, regardless of type. The inventory is the contract: everything after it is production, everything before it is understanding. Answers and decisions from the coverage doc revise the inventory rather than being filed somewhere else.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Intake → production"
        pageNumber={17}
        title={['Understand, ', { accent: 'then produce.' }]}
        titleWidth={900}
        lead="The path every request takes, regardless of type. The inventory is the contract: everything after it is production, everything before it is understanding."
        footnote="Timings, left to right: a 3–5 min Loom · minutes · minutes → hours · with the build. The product owner appears twice — once at intake, once when answers and decisions come back."
        wellTop={252}
        wellBottom={664}
        children={({ width, height }) => (
          <DataFlow
            width={width}
            height={height}
            payloads={[
              { code: 'RQ', label: 'Requirements' },
              { code: 'SI', label: 'Screen inventory' },
              { code: 'PT', label: 'Prototypes' },
              { code: 'CV', label: 'Coverage doc' },
            ]}
            lanes={[
              { name: ['Product', 'owner'], key: 'PO' },
              { name: ['Design', 'production'], key: 'DES' },
            ]}
            steps={[
              { number: '01', label: 'Requirements' },
              { number: '02', label: 'Inventory', focal: true },
              { number: '03', label: 'Build' },
              { number: '04', label: 'Coverage' },
            ]}
            nodes={[
              {
                lane: 'PO',
                step: 0,
                title: 'Requirements',
                sub: 'tickets, ACs, a recorded Loom',
                chips: { out: 'RQ' },
              },
              {
                lane: 'DES',
                step: 1,
                title: 'Touchpoints, in order',
                sub: 'what each shows, what’s out of scope',
                chips: { in: 'RQ', out: 'SI' },
                focal: true,
              },
              {
                lane: 'DES',
                step: 2,
                title: 'Prototypes, not comps',
                sub: 'real components, one shared record',
                chips: { in: 'SI', out: 'PT' },
              },
              {
                lane: 'DES',
                step: 3,
                title: 'Requirement → screen',
                sub: 'decisions made, open questions',
                chips: { in: 'PT', out: 'CV' },
              },
              {
                lane: 'PO',
                step: 3,
                title: 'Answers + decisions',
                sub: 'what review sends back',
                chips: { in: 'CV' },
              },
            ]}
            arrows={[
              { from: { lane: 'PO', step: 0 }, to: { lane: 'DES', step: 1 }, tone: 'accent' },
              { from: { lane: 'DES', step: 1 }, to: { lane: 'DES', step: 2 } },
              { from: { lane: 'DES', step: 2 }, to: { lane: 'DES', step: 3 } },
              { from: { lane: 'DES', step: 3 }, to: { lane: 'PO', step: 3 } },
              /* The feedback loop. It exits the PO's LEFT face and runs back
                 across that lane's empty cells — the derived right-exit would
                 double back over its own node, and a same-lane return in the
                 design lane would run straight through BUILD. */
              {
                from: { lane: 'PO', step: 3 },
                to: { lane: 'DES', step: 1 },
                dashed: true,
                fromSide: 'left',
                toSide: 'top',
                label: 'revises it',
              },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 18 */
  {
    id: 'screen-inventory',
    title: 'The screen inventory',
    notes:
      'The first deliverable, before anything is designed. Agreed up front — silence about a screen, or about a requirement with no screen, is the most expensive kind of ambiguity. First-Time Setup is not a sixth screen: it is the same implementation at a different moment.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="The screen inventory"
        pageNumber={18}
        title={['A list of screens, ', { accent: 'and what each must prove.' }]}
        titleWidth={900}
        lead="Agreed before anything is designed. Silence about a screen — or about a requirement with no screen — is the most expensive kind of ambiguity."
        footnote="A screen isn’t done because it renders once. 12 requirements in · 5 surfaces designed · 2 named as having no UI at all · 5 questions still open in Needs Spec."
        wellTop={220}
        wellBottom={664}
        children={({ width, height }) => (
          <Architecture
            width={width}
            height={height}
            nodeHeight={44}
            nodeGap={8}
            zoneGap={56}
            zones={[
              {
                label: 'Inventory · Teams Mgmt Comms Ph2',
                flex: 1.55,
                nodes: [
                  {
                    id: 's1',
                    name: '01 · Event Registration Settings',
                    sublabel: 'event-level toggle + policy',
                  },
                  {
                    id: 's2',
                    name: '02 · Notification Preferences',
                    sublabel: 'templates, scheduling, recipients',
                  },
                  {
                    id: 's3',
                    name: '03 · First-Time Setup',
                    sublabel: 'same implementation, different moment',
                    kind: 'focal',
                  },
                  {
                    id: 's4',
                    name: '04 · Team Detail',
                    sublabel: 'opt-out + per-team comms log',
                  },
                  {
                    id: 's5',
                    name: '05 · Company Settings',
                    sublabel: 'From / Reply sources',
                  },
                  {
                    id: 'o1',
                    name: 'OUT · P0-8 · Daily job rules',
                    sublabel: 'no mock — not requested',
                    kind: 'optional',
                  },
                  {
                    id: 'o2',
                    name: 'OUT · P0-10 · Recipient resolution',
                    sublabel: 'backend logic, no UI surface',
                    kind: 'optional',
                  },
                ],
              },
              {
                label: 'Every screen',
                flex: 1,
                nodes: [
                  { id: 'st1', name: 'Seeded', kind: 'store' },
                  { id: 'st2', name: 'Configured', kind: 'store' },
                  { id: 'st3', name: 'Unsaved changes', kind: 'store' },
                  { id: 'st4', name: 'Locked', kind: 'store' },
                  { id: 'st5', name: 'Upsell', kind: 'store' },
                  { id: 'st6', name: 'Empty log', kind: 'store' },
                ],
              },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 19 */
  {
    id: 'section-iv-three-types',
    title: 'IV · The three types',
    notes:
      'Section IV. Tweaks, features and ground-up. Feature work is most of what we do, so that is where the detail sits.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={19}
        label="Section IV"
        title="The three types"
        width={940}
        lead={
          'Tweaks, features, and ground-up. Feature work is most of what we do, so that is where the detail sits.\n\n' +
          /* Broken by hand: left to wrap, the contents list splits an entry
             across two lines and the row of numerals stops scanning. */
          '20 The three types · 21 Turnaround · 22 Type 01 · tweaks\n' +
          '23 Type 02 · Phase 2 · 24 Requirement coverage · 25 One implementation\n' +
          '26 Decisions to review · 27 What was not designed · 28 Type 03 · ground-up'
        }
      />
    ),
  },

  /* ------------------------------------------------------------------ 20 */
  {
    id: 'three-types',
    title: 'The three types',
    notes:
      'Naming the type first is what makes the rest predictable. 01 and 02 are production; 03 is concepting and needs a different conversation. All three have a shipped example in the Storybook.',
    render: () => (
      <ColumnGrid
        fit="none"
        eyebrow="The three types"
        pageNumber={20}
        title={['Same process. ', { accent: 'Different scale.' }]}
        titleWidth={900}
        lead="Naming the type first is what makes the rest predictable. 01 and 02 are production; 03 is concepting and needs a different conversation. All three have a shipped example in the Storybook."
        sublabel="Sizing a request before starting it"
        columns={3}
        align="top"
        top={330}
        /* The cells carry prose, not figures, so they step up from the 3-up
           density's 13px note to the deck's body size. */
        noteSize="body"
        cells={[
          {
            label: '01 · Tweaks & fixes',
            note:
              'An existing screen changes behaviour — a field, a limit, a state\n\n' +
              'Screens — 1–5, all existing\n\n' +
              'I need first — tickets + a 3–5 min Loom',
          },
          {
            label: '02 · Feature development',
            note:
              'New capability across existing surfaces, with new components\n\n' +
              'Screens — 4–20, mixed\n\n' +
              'I need first — requirements + a 3–5 min Loom',
          },
          {
            label: '03 · Ground-up product',
            note:
              'No surface exists yet. The screen list is itself the question\n\n' +
              'Screens — unknown, that’s the work\n\n' +
              'I need first — intent, constraints, a conversation',
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 21 */
  {
    id: 'turnaround',
    title: 'Turnaround',
    notes:
      'What each type costs in time, once intake is done. Measured from a signed-off inventory. Screens get composed from the library, not drawn — that is the whole reason these are hours rather than weeks.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Turnaround"
        pageNumber={21}
        title={['Minutes, hours, ', { accent: 'or a couple of days.' }]}
        titleWidth={900}
        lead="What each type costs in time, once intake is done. Measured from a signed-off inventory: screens get composed from the library, not drawn — that is the whole reason these are hours."
        footnote="Tweaks: minutes to a couple of hours, 1–5 existing screens. Feature: hours, 4–20 screens with new components as needed. Ground-up: a couple of days per round, not per project."
        wellTop={280}
        wellBottom={660}
        children={({ width, height }) => (
          <Gantt
            width={width}
            height={height}
            unitLabel="Elapsed"
            units={['10 min', '1 hr', '4 hrs', '1 day', '2 days', '1 week']}
            /* One band per type rather than three tasks in one band: the band
               header carries the type, so the row is free to state the duration
               in the source's own words. */
            phases={[
              {
                label: 'Tweaks',
                tasks: [
                  {
                    name: 'Minutes → a couple of hours',
                    start: 0,
                    end: 2,
                    meta: '1–5 existing screens',
                  },
                ],
              },
              {
                label: 'Feature',
                tasks: [
                  {
                    name: 'Hours',
                    start: 0,
                    end: 3,
                    kind: 'focal',
                    meta: '4–20 screens, new components as needed',
                  },
                ],
              },
              {
                label: 'Ground-up',
                tasks: [
                  {
                    name: 'A couple of days',
                    start: 0,
                    end: 5,
                    /* Short: the longest bar leaves one column of air, and
                       'per round, not per project' clipped at the well's edge.
                       The full phrase is in the footnote. */
                    meta: 'per round',
                  },
                ],
              },
            ]}
            /* One item: the accent bar is the only thing on the chart that needs
               explaining, and the strip also gives the three short bars a floor
               to sit on rather than a third of the well as dead air. */
            legend={[{ label: 'Feature work — most of what we do', kind: 'focal' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 22 */
  {
    id: 'type-01-tweaks',
    title: 'Type 01 · Tweaks & fixes',
    notes:
      'Shipped example: multiple secondary fees. One line of requirement, eight surfaces. The inventory found the screen nobody asked about — syncing a fee slot the event had turned off would have silently deleted that fee across every hotel in the event.',
    render: () => (
      <StatGrid
        fit="none"
        eyebrow="Type 01 · Tweaks & fixes"
        pageNumber={22}
        title={['One rule changed. ', { accent: 'Eight surfaces moved.' }]}
        /* Wide measure so the lead holds to three lines: StatGrid pins its
           sublabel at y=265 and a fourth line runs into it. */
        titleWidth={1120}
        lead={[
          'One line of requirement — allow up to three secondary fees instead of one. The inventory found the screen nobody asked about: syncing a fee slot the event had turned ',
          { italic: 'off' },
          ' would have silently deleted that fee across every hotel in the event. The rule itself lives in one shared module, so the admin side and the guest-facing side cannot disagree about it.',
        ]}
        sublabel="Shipped example · multiple secondary fees"
        sublabelSize="eyebrow"
        sublabelWidth={700}
        columns={4}
        top={352}
        height={210}
        cards={[
          { value: '7', label: 'Tickets in' },
          { value: '8', label: 'Surfaces' },
          { value: '2', label: 'Products' },
          { value: 'hrs', label: 'Turnaround' },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 23 */
  {
    id: 'type-02-feature',
    title: 'Type 02 · Feature development',
    notes:
      'Shipped example: Teams Mgmt Comms Phase 2. This is the shape most of our work takes, so it is worth walking through properly. Same intake as a tweak, same method — only the surface area changes. Everything renders against one tenant, one event, one team.',
    render: () => (
      <StatGrid
        fit="none"
        eyebrow="Type 02 · Feature development"
        pageNumber={23}
        title={['Twelve requirements, ', { accent: 'designed and in review.' }]}
        titleWidth={1120}
        lead="This is the shape most of our work takes, so it is worth walking through properly. Same intake as a tweak — requirements plus a walkthrough — and the method does not change. Only the surface area does. Everything renders against one tenant, one event, one team, so the five screens read as one product rather than five mockups."
        sublabel="Shipped example · Teams Mgmt Comms Phase 2"
        sublabelSize="eyebrow"
        sublabelWidth={700}
        columns={4}
        top={352}
        height={210}
        cards={[
          { value: '12', label: 'Requirements' },
          { value: '20', label: 'Prototypes' },
          { value: '15', label: 'Components' },
          { value: '5', label: 'Surfaces' },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 24 */
  {
    id: 'phase-2-coverage',
    title: 'Phase 2 · requirement coverage',
    notes:
      'Where each requirement was answered. Twelve in all; the rest sit on the same screens. Review becomes confirming coverage rather than hunting for it.',
    render: () => (
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="Phase 2 · requirement coverage"
        pageNumber={24}
        title={['Every ticket, ', { accent: 'mapped to a screen.' }]}
        /* Wide enough that the lead sets on ONE line: seven rows plus a header
           leave no room for a two-line headline block above them. */
        titleWidth={1120}
        lead="Twelve in all; the rest sit on the same screens. Review becomes confirming coverage rather than hunting for it."
        tableTop={200}
        minRowHeight={48}
        headers={['Ticket', 'Requirement', 'Where it lives']}
        columnWidths={[130, 560, 465]}
        rows={[
          { label: 'P0-1', cells: ['Event-level communications toggle', 'Event Registration Settings'] },
          { label: 'P0-2', cells: ['Team-level opt-out', 'Team Detail'] },
          { label: 'P0-3', cells: ['Default templates — three seeded', 'First-Time Setup'] },
          { label: 'P0-4', cells: ['Add and delete reminder templates', 'Notification Preferences'] },
          { label: 'P0-6', cells: ['Email template variables', 'Personalization Menu'] },
          { label: 'P0-9', cells: ['Per-team communication log', 'Team Detail'] },
          { label: 'P1-1', cells: ['Email preview and test send', 'Notification Preferences'] },
        ]}
      />
    ),
  },
]
