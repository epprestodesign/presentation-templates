import { SectionDivider } from '../../templates/SectionDivider'
import { Pillars } from '../../templates/Pillars'
import { TintTable } from '../../templates/TintTable'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Architecture } from '../../diagrams/Architecture'
import { PlatformIntegration } from '../../diagrams/PlatformIntegration'
import type { DeckSlide } from '../types'
import { BOUNDARY_LEGEND, COVER, SHAPE, WELL } from './shared'

/**
 * PART ONE — slides 01–06: the answer up front, then the foundation.
 *
 * WHO IS HERE AND WHAT REACHES ME, BEFORE ANYTHING ELSE. The deck builds in four
 * movements — the team and its demand (I), where that jams (II), what the system
 * does about it (III), and that the same process holds outside product (IV) — so
 * that someone who has never thought about design throughput can read it in one
 * pass. An earlier cut opened on the three-boundary process diagram, which is the
 * answer to a question the audience had not been asked yet.
 *
 * NO SOLUTION APPEARS IN THIS SECTION. Six audiences, seven named sources, three
 * boundaries. The design system is not mentioned until Section III, because a
 * mechanism introduced before the problem it solves is heard as a tool
 * preference rather than as a response.
 *
 * FOUR CONVERSION DECISIONS, inherited from the source deck, applying to every
 * part file:
 *
 *  1. The source's `.kicker` — the question a slide answers, above the headline —
 *     has a real home only on `NumberedRows`, which has a `kicker` prop. Elsewhere
 *     it becomes the `lead`, which is the same job by another name.
 *
 *  2. The source's `.gap-note` closing line has nowhere to sit under a full-width
 *     table, so on 03 it is folded into the `lead` as the accented clause. On
 *     `NumberedRows` it sits in `note`; on `DiagramSlide` in `footnote`.
 *
 *  3. The source sets the second line of every headline in grey (`.dim`). Here it
 *     is ACCENT — grey-on-grey is the thing this deck was told to stop doing, and
 *     the accented clause is the one carrying the claim in every case.
 *
 *  4. ONE table in the whole deck, `variant="ruled"`. The cyan ramp only reads as
 *     emphasis while it stays the exception, and 03 is a reference matrix rather
 *     than an argument.
 */

