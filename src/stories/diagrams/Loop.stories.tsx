import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Loop } from '../../diagrams/Loop'

/** DIAGRAMS / Loop — a ring of work writing back to one shared centre. */
const meta = {
  title: 'Diagrams/Loop',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Loop / flywheel

Work advances clockwise around a ring while every pass writes durable state back
to one shared centre — the diagram to reach for when the reader has to see both
motions at once.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### The dashed spokes are the whole type

Take away the write-backs and this is a circular process, which upstream calls
Cycle. Take away the return from the last station to the first and it is a
flowchart bent into a circle, which is worse. The hub is **accumulated state** —
memory, a standard, a record — never a further step, which is why it is the single
inverted box and the only dark element on the page.

### Two documented exceptions to the orthogonal-connector rule

Both are upstream's, and both are load-bearing:

1. **The ring is one curve.** Every segment is an SVG arc on the same ellipse with
   the same sweep, so the visible gaps read as pieces of one ring. Mixing in an
   orthogonal elbow turns the ring into a rounded rectangle.
2. **The spokes are true radii.** A write-back runs straight from a station's inner
   edge toward the hub; routed orthogonally it would cross its neighbours and stop
   reading as inward. They are drawn as \`<line>\` elements — the correct element
   for a straight segment, and it keeps the exception visible in the SVG instead of
   hiding a slanted \`L\` inside a path.

### The ring is an ellipse, not a circle

Upstream's canonical geometry is a circle in a 1040×680 canvas. The deck's diagram
well is roughly 1155×380 — three to one — and a circle inscribed in that uses a
third of the width, pushes the stations into the hub and leaves the radius too
short for a legible spoke. So the ring takes the well's aspect, capped at 2.6:1 so
it stays a ring. Every other invariant holds: equal angular spacing from −90°,
five to eight stations, exactly one hub, at most one focal station.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The commercial flywheel: the argument for why this compounds.
 *
 *  Three of six spokes are labelled, not all six — upstream is explicit that a
 *  curated subset beats crowding the hub halo, and the three chosen are the ones
 *  that actually add to the record rather than read from it. */
export const RateDataFlywheel: Story = {
  name: 'Rate data flywheel',
  args: {
    eyebrow: 'Why It Compounds',
    pageNumber: 32,
    title: ['Every event we run makes ', { accent: 'the next contract easier to win.' }],
    lead: 'The rate history is the asset, not the software. Each event adds comparables to one shared record, which sharpens the benchmark, which prices the next bid — and the loop tightens with every pass.',
    footnote:
      'Illustrative. Dashed spokes are write-backs to the shared record, not process steps; the hub is accumulated state, not a seventh station.',
    children: ({ width, height }) => (
      <Loop
        width={width}
        height={height}
        hub={{ name: 'Rate record', sublabel: 'One market history' }}
        stations={[
          { name: 'Win the event', sublabel: 'Bid with comparables', spokeLabel: 'Terms' },
          { name: 'Contract blocks', sublabel: 'Hotels priced, signed' },
          { name: 'Attendees book', sublabel: 'Rooms picked up', spokeLabel: 'Pickup' },
          { name: 'Reconcile', sublabel: 'Actuals + commission' },
          {
            name: 'Benchmark',
            sublabel: 'Rates by market',
            focal: true,
            spokeLabel: 'Comparables',
          },
          { name: 'Next bid', sublabel: 'Priced from history' },
        ]}
      />
    ),
  },
}

/** The same type at the operating scale, with the legend that names the two
 *  motions.
 *
 *  Five stations rather than six, and a narrower hub, because a five-station ring
 *  puts two stations closer to the centre line — the hub has to give ground rather
 *  than the ring stretching to accommodate it. */
export const OperatingCadence: Story = {
  name: 'Operating cadence',
  args: {
    eyebrow: 'Operating Cadence',
    pageNumber: 33,
    title: ['One record, five moves a week, ', { accent: 'and the forecast stops drifting.' }],
    lead: 'A housing desk runs the same five moves on every event. Each pass writes its result back to the block record, which is why the pickup forecast on Friday agrees with the invoice at the end of the month.',
    footnote:
      'Illustrative cadence for a mid-size housing team. The hub is accumulated state, not a sixth step.',
    children: ({ width, height }) => (
      <Loop
        width={width}
        height={height}
        hubW={176}
        hub={{ name: 'Block record', sublabel: 'Pickup + rates' }}
        stations={[
          { name: 'Publish block', sublabel: 'Rates go live', spokeLabel: 'Rates' },
          { name: 'Watch pickup', sublabel: 'Daily against target' },
          { name: 'Adjust', sublabel: 'Shift rooms, extend', focal: true, spokeLabel: 'Changes' },
          { name: 'Reconcile', sublabel: 'Actuals vs contract' },
          { name: 'Report', sublabel: 'Operator + hotel' },
        ]}
        legend={[
          { label: 'Operating flow', line: 'default' },
          { label: 'Write-back', line: 'soft', dashed: true },
        ]}
      />
    ),
  },
}
