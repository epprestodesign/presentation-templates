import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Sequence } from '../../diagrams/Sequence'

/** DIAGRAMS / Sequence — actors, messages and time, on a slide. */
const meta = {
  title: 'Diagrams/Sequence',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Sequence

Who calls whom, in what order — the diagram for a request's path, a protocol
exchange, or an incident reconstruction.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Message kinds

| Kind | Stroke | Meaning |
|---|---|---|
| \`call\` | solid muted | a request that expects a reply |
| \`external\` | solid orient | a hop across a system boundary |
| \`return\` | **dashed** | the reply to the call above it — never solid |
| \`async\` | dashed, palest head | fire-and-forget: queued, not awaited |
| \`success\` | solid accent | the one headline message |

Time flows down and only down. An arrow pointing up reverses time and is the one
unforgivable error in this type.

### Combined fragments

A branch is a framed \`alt\` / \`opt\` / \`loop\` region, never a free-floating
cluster of if/else arrows. One fragment per diagram, two \`alt\` regions at most,
and the accent stays on a single headline message — not on both branches.

### Two departures from upstream

**Async uses a soft dashed head, not a hollow one.** Upstream signals
fire-and-forget with an open arrowhead. \`ArrowMarkers\` defines four filled
heads and nothing else, so async here is dashed plus the palest head available.

**The operator tab and guards are Poppins, tracked.** Upstream requires mono for
\`ALT\` and \`[guard]\`; the deck has no mono face, so the technical register comes
from size, weight and tracking.

### Time is derived

The author lists messages; the component assigns each a slot and divides the
well's remaining height between them. A fragment buys extra slots for its tab,
guard and divider — so adding an \`alt\` pushes everything below it down instead
of landing on top of a message.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** A booking, from the attendee's click to the hotel's queue.
 *
 *  The accent is on the single write. Everything above it is a read against the
 *  same block, which is the argument the slide is making. */
export const BookingRequest: Story = {
  name: 'Booking request',
  args: {
    eyebrow: 'Booking Flow',
    pageNumber: 22,
    title: ['A confirmed room is ', { accent: 'one write' }, ' to the record.'],
    lead: 'Search, quote and hold are all reads against the same block. Only the confirmation writes — which is why a reservation cannot exist on the booking site and be missing from the record.',
    footnote:
      'Dashed = the reply to the call above it. The palest arrow is fire-and-forget: the rooming list is queued for the hotel, not awaited. Illustrative sequence.',
    children: ({ width, height }) => (
      <Sequence
        width={width}
        height={height}
        actors={[
          { id: 'attendee', name: 'Attendee', sublabel: 'Browser', kind: 'input' },
          { id: 'site', name: 'Presto Site', sublabel: 'Booking surface' },
          { id: 'api', name: 'Booking API', sublabel: 'Holds + writes' },
          { id: 'record', name: 'System of Record', sublabel: 'Blocks · rates', kind: 'focal' },
          { id: 'pms', name: 'Hotel PMS', sublabel: 'Property system', kind: 'external' },
        ]}
        messages={[
          { from: 'attendee', to: 'site', label: 'pick dates' },
          { from: 'site', to: 'api', label: 'availability', kind: 'external' },
          { from: 'api', to: 'record', label: 'read block' },
          { from: 'record', to: 'api', label: '12 left', kind: 'return' },
          { from: 'attendee', to: 'site', label: 'pay + book' },
          { from: 'site', to: 'api', label: 'reserve', kind: 'external' },
          { from: 'api', to: 'record', label: 'write room', kind: 'success' },
          { from: 'api', to: 'site', label: 'confirmed', kind: 'return' },
          { from: 'api', to: 'pms', label: 'rooming list', kind: 'async' },
        ]}
        activations={[
          { actor: 'site', from: 0, to: 7 },
          { actor: 'api', from: 1, to: 8 },
          { actor: 'record', from: 2, to: 3 },
          { actor: 'record', from: 6, to: 6 },
        ]}
      />
    ),
  },
}

/** Cut-off, with the branch drawn as a branch.
 *
 *  One `alt` frame, two regions, and the accent on the write that both regions
 *  end at — not on either branch. */
export const CutOffBranch: Story = {
  name: 'Cut-off branch',
  args: {
    eyebrow: 'Cut-off Handling',
    pageNumber: 23,
    title: ['Cut-off runs itself, ', { accent: 'both ways.' }],
    lead: 'The nightly job reads pickup, then takes one of two paths with the hotel — extend the block or release the unsold rooms. Either way the actuals are written before an operator sees a number.',
    footnote:
      'ALT frames the branch: exactly one region runs. Dashed = the reply to the call above it. Thresholds and percentages are illustrative.',
    children: ({ width, height }) => (
      <Sequence
        width={width}
        height={height}
        actors={[
          { id: 'job', name: 'Cut-off Job', sublabel: 'Nightly, 02:00', kind: 'input' },
          { id: 'api', name: 'Booking API', sublabel: 'Block service' },
          { id: 'record', name: 'System of Record', sublabel: 'Pickup · actuals', kind: 'focal' },
          { id: 'pms', name: 'Hotel PMS', sublabel: 'Property system', kind: 'external' },
        ]}
        messages={[
          { from: 'job', to: 'api', label: 'run cut-off' },
          { from: 'api', to: 'record', label: 'read pickup' },
          { from: 'record', to: 'api', label: '82%', kind: 'return' },
          { from: 'api', to: 'pms', label: 'extend 7 days', kind: 'external' },
          { from: 'api', to: 'pms', label: 'release unsold', kind: 'external' },
          { from: 'pms', to: 'api', label: 'accepted', kind: 'return' },
          { from: 'api', to: 'record', label: 'write actuals', kind: 'success' },
        ]}
        fragments={[
          {
            operator: 'alt',
            from: 3,
            to: 5,
            guard: 'pickup at 80% or over',
            elseAt: 4,
            elseGuard: 'pickup under 80%',
          },
        ]}
        activations={[
          { actor: 'api', from: 0, to: 6 },
          { actor: 'record', from: 1, to: 2 },
        ]}
      />
    ),
  },
}
