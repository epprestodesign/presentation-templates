import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { HighLevel } from '../../diagrams/HighLevel'

/** DIAGRAMS / High Level — the end-to-end stack, with the phases named across the top. */
const meta = {
  title: 'Diagrams/High Level',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## High Level

A chevron banner names the phases, a dashed zone on the left holds what is outside
the system, a solid boundary holds what is inside it, and every component sits in
the column of the phase it belongs to. Reach for
[Architecture](/docs/diagrams-architecture--docs) when the phases do not matter;
reach for [Platform Integration](/docs/diagrams-platform-integration--docs) when
the question is which surfaces exist and over what wire. Reach for this one when
the subject is that the stack has an **order** and the reader should be able to
name each stage.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens.

### The banner is a legend, enforced by geometry

Upstream's first reproducibility check and its first anti-pattern are the same rule
from two sides: a node's centre must equal its chevron's centre. A node placed
anywhere else breaks the contract that makes the banner readable as a key rather
than decoration — so \`nodeCx\` is not a parameter. It is looked up from the
chevron, and there is no way to override it.

### Vertical chevrons pair 1:1 with a cross-spanning component

\`Orchestration\`, \`Security\`, \`Observability\`, \`Governance\` and \`Backup\`
are reserved names: they render rotated in the right-hand strip rather than in the
banner, because they are not phases of the flow — they are things true of *every*
phase, and putting one in the banner would claim the stack stops being secure after
the Storage column. Each one labels a bar (inside the cluster) or a cross-cutting
row (below it). The strip is reserved only when a vertical exists, and when it is,
every horizontal dimension shrinks to make room.

### Four departures from upstream

1. **No icons.** Upstream hangs a tool glyph in every box. The deck has no icon set
   at diagram scale and a stack of invented glyphs would be worse than none, so the
   technical register is the type scale instead — a rectangular tag for the role, a
   letter-spaced sublabel for the detail.
2. **No per-component colour overrides.** Upstream allows two components to carry a
   semantic hex — rust for security, slate for observability. Every colour here
   comes from a role, and the deck has no value that reads as *security* without
   also reading as *bad* (\`negative\` is a coral red). The vertical chevron already
   names the concern, which is what the colour was for.
3. **Focal-touching edges are not auto-promoted to accent.** Upstream promotes every
   edge that touches the focal node. That is right when the focal has two edges and
   wrong when it is a hub: a four-edge focal produces four accent lines, and this
   deck's rule is one or two accent elements in the whole drawing. The author names
   the accent path, and it is usually the main line rather than every branch off it.
4. **Source fans share one trunk.** Kept from upstream deliberately, even though it
   means two verticals can overlap where their spans coincide. Three wires into one
   node via three separate corridors reads as three unrelated routes; one trunk with
   three horizontal legs off it reads as what it is — a bus. Attach points are still
   fanned, which is the rule that actually matters.

### Rules kept

- **Bar drops never elbow.** A straight dashed vertical from the bar's bottom edge
  to the target's top, at the target's own centre, and never labelled: an
  orchestration trigger is not part of the data path.
- **Rows are top-aligned across columns**, so row 0 is the main line of flow in
  every column and a two-node column hangs its second node off the same rail as its
  neighbour's. Centring each column independently reads as five unrelated stacks.
- **The dashed border is the signal.** A source zone with a solid border is an
  anti-pattern, because the border is the only thing saying these components are
  outside the system.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The full parametric pattern: five phases, a vertical strip, an orchestration
 *  bar and one cross-cutting row.
 *
 *  One focal node — the ledger — because everything to its left exists to fill it
 *  and everything to its right is derived from it. Two accent edges name the main
 *  line through it; the branch to the read replica stays muted. */
export const BookingToPickup: Story = {
  name: 'Booking to pickup',
  args: {
    eyebrow: 'Data Platform',
    pageNumber: 26,
    title: ['From booking event to ', { accent: 'pickup report.' }],
    lead: 'Three inbound systems, one ledger, and a nightly model that produces the number an operator actually reads. The scheduler triggers each stage; identity gates all of them.',
    footnote:
      'Illustrative component names. Retries, dead-letter handling and replica lag are omitted.',
    children: ({ width, height }) => (
      <HighLevel
        width={width}
        height={height}
        clusterLabel="EventPipe cloud"
        sourceZoneLabel="Outside the platform"
        chevrons={[
          { name: 'Data sources' },
          { name: 'Ingestion' },
          { name: 'Storage' },
          { name: 'Modelling' },
          { name: 'Reporting' },
          { name: 'Orchestration' },
          { name: 'Security' },
        ]}
        sources={[
          { name: 'Registration', sublabel: 'Team rosters' },
          { name: 'Ticketing', sublabel: 'Orders and scans' },
          { name: 'Hotel CRS', sublabel: 'Inventory and folios' },
        ]}
        components={[
          {
            name: 'Ingest Gateway',
            chevron: 'Ingestion',
            tag: 'coll',
            sublabel: 'Validate and dedupe',
          },
          {
            name: 'Block Ledger',
            chevron: 'Storage',
            tag: 'store',
            sublabel: 'System of record',
            focal: true,
          },
          {
            name: 'Read Replica',
            chevron: 'Storage',
            tag: 'virt',
            sublabel: 'Queries, never writes',
            nodeKind: 'store',
          },
          {
            name: 'Pickup Models',
            chevron: 'Modelling',
            tag: 'anlz',
            sublabel: 'Nightly aggregates',
          },
          {
            name: 'Pickup Report',
            chevron: 'Reporting',
            tag: 'dash',
            sublabel: 'What operators read',
          },
          {
            name: 'Operator Console',
            chevron: 'Reporting',
            tag: 'app',
            sublabel: 'Live block view',
          },
          {
            name: 'Scheduler',
            chevron: 'Orchestration',
            kind: 'bar',
            sublabel: 'Nightly triggers · backfill · retries',
          },
          {
            name: 'Identity and Audit',
            chevron: 'Security',
            kind: 'crosscut',
            sublabel: 'SSO · scoped keys · every write attributed',
          },
        ]}
        edges={[
          { from: 'Registration', to: 'Ingest Gateway' },
          { from: 'Ticketing', to: 'Ingest Gateway' },
          { from: 'Hotel CRS', to: 'Ingest Gateway' },
          { from: 'Ingest Gateway', to: 'Block Ledger', label: 'Write', tone: 'accent' },
          { from: 'Block Ledger', to: 'Pickup Models', label: 'Model', tone: 'accent' },
          { from: 'Block Ledger', to: 'Read Replica', tone: 'soft', dashed: true },
          { from: 'Pickup Models', to: 'Pickup Report', label: 'Publish' },
          { from: 'Read Replica', to: 'Operator Console', label: 'Live read' },
          { from: 'Scheduler', to: 'Ingest Gateway' },
          { from: 'Scheduler', to: 'Pickup Models' },
        ]}
        legend={[
          { label: 'Focal', kind: 'focal' },
          { label: 'Cluster service', kind: 'step' },
          { label: 'External source', kind: 'input' },
          { label: 'Main path', line: 'accent' },
          { label: 'Trigger or replica', line: 'soft', dashed: true },
        ]}
      />
    ),
  },
}

/** The horizontal-only variant: four phases, no strip, no bar, no cross-cutting row.
 *
 *  Same component, and the branch upstream's checklist cares about — the right-hand
 *  strip exists if and only if a vertical chevron is declared, and when it does not
 *  the banner and both containers take the width back. The well is shortened to
 *  match the shallower content rather than letting the cluster float. */
export const ReconciliationStack: Story = {
  name: 'Reconciliation stack',
  args: {
    eyebrow: 'Reconciliation',
    pageNumber: 27,
    title: ['Where the pickup number ', { accent: 'actually comes from.' }],
    lead: 'Booking events are deduped into stays, matched against the hotel folio, and rolled up per block per night. Every figure in the report traces back through those three steps.',
    footnote: 'Illustrative job names. Dispute handling and manual adjustments are omitted.',
    /* Four phases with no strip and no cross-cutting row carry less than five with
       both, so the well is shortened rather than letting the cluster stretch. */
    wellBottom: 616,
    children: ({ width, height }) => (
      <HighLevel
        width={width}
        height={height}
        clusterLabel="Nightly batch"
        sourceZoneLabel="What arrives"
        chevrons={[
          { name: 'Booking events' },
          { name: 'Reconciliation' },
          { name: 'Aggregation' },
          { name: 'Operator view' },
        ]}
        sources={[
          { name: 'Bookings', sublabel: 'Every hold and change' },
          { name: 'Cancellations', sublabel: 'Including no-shows' },
          { name: 'Hotel folios', sublabel: 'What was actually charged' },
        ]}
        components={[
          {
            name: 'Dedupe',
            chevron: 'Reconciliation',
            tag: 'job',
            sublabel: 'One stay per reservation',
          },
          {
            name: 'Folio Match',
            chevron: 'Reconciliation',
            tag: 'job',
            sublabel: 'Booked against charged',
          },
          {
            name: 'Pickup Rollup',
            chevron: 'Aggregation',
            tag: 'agg',
            sublabel: 'Block, night, source',
            focal: true,
          },
          {
            name: 'Pickup Report',
            chevron: 'Operator view',
            tag: 'dash',
            sublabel: 'What operators read',
          },
          {
            name: 'Variance Alerts',
            chevron: 'Operator view',
            tag: 'alert',
            sublabel: 'When actuals drift',
          },
        ]}
        edges={[
          { from: 'Bookings', to: 'Dedupe' },
          { from: 'Cancellations', to: 'Dedupe' },
          { from: 'Hotel folios', to: 'Folio Match' },
          { from: 'Dedupe', to: 'Pickup Rollup', label: 'Stays', tone: 'accent' },
          { from: 'Folio Match', to: 'Pickup Rollup', label: 'Actuals' },
          { from: 'Pickup Rollup', to: 'Pickup Report', label: 'Publish', tone: 'accent' },
          { from: 'Pickup Rollup', to: 'Variance Alerts', label: 'Deltas' },
        ]}
        legend={[
          { label: 'Focal', kind: 'focal' },
          { label: 'Batch job', kind: 'step' },
          { label: 'Inbound event', kind: 'input' },
          { label: 'Main path', line: 'accent' },
        ]}
      />
    ),
  },
}
