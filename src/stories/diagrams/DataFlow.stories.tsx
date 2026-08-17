import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { DataFlow } from '../../diagrams/DataFlow'

/** DIAGRAMS / Data Flow — who touches the data at each step, by role. */
const meta = {
  title: 'Diagrams/Data Flow',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Data Flow

Lanes are roles, columns are steps, and a cell holds a node only if that role does
something at that step. Reach for
[Architecture](/docs/diagrams-architecture--docs) when the question is *what talks
to what*; reach for this when the question is **who touches this, and in what
order**.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens.

### The empty cell is the point

Upstream's first anti-pattern is a placeholder box in a cell where a role does not
participate, and it is worth restating: the *shape* of the occupied cells is the
diagram. A full grid with some boxes greyed out says "everyone is involved
throughout". A sparse grid says "a reservation changes hands three times", which is
the actual claim.

### One labelled arrow

Every hand-off is an arrow; only the focal cross-role hand-off is named. Labelling
all eight turns the lanes into a wall of type and leaves the slide with no subject.
Three focal slots, one entry each: one step header, one node, one arrow.

### Payload chips are a separate axis from the accent

A chip says what *shape* the data is in — a form submission, a reservation row, a
rooming list. The accent says which hand-off the slide is about. Confusing them
would make a payload read as focal, so the chip palette is \`role.series\` with the
accent removed.

Two departures from upstream on the chips: they sit in the node's **top-right**
corner rather than on the bottom edge (\`NodeBox\` centres its name/sublabel block
and has no bottom reserve — the choice was a chip position or a sublabel, and the
sublabel says what the step does), and there is **no dot-pattern ground**, because
the diagram sits on a slide and the texture would compound with the deck's chrome.

### Routing

Single-bend, horizontal-first out of a right edge so the corner lands in the gutter
between step columns. \`fromSide\` / \`toSide\` exist for the one case the component
cannot infer: when a right-exit cross-lane hop would run straight through a box in
the source's own lane at the target's step.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

const PAYLOADS = [
  { code: 'BLK', label: 'Room block' },
  { code: 'WEB', label: 'Booking site' },
  { code: 'RES', label: 'Reservation' },
  { code: 'PII', label: 'Guest details' },
  { code: 'RPT', label: 'Report' },
]

/** The lifecycle of one reservation, by role.
 *
 *  The focal hand-off is the rooming list, because that is the moment guest names
 *  leave the platform — the only step in the row that is irreversible. */
export const WhoTouchesAReservation: Story = {
  name: 'Who touches a reservation',
  args: {
    eyebrow: 'How It Works',
    pageNumber: 32,
    title: ['A reservation changes hands ', { accent: 'four times.' }],
    lead: 'Each lane is a role and each column a step. The empty cells matter as much as the full ones: a team manager appears once, and a hotel never sees a guest name until the rooming list is released.',
    footnote:
      'Simplified: payment capture, waitlists and cancellations are omitted. Illustrative step names for this template.',
    children: ({ width, height }) => (
      <DataFlow
        width={width}
        height={height}
        payloads={PAYLOADS}
        lanes={[
          { name: ['Event', 'organiser'], key: 'ORG' },
          { name: ['Housing', 'operator'], key: 'OPS' },
          { name: ['Team', 'manager'], key: 'TEAM' },
          { name: ['Hotel', 'partner'], key: 'HTL' },
        ]}
        steps={[
          { number: '01', label: 'Contract' },
          { number: '02', label: 'Publish' },
          { number: '03', label: 'Book' },
          { number: '04', label: 'Rooming', focal: true },
          { number: '05', label: 'Settle' },
        ]}
        nodes={[
          { lane: 'ORG', step: 0, title: 'Agree the block', sub: 'dates · room count', chips: { out: 'BLK' } },
          { lane: 'OPS', step: 0, title: 'Load the contract', sub: 'rates and cut-off', chips: { in: 'BLK', out: 'BLK' } },
          { lane: 'OPS', step: 1, title: 'Open the site', sub: 'inventory goes live', chips: { in: 'BLK', out: 'WEB' } },
          { lane: 'TEAM', step: 2, title: 'Book rooms', sub: 'card on file', chips: { in: 'WEB', out: 'RES' } },
          { lane: 'OPS', step: 2, title: 'Hold and confirm', sub: 'reservation written', chips: { in: 'RES', out: 'RES' } },
          { lane: 'OPS', step: 3, title: 'Build the list', sub: 'per hotel, at cut-off', chips: { in: 'RES', out: 'PII' } },
          {
            lane: 'HTL',
            step: 3,
            title: 'Receive the list',
            sub: 'names released',
            chips: { in: 'PII', out: 'PII' },
            focal: true,
          },
          { lane: 'HTL', step: 4, title: 'Post the folio', sub: 'actuals per stay', chips: { in: 'PII', out: 'RPT' } },
          { lane: 'OPS', step: 4, title: 'Reconcile', sub: 'commission calculated', chips: { in: 'RPT', out: 'RPT' } },
          { lane: 'ORG', step: 4, title: 'Read the pickup', sub: 'block performance', chips: { in: 'RPT' } },
        ]}
        arrows={[
          { from: { lane: 'ORG', step: 0 }, to: { lane: 'OPS', step: 0 }, dashed: true },
          { from: { lane: 'OPS', step: 0 }, to: { lane: 'OPS', step: 1 } },
          /* Right-exit would run along the OPS lane straight through
             `OPS · Hold and confirm`. Dropping out of the bottom clears it. */
          {
            from: { lane: 'OPS', step: 1 },
            to: { lane: 'TEAM', step: 2 },
            fromSide: 'bottom',
            toSide: 'left',
          },
          { from: { lane: 'TEAM', step: 2 }, to: { lane: 'OPS', step: 2 } },
          { from: { lane: 'OPS', step: 2 }, to: { lane: 'OPS', step: 3 } },
          { from: { lane: 'OPS', step: 3 }, to: { lane: 'HTL', step: 3 }, tone: 'accent', label: 'Rooming list' },
          { from: { lane: 'HTL', step: 3 }, to: { lane: 'HTL', step: 4 } },
          { from: { lane: 'HTL', step: 4 }, to: { lane: 'OPS', step: 4 } },
          { from: { lane: 'OPS', step: 4 }, to: { lane: 'ORG', step: 4 }, tone: 'link' },
        ]}
      />
    ),
  },
}

/** Three lanes, six steps — the same component at a different shape.
 *
 *  A change request rather than the happy path, which is where the role question
 *  actually bites: one operator decides, and everyone downstream is notified. */
export const ChangeRequest: Story = {
  name: 'Change request',
  args: {
    eyebrow: 'How It Works',
    pageNumber: 33,
    title: ['One person decides. ', { accent: 'Everyone else is told.' }],
    lead: 'A date swap after the block is live. The operator is the only role with write access to the reservation, which is why every path in the drawing goes through the middle lane.',
    footnote:
      'Simplified: refunds, partial cancellations and rate disputes are omitted. Illustrative step names for this template.',
    children: ({ width, height }) => (
      <DataFlow
        width={width}
        height={height}
        payloads={PAYLOADS}
        lanes={[
          { name: ['Team', 'manager'], key: 'TEAM' },
          { name: ['Housing', 'operator'], key: 'OPS' },
          { name: ['Hotel', 'partner'], key: 'HTL' },
        ]}
        steps={[
          { number: '01', label: 'Request' },
          { number: '02', label: 'Check' },
          { number: '03', label: 'Reprice' },
          { number: '04', label: 'Decide', focal: true },
          { number: '05', label: 'Notify' },
          { number: '06', label: 'Audit' },
        ]}
        nodes={[
          { lane: 'TEAM', step: 0, title: 'Ask to swap', sub: 'from the booking site', chips: { out: 'WEB' } },
          { lane: 'OPS', step: 1, title: 'Check the block', sub: 'availability + cut-off', chips: { in: 'WEB', out: 'BLK' } },
          { lane: 'OPS', step: 2, title: 'Reprice the stay', sub: 'contracted rate applies', chips: { in: 'BLK', out: 'RES' } },
          {
            lane: 'OPS',
            step: 3,
            title: 'Approve or refuse',
            sub: 'one operator decides',
            chips: { in: 'RES', out: 'RES' },
            focal: true,
          },
          { lane: 'TEAM', step: 4, title: 'Confirmation', sub: 'new dates, new rate', chips: { in: 'RES' } },
          { lane: 'HTL', step: 4, title: 'Updated list', sub: 'if past cut-off', chips: { in: 'RES', out: 'PII' } },
          { lane: 'OPS', step: 5, title: 'Write the audit row', sub: 'who changed what', chips: { in: 'RES', out: 'RPT' } },
        ]}
        arrows={[
          { from: { lane: 'TEAM', step: 0 }, to: { lane: 'OPS', step: 1 } },
          { from: { lane: 'OPS', step: 1 }, to: { lane: 'OPS', step: 2 } },
          { from: { lane: 'OPS', step: 2 }, to: { lane: 'OPS', step: 3 } },
          /* Declared BEFORE the accent hop, and out of the top rather than the
             right. Two arrows leaving the same right edge for targets in
             opposite lanes drop their vertical legs at the two targets' centre
             lines — which here are the same x, so the two legs ran on top of
             each other and read as one closed loop. Sending the upward one out
             of the top gives it its own corridor. */
          { from: { lane: 'OPS', step: 3 }, to: { lane: 'TEAM', step: 4 }, tone: 'link', fromSide: 'top', toSide: 'bottom' },
          { from: { lane: 'OPS', step: 3 }, to: { lane: 'HTL', step: 4 }, tone: 'accent', label: 'Rooming update' },
          { from: { lane: 'HTL', step: 4 }, to: { lane: 'OPS', step: 5 } },
        ]}
      />
    ),
  },
}
