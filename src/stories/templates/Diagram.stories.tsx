import type { Meta, StoryObj } from '@storybook/react-vite'
import { Diagram } from '../../templates/Diagram'

/** TEMPLATES / Diagram — labelled nodes, arranged two ways.
 *
 * Stories are the real rebuilt slides: a content object handed to the template.
 */
const meta = {
  title: 'Templates/Narrative/Diagram',
  component: Diagram,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Diagram

Two arrangements of the same node spec (\`label\`, \`icon\`, \`caption\`), chosen
by \`variant\`:

- **orbit** — four muted quadrants with a ring-outlined hub over their shared
  centre. Each quadrant pushes its label and icon to the corner furthest from
  the hub, derived from the index, so reordering the participants cannot leave a
  label pointing the wrong way.
- **flow** — nodes as brand-gradient cards in a row with arrows in the gaps.

\`variant\` has no default on purpose. The two say different things — "everything
meets in the middle" versus "value passes left to right" — so picking one is a
decision about the argument, not a styling default.

**Rebuilt from:** \`references/slide-decks/09.png\` (orbit) and
\`references/slide-decks/Slide.png\` (flow).
        `,
      },
    },
  },
} satisfies Meta<typeof Diagram>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 09 — "EventPipe is our customer's operating system".
 *
 *  Two paragraphs of copy, and this is the one place the rebuild loses a little:
 *  the original sets both at the same size, while `SlideHeading` renders `lead`
 *  at 17px and `body` at 15px. Passing them as lead + body keeps the copy column
 *  in one stack — which is what stops the second paragraph colliding with a
 *  headline that wraps to a different number of lines — so the 2px step is the
 *  right trade until SlideHeading takes a `paragraphs` array.
 *
 *  Icons stand in for hand-drawn line art: the original's registration glyph is
 *  three figures over a gear and its ticketing glyph is a phone with a star,
 *  neither of which exists in Material Symbols. `groups` and
 *  `confirmation_number` are the nearest true equivalents at the same weight. */
export const Ecosystem: Story = {
  args: {
    variant: 'orbit',
    eyebrow: 'Why We Win',
    pageNumber: 9,
    title: ['EventPipe is our ', { accent: "customer's operating system" }],
    lead: 'Housing teams do not report on their events inside EventPipe. They run them. Blocks, rates, pickup, contracts, commissions and reconciliation live in one record — so leaving means rebuilding the operation mid-season, not swapping a vendor.',
    body: "The reach extends past our direct customer — the branded booking sites teams and attendees use are EventPipe sites, so we can service our customers' customers directly when the situation calls for it.",
    titleWidth: 470,
    nodes: [
      { label: 'Registration', icon: 'groups' },
      { label: 'Ticketing', icon: 'confirmation_number' },
      { label: 'Hotel Marketplaces', icon: 'signpost' },
      { label: 'Housing Services', icon: 'room_service' },
    ],
    hub: {
      logo: true,
      title: 'Event housing system of record',
      detail: 'Authoritative blocks, rates, pickup, contracts, commissions, payouts',
    },
  },
}

/** "Powering Tournament Lodging at Scale" — the three-step ecosystem flow.
 *
 *  The first card carries the EventPipe glyph rather than an icon (`logo: true`),
 *  which is why the node spec has that flag: the deck's own mark is the subject
 *  of the first step, and swapping in a generic 'hub' glyph would have thrown
 *  away the one place the brand belongs inside the artwork.
 *
 *  No page number — the reference has none, and the eyebrow carries the section
 *  instead. */
export const EcosystemFlow: Story = {
  args: {
    variant: 'flow',
    eyebrow: 'Ecosystem Overview',
    title: 'Powering Tournament Lodging at Scale',
    lead: 'EventPipe equips housing companies to book, manage, and track with ease.',
    titleWidth: 1120,
    nodes: [
      { label: 'EventPipe', logo: true, caption: 'The B2B SaaS backbone' },
      {
        label: 'Housing Companies',
        // 'corporate_fare' rather than 'apartment': the original draws a hotel
        // tower, and 'apartment' is a flat grid of window squares that reads as
        // a spreadsheet at 150px.
        icon: 'corporate_fare',
        caption: 'Powered by EventPipe software',
      },
      {
        label: 'Event / Tournament Operators',
        icon: 'stadium',
        caption: 'Serviced by Housing Companies',
      },
    ],
  },
}

/** The chain carried all the way to the person who books a room.
 *
 *  Three steps, like `EcosystemFlow`, but ending at the traveller rather than at
 *  the operator — the two stories are a pair, showing the same flow to its two
 *  useful endpoints.
 *
 *  This was a four-step version until the fourth card was dropped. Four fit
 *  geometrically — cards share the width left after the fixed arrow columns, so
 *  a fourth narrows every card rather than pushing the last past the watermark
 *  gutter — but narrowing them wraps 'Event / Tournament Operators' and
 *  'Teams & Attendees' onto three lines each, and a row of three-line labels
 *  under 150px icons reads as dense rather than as a sequence. Three is the
 *  practical ceiling for this variant at slide scale. */
export const FlowToAttendees: Story = {
  name: 'Flow – to attendees',
  args: {
    ...EcosystemFlow.args,
    nodes: [
      { label: 'EventPipe', logo: true, caption: 'The B2B SaaS backbone' },
      {
        label: 'Housing Companies',
        icon: 'corporate_fare',
        caption: 'Powered by EventPipe software',
      },
      { label: 'Teams & Attendees', icon: 'family_restroom', caption: 'Book on branded sites' },
    ],
  },
}
