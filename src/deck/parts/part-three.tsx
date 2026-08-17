import type { DeckSlide } from '../types'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { NumberedRows } from '../../templates/NumberedRows'
import { ColumnGrid } from '../../templates/ColumnGrid'
import { SectionDivider } from '../../templates/SectionDivider'
import { TintTable } from '../../templates/TintTable'
import { ProcessFlow } from '../../diagrams/ProcessFlow'
import { Swimlane } from '../../diagrams/Swimlane'

/**
 * PART THREE — slides 25 to 36.
 *
 * The back half of the talk: the last three feature-work slides, the ground-up
 * convergence diagram, what comes back when screens are built, and the contract.
 *
 * Two rules, from src/deck/slides.tsx and true of every slide below:
 * `fit="none"` (the player already scales the artboard), and `pageNumber` is the
 * SOURCE deck's number so a reviewer holding the original can follow along.
 *
 * THREE PLACES THE SOURCE DID NOT MAP ONE-TO-ONE, all noted at their slide:
 *
 *  - `TintTable` has no `kicker` and no footnote, so on 26 the source's kicker
 *    becomes the `lead` and the `.gap-note` becomes the tracked `note` above the
 *    table. It is the deck's ONE table here, and it runs `variant="ruled"` — a
 *    six-row reference table is scanned line by line, and the cyan ramp competes
 *    with the eye's own line-tracking when it does.
 *  - `SectionDivider` has no contents list, so on 29 / 34 the numbered contents
 *    ride in the chrome's bottom-left `tag` — a tracked strip, which is what the
 *    source's own contents row was.
 *  - `Swimlane` draws no column headers, so on 33 the six step names ARE the
 *    agent lane's node names, and the ME lane names what it does at each one.
 */
