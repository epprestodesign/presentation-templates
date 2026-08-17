import { FullBleed } from '../../templates/FullBleed'
import { NumberedRows } from '../../templates/NumberedRows'
import { TintTable } from '../../templates/TintTable'
import type { DeckSlide } from '../types'

/**
 * THE APPENDIX — slides 37–42.
 *
 * Slide 36 closes the argument with "all three examples are already in the
 * Storybook". This section makes good on that: one slide per project, each
 * naming which of the three request types it exemplifies, what to look at, and
 * where it lives.
 *
 * THE URL IS THE POINT OF THESE SLIDES, so it is set as the accent note rather
 * than buried in the copy — it is the one thing a viewer needs to take away. The
 * short host+repo form is displayed because a full Storybook deep link runs past
 * 120 characters and wraps to three lines at body size; the complete link is in
 * the speaker notes, where it can be copied without reading it off a projector.
 *
 * Every link was checked live: all three sites return 200, and both coverage
 * docs are present in eventpipe-prototype-ds's story index.
 */

/** Full deep links, kept next to the slides that reference them so a broken one
 *  is fixed in a single place. */
const LINKS = {
  coverageFeature:
    'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-teams-mgmt-comms-phase-2-requirements-coverage--docs',
  coverageTweak:
    'https://epprestodesign.github.io/eventpipe-prototype-ds/?path=/docs/design-requests-multiple-secondary-fees-requirements-coverage--docs',
  presto2026: 'https://epprestodesign.github.io/presto-2026/',
  ticketing:
    'https://epprestodesign.github.io/presto-2026-ticketing/?path=/docs/getting-started-introduction--docs',
}