export const partOne: DeckSlide[] = [
  /* ------------------------------------------------------------------ 01 */
  {
    id: 'title',
    /* Not 'The design process' — that is the DECK title, and the player composes the
       browser tab as '<n> · <slide title> · <deck title>', so it read the same phrase
       twice. */
    title: 'A proven system, a faster partnership',
    notes:
      'Open on the two things worth taking away, because they are what the room can act on.\n\nFirst, none of this is experimental. One component system in code, reviewed once and reused — and a workflow that design-engineering teams already run. Slide 11 puts it beside the standard Figma-and-handoff workflow so you can see exactly how small the departure is: four things change and the rest stays put.\n\nSecond, the partnership is where the speed comes from, not the tooling. Review happens before the build against the components engineering will actually use, everyone opens the same link at the same time, and the requirements arrive with the screens instead of catching up to them. Comms Phase 2 was four hours of production because Phase 1 was already there and already documented.\n\nWorth stating once, since the rest of the deck depends on it: there is one designer here, and the job spans product, brand, web, marketing, decks and the one-offs. An agency would staff that separately. That is not a complaint — it is why the system matters.\n\nThe next slide is the whole answer on one page. Everything after it is context.',
    /* THE TITLE LEADS ON PROVENANCE AND SPEED, NOT ON THE CONSTRAINT. Two earlier cuts
       were wrong in opposite directions: 'The design process' was true of any design team
       anywhere, and 'One designer, one process' opened on a limitation — which invites
       the audience to read everything after it as coping rather than as a working method.
       A deck asking product and engineering to change how they hand work over has to open
       on why the method is safe to adopt, and the two answers are that it is not
       experimental and that the speed comes from the partnership.
     *
       The one-designer fact still matters — Section II's arithmetic depends on it — so it
       moved to the `label` and the speaker notes, where it is context rather than the
       headline claim.
     *
       `width` 820 → 880: the lead runs three sentences and the last one carries three
       clauses, which needs the measure to stay at three lines.
     *
       SectionDivider's white-panel variant rather than `Cover`: a title well plus a
       brand plate says the same thing without the photo strip, and a talk about
       process does not open on stock photography.

       The frame label is in `label`, NOT `eyebrow`. With `panel` on, the white card
       covers all four corners the chrome occupies and the chrome's ink is white on
       a brand surface — an eyebrow here renders white on white. Stating the section
       in the copy stack is the variant's own documented answer, and it is why
       `watermark` is off too.

       THE TITLE IS THE ONLY PANELLED DIVIDER IN THE DECK. The four section covers
       run on the bare plate — see the note on COVER in shared.tsx. */
    render: () => (
      <SectionDivider
        fit="none"
        watermark={false}
        panel
        label="Internal · Justin Girard · The only designer at EventPipe"
        title={['A proven system.\n', { accent: 'A faster partnership.' }]}
        lead="None of this is invented here — one component system in code, reviewed once and reused, plus the practices design and engineering teams already run at their best. What it buys: review before the build, one link everyone opens, and requirements that arrive with the screens instead of after them."
        width={880}
      />
    ),
  },

  /* ------------------------------------------------------------------ 02 */
  {
    id: 'section-foundation',
    title: 'Section I · The team',
    notes:
      'Section one, and deliberately no solutions in it. Just who asks, what they ask for, and where design sits between the requirement and the build. Everything after this is a response to what these three slides establish.',
    render: () => (
      <SectionDivider
        {...COVER}
        pageNumber={3}
        label="Section I · Foundation"
        title={'The team, and\nwhat reaches me.'}
        lead="Six audiences, seven named sources, and the three boundaries design sits between. No answers yet — this is the shape of the problem."
      />
    ),
  },

  /* ------------------------------------------------------------------ 02 */
  {
    id: 'the-process',
    title: 'This is the process',
    notes:
      'Leading with the answer, so nobody has to sit through twenty-four slides to get it. This is the process; everything after it is background for the team — why it looks like this, what it replaced, and what it costs. Read it or do not.\n\nThree columns, and the middle one is the only one making promises. Read the outer two as what I need and what changes for you.\n\nFrom product: requirements in Linear with a project and a date, a five-minute rehearsed walkthrough, and sign-off on the screen list before design starts. That last one is the single cheapest thing on this slide — it is the point where changing scope costs nothing.\n\nFrom design, every time: a working prototype on one link, the screen inventory with its states, components itemised as new, changed or reused, and every decision and open question written where the work is tracked.\n\nFor engineering, what changes: review happens before the build rather than after, against the same components you will use — so feasibility is a first-week conversation. And flagging the infeasible during the inventory is worth more than flagging it at handoff.\n\nOne ask, and it is the banner: requests go into Linear with a project and a date. Everything else on this slide either already happens or costs nobody anything. If you take one thing from this deck, take that.',
    /* THE OPENER, AND IT USED TO BE THE CLOSE. Moved to slide 02 so the deck leads with
       its answer and everything after it reads as background — which is the right shape
       for an audience that may only get through two slides, and it costs the deck
       nothing: a commitments slide works as well before the argument as after it, because
       it is not a recap. A summary that merely restates twenty-four slides would not
       survive the move; this one states what each side DOES, which needs no setup.
     *
     * THE LEAD IS ONE LINE, deliberately. It ran three sentences — the commitments, the
     * "everything after this is context" framing, and a note that one item is an ask —
     * and wrapped to three lines above a slide that already has a banner, three column
     * headings and ten cards. The third sentence was redundant against the banner, which
     * names the ask outright, so the lead keeps the two halves nothing else says.
     *
     * `Pillars` because the content is genuinely three columns of items and nothing
       else — no flow, no hierarchy, no sequence between them. The middle column is
       `accent` and carries the most cards, which is the right asymmetry: design is the
       one making promises here, and the outer two are an ask and a consequence.
     *
     * THIS RECOVERS THE SWIMLANE'S JOB IN A BETTER POSITION. A five-steps-three-roles
     * swimlane used to sit late in Section III, seven slides after the same five steps,
     * and was cut as a repeat. Up front the who-does-what content cannot be a recap of
     * anything — nothing has been shown yet — so it comes back as commitments rather
     * than as lanes.
     *
     * THE BANNER CARRIES THE ONE ASK. Everything else on the slide already happens or
     * costs nothing, and a deck with two proposals in it (11 and 13) needs one line
     * saying which single thing is being requested. */
    render: () => (
      <Pillars
        fit="none"
        eyebrow="The process"
        pageNumber={2}
        title={['This is the process. ', { accent: 'The rest is why.' }]}
        lead="What each side does from the next request onward. Everything after this slide is context."
        banner={{ label: 'The one ask · requests go into Linear with a project and a date' }}
        columns={[
          {
            title: 'Product brings',
            tone: 'ink',
            cards: [
              'Requirements in Linear, with a project and a date',
              'A five-minute rehearsed walkthrough',
              'Sign-off on the screen list, before design starts',
            ],
          },
          {
            title: 'Design returns, every time',
            tone: 'accent',
            cards: [
              'A working prototype, on one link',
              'The screen inventory, states included',
              'Components itemised: new, changed, reused',
              'Decisions and open questions, on the issue',
            ],
          },
          {
            title: 'Engineering gets',
            tone: 'navy',
            cards: [
              'Review before the build, not after it',
              'The same components you will build with',
              'Effort knowable in the first week',
            ],
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 03 */
  {
    id: 'the-demand',
    title: 'One designer, six audiences',
    notes:
      'Six audiences, one designer. Two of them are planned against the roadmap; four arrive on request, usually at short notice. A second product owner is joining, so volume goes up rather than down — which is the reason this deck exists. The next slide is the same picture with names on it.',
    /* `variant="ruled"`, not tinted: a reference matrix is scanned row by row, and
       the row tint competes with the eye's own line-tracking.
     *
     * THE FIRST CONTENT SLIDE IN THE DECK, on purpose. It is the only one that needs
     * no prior context — a reader who knows nothing about how design works here can
     * still read "one designer, six audiences" and take the rest of Section I as
     * detail on it. */
    render: () => (
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="The demand"
        pageNumber={4}
        title={['One designer, ', { accent: 'six audiences.' }]}
        titleSize="h2"
        lead={[
          'Who design serves, and how requests arrive. A second product owner is joining, so ',
          { accent: 'request volume goes up rather than down' },
          ' — the question this deck answers is how quality holds when it does.',
        ]}
        headers={['Who', 'What they need', 'How it arrives']}
        columnWidths={[280, 440, 400]}
        /* 54, down from 62, and `tableTop` 288 → 276: a sixth row at the old floor
           put the table's last rule 30px past the content floor. 276 + a ~50px
           header + 6 x 54 lands at 650. */
        minRowHeight={54}
        tableTop={276}
        rows={[
          {
            label: 'Product',
            cells: [['Requirements turned into screens'], ['Planned, against the roadmap']],
          },
          {
            label: 'Engineering',
            cells: [['Direction, specs, review'], ['Continuous, during builds']],
          },
          {
            label: 'Executives',
            cells: [['Narrative and decks'], ['On request, usually short notice']],
          },
          {
            label: 'Marketing',
            cells: [['Campaign and brand work'], ['On request']],
          },
          {
            label: 'Sales',
            cells: [['Pitch pages, decks, concepts'], ['On request']],
          },
          {
            label: 'Anyone',
            cells: [['Graphic design, one-offs'], ['On request']],
          },
        ]}
      />
    ),
  },

  /* ------------------------------------------------------------------ 04 */
  {
    id: 'who-asks',
    title: 'Seven sources, one channel',
    notes:
      'The previous slide with names on it, and the thing to say first is the middle column: this is not a product-design job with some extras attached. Product and UX is one of three disciplines, alongside brand, web and marketing, and decks and graphics. A design agency would staff those separately.\n\nJosh Silverberg and Scott Villemain on product. Sales for Presto page pitches and decks. Customer Support for Presto page graphics. Jeff Porter for marketing design. The C-suite for investor deck updates. And design concepts from anyone, at any time.\n\nThe thing to say out loud: not one of these arrives with a defined timeline, and none of them is tracked in Linear. Every one is a Slack message, and every one is asap. That is not a complaint about any individual — it is a description of a routing problem, and Section II is what it costs.',
    /* `PlatformIntegration`, and the reason is its footer rule.
     *
     * Upstream's §9 — the single most load-bearing rule in this type — is that a
     * layer-wide service connects to the ZONE'S BOTTOM EDGE and never to one
     * component, because wiring it to a single node understates its scope. Slack is
     * exactly that: not one requester's habit, but the condition every request
     * arrives under. Drawing it as a footer makes the argument structurally rather
     * than by repeating the same label on six wires — which is what the first sketch
     * did, and it read as noise.
     *
     * So the wires carry WHAT is being asked for and the footer carries HOW it
     * arrives. That split is the slide.
     *
     * SEVEN SOURCES IS THE CONSTRAINT THAT SETS EVERY OTHER NUMBER HERE. The side
     * columns lay out against the larger of the two counts and take `sideH =
     * min(stride - 16, 68)`, so six sources in a well with a legend and a two-band
     * footer computed a 20px box — every name rendered across its own bottom border
     * with the sublabel struck through. Three things bought the height back: no
     * legend, ONE footer band instead of two, and NO SUBLABELS on the side nodes.
     * The last is not a loss — the wire already says what each person asks for, so
     * 'Josh Silverberg → tickets' carries the role without a second line repeating it.
     *
     * Sales was then added as the seventh, which cost the remaining slack: at seven
     * the stride computed 44px and `sideH` 28px, exactly the floor a single-line name
     * needs. The well grew instead — `wellTop` 200 → 186 and `wellBottom` 668 → 672 —
     * which buys back a 48px stride and a 32px box. An EIGHTH source does not fit
     * without dropping the footer band, and the footer is the argument.
     *
     * NAMES ARE ON THE SLIDE by explicit instruction. Worth knowing before showing
     * it: this is a slide arguing that these people's requests arrive untracked and
     * undated, so who is in the room matters. Both product owners are named in the
     * speaker notes with their roles; swapping to roles-only is a one-line edit per
     * source. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Who asks"
        pageNumber={5}
        title={['Seven sources. ', { accent: 'One designer.' }]}
        lead="Every request arrives the same way, whoever sends it — and it is not all product design. One person covers what an agency would staff separately."
        wellTop={186}
        wellBottom={672}
        footnote="No defined timeline on any of them, and none of them tracked in Linear. The channel is Slack and the date is asap."
        children={({ width, height }) => (
          <PlatformIntegration
            width={width}
            height={height}
            sourcesLabel="Who asks"
            consumersLabel="What goes out"
            zoneLabel="Product design · one person"
            sources={[
              { name: 'Josh Silverberg', kind: 'input' },
              { name: 'Scott Villemain', kind: 'input' },
              { name: 'Customer Support', kind: 'input' },
              { name: 'Jeff Porter', kind: 'input' },
              { name: 'C-suite', kind: 'input' },
              { name: 'Sales', kind: 'input' },
              { name: 'Anyone', kind: 'input' },
            ]}
            /* THE ROW BELOW THE BAR IS THE DISCIPLINES, NOT THE PROCESS STEPS.
               
               It used to read 'Reads the request / Builds from the system / Reviews on
               one link', which is slide 16's pipeline stated a second time — and worse,
               it made the middle column look like a product-design workflow on a slide
               whose whole argument is that six different KINDS of request arrive. The
               disciplines are what the sources on the left are actually asking for, so
               the column now names them and the slide reads as one person covering what
               an agency would staff separately.
               
               THREE NODES, NOT FIVE. The zone is 623px wide, so a five-node row
               computes 104px per node — too narrow for a name plus a sublabel. Grouping
               to three gives 184px each, which is why brand, web and marketing share a
               box: they share a requester and a deliverable shape. */
            rows={[
              {
                /* NO `tag`. It read 'one', which the sublabel already says — and it cost
                   the bar its vertical centring. `NodeBox` reserves a 24px band for a
                   type tag and then centres the name+sublabel block in WHAT IS LEFT, so
                   the block sat 30px below the bar's top edge and 5px above its bottom:
                   off-centre by 25px, measured. Dropping the tag centres the text and
                   takes the bar from 68px to 48px, which the row below inherits as
                   breathing room. */
                kind: 'bar',
                name: 'Justin',
                sublabel: 'A design agency of one',
                focal: true,
              },
              {
                kind: 'row',
                nodes: [
                  { name: 'Product & UX', sublabel: 'Screens, flows, the system' },
                  { name: 'Brand, web & marketing', sublabel: 'Identity, banners, display ads' },
                  { name: 'Decks & graphics', sublabel: 'Investor decks, one-offs' },
                ],
              },
            ]}
            wires={[
              /* 'tickets', not 'requirements'. The wire label is centred on the first
                 leg of its dogleg, and the two top wires stagger closest to the
                 source column — so a 12-character label there overhangs its own
                 source box by 23px, measured. Nine characters is the fit, which is
                 also why the other four already clear. */
              { from: 'Josh Silverberg', to: 'Justin', label: 'tickets', tone: 'accent' },
              { from: 'Scott Villemain', to: 'Justin', label: 'tickets', tone: 'accent' },
              { from: 'Customer Support', to: 'Justin', label: 'graphics' },
              { from: 'Jeff Porter', to: 'Justin', label: 'campaign' },
              { from: 'C-suite', to: 'Justin', label: 'deck' },
              { from: 'Sales', to: 'Justin', label: 'pitches' },
              { from: 'Anyone', to: 'Justin', label: 'concepts' },
              { from: 'Product & UX', to: 'Reviewed screens', label: 'one url' },
              { from: 'Product & UX', to: 'Coverage docs', label: 'written' },
              { from: 'Brand, web & marketing', to: 'Brand + campaign', label: 'sized sets' },
              { from: 'Decks & graphics', to: 'Decks + narrative', label: 'editable' },
            ]}
            consumers={[
              { name: 'Reviewed screens' },
              { name: 'Coverage docs' },
              { name: 'Brand + campaign' },
              { name: 'Decks + narrative' },
            ]}
            footer={[
              {
                name: 'Slack',
                sublabel: 'Every source · no ticket · no date',
                label: 'asap',
              },
            ]}
          />
        )}
      />
    ),
  },

  /* ------------------------------------------------------------------ 05 */
  {
    id: 'where-design-sits',
    title: 'Where design sits',
    notes:
      'Three stages, and what crosses each boundary in both directions. Product sends requirements and a walkthrough, and gets back a screen list to sign off. Engineering gets clickable screens and a coverage doc, and sends back questions during the build. The point of the picture is the return arrows: both boundaries are two-way.\n\nSection IV then shows why the other request types do NOT need this picture.',
    /* The source draws this by hand — three notched frames and six paths. Here it is
       `Architecture`, which means the layout is DERIVED: the three zones are
       columns, the stages stack inside them, and every coordinate snaps to the 4px
       grid. Adding a stage re-flows its column instead of needing new x values for
       everything to its right.
     *
     * THREE NODES PER ZONE, SO THE ROWS ALIGN. That is the whole reason for the
     * count. Architecture attaches an edge to a node, and an edge between two nodes
     * on different rows has to elbow — which, between adjacent columns, means a
     * vertical run hugging the column's own edge, reading as a line drawn through
     * the boxes. Equal rows make every crossing a straight horizontal in the open
     * gutter. The first pass ran 4/4/2 and looked exactly as bad as that sounds.
     *
     * WHICH node an arrow attaches to is therefore arbitrary — and so is the
     * source's, which draws these as zone-level paths at fixed heights attached to
     * nothing. Row 0 forward and row 2 back is as faithful as any other choice and
     * the only one that draws cleanly.
     *
     * ONE focal node, not four. The first pass marked all four design nodes and the
     * column became a wall of teal — upstream's rule 5 restated: if everything is
     * focal, nothing is.
     *
     * The geometry constants are shared with Section IV, which draws this same
     * picture three more times. See shared.tsx. */
    render: () => (
      <DiagramSlide
        fit="none"
        eyebrow="Where design sits"
        pageNumber={6}
        title={['Between the requirement ', { accent: 'and the build.' }]}
        lead="The three stages, and what crosses each boundary — in both directions."
        {...WELL}
        footnote="Design sits between the requirement and the build, and produces the one artifact both sides review: a working version of the thing, made from the components engineering will use."
        children={({ width, height }) => (
          <Architecture
            width={width}
            height={height}
            {...SHAPE}
            zones={[
              {
                label: 'Product',
                nodes: [
                  {
                    id: 'p-reqs',
                    name: 'Writes the requirements',
                    sublabel: 'Tickets, criteria, the constraint',
                    kind: 'input',
                  },
                  {
                    id: 'p-walk',
                    name: 'Records a walkthrough',
                    sublabel: 'Thinking out loud, not a demo',
                    kind: 'input',
                  },
                  {
                    id: 'p-signoff',
                    name: 'Signs off the screen list',
                    sublabel: 'Before design starts',
                    kind: 'input',
                  },
                ],
              },
              {
                label: 'Design',
                nodes: [
                  {
                    id: 'd-inventory',
                    name: 'Inventories the screens',
                    sublabel: 'Sets the boundary',
                    kind: 'focal',
                  },
                  {
                    id: 'd-build',
                    name: 'Builds from the system',
                    sublabel: 'Working, not static',
                  },
                  {
                    id: 'd-review',
                    name: 'Reviews, then documents',
                    sublabel: 'One link · one coverage doc',
                  },
                ],
              },
              {
                label: 'Engineering',
                nodes: [
                  {
                    id: 'e-feasibility',
                    name: 'Flags the infeasible',
                    sublabel: 'Effort, against real components',
                    kind: 'external',
                  },
                  {
                    id: 'e-ask',
                    name: 'Asks questions',
                    sublabel: 'On the same link',
                    kind: 'external',
                  },
                  {
                    id: 'e-build',
                    name: 'Builds the feature',
                    sublabel: 'Against a working reference',
                    kind: 'external',
                  },
                ],
              },
            ]}
            edges={[
              { from: 'p-reqs', to: 'd-inventory', tone: 'accent', label: 'requirements' },
              {
                from: 'd-review',
                to: 'p-signoff',
                fromSide: 'left',
                toSide: 'right',
                dashed: true,
                label: 'screen list',
              },
              { from: 'd-inventory', to: 'e-feasibility', tone: 'accent', label: 'screens + doc' },
              {
                from: 'e-build',
                to: 'd-review',
                fromSide: 'left',
                toSide: 'right',
                dashed: true,
                label: 'questions',
              },
            ]}
            legend={BOUNDARY_LEGEND}
          />
        )}
      />
    ),
  },
]
