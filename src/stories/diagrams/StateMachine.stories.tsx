import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { StateMachine } from '../../diagrams/StateMachine'

/** DIAGRAMS / State Machine — finite states and their triggers, on a slide. */
const meta = {
  title: 'Diagrams/State Machine',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## State machine

Finite states and what moves between them — order status, block lifecycle,
reservation status, job queue.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Every transition is labelled

\`event\`, or \`event [guard]\`. An unlabelled transition removes the only thing a
state diagram exists to say, which is what triggers the move. Entry is a filled
dot, the terminal is a ringed dot, and the accent goes on the state the reader
should notice — usually the error state or the happy completion.

### \`note\`, not a fan-out

The transition every state machine has and nobody should draw is
\`* → Cancelled\`. Upstream's answer is a single annotation rather than an arrow
out of all six states, and \`note\` is where it goes.

### One departure from upstream

**Transitions are orthogonal, not curved.** Upstream draws them as curves and
self-loops as arcs. The deck's connector rules are absolute: every bend is a
quarter-arc and a diagonal is a hard fail, so a self-loop is a rectangular U over
the state's top edge landing on two distinct attach points.

### Layout is derived

States sit on a row/column grid and each is capped **below** its cell width. The
cap is what buys the gap a transition label needs — with boxes filling their
cells, the only home for \`inventory loaded\` would be a 40px gutter and the mask
would land inside both neighbours. A transition that changes both row and column
travels the row-gap corridor, which is the one strip of canvas guaranteed to be
empty.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The block lifecycle, as the platform enforces it. */
export const BlockLifecycle: Story = {
  name: 'Room block lifecycle',
  args: {
    eyebrow: 'Block Lifecycle',
    pageNumber: 24,
    title: ['Rooms only sell in ', { accent: 'one state.' }],
    lead: 'A block is a state machine, not a spreadsheet. Inventory is sellable between the contract loading and the cut-off, and every pickup posting lands inside that window — which is what makes reconciliation arithmetic rather than archaeology.',
    footnote:
      'Transitions read as event, or event [guard]. Re-contracting and mid-event block increases are omitted. Illustrative lifecycle.',
    children: ({ width, height }) => (
      <StateMachine
        width={width}
        height={height}
        note="* → Cancelled on operator cancel, from any state before cut-off."
        rows={[
          {
            states: [
              { id: 'start', col: 0, shape: 'start' },
              { id: 'draft', col: 1, name: 'Draft', sublabel: 'no inventory' },
              { id: 'contracted', col: 2, name: 'Contracted', sublabel: 'rates + attrition' },
              { id: 'open', col: 3, name: 'Open', sublabel: 'sellable', kind: 'focal' },
            ],
          },
          {
            states: [
              { id: 'cutoff', col: 0, name: 'Cut-off', sublabel: 'release window' },
              { id: 'reconciled', col: 1, name: 'Reconciled', sublabel: 'actuals posted' },
              { id: 'closed', col: 2, name: 'Closed', sublabel: 'commission paid' },
              { id: 'end', col: 3, shape: 'end' },
            ],
          },
        ]}
        transitions={[
          { from: 'start', to: 'draft', label: 'created' },
          { from: 'draft', to: 'contracted', label: 'signed' },
          { from: 'contracted', to: 'open', label: 'inventory loaded' },
          { from: 'open', to: 'open', label: 'pickup posted' },
          /* The one label carrying a guard, and it sits on the row-gap corridor
             — the long open leg — because `event [guard]` is half again as wide
             as a bare event and a column gutter cannot hold it. */
          { from: 'open', to: 'cutoff', label: 'cut-off reached [rooms unsold]', tone: 'accent' },
          { from: 'cutoff', to: 'reconciled', label: 'actuals posted' },
          { from: 'reconciled', to: 'closed', label: 'invoiced' },
          { from: 'closed', to: 'end', label: 'archived' },
        ]}
      />
    ),
  },
}

/** Reservation status, where the accent is on the failure the operator pays for. */
export const ReservationStates: Story = {
  name: 'Reservation states',
  args: {
    eyebrow: 'Reservation States',
    pageNumber: 25,
    title: ['A held room is ', { accent: 'never a booked room.' }],
    lead: 'A hold is a fifteen-minute lease on inventory, not a reservation. It becomes one when payment captures; every other exit returns the room to the block, and the block is sellable again within the minute.',
    footnote:
      'Transitions read as event, or event [guard]. Waitlist promotion is a separate machine. Illustrative timings.',
    children: ({ width, height }) => (
      <StateMachine
        width={width}
        height={height}
        note="Expired and Cancelled both return inventory to the block within 60 seconds."
        rows={[
          {
            states: [
              { id: 'start', col: 0, shape: 'start' },
              { id: 'held', col: 1, name: 'Held', sublabel: '15-minute lease' },
              { id: 'confirmed', col: 2, name: 'Confirmed', sublabel: 'card captured' },
              { id: 'stayed', col: 3, name: 'Stayed', sublabel: 'checked in' },
            ],
          },
          {
            states: [
              { id: 'expired', col: 1, name: 'Expired', sublabel: 'room returned' },
              { id: 'cancelled', col: 2, name: 'Cancelled', sublabel: 'refund queued', kind: 'focal' },
              { id: 'end', col: 3, shape: 'end' },
            ],
          },
        ]}
        transitions={[
          { from: 'start', to: 'held', label: 'requested' },
          { from: 'held', to: 'confirmed', label: 'payment captured' },
          /* Guard on a vertical drop, where the label sits beside the line in
             the row gap and has the whole empty column to spread into. */
          { from: 'held', to: 'expired', label: '15 min [no capture]' },
          { from: 'confirmed', to: 'confirmed', label: 'date change' },
          { from: 'confirmed', to: 'stayed', label: 'checked in' },
          { from: 'confirmed', to: 'cancelled', label: 'guest cancels', tone: 'accent' },
          { from: 'stayed', to: 'end', label: 'folio closed' },
          { from: 'cancelled', to: 'end', label: 'refunded' },
        ]}
      />
    ),
  },
}
