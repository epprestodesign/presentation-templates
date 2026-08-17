import { SectionDivider } from '../../templates/SectionDivider'
import { NumberedRows } from '../../templates/NumberedRows'
import { StatGrid } from '../../templates/StatGrid'
import { Comparison } from '../../templates/Comparison'
import { TintTable } from '../../templates/TintTable'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { ProcessFlow } from '../../diagrams/ProcessFlow'
import { Architecture } from '../../diagrams/Architecture'
import { Sequence } from '../../diagrams/Sequence'
import type { DeckSlide } from '../types'
import { COVER, SHAPE, WELL } from './shared'

/**
 * PART THREE — SECTION III, slides 09–21: what the system does about it.
 *
 * The response to Section II, and the longest section by a wide margin. It opens
 * on the industry-standard workflow rather than on ours, for a reason that is
 * about trust rather than about completeness: a process proposal that does not
 * name the convention it departs from asks the room to take on faith that the
 * departure is small. Slides 10 and 11 name it and size it, so that everything
 * after them is read as four specific changes rather than as a rewrite.
 *
 * THE THREE STEPS DELIBERATELY DO NOT SHARE A TEMPLATE. Step one is a tree because
 * an inventory IS a hierarchy; step two is a list because assembly genuinely is
 * three unordered properties; step three is a sequence because "everyone at once"
 * is a claim about time that only a sequence can make. An earlier pass ran all
 * three as `NumberedRows` and the deck had seven identical slides in a row.
 *
 * THIS SECTION IS LONG — fourteen slides against Section I's five and Section II's
 * three. That imbalance is real and worth a decision rather than a shrug. The one
 * remaining trim candidate is 13 (two inputs, which 14's first column also shows as
 * a payload chip); it survives because the walkthrough argument is the single most
 * useful ask in the deck and needs more than a chip. 19 and 20 were one slide and
 * are now two, because the handoff list and its worked itemisation are a claim and
 * its evidence.
 */