export const partFour: DeckSlide[] = [
  {
    id: 'appendix',
    title: 'Appendix',
    links: [
      { label: 'Type 01 · Secondary fees', href: LINKS.coverageTweak },
      { label: 'Type 02 · Comms Phase 2', href: LINKS.coverageFeature },
      { label: 'Type 03 · Ticketing', href: LINKS.ticketing },
      { label: 'Presto 2026', href: LINKS.presto2026 },
    ],
    notes:
      'Appendix. Four things to look at, each a shipped example of something claimed earlier in the deck. Every link is public — no sign-in, nothing to install, and engineering and QA see the same URL you do.',
    /* FullBleed rather than SectionDivider, matching Showcase → Full Bleed →
     * Code In Glasses.
     *
     * An appendix divider is doing a different job from the six section dividers
     * before it: those break the argument into acts, this one says the argument is
     * over and what follows is evidence. A full-bleed photograph marks that change
     * of register far more plainly than another numbered card would.
     *
     * `watermark={false}` follows the reference story — the wordmark competes with
     * a photograph, and the arrow already carries the brand. */
    render: () => (
      <FullBleed
        fit="none"
        image="full-bleed/demo-code-glasses"
        alt="Glasses reflecting lines of code"
        eyebrow="Appendix"
        title="Appendix"
        arrow
        scrim={0.34}
        watermark={false}
      />
    ),
  },

  {
    id: 'example-tweak',
    title: 'Example · Type 01 · Multiple secondary fees',
    links: [
      { label: 'Open the coverage doc', href: LINKS.coverageTweak },
    ],
    notes: `Type 01, the tweak. One line of requirement — allow up to three secondary fees instead of one — that moved eight surfaces across two products. The coverage doc is the deliverable: requirement to screen, what has no mock, and the decisions made.\n\nFull link: ${LINKS.coverageTweak}`,
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Example · Type 01"
        pageNumber={38}
        kicker="A tweak, and its coverage document"
        title={['Multiple secondary fees. ', { accent: 'Eight surfaces.' }]}
        titleSize="h2"
        termWidth={260}
        rows={[
          {
            term: 'What to look at',
            detail:
              'The requirement-to-screen table — seven tickets mapped to the eight surfaces they touched.',
          },
          {
            term: 'The interesting part',
            detail:
              'The screen nobody asked about: syncing a fee slot the event had turned off would have silently deleted that fee across every hotel.',
          },
          {
            term: 'Turnaround',
            detail: 'Hours, from a signed-off inventory.',
          },
        ]}
        note="epprestodesign.github.io/eventpipe-prototype-ds → Design Requests → Multiple Secondary Fees"
        noteHref={LINKS.coverageTweak}
      />
    ),
  },

  {
    id: 'example-feature',
    title: 'Example · Type 02 · Teams Mgmt Comms Phase 2',
    links: [
      { label: 'Open the coverage doc', href: LINKS.coverageFeature },
    ],
    notes: `Type 02, the feature. Twelve requirements across five surfaces, twenty prototypes, fifteen components sharing six state modules. The coverage doc carries the requirement map, the six decisions worth reviewing, and what deliberately was not designed.\n\nFull link: ${LINKS.coverageFeature}`,
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Example · Type 02"
        pageNumber={39}
        kicker="A full feature, documented as it was built"
        title={['Teams Mgmt Comms Phase 2. ', { accent: 'Twelve requirements.' }]}
        titleSize="h2"
        termWidth={260}
        rows={[
          {
            term: 'What to look at',
            detail:
              'Twenty prototypes across five surfaces, then the coverage doc that maps every ticket to the screen answering it.',
          },
          {
            term: 'The discipline',
            detail:
              'The configured screen and first-time setup are one implementation seen at two moments — they cannot drift, because there is only one of them.',
          },
          {
            term: 'Also documented',
            detail:
              'Six decisions where design made a call rather than following the spec, and four requirements deliberately not designed.',
          },
        ]}
        note="epprestodesign.github.io/eventpipe-prototype-ds → Design Requests → Teams Mgmt Comms Phase 2"
        noteHref={LINKS.coverageFeature}
      />
    ),
  },

  {
    id: 'example-ground-up',
    title: 'Example · Type 03 · Ticketing',
    links: [
      { label: 'Open the ticketing concepts', href: LINKS.ticketing },
    ],
    notes: `Type 03, the ground-up concept. Four options over three rounds in three days, and zero library files changed — it was all composed from the foundation. Converging showed up as subtraction.\n\nFull link: ${LINKS.ticketing}`,
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Example · Type 03"
        pageNumber={40}
        kicker="A ground-up concept, three rounds in three days"
        title={['Ticketing. ', { accent: 'Diverge wide, then subtract.' }]}
        titleSize="h2"
        termWidth={260}
        rows={[
          {
            term: 'What to look at',
            detail:
              'Three parallel options on day one, forked to a fourth on day two, revised on day three — each round its own category.',
          },
          {
            term: 'The finding',
            detail:
              'Each round removed more than it added, and what it removed was the point. Rejected options are kept and labelled, not deleted.',
          },
          {
            term: 'Cost to the system',
            detail: 'Zero library files changed. All of it composed from the foundation.',
          },
        ]}
        note="epprestodesign.github.io/presto-2026-ticketing"
        noteHref={LINKS.ticketing}
      />
    ),
  },

  {
    id: 'example-booking-site',
    title: 'Example · The booking site',
    links: [
      { label: 'Open Presto 2026', href: LINKS.presto2026 },
    ],
    notes: `presto-2026 — the booking site revamp. Not one of the three request types; it is the product surface the foundation was extracted from, which is why the three types can be composed rather than drawn.\n\nFull link: ${LINKS.presto2026}`,
    render: () => (
      <NumberedRows
        fit="none"
        eyebrow="Example · The product surface"
        pageNumber={41}
        kicker="Where the foundation came from"
        title={['Presto 2026. ', { accent: 'The booking site.' }]}
        titleSize="h2"
        termWidth={260}
        rows={[
          {
            term: 'What to look at',
            detail:
              'The booking flow end to end, and the component library underneath it — 41 shared components, tokens and app shell.',
          },
          {
            term: 'Why it matters here',
            detail:
              'This is the surface the foundation was extracted from. It is the reason a new screen is mostly assembly rather than drawing.',
          },
        ]}
        note="epprestodesign.github.io/presto-2026"
        noteHref={LINKS.presto2026}
      />
    ),
  },

  {
    id: 'every-link',
    title: 'Every link',
    links: [
      { label: 'Type 01 · Secondary fees', href: LINKS.coverageTweak },
      { label: 'Type 02 · Comms Phase 2', href: LINKS.coverageFeature },
      { label: 'Type 03 · Ticketing', href: LINKS.ticketing },
      { label: 'Presto 2026', href: LINKS.presto2026 },
    ],
    notes:
      'One slide to photograph. Everything in this deck is a public link — no sign-in, nothing to install, and engineering and QA see the same URL you do.',
    render: () => (
      <TintTable
        fit="none"
        variant="ruled"
        eyebrow="Every link"
        pageNumber={42}
        title={['Everything here is ', { accent: 'a link.' }]}
        titleSize="h2"
        lead="No sign-in, nothing to install. You, engineering and QA review the same URL at the same time."
        headers={['Example', 'Type', 'Where']}
        columnWidths={[330, 150, 675]}
        minRowHeight={64}
        rows={[
          {
            label: 'Multiple secondary fees',
            cells: [['01 · Tweak'], ['eventpipe-prototype-ds → Design Requests']],
          },
          {
            label: 'Teams Mgmt Comms Ph2',
            cells: [['02 · Feature'], ['eventpipe-prototype-ds → Design Requests']],
          },
          {
            label: 'Ticketing',
            cells: [['03 · Ground-up'], ['presto-2026-ticketing']],
          },
          {
            label: 'Presto 2026',
            cells: [['Product'], ['presto-2026']],
          },
        ]}
      />
    ),
  },
]
