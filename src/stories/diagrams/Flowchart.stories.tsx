import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Flowchart } from '../../diagrams/Flowchart'

/** DIAGRAMS / Flowchart — decision logic, on a slide. */
const meta = {
  title: 'Diagrams/Flowchart',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Flowchart

Decision logic, top to bottom — the diagram to reach for when the question is
"what happens if".

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Shape carries type, not colour

- **Oval** — start or end
- **Rectangle** — a step
- **Diamond** — a decision, three exits at most

Fill is never a legend for node type. That frees the accent for the one thing it
should say: either the happy path, **or** the single most consequential decision.
Never both, and never every decision.

### Every branch is labelled

An unlabelled fork is the one flowchart mistake that costs the reader the whole
diagram. \`label\` is optional on the API and mandatory in practice on anything
leaving a diamond.

### Two departures from upstream

**The happy path runs down the spine, exceptions to the sides.** Upstream's
convention is "Yes right, No below". On a 16:9 slide the vertical budget is the
scarce one, so the sequential path takes the centre column and every branch exits
sideways.

**No merge dot.** Upstream rejoins branches on a small filled dot. A dot has no
edge to fan attach points along, so two arrowheads land on one point — upstream's
own rule 4. Branches here rejoin at the node that consumes them, whose top edge
fans cleanly for N inbound connectors.

### Layout is derived

Rows with a fixed \`height\` keep it; the rest share what is left, so the stack
always fills the well and adding a row re-flows the chart instead of pushing it
off the slide. Node widths are capped **below** their cell width on purpose —
that is what buys the gap a branch label needs.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The path a single room request takes.
 *
 *  Accent on the happy path and its outcome — one claim, one colour. Both
 *  exceptions are steps in the side columns, which is what keeps the spine
 *  readable as "the way it normally goes". */
export const BookingRequest: Story = {
  name: 'Booking request path',
  args: {
    eyebrow: 'Booking Flow',
    pageNumber: 20,
    title: ['A request lands in the block, or ', { accent: 'never enters it.' }],
    lead: 'Every room request resolves in one pass. Inventory is checked against the live block, the hold is a timed lease, and payment either confirms the room or returns it — no request sits in between.',
    footnote:
      'Oval = entry or outcome, diamond = decision, rectangle = step. Rate rules, tax treatment and multi-room splits are omitted. Illustrative flow.',
    children: ({ width, height }) => (
      <Flowchart
        width={width}
        height={height}
        columns={3}
        rows={[
          {
            height: 52,
            nodes: [{ id: 'request', col: 1, shape: 'terminal', kind: 'input', label: 'Team submits request' }],
          },
          {
            nodes: [
              { id: 'stock', col: 1, shape: 'decision', label: 'Rooms left in block?', sublabel: 'live inventory' },
              { id: 'wait', col: 0, label: 'Waitlist queue', sublabel: 'notified on release' },
            ],
          },
          {
            nodes: [
              { id: 'card', col: 1, shape: 'decision', label: 'Card authorised?', sublabel: '15-minute hold' },
              { id: 'release', col: 2, label: 'Hold released', sublabel: 'room back in block' },
            ],
          },
          {
            height: 60,
            nodes: [
              { id: 'done', col: 1, shape: 'terminal', kind: 'focal', label: 'Reservation confirmed' },
            ],
          },
        ]}
        edges={[
          { from: 'request', to: 'stock' },
          { from: 'stock', to: 'card', label: 'yes', tone: 'accent' },
          { from: 'stock', to: 'wait', label: 'no · sold out' },
          { from: 'card', to: 'done', label: 'yes', tone: 'accent' },
          { from: 'card', to: 'release', label: 'declined' },
        ]}
      />
    ),
  },
}

/** Cut-off, as the logic the platform actually runs.
 *
 *  Here the accent is spent on the DECISION rather than a path, because the whole
 *  point of the slide is that one threshold decides both outcomes. */
export const CutOffHandling: Story = {
  name: 'Cut-off handling',
  args: {
    eyebrow: 'Cut-off Handling',
    pageNumber: 21,
    title: ['At cut-off, ', { accent: 'pickup decides' }, ' what happens to the block.'],
    lead: 'Twenty-one days out the platform reads pickup against the contracted block, then either releases the unsold rooms or asks the hotel for a seven-day extension. Attrition is recalculated on either path.',
    footnote:
      'The threshold is per contract; 80% is the default on a signed block. Both branches rejoin at the same step, which is why the liability figure is never a fork. Illustrative.',
    children: ({ width, height }) => (
      <Flowchart
        width={width}
        height={height}
        columns={3}
        rows={[
          {
            height: 52,
            nodes: [
              { id: 'start', col: 1, shape: 'terminal', kind: 'input', label: 'Cut-off minus 21 days' },
            ],
          },
          {
            nodes: [
              {
                id: 'pickup',
                col: 1,
                shape: 'decision',
                kind: 'focal',
                label: 'Pickup at 80%?',
                sublabel: 'contracted vs picked up',
              },
            ],
          },
          {
            nodes: [
              { id: 'release', col: 0, label: 'Release unsold rooms', sublabel: 'returned to the hotel' },
              { id: 'extend', col: 2, label: 'Request extension', sublabel: 'seven more days' },
            ],
          },
          {
            height: 72,
            nodes: [
              { id: 'recalc', col: 1, label: 'Attrition recalculated', sublabel: 'liability re-forecast' },
            ],
          },
        ]}
        edges={[
          { from: 'start', to: 'pickup' },
          { from: 'pickup', to: 'release', label: 'under 80%' },
          { from: 'pickup', to: 'extend', label: 'at or over' },
          { from: 'release', to: 'recalc' },
          { from: 'extend', to: 'recalc' },
        ]}
      />
    ),
  },
}