export const partThree: DeckSlide[] = [
  /* ------------------------------------------------------------------ 09 */
  {
    id: 'section-the-system',
    title: 'Section III · The system',
    notes:
      'Section three is the answer to section two. It starts with the standard workflow and where we differ from it, because the honest version of this pitch is "four things change", not "here is a new process".',
    render: () => (
      <SectionDivider
        {...COVER}
        pageNumber={10}
        label="Section III · The response"
        title={'What the system\ndoes about it.'}
        lead="Starting with the workflow every design team already runs, and the four places this one departs from it. Then the process itself, step by step."
      />
    ),
  },

  /* ------------------------------------------------------------------ 11 */
  {
    id: 'the-standard-workflow',
    title: 'The standard workflow, and this one',
    notes:
      'This is the workflow almost every product design team runs, and it is not a straw man — it is what I would run too, without a system in code. Research, wireframes, hi-fi mockups in Figma, a design review, handoff via Dev Mode with redlines and specs, engineering rebuilds it in code, then design QA compares the build against the mockup.\n\nThe bottom band is the same five beats. Nothing is skipped and nothing is added. What changes is the artifact: the thing being reviewed is the build, not a picture of it, which means the QA step at the end has nothing left to catch — because there is no translation between mockup and code for anything to be lost in.\n\nSay this plainly: this is a design-engineering workflow. It is a real and established practice, not something invented here, and it trades a Figma file for a codebase. That trade has costs, and the next slide names them.',
    /* `Comparison`, whose whole shape is this argument: the old way in muted grey on
       top, the same journey beneath it on the brand gradient. Five steps each,
       deliberately — the claim is that the SEQUENCE is unchanged and only the
       artifact differs, and two bands with different step counts would undercut that
       before a word is read.
     *
     * THE TOP BAND IS NOT A STRAW MAN and the copy has to earn that. It is the
     * workflow the room's own experience recognises, described in its own terms —
     * Figma, Dev Mode, redlines, design QA — because a contrast slide that
     * caricatures the convention loses the argument with the one engineer who has
     * shipped that way successfully.
     *
     * THIS SLIDE AND 11 ARE TWO HALVES OF ONE PIPELINE, and they sit back to back
     * because an earlier cut had a delta list between them and they read as the same
     * slide twice — both are five-step pipelines, so the eye pairs them whatever the
     * copy says. The actual division: BOTH bands here begin at "requirements in
     * hand", which is the standard workflow's blind spot. It has no intake step at
     * all, and every failure mode in Section II happens upstream of its first beat.
     * 11 is that missing beat. The `lead` points at where the bands start for exactly
     * this reason, and 12 then sizes both halves together. */
    render: () => (
      <Comparison
        fit="none"
        eyebrow="The convention"
        pageNumber={11}
        title={['Same five beats. ', { accent: 'A different artifact.' }]}
        lead="The workflow most design teams run, and this one beside it. The sequence does not change — what changes is whether the thing under review is the build or a picture of it. Note where both bands START: a requirement already in hand."
        leadTop={172}
        top={296}
        bandHeight={172}
        bandGap={8}
        bands={[
          /* THE STEP STRINGS ARE SHORT BECAUSE THE COLUMN IS ~190px WIDE. Five steps
             plus a 152px label cell divide the panel into six, and the band clips at
             its own height rather than growing — so the first pass, written as full
             sentences at the default `paddingTop` of 78, lost the last line of four
             of the ten steps ("Figma", "design QA", "signed off", "plus a") below the
             band edge. Five words is the budget.
             
             `size: 'body'` at a 172px band with a 46px top inset fits the deepest
             step (three lines) with matching slack above and below. The reference's
             78px inset deliberately sits its copy LOW, which is right for the one
             line of copy it carries and leaves a 100px hole under three. */
          {
            label: 'The standard\nworkflow',
            surface: 'muted',
            size: 'body',
            paddingTop: 46,
            steps: [
              'Requirements and research',
              'Hi-fi mockups in Figma',
              'Design review on mockups',
              'Handoff — redlines and specs',
              'Rebuilt in code, then design QA',
            ],
          },
          {
            label: 'This\nworkflow',
            surface: 'brand',
            size: 'body',
            paddingTop: 46,
            steps: [
              'Requirements and a walkthrough',
              'A screen inventory, signed off',
              'Composed from the system, in code',
              'Review on one live link',
              'Handoff — components and a coverage doc',
            ],
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 12 */
  {
    id: 'proposed-intake',
    title: 'Proposed · Intake through Linear',
    notes:
      'This slide is a PROPOSAL, and I want to be explicit about that before describing it — everything else in this section is what already happens. The Linear routing does not exist today, and the agent step exists only as something I run by hand on my own work.\n\nRead it against slide 08. Same three columns: how it arrives, where it lands, what it produces. Every pain flag on 07 has a counterpart here. The Slack message becomes an issue in a project with a date on it. The one unranked inbox becomes a queue everyone can see. And the third column changes from rework, late scope and the wrong thing, to concepts, a scope document and a dated commitment.\n\nThe agent column is the part worth arguing about. When an issue is assigned, agents draft several concepts from the design system — not to pick one, but so that review starts from options rather than a blank page. My review of those concepts is where the questions and refinement get drafted, and that is still a person deciding. The thing agents remove is the hour spent producing the first thing to react to; they do not remove the judgment on slide 20.\n\nWhat this needs from the room: requests go into Linear with a project and a date. That is the whole ask.',
    /* THE ONLY PROPOSAL IN THE DECK, and it is labelled one in the eyebrow, the
       title and the first line of the notes. Everything else in Section III describes
       what already happens; presenting an unbuilt routing change in the same voice
       would be the deck's one dishonest slide, and the one most likely to be caught.
     *
     * `ProcessFlow`, deliberately the same type as 15 — the delivery pipeline — because
     * this is the pipeline UPSTREAM of it, and the two meet at the screen inventory.
     * 15's first column is 'Intake'; this slide is that column expanded. Using a
     * different type would hide the join.
     *
     * IT SITS DIRECTLY AFTER 10 BECAUSE THEY ARE ONE PIPELINE IN TWO HALVES. Both
     * bands on 10 start at "requirements in hand" — the standard workflow simply has
     * no intake step, which is why none of Section II's failure modes are visible in
     * it. This is the missing beat, and putting a delta list between them (the earlier
     * order) made two halves of one argument read as the same slide twice.
     *
     * IT IS BUILT AS A POINT-FOR-POINT ANSWER TO 07, which is what makes it a
     * contrast rather than a wish list. 07's three zones are how it arrives / where it
     * lands / what it produces; the five steps here run through the same three
     * concerns in the same order, and every pain flag on 07 has a counterpart. If a
     * row here does not answer something on 07, it does not belong on this slide.
     *
     * THE FOCAL STEP IS THE QUEUE, NOT THE AGENTS. 07's focal node is 'no queue', so
     * the fix has to be focal on the same axis — otherwise the slide reads as "agents
     * solve it", which is not the argument and is not true. Ranking is the fix; the
     * agents are an accelerant on one step of it. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Proposed · Not in place today"
        pageNumber={12}
        title={['Proposed: give a request ', { accent: 'a shape on arrival.' }]}
        lead="The slide before begins at a requirement already in hand. This is the beat before that one, which no standard workflow has — and unlike the rest of this section, it is a proposal."
        wellTop={216}
        wellBottom={666}
        footnote="What it needs from the room: requests go into Linear with a project and a date. The ranking is the fix — agents only remove the hour spent making the first thing to react to, not the judgment about which concept is right."
        children={({ width, height }) => (
          <ProcessFlow
            width={width}
            height={height}
            labelWidth={132}
            lanes={[
              { key: 'LN', name: 'Linear' },
              { key: 'AG', name: 'Agents' },
              { key: 'DS', name: 'Design', tint: true },
            ]}
            steps={[
              { number: '01', label: 'Arrives' },
              { number: '02', label: 'Ranked', focal: true },
              { number: '03', label: 'Concepts' },
              { number: '04', label: 'Reviewed' },
              { number: '05', label: 'Committed' },
            ]}
            nodes={[
              {
                id: 'issue',
                lane: 'LN',
                step: 0,
                title: 'An issue, in a project',
                tool: 'Not a Slack message',
                out: 'IS',
              },
              {
                id: 'queue',
                lane: 'LN',
                step: 1,
                title: 'Assigned and ranked',
                tool: 'One queue, visible to all',
                in: 'IS',
                out: 'QU',
                focal: true,
              },
              {
                id: 'draft',
                lane: 'AG',
                step: 2,
                title: 'Draft several concepts',
                tool: 'From the design system',
                in: 'QU',
                out: 'CN',
              },
              {
                id: 'review',
                lane: 'DS',
                step: 3,
                title: 'Review the concepts',
                tool: 'Questions, refinement',
                in: 'CN',
                out: 'RF',
              },
              {
                id: 'inventory',
                lane: 'DS',
                step: 4,
                title: 'Screen inventory',
                tool: 'Where slide 17 picks up',
                in: 'RF',
                out: 'SL',
              },
              {
                id: 'commit',
                lane: 'LN',
                step: 4,
                title: 'A dated commitment',
                tool: 'Because the queue is ranked',
                in: 'SL',
              },
            ]}
            edges={[
              { from: 'issue', to: 'queue' },
              { from: 'queue', to: 'draft' },
              { from: 'draft', to: 'review' },
              { from: 'review', to: 'inventory' },
              { from: 'inventory', to: 'commit' },
            ]}
            payloads={[
              { code: 'IS', label: 'A dated issue' },
              { code: 'QU', label: 'A queue position' },
              { code: 'CN', label: 'Concepts to react to' },
              { code: 'RF', label: 'Questions and refinement' },
              { code: 'SL', label: 'The screen list' },
            ]}
            legend={[{ label: 'The fix: a ranked queue', kind: 'focal' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 13 */
  {
    id: 'what-changes',
    title: 'Five things change',
    notes:
      'Be concrete about the size of this. Five things change — four on the delivery side, plus the intake queue from the slide before, and I want to be the one who names the costs rather than have them found later.\n\nThe costs: Figma stops being the source of truth, which is a real loss for anyone who wants to explore visually at speed — I still use it, it just is not what gets reviewed. Design owns library code, which means design can break a build. And a written inventory adds a gate before design starts, which feels slower on day one and is the thing that pays for itself.\n\nWhat does not change is the longer list, and it is the reassuring one: product still owns requirements, engineering still owns the build, work is still tracked where it always was, QA still verifies against acceptance criteria. Nobody has to adopt a tool.',
    /* The slide that makes the previous one honest. A contrast slide on its own
       invites "so everything is different"; this sizes the delta at four items and
       names what each one costs.
     *
     * `changed` marks the two that cost something real. That prop exists for the pair
       of slides in the other deck showing the same list twice — but its meaning here
       is the same: an accent rule on the leading edge saying "this one is not free".
       Restrained on purpose, because the argument is that two of four are cheap.
     *
     * The note carries what does NOT change, and it is deliberately the longest line
     * on the slide. In a room being asked to accept a process change, the list of
     * things staying put is what gets the change accepted. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="The size of the change"
        pageNumber={13}
        kicker="Being specific, including about what it costs"
        title={['Five things change. ', { accent: 'The rest stays put.' }]}
        titleSize="h2"
        termWidth={280}
        rowsTop={206}
        rows={[
          {
            term: 'The artifact is the build',
            detail:
              'Reviewers open working screens made from real components, not a picture of them. Nothing is translated from mockup to code, so nothing is lost in the translation.',
          },
          {
            term: 'Review happens before',
            detail:
              'Design QA at the end becomes review at the start, against the components engineering will actually use. Feasibility is a first-week conversation rather than a last-week surprise.',
          },
          {
            term: 'Figma stops being the source',
            detail:
              'Still used for thinking, no longer what gets reviewed or handed over. That is a genuine loss of visual exploration speed, and it is the trade being made.',
            changed: true,
          },
          {
            term: 'Design owns library code',
            detail:
              'One system in code rather than a Figma library mirrored imperfectly into one. It also means design can break a build, which is a new risk that did not exist before.',
            changed: true,
          },
          {
            term: 'Requests get a queue',
            detail:
              'The one on slide 12 — and the only item here that is a proposal rather than a description. It is also the only one that asks the room for something.',
            changed: true,
          },
        ]}
        note="What does not change: product still owns requirements, engineering still owns the build, work is still tracked where it is tracked, and QA still verifies against acceptance criteria. Nobody has to adopt a tool."
      />
    ),
  },

  /* ------------------------------------------------------------------ 14 */
  {
    id: 'the-design-system',
    title: 'Two environments, one source',
    notes:
      'Two environments, and that is the whole slide.\n\nStorybook holds every component on its own page with all of its states. The prototype holds those same components assembled into screens you can click through. They are not two copies kept in step — there is one implementation of each component and these are two views of it, so an edit in either shows up in the other with no sync step to fail.\n\nWhy that is a benefit rather than a nicety. In a review we open the prototype and change things until it is in a good spot to show — and because the components are the real ones, that same editing is what keeps the documentation true. The screen inventory on 16 and the itemisation on 21 describe the thing that was just edited, not a snapshot of it from last week.\n\nWhich is the time saving for engineering. In the standard workflow on slide 11, the spec catches up to the design after the design is done, and the gap between those two is where questions come from. Here there is no gap to close, because the artifact and its description are the same commit.\n\nOne honesty note if anyone asks: the inventory and itemisation are authored today, not generated. What is already true is that they live beside the components, so an edit and its documentation are one job instead of two. Full regeneration per edit is the ask on slide 12.',
    /* WAS THREE ZONES — Storybook, prototype, and a 'what engineering reads' column of
       derived documents. Cut to two, because the third column was answering a different
       question: it listed OUTPUTS when the slide is about how two environments relate.
       The documents already have their own slides (16 and 21), so drawing them a third
       time made the diagram wider without making the point sharper.
     *
     * TWO ZONES ALSO BUYS THE COPY ROOM. At three zones a node is 278px; at two it is
     * 489px, which is what lets every sublabel say something specific instead of being
     * cropped to a fragment.
     *
     * `Architecture` with slide 06's geometry, so the deck's three-boundary and
     * two-boundary pictures read as the same kind of statement. THE PROTOTYPE IS FOCAL
     * because that is where reacting and refining happens; Storybook is the library.
     *
     * BIDIRECTIONALITY IS DRAWN AS THREE DIFFERENT MOVES, NOT AS A SYNC. "They feed
     * each other" is the experience, and two arrows meaning the same thing would
     * misrepresent the mechanism — there is one implementation and these are two views,
     * so nothing is being kept in step. Composition and propagation run forward;
     * PROMOTION runs back, and it is a genuinely different operation: a pattern that
     * earned its place across two screens becomes a component. The labels say so.
     *
     * THE REQUIREMENTS BENEFIT IS THE FOOTNOTE, NOT A NODE. It is a consequence of the
     * two environments sharing a source rather than a third thing in the picture, and
     * stating it as a claim keeps the diagram to what it can actually show. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="The environments"
        pageNumber={14}
        title={['Two environments, ', { accent: 'one source.' }]}
        lead="Edit either and the other follows, because there is only one implementation of each component. The prototype is what you get into a good spot to show; Storybook is what keeps the requirements true while you do it."
        {...WELL}
        footnote="So the requirements move with the artifact instead of catching up to it — which is the gap engineering usually spends its questions on. No spec to reconcile, because the screens and their description are the same commit."
        children={({ width, height }) => (
          <Architecture
            width={width}
            height={height}
            {...SHAPE}
            zones={[
              {
                label: 'Storybook · the components',
                nodes: [
                  {
                    id: 'sb-components',
                    name: 'Every component, in isolation',
                    sublabel: 'Each state on its own page, reviewed once',
                    kind: 'input',
                  },
                  {
                    id: 'sb-edit',
                    name: 'Edit a component',
                    sublabel: 'It changes on every screen using it, at once',
                    kind: 'input',
                  },
                  {
                    id: 'sb-library',
                    name: 'The library of record',
                    sublabel: 'One component, one rule — documented beside it',
                    kind: 'input',
                  },
                ],
              },
              {
                label: 'Prototype · the screens',
                nodes: [
                  {
                    id: 'pr-screens',
                    name: 'The screens, assembled',
                    sublabel: 'Clickable, one shared tenant, event and team',
                    kind: 'focal',
                  },
                  {
                    id: 'pr-edit',
                    name: 'Edit a screen',
                    sublabel: 'Get it into a good spot to show, in the review',
                  },
                  {
                    id: 'pr-refine',
                    name: 'React and refine',
                    sublabel: 'On a link — and a pattern used twice gets promoted',
                  },
                ],
              },
            ]}
            edges={[
              { from: 'sb-components', to: 'pr-screens', tone: 'accent', label: 'composed' },
              { from: 'sb-edit', to: 'pr-edit', tone: 'accent', label: 'propagates' },
              {
                from: 'pr-refine',
                to: 'sb-library',
                fromSide: 'left',
                toSide: 'right',
                dashed: true,
                label: 'promoted',
              },
            ]}
            /* LEGEND LABELS ARE CAPPED AT ~24 CHARACTERS, and that is a hard layout
               constraint rather than a style preference. `Legend` lays items out on a
               FIXED stride — measured at ~193px here — so a label wider than the slot
               runs into the next one instead of pushing it along. 'Composed, and
               propagated on edit' measured 201px and overlapped the item after it by
               11px. Anything over about 185px collides; check it after editing. */
            legend={[
              { label: 'Where we react and refine', kind: 'focal' },
              { label: 'Composed and propagated', line: 'accent' },
              { label: 'Promoted back', line: 'default', dashed: true },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 15 */
  {
    id: 'what-design-receives',
    title: 'Two inputs, one of them contested',
    notes:
      'Two inputs, and I want to take the objection to the second one head on rather than wait for it — because it has already been made, and the person who made it is the person whose minutes this costs.\n\nThe objection is that a recorded walkthrough is overkill. On its face that is fair: if the requirements are written well, why narrate them.\n\nTwo answers. First, the environments. A good share of our dev environments work some of the time, so a recording is not a narration of the requirements — it is evidence of a state that actually worked, watchable again at the moment the question comes up rather than needing someone to reproduce it live.\n\nSecond, the comparison is wrong. It is not "a recording versus nothing". It is five rehearsed minutes versus an hour of open discussion against vague requirements, whose output is somebody\'s notes. Rehearsed and straight to the point, with each screen tied to the requirement it answers, is less of the PO\'s time in total, not more — and it is re-watchable, which a meeting is not.\n\nWhat I am asking for is minutes, once, not a production.',
    /* THE OBJECTION IS ON THE SLIDE, NOT LEFT TO THE Q&A. It has already been raised —
       the recorded walkthrough was called overkill by the person whose time it costs —
       and an ask that has been refused once does not get accepted by being restated
       more confidently. So rows 03 and 04 are the two answers, marked `changed` because
       they are the contested half of the slide, and the note reframes the comparison.
     *
     * NOBODY IS NAMED, here or in the notes. The objection is a fair one on its face
     * and the slide has to argue with the reasoning rather than with a person —
     * particularly since this deck is a link that gets forwarded.
     *
     * THE ENVIRONMENTS ARGUMENT IS THE STRONGER ONE and it is deliberately first. It
     * reframes the recording from "narration of the requirements", which genuinely
     * would be overkill, to "evidence of a working state", which nothing else in the
     * process supplies. The time-arithmetic answer is second because it invites a
     * debate about whose hour is worth more.
     *
     * WAS TWO ROWS AT `rowsTop` 276. Four rows need the height, and the slide is no
     * longer a quiet statement of inputs — it is the one place the deck asks for
     * something and expects to be argued with. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="What design receives"
        pageNumber={15}
        kicker="The inputs, and the objection to the second one"
        title={['Two inputs. ', { accent: 'Five minutes of one.' }]}
        titleSize="h2"
        termWidth={280}
        rowsTop={222}
        rows={[
          {
            term: 'The requirements',
            detail:
              'Tickets and acceptance criteria, and the constraint behind them — what breaks if we get this wrong.',
          },
          {
            term: 'A rehearsed walkthrough',
            detail:
              'Five minutes, straight to the point, each screen tied to the requirement it answers. Not a demo, and not narration of the tickets.',
          },
          {
            term: 'Why recorded, not live',
            detail:
              'A good share of our dev environments work some of the time. A recording is evidence of a state that worked, re-watchable at the moment the question comes up rather than reproduced live.',
            changed: true,
          },
          {
            term: 'Why not a meeting',
            detail:
              'An hour of open discussion against vague requirements produces somebody’s notes. Five rehearsed minutes against the screens produces the order they get built in — and costs the fewer minutes of the two.',
            changed: true,
          },
        ]}
        note="The requirements give the rule; the walkthrough gives the order — which screen opens first, what is checked next, where someone hesitates. That order is not usually in the tickets, and it is what determines the screen list."
      />
    ),
  },

  /* ------------------------------------------------------------------ 16 */
  {
    id: 'five-steps',
    title: 'The five steps, end to end',
    notes:
      'The whole pipeline on one slide, before we walk each step. Five columns, three lanes, and the payload moving between them. The screen inventory is the focal step because it is the only one where scope can still change cheaply — everything to its right is executing a decision made there.\n\nThe three steps that follow in the deck are columns two, three and four.',
    /* `ProcessFlow` rather than `Swimlane` for the reason its own header gives: reach
       for swimlane when the payloads and the owning team are all that matter, and for
       this when the reader has to see, per step, who owns it and what arrives and
       leaves. The payload chips are the argument — the artifact changes shape at every
       column, and that is what makes the process a process rather than a list of
       meetings.
     *
     * The focal step is the inventory. Upstream asks for exactly one, and this is the
     * analytical pivot: the last column where scope is cheap. It is the deck's ONLY view of the five steps: a
     * swimlane recap used to close the section and was cut, because it showed the same
     * five steps a second time seven slides later — the payload chips are the thing a
     * lane diagram cannot carry, so this is the version that survived. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="The pipeline"
        pageNumber={16}
        title={['Five steps, ', { accent: 'one artifact moving.' }]}
        lead="What each step receives and what it hands on. The three steps in detail are columns two, three and four."
        wellTop={216}
        wellBottom={666}
        footnote="Scope is cheap to change in column two and expensive everywhere to its right, which is why the inventory is agreed before anything is built."
        children={({ width, height }) => (
          <ProcessFlow
            width={width}
            height={height}
            labelWidth={132}
            lanes={[
              { key: 'PR', name: 'Product' },
              { key: 'DS', name: 'Design', tint: true },
              { key: 'EN', name: 'Engineering' },
            ]}
            steps={[
              { number: '01', label: 'Intake' },
              { number: '02', label: 'Screen inventory', focal: true },
              { number: '03', label: 'Build' },
              { number: '04', label: 'Review' },
              { number: '05', label: 'Handoff' },
            ]}
            nodes={[
              {
                id: 'intake',
                lane: 'PR',
                step: 0,
                title: 'Requirements',
                tool: 'Tickets · Loom',
                out: 'RQ',
              },
              {
                id: 'inventory',
                lane: 'DS',
                step: 1,
                title: 'Inventory the screens',
                tool: 'Written, before building',
                in: 'RQ',
                out: 'SL',
                focal: true,
              },
              {
                id: 'signoff',
                lane: 'PR',
                step: 1,
                title: 'Sign off the list',
                tool: 'The cheapest change point',
                in: 'SL',
              },
              {
                id: 'build',
                lane: 'DS',
                step: 2,
                title: 'Compose the screens',
                tool: 'Storybook',
                in: 'SL',
                out: 'SC',
              },
              {
                id: 'review',
                lane: 'DS',
                step: 3,
                title: 'Run review on one link',
                tool: 'One URL, no sign-in',
                in: 'SC',
                out: 'DC',
              },
              {
                id: 'intent',
                lane: 'PR',
                step: 3,
                title: 'Check intent',
                tool: 'Is anything missing',
                in: 'SC',
              },
              {
                id: 'effort',
                lane: 'EN',
                step: 3,
                title: 'Check effort',
                tool: 'Against real components',
                in: 'SC',
              },
              {
                id: 'doc',
                lane: 'DS',
                step: 4,
                title: 'Write the coverage doc',
                tool: 'Requirement → screen',
                in: 'DC',
                out: 'CD',
              },
              {
                id: 'handoff',
                lane: 'EN',
                step: 4,
                title: 'Build the feature',
                tool: 'Against the reference',
                in: 'CD',
              },
            ]}
            edges={[
              { from: 'intake', to: 'inventory' },
              { from: 'inventory', to: 'signoff' },
              { from: 'inventory', to: 'build' },
              { from: 'build', to: 'review' },
              { from: 'review', to: 'intent' },
              { from: 'review', to: 'effort' },
              { from: 'review', to: 'doc' },
              { from: 'doc', to: 'handoff' },
            ]}
            payloads={[
              { code: 'RQ', label: 'Requirements' },
              { code: 'SL', label: 'The screen list' },
              { code: 'SC', label: 'Clickable screens' },
              { code: 'DC', label: 'Decisions' },
              { code: 'CD', label: 'Coverage document' },
            ]}
            legend={[{ label: 'Where scope is still cheap', kind: 'focal' }]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 17 */
  {
    id: 'step-one-inventory',
    title: 'Phase 2, itemised',
    links: [
      {
        label: 'Phase 2 · Requirements coverage',
        href: 'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-teams-mgmt-comms-phase-2-requirements-coverage--docs',
      },
      {
        label: 'Phase 1 · Notifications preferences',
        href: 'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-teams-mgmt-comms-phase-1-v1-%C2%B7-notifications-preferences--docs',
      },
    ],
    notes:
      'This is what step one produces, on a real project — and every component on this slide is named because the count alone undersells it.\n\nFive surfaces. Eleven screen states. Fourteen components built, each one with its own states and its own page. Sixty live pages in total, all of them open at the link under this slide.\n\nRead the first row against the rest. Notification preferences is Phase 1\'s surface extended, and it carries nine of the fourteen components — the compliance reminder flow, the from/reply configuration, email preview and test send, the unsaved-changes bar. That is where the depth is.\n\nThen the last row. First-time setup is six live pages and ZERO new components, because it is the preferences screen at a different moment rather than a second screen that resembles it. The configured view and the first-run view cannot drift, because there is only one of them.\n\nTwo requirements of the twelve were judged to need no screen at all — daily job rules and recipient resolution — and that is recorded in the coverage doc with the reason. Deciding what not to design is a decision.\n\nEvery number here is counted from the live story index, so it can be checked while I am talking.',
    /* WAS A TREE, AND THE TREE UNDERSOLD THE WORK. Five boxes reading 'New · 1 state' is
       an accurate summary and a poor account of a project with fourteen components in it:
       the count of a thing is not the same as the thing, and this slide's job is to make
       twelve requirements' worth of build legible. So every component is NAMED.
     *
     * A TABLE RATHER THAN A DIAGRAM, and the constraint decided it. Fourteen component
     * names cannot go in a tree — that is fourteen leaves at ~75px each — and they cannot
     * go in bulleted cells either: nine bullets in the first row measured ~216px of row
     * height and pushed the table 70px past the content floor. Run inline, separated by
     * middots, the same nine names set on three lines. The shape is a list with counts,
     * so it is a list with counts.
     *
     * THIS ABSORBS THE OLD PER-SURFACE TABLE, which is why that slide is gone. It carried
     * Surface / What it is / New components / Live pages — every column of which is here
     * with the names filled in, so keeping both would have been the same table twice, one
     * of them redundant.
     *
     * `variant="ruled"`, and it is now the deck's second ruled table alongside 03. Both
     * are reference matrices a reader scans row by row, which is the case the ruled
     * variant exists for; neither spends the cyan ramp.
     *
     * THE LAST ROW IS THE ARGUMENT, so rows are ordered by component count descending —
     * it lands the reader on 'None' with six pages beside it. */
    render: () => (
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="Step one · What the inventory produced"
        pageNumber={17}
        title={['Five surfaces, fourteen components, ', { accent: 'sixty pages.' }]}
        titleSize="h2"
        lead={[
          'Comms Phase 2, itemised from the live Storybook. Nine of the fourteen components sit on ',
          { accent: "Phase 1's surface, extended" },
          ' — the other four surfaces did not exist before.',
        ]}
        headers={['Surface', 'States', 'Components built', 'Pages']}
        columnWidths={[250, 90, 700, 115]}
        minRowHeight={52}
        tableTop={274}
        rows={[
          {
            label: 'Notification preferences',
            cells: [
              ['3'],
              [
                'Text formatter · Personalization menu · Add compliance reminder · Delete template · From/reply config · Email preview + test send · Restore to default · Template group labels · Unsaved changes bar',
              ],
              ['31'],
            ],
          },
          {
            label: 'Event registration settings',
            cells: [['2'], ['Non-compliance policy · Teams management communications card'], ['10']],
          },
          {
            label: 'Team detail',
            cells: [['1'], ['Communications log · Communications opt-out'], ['8']],
          },
          {
            label: 'Company settings',
            cells: [['1'], ['From/reply address sources'], ['4']],
          },
          {
            label: 'First-time setup',
            cells: [['4'], ['None — the preferences screen at first run'], ['6']],
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 18 */
  {
    id: 'step-two-build',
    title: 'Step two · Build the screens',
    notes:
      'Step two, and the least interesting one. A screen is mostly existing components arranged against the agreed list — that is the part tooling helps with. Clickable rather than static, so a wrong assumption is visible instead of hidden. One shared record across every screen, so the set reads as one product.',
    /* Stays a list, and it is the only one of the three steps that should be. These
       three are properties of the build holding simultaneously, not a sequence and
       not a hierarchy — so the shape with no implied order is the correct one. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Step two · Build the screens"
        pageNumber={18}
        kicker="How the screens get made"
        title={['Composed from ', { accent: 'the system.' }]}
        titleSize="h2"
        termWidth={260}
        rowsTop={252}
        rows={[
          {
            term: 'Assembly, not invention',
            detail:
              'A screen is mostly existing components arranged against the agreed list. That is the part tooling helps with, and it is the least interesting part.',
          },
          {
            term: 'Working, not static',
            detail:
              'Clickable rather than a comp — change something and the related screens follow, so a wrong assumption is visible instead of hidden.',
          },
          {
            term: 'One shared record',
            detail:
              'Every screen renders the same tenant, event and team, so the set reads as one product rather than separate mockups.',
          },
        ]}
        note="Nothing reaches review unread. Composition is fast; deciding whether the composition is right is not, and that is the next two steps."
      />
    ),
  },

  /* ------------------------------------------------------------------ 19 */
  {
    id: 'step-three-review',
    title: 'Step three · Review',
    notes:
      'Step three. One link — no sign-in, nothing to install — so product, engineering and QA all open the same thing at the same time. That simultaneity is the whole claim, and it is why this is drawn as a sequence rather than listed.\n\nCompare it against slide 11: this is the step that replaces design QA at the end. The review happens against the real components before the build, so there is nothing left to compare a build against afterwards.',
    /* `Sequence`, because "everyone at once" is a claim about TIME and a list cannot
       make it. Five actors, one link, and three reviews happening in parallel off the
       same message — drawn, that is obvious; listed, it reads as three separate review
       rounds, which is the opposite of the argument.
     *
     * NO OPERATOR FRAME on the revise loop, though the revision genuinely is
     * conditional. An `opt` spanning a single self-message frames one lifeline and
     * nothing else — a 47px-wide box with its own guard text running out the right
     * side of it. The frame costs more legibility than the conditional-ness is worth
     * at this size, so the self-call carries it alone.
     *
     * The last message lands on the tracker rather than on a person, which is source
     * rule 4 — decisions land on the issue, not in a thread — expressed as geometry. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Step three · Review"
        pageNumber={19}
        title={['One link, ', { accent: 'everyone at once.' }]}
        lead="No sign-in and nothing to install, so every reviewer opens the same build at the same time."
        wellTop={216}
        wellBottom={666}
        footnote="Reviewing something that runs surfaces problems a static mock cannot — wrong states, missing cases, awkward sequences. The revise loop fires when it does."
        children={({ width, height }) => (
          <Sequence
            width={width}
            height={height}
            actors={[
              { id: 'design', name: 'Design', sublabel: 'Posts the build', kind: 'focal' },
              { id: 'product', name: 'Product', sublabel: 'Checks intent' },
              { id: 'eng', name: 'Engineering', sublabel: 'Checks effort', kind: 'external' },
              { id: 'qa', name: 'QA', sublabel: 'Checks the states', kind: 'external' },
              { id: 'issue', name: 'The issue', sublabel: 'Where work is tracked', kind: 'store' },
            ]}
            messages={[
              { from: 'design', to: 'product', label: 'one url', kind: 'success' },
              { from: 'design', to: 'eng', label: 'same url', kind: 'success' },
              { from: 'design', to: 'qa', label: 'same url', kind: 'success' },
              { from: 'product', to: 'design', label: 'missing?', kind: 'return' },
              { from: 'eng', to: 'design', label: 'feasible?', kind: 'return' },
              { from: 'qa', to: 'design', label: 'states?', kind: 'return' },
              { from: 'design', to: 'design', label: 'revise', kind: 'call' },
              { from: 'design', to: 'issue', label: 'decisions', kind: 'success' },
            ]}
            legend={[
              { label: 'The one link', line: 'accent' },
              { label: 'What each reviewer asks', line: 'default' },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 20 */
  {
    id: 'where-the-judgment-is',
    title: 'The decisions, not the drawing',
    notes:
      'This is the slide. Tooling composes screens from components that already exist — it does not decide which screen is right, and it will build exactly what it is asked for, including the wrong thing. Setting the boundary, disagreeing with the spec, noticing what was not asked, choosing what not to keep.\n\nThis is the direct answer to the third failure mode on slide 09: the wrong thing, built well. That judgment is the job, and the coverage document is where it is recorded.',
    /* The one slide whose note is the deck's thesis rather than a closing remark,
       which is why it runs long and why `rowsTop` is pulled up to give it room.
     *
     * Stays a list ON PURPOSE. Every diagram candidate here would imply these four
     * judgments have a structure — an order, a hierarchy, a flow. They do not. They
     * are four places where a person made a call, and prose is the honest shape. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Where the judgment is"
        pageNumber={20}
        kicker="The part of this that is not production"
        title={['The decisions, ', { accent: 'not the drawing.' }]}
        titleSize="h2"
        termWidth={260}
        rowsTop={224}
        rows={[
          {
            term: 'Setting the boundary',
            detail:
              'Which surfaces are in and which are not. On the comms project, two of twelve requirements were named as having no screen at all — that is a call, and it is recorded as one.',
          },
          {
            term: 'Disagreeing with the spec',
            detail:
              'Six places on that project where the design does not follow the requirement literally, each with its reason — including one acceptance criterion that had gone stale.',
          },
          {
            term: 'Noticing what was not asked',
            detail:
              'The fee change had no ticket for the sync screen. Syncing a disabled fee would have deleted it across every hotel in the event.',
          },
          {
            term: 'Choosing what not to keep',
            detail:
              'Ten components deleted on that phase rather than carried forward. Options narrow by removing, not by adding.',
          },
        ]}
        note="Tooling composes screens from components that already exist. It does not decide which screen is right, and it will build exactly what it is asked for — including the wrong thing. That judgment is the job, and it is what the coverage document records."
      />
    ),
  },

  /* ------------------------------------------------------------------ 21 */
  {
    id: 'what-engineering-receives',
    title: 'A working reference, and a written answer',
    notes:
      'The output at handoff, and worth comparing against the standard workflow on slide 11: instead of redlines and a spec, engineering gets a working prototype plus the inventory that says what changed and what it affects.\n\nThe third and fourth rows are the ones engineering actually asks for. Components itemised per screen — new, changed or reused — means effort is countable before anyone estimates a ticket. And edge cases listed against the screen they belong to, rather than as a global list nobody reads to the bottom of.\n\nSlide 16 is that itemisation, named component by component, so this is not a promise about a document nobody has seen.',
    /* Rewritten from four generic handoff items to the four that are actually
       handed over. The two that matter are the last two, and they are what makes
       this slide different from the standard workflow's "here is a Figma file":
       component-level change status per screen turns handoff into something
       countable, and per-screen edge cases put the awkward case next to the screen
       it happens on.
     *
     * NO LONGER A TRIM CANDIDATE. The earlier version's content was the last column
     * of the swimlane; this version's is not on any other slide, and 20 draws it. */
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="What engineering receives"
        pageNumber={21}
        kicker="The output, at handoff"
        title={['A working prototype, ', { accent: 'itemised.' }]}
        titleSize="h2"
        termWidth={280}
        rowsTop={230}
        rows={[
          {
            term: 'A working prototype',
            detail:
              'Clickable, built from the real components, covering the states agreed in the inventory — not a picture of them.',
          },
          {
            term: 'The inventory, in Storybook',
            detail:
              'Every surface the change touches, what changed on each one, and what that change affects downstream.',
          },
          {
            term: 'Components, per screen',
            detail:
              'Itemised as new, changed or reused, so effort is countable before a ticket is estimated rather than discovered during it.',
            changed: true,
          },
          {
            term: 'Edge cases, per screen',
            detail:
              'Listed against the screen they belong to rather than as one global list nobody reads to the bottom of.',
            changed: true,
          },
        ]}
        note="All of it sits beside the screens it describes. Scope is knowable at handoff because the reference is made from the same parts the build will use."
      />
    ),
  },

  /* ------------------------------------------------------------------ 22 */
  {
    id: 'worked-example',
    title: 'Four numbers design can be held to',
    links: [
      {
        label: 'Phase 2 · Requirements coverage',
        href: 'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-teams-mgmt-comms-phase-2-requirements-coverage--docs',
      },
      {
        label: 'Phase 1 · Notifications preferences',
        href: 'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-teams-mgmt-comms-phase-1-v1-%C2%B7-notifications-preferences--docs',
      },
    ],
    notes:
      'This slide is deliberately not "look how much I made". It is the four things design delivery can be measured on, in the terms engineering and product already use — and all four are checkable in the coverage doc linked under this slide, which is the point of putting them up.\n\nFor product. Requirements accounted for: twelve of twelve, ten mapped to a screen and two judged to need no UI with the reason written down. Nothing silently dropped is the whole claim. And six decisions on record, with five questions raised before the build rather than surfacing mid-sprint.\n\nFor engineering. Eleven components reused against fourteen built new — the reuse is the maintenance argument, because the eleven are already reviewed and already have their states. And four hours. Be precise about what that number is, because it is the one people will repeat. It is not time to a first draft and it is not elapsed calendar time — it is the TOTAL design production time on this project: the refinement, the back and forth, and the finished requirements handed to engineering. Weeks did not go into this.\n\nTwo things keep it honest rather than a boast. It is four hours BECAUSE Phase 1 already existed and was documented — the same twelve requirements with no foundation underneath is a different number entirely. And elapsed time was governed by review availability rather than by design, which is the part that says design was not the constraint here.\n\nIf you want to hold design to something, hold it to these four. The one I would watch is requirements accounted for, because it is the only one that cannot be gamed by working faster.\n\nOne caveat to say out loud: the four hours is what Phase 2 cost BECAUSE Phase 1 existed and was documented. Quoted without that, it becomes a throughput claim the process cannot support.',
    /* WAS AN EFFORT COUNT — 5 surfaces / 14 components / 60 pages / 4 hours — which
       measured OUTPUT and therefore said "I did a lot of work". That is the wrong frame
       for this audience: a CTO and a product director do not buy design on volume, and
       a slide of production totals invites the question of whether the volume was
       necessary. So the same project is re-cut as the four things design delivery can be
       HELD TO, in the vocabulary those two roles already use for delivery: coverage,
       decisions on record, reuse, cycle time.
     *
     * TWO OF EACH, AND `groups` SAYS WHOSE. Coverage and decisions are the product
     * director's; reuse and cycle time are the CTO's. Splitting them makes the slide
     * answerable by two people rather than admired by both — and `groups` aligns to the
     * same grid as the tiles, so the pairing is structural rather than stated.
     *
     * EVERY VALUE IS FOUR CHARACTERS OR FEWER so all four can sit at `stat` (68px).
     * The previous version set one tile at `statMd` (36px) to fit '4 hrs' and it read
     * as the least important figure rather than the longest — a figure row exists to be
     * compared across. Units live in `label` and `note`, never in `value`.
     *
     * PROVENANCE: 12 requirements / 2 judged no-UI / 6 decisions / 5 open questions are
     * the coverage doc's own record; 11 and 14 are counted from `comms-phase-1-components-*`
     * and `comms-phase-2-components-*` in the live story index. Only the four hours is
     * unverifiable from the repo, which is why the notes carry its caveat rather than
     * the slide carrying it alone.
     *
     * THE FOUR HOURS IS TOTAL PRODUCTION TIME, NOT CYCLE TIME, and the tile said
     * otherwise until it was corrected. 'Hours to a reviewable link · request to one URL'
     * describes time-to-first-draft, which is both a weaker claim and a different one:
     * the four hours cover the whole of design's effort on this project, refinement loop
     * and finished requirements included. Understating it that way also invited the
     * obvious follow-up — how long did the REST take — which has no answer, because there
     * is no rest. The lead now names which measure it is, since a figure this small is
     * only credible when its boundaries are stated. */
    render: () => (
      <StatGrid
        fit="none"
        eyebrow="Design KPIs · Comms Phase 2"
        pageNumber={22}
        columns={4}
        surface="muted"
        title={['Four numbers ', { accent: 'design can be held to.' }]}
        titleWidth={940}
        lead={[
          'Comms Phase 2, measured the way delivery already gets measured. Four hours is the ',
          { accent: 'total design production time' },
          ' — refinement and feedback included, through to final requirements. Not time to a first draft.',
        ]}
        groups={[
          { label: 'For product', span: 2 },
          { label: 'For engineering', span: 2 },
        ]}
        groupsSize="h4"
        top={404}
        height={254}
        cards={[
          {
            value: '100%',
            label: 'Requirements accounted for',
            note: '10 mapped to a screen, 2 judged no-UI',
          },
          {
            value: '6',
            label: 'Decisions on record',
            note: 'With 5 questions raised before the build',
          },
          {
            value: '11',
            label: 'Components reused',
            note: 'Against 14 built new for Phase 2',
          },
          {
            value: '4',
            label: 'Hours of design production',
            note: 'Total, refinement loop included',
          },
        ]}
      />
    ),
  },

]