export const partThree: DeckSlide[] = [
  {
    id: 'one-implementation',
    title: 'One implementation',
    notes:
      'This is the discipline that keeps five screens honest. The configured screen and first-time setup are not two screens — they are one product surface at two moments, so they cannot drift. Everything left in a story file is the difference, nothing else.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Phase 2 · one implementation"
        pageNumber={25}
        kicker="The discipline that keeps five screens honest"
        title={['Two moments, ', { accent: 'one editor.' }]}
        termWidth={250}
        rows={[
          {
            term: 'Not two screens',
            detail:
              'The configured screen and first-time setup are the same product surface at two moments. The editor, its dialogs and all their state live in one module both import.',
          },
          {
            term: 'Only differences stay',
            detail:
              'What is left in each story file is the list, the starting data, and what "unsaved" means there. Nothing else is duplicated.',
          },
          {
            term: 'Grouped by screen',
            detail:
              'Each component sits under the screen it belongs to, mirroring the inventory, so nothing ends up orphaned.',
          },
          {
            term: 'Inherited work deleted',
            detail:
              'Phase 1 components were removed rather than carried along. Two were kept, because Phase 2 genuinely needed them.',
          },
        ]}
        note="Edit opens the same editor, Preview shows the same email, a test send behaves the same way. They cannot drift, because there is only one of them."
      />
    ),
  },

  {
    /* The source's kicker becomes the lead, and the gap-note splits: the part
       that is an argument joins the lead, the part that is a principle becomes
       the tracked note above the table. TintTable has neither a kicker nor a
       footnote slot. */
    id: 'decisions-to-review',
    title: 'Decisions worth reviewing',
    notes:
      'Six places where design made a call rather than following the spec literally. Each one has its reason next to it, which is what makes it overturnable — a stale acceptance criterion is worth flagging, not quietly following.',
    render: () => (
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="Phase 2 · decisions worth reviewing"
        pageNumber={26}
        title={['Six calls, ', { accent: 'each with its reason.' }]}
        lead="Where design made a call rather than following the spec."
        note="Overturn any of them on the merits — a stale acceptance criterion is worth flagging, not quietly following"
        titleWidth={1000}
        headers={['Ticket', 'Decision', 'Why']}
        columnWidths={[104, 440, 611]}
        minRowHeight={56}
        tableTop={236}
        rows={[
          {
            label: 'P0-4',
            cells: [
              'No type picker in the add dialog',
              'The direction is unlimited reminders, not a type choice — the AC is stale',
            ],
          },
          {
            label: 'P0-5',
            cells: [
              'No event-level override',
              'Event manager and support contact already vary per event',
            ],
          },
          {
            label: 'P0-6',
            cells: [
              'Tokens insert as the literal variable',
              'Matches the spec list exactly, and keeps the mapping visible',
            ],
          },
          {
            label: 'P0-9',
            cells: [
              'A comms log, not an activity log',
              'Recipients and status are meaningless for notes and reservations',
            ],
          },
          {
            label: 'P1-1',
            cells: [
              'Test sends excluded from the log',
              ['The log exists to prove what a ', { italic: 'team' }, ' was sent'],
            ],
          },
          {
            label: 'P0-3',
            cells: [
              'Draft body copy written, not blank',
              'Gives the copy ticket something concrete to react to. Not approved copy',
            ],
          },
        ]}
      />
    ),
  },

  {
    /* A list, not a table. The claim is that the absences are DELIBERATE, and a
       list of four named gaps states that more plainly than a grid does. The
       source's Status column survives as the bolded first clause of each detail,
       so "Backlog" still reads as a status rather than as prose. The P2 block
       genuinely has no requirement name in the source, so its term is the id
       range alone rather than an invented one. */
    id: 'what-wasnt-designed',
    title: "What wasn't designed",
    notes:
      'The gaps are on the page on purpose. Two are engineering-side, one is unspecced and holds all the forecasting, and six are out of scope for v1. An absence should never read as an oversight.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Phase 2 · what wasn't designed"
        pageNumber={27}
        kicker="Listed so the page reflects the whole project"
        title={['The gaps, ', { accent: 'named on purpose.' }]}
        termWidth={300}
        rows={[
          {
            term: 'P0-8 · Daily job rules',
            detail: [
              { bold: 'Not requested.' },
              ' No mock asked for; the send-eligibility rules are engineering-side.',
            ],
          },
          {
            term: 'P0-10 · Recipient resolution',
            detail: [
              { bold: 'Backlog.' },
              ' Backend logic. No UI surface beyond the log already showing recipients.',
            ],
          },
          {
            term: 'P1-2 · Comms dashboard',
            detail: [
              { bold: 'Needs Spec.' },
              ' Not specced. All forecasting was deliberately reserved for it.',
            ],
          },
          {
            term: 'P2-1 … P2-6',
            detail: [
              { bold: 'Backlog.' },
              ' Out of scope for v1 — open tracking, multi-language, WYSIWYG builder, and three more.',
            ],
          },
        ]}
        note="Five questions also remain open, including the default template copy that P0-3 depends on. An absence should never read as an oversight."
      />
    ),
  },

  {
    /* ProcessFlow rather than Tree: time runs left to right and the three
       option tracks narrow to one, so the convergence is the SHAPE. A tree would
       have had to be read upside down to say the same thing. The two options
       that stopped are dashed — kept, not deleted. */
    id: 'ground-up',
    title: 'Ground-up product',
    notes:
      'Four options, three rounds, three days, and not one library file changed. D is a fork of C, then revised. Converging showed up as subtraction — each round removed more than it added, and what it removed was the point.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Type 03 · Ground-up product"
        pageNumber={28}
        title={['Diverge wide, ', { accent: 'then subtract.' }]}
        lead="Four options, three rounds, three days, zero library files changed. Converging showed up as subtraction — each round removed more than it added, and what it removed was the point."
        titleWidth={1040}
        footnote='Shipped example · ticketing. A and B were kept rather than deleted — "good for later, not the landing page". Figures are prototypes built per option.'
        wellTop={250}
      >
        {({ width, height }) => (
          <ProcessFlow
            width={width}
            height={height}
            colGap={96}
            lanes={[
              { key: 'A', name: 'Option A' },
              { key: 'B', name: 'Option B' },
              { key: 'C', name: 'Option C\n→ D', tint: true },
            ]}
            steps={[
              { number: '1', label: 'Aug 4' },
              { number: '2', label: 'Aug 5', focal: true },
              { number: '3', label: 'Aug 6' },
            ]}
            nodes={[
              { id: 'a', lane: 'A', step: 0, title: 'Packages first', tool: '11 prototypes', kind: 'optional' },
              { id: 'b', lane: 'B', step: 0, title: 'Hotel first', tool: '10 prototypes', kind: 'optional' },
              { id: 'c', lane: 'C', step: 0, title: 'One-click grid', tool: '9 prototypes' },
              { id: 'd', lane: 'C', step: 1, title: 'D · two hotels', tool: 'forked from C · 6', focal: true },
              { id: 'd2', lane: 'C', step: 2, title: 'D · revised', tool: 'the same 6' },
            ]}
            edges={[
              { from: 'c', to: 'd' },
              { from: 'd', to: 'd2' },
            ]}
            legend={[
              { label: 'The direction', kind: 'focal' },
              { label: 'Carried forward', kind: 'step' },
              { label: 'Kept for later', kind: 'optional' },
            ]}
          />
        )}
      </DiagramSlide>
    ),
  },

  {
    /* The contents list has no prop on SectionDivider, so it rides in the
       chrome's bottom-left tag — a tracked strip, which is what it was. */
    id: 'section-what-comes-back',
    title: 'V · What comes back',
    notes:
      'Section five. What actually comes back when the screens are done: a written answer, not a link — and the disciplines that make it reviewable by anyone.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={29}
        label="Section V"
        title="What comes back"
        lead="A written answer, not a link — and the disciplines that make it reviewable by anyone."
        width={880}
        tag="30 The coverage doc · 31 The feedback response · 32 Prototypes, not pictures · 33 Where agents fit"
      />
    ),
  },

  {
    id: 'coverage-doc',
    title: 'The coverage doc',
    notes:
      'What goes back on a tweak or a feature: every requirement mapped to the screen that answers it, what has no mock and why, the calls design made, and the open questions with a name against each. Review becomes confirming coverage rather than hunting for it.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Types 01 & 02 · the coverage doc"
        pageNumber={30}
        kicker="What goes back when screens are built"
        title={['Checking coverage, ', { accent: 'not hunting for it.' }]}
        termWidth={240}
        rows={[
          {
            term: 'Requirement → where',
            detail:
              'Every ticket mapped to the screen that answers it, so review is confirming coverage rather than searching for it.',
          },
          {
            term: 'What has no mock',
            detail:
              'Backend-only work, or simply not requested — named explicitly, so an absence never reads as an oversight.',
          },
          {
            term: 'Decisions to review',
            detail:
              'Where design made a call rather than following the spec literally, with the reason — so it can be overturned on the merits.',
          },
          {
            term: 'Open questions',
            detail:
              "Numbered and addressed to a person. The things design can't decide alone, in one place instead of scattered across threads.",
          },
        ]}
        note="It lives in the same Storybook as the screens, so the document and the thing it describes cannot drift apart."
      />
    ),
  },

  {
    id: 'feedback-response',
    title: 'The feedback response',
    notes:
      'What goes back on ground-up work, after each round. Every point answered in writing, what the round removed named before what it added, rejected options kept with a reason, and each round separable. Where a call turned out wrong, that gets written down too.',
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Type 03 · the feedback response"
        pageNumber={31}
        kicker="What goes back after each round of options"
        title={['Every point answered, ', { accent: 'in writing.' }]}
        termWidth={270}
        rows={[
          {
            term: 'Point, then answer',
            detail:
              'Each piece of feedback in one column, how the new option answers it in the next. Nothing gets quietly dropped.',
          },
          {
            term: 'What this round removed',
            detail:
              'Usually the substance of it. Converging shows up as subtraction, so the removals need naming more than the additions.',
          },
          {
            term: 'Rejected options kept',
            detail:
              'Labelled with why they are still useful — "good for later, not the landing page" — rather than deleted.',
          },
          {
            term: 'Rounds stay separable',
            detail:
              'Each round is its own category, so you can see what changed on which day and why.',
          },
        ]}
        note="Where a call turned out wrong, that gets written down too. A PO reading it learns that pushing back produces an answer, not a defence."
      />
    ),
  },

  {
    /* Three rows and no gap-note. The list keeps the deck's standard anchor
       anyway — dropping it to balance the white space put a visible hole between
       the headline and the first rule, which reads worse than air at the foot. */
    id: 'why-it-holds-up',
    title: 'Why it holds up',
    notes:
      "Three things that make the work checkable. A comp can't be wrong in a way you'd notice; a prototype can. Everything renders the same tenant, event and team as the Loom. And it is a link, so you, engineering and QA all review the same URL at the same time.",
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Why it holds up"
        pageNumber={32}
        kicker="Three things that make the work checkable"
        title={['Prototypes, ', { accent: 'not pictures.' }]}
        termWidth={250}
        rows={[
          {
            term: 'Working, not static',
            detail:
              "Change a template, save, and the list, the event settings and the log all follow. A comp can't be wrong in a way you'd notice; a prototype can.",
          },
          {
            term: 'One record, one rule',
            detail:
              'Every screen renders the same tenant, event, and team — the same records as the Loom — and shared rules live in one module, so no two surfaces can disagree.',
          },
          {
            term: 'A link, not a file',
            detail:
              'No sign-in and nothing to install, so you, engineering, and QA all review the same URL at the same time.',
          },
        ]}
      />
    ),
  },

  {
    /* THE POINT OF THIS SLIDE IS AN EMPTY CELL. The agent lane has no node at
       column 5, DECIDE, and Swimlane renders an empty cell as nothing — which is
       exactly the argument. The two lane crossings are the only edges that
       matter: work hands off INTO the decision and comes back out of it. */
    id: 'where-agents-fit',
    title: 'Where agents fit',
    notes:
      'Five of the six steps are delegated and I review them. The sixth has no agent lane at all — look at the gap. An agent will not tell me a direction is wrong; it will build exactly what I asked for, very well and very fast.',
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Where agents fit"
        pageNumber={33}
        title={['Agents produce. ', { accent: 'I decide.' }]}
        lead="What gets delegated, and the one step that never does. Five steps have an agent lane; the decision has none."
        titleWidth={1000}
        footnote="The decision step has no agent lane. An agent will not tell me a direction is wrong — it will build exactly what I asked for."
      >
        {({ width, height }) => (
          <Swimlane
            width={width}
            height={height}
            columns={6}
            nodeHeight={80}
            lanes={[
              { key: 'agent', name: 'Agent', tint: true },
              { key: 'me', name: 'Me' },
            ]}
            nodes={[
              { id: 'a0', lane: 'agent', col: 0, name: 'Filter' },
              { id: 'a1', lane: 'agent', col: 1, name: 'Inventory' },
              { id: 'a2', lane: 'agent', col: 2, name: 'Compose' },
              { id: 'a3', lane: 'agent', col: 3, name: 'Variants' },
              /* col 4 — DECIDE — is deliberately absent from this lane. */
              { id: 'a5', lane: 'agent', col: 5, name: 'Document' },

              { id: 'm0', lane: 'me', col: 0, name: 'Review', kind: 'optional' },
              { id: 'm1', lane: 'me', col: 1, name: 'Review', kind: 'optional' },
              { id: 'm2', lane: 'me', col: 2, name: 'Review', kind: 'optional' },
              { id: 'm3', lane: 'me', col: 3, name: 'Review', kind: 'optional' },
              { id: 'm4', lane: 'me', col: 4, name: 'Decide', sublabel: 'no agent lane', kind: 'focal' },
              { id: 'm5', lane: 'me', col: 5, name: 'Review', kind: 'optional' },
            ]}
            edges={[
              { from: 'a0', to: 'a1' },
              { from: 'a1', to: 'a2' },
              { from: 'a2', to: 'a3' },
              { from: 'a3', to: 'm4', tone: 'accent', label: 'hand off' },
              /* Unlabelled deliberately: this leg leaves the DECIDE box's right
                 face, and Swimlane's label-avoidance only walks a label clear of
                 boxes that are NOT its own endpoints — so any text here lands on
                 top of the word "Decide". */
              { from: 'm4', to: 'a5', tone: 'accent' },
            ]}
            legend={[
              { label: 'Owns it', kind: 'step' },
              { label: 'Reviews it', kind: 'optional' },
              { label: 'Mine alone', kind: 'focal' },
            ]}
          />
        )}
      </DiagramSlide>
    ),
  },

  {
    id: 'section-the-contract',
    title: 'VI · The contract',
    notes:
      'Section six, and the last one. What each type needs from you, and the five things I am asking for.',
    render: () => (
      <SectionDivider
        fit="none"
        pageNumber={34}
        label="Section VI"
        title="The contract"
        lead="What each type needs from you, and the five things I am asking for."
        width={880}
        tag="35 The contract · 36 What I need"
      />
    ),
  },

  {
    id: 'the-contract',
    title: 'The contract',
    notes:
      'One row per type. Name the type and everything after it is predictable: what you give me, what comes back, and when. Everything arrives as a link, so engineering and QA see it at the same time you do.',
    render: () => (
      <ColumnGrid
        fit="none"
        eyebrow="The contract"
        pageNumber={35}
        title={['Predictable, ', { accent: "once it's named." }]}
        lead="What each type needs, and what you get back. Everything arrives as a link, so engineering and QA see it at the same time you do."
        titleWidth={1040}
        sublabel="You give me → you get back → when"
        columns={3}
        surface="outline"
        align="top"
        /* `value` is the cell's emphatic slot, so it carries the EXCHANGE — the
           thing a PO is agreeing to — and what comes back plus the timing sit in
           the quiet `note` under it. Stepped down from the default 44px, which
           would make a whole clause a headline per column; and the note stepped
           UP from bodySm, because at 13px three stacked facts read as fine print
           rather than as the terms. */
        valueSize="h3"
        noteSize="body"
        padding={32}
        cells={[
          {
            label: '01 · Tweaks',
            value: 'Shape 01 — discussed + a Loom',
            note: 'Working screens + coverage doc\n\nMinutes to hours',
          },
          {
            label: '02 · Feature',
            value: 'Shape 02 — written in Linear, plus a Loom',
            note: 'Inventory first, then screens in batches\n\nHours',
          },
          {
            label: '03 · Ground-up',
            value: 'Shape 03 — intent and one constraint',
            note: 'Parallel options + a written feedback response\n\nA couple of days per round',
          },
        ]}
      />
    ),
  },

  {
    /* THE CLOSING SLIDE. It steps up to `h1` and takes the deck's one accent
       clause rather than the muted continuation every other slide uses — this is
       the ask, and it is the last thing on the screen. */
    id: 'what-i-need',
    title: 'What I need',
    notes:
      "Five habits, all of them cheap. Pick a shape when you file. Record the Loom first. Roadmap work goes in Linear. Send the vague things early. And sign off the inventory — that is where scope is cheapest to change. All three examples are already in the Storybook if you want to look at them.",
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="What I need"
        pageNumber={36}
        kicker="What would make the biggest difference to throughput"
        title={['Five habits, ', { accent: 'all cheap.' }]}
        titleSize="h1"
        termWidth={300}
        rowsTop={200}
        rows={[
          {
            term: 'Pick a shape when filing',
            detail:
              'Discussed + Loom, fully written, or vague intent. One line, and it tells me what to do next without a round of questions.',
          },
          {
            term: 'Record the Loom first',
            detail:
              'Three to five minutes of clicking and thinking out loud, once, instead of a week of clarifying questions.',
          },
          {
            term: 'Roadmap work goes in Linear',
            detail:
              'Anything on the plan needs a written record so I can report status against it rather than being asked.',
          },
          {
            term: 'Send vague things early',
            detail:
              "A rough direction now beats a finished spec later. I'll build options to react to and we'll write it down after.",
          },
          {
            term: 'Sign off the inventory',
            detail:
              'A short review of the screen list before I build. This is where scope is cheapest to change.',
          },
        ]}
        note="All three examples are already in the Storybook — a tweak, a full feature, and a ground-up concept — with their coverage docs alongside them."
      />
    ),
  },
]
