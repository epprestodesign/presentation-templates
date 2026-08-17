import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { PlatformIntegration } from '../../diagrams/PlatformIntegration'

/** DIAGRAMS / Platform Integration — what plugs in, what plugs out, over what wire. */
const meta = {
  title: 'Diagrams/Platform Integration',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Platform Integration

Sources on the left, consumers on the right, the platform as an explicit **zone**
in the middle, and every wire labelled with its protocol. Reach for
[Architecture](/docs/diagrams-architecture--docs) when the question is what talks
to what; reach for [Data Flow](/docs/diagrams-data-flow--docs) when it is how data
moves through stages. Reach for this one when the question is *"what surfaces does
this expose, and over what wire?"* — the question an integration team actually
asks.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens.

### This type deliberately exceeds the node budget

Every other type caps at nine nodes. A realistic integration picture is fourteen
to twenty, and upstream says so explicitly: **the complexity is the claim.** The
diagram is asserting how many distinct integration surfaces exist, so collapsing
"four sources" into one box marked *Sources* deletes the argument. If it genuinely
will not fit, the move is to split by plane — data, identity, observability — not
to collapse a column.

### Identity connects to the layer, never to a component

The most load-bearing rule in the type. An identity provider, a secrets store, an
audit sink authenticates *every* component, so wiring it to one tool understates
the trust scope and misrepresents the model. Footer services get one dashed line
to the zone's bottom **edge**, and \`footer\` entries take no target by
construction — the component cannot be asked to draw the wrong thing. They also
sit *outside* the zone, because that is where a thing that gates the layer lives.

### Two corridors, and every vertical leg is clamped into its own

Each wire is a three-segment H-V-H route whose vertical leg sits in a corridor —
\`[column, zone]\` on the way in, \`[zone, column]\` on the way out — and whose
protocol label sits on the long horizontal leg, which is open canvas because a
corridor holds nothing but connectors. Two things about the stagger are load-
bearing and neither is obvious:

- **The index is counted per corridor, not per wire.** Measuring the offset back
  from the target edge with a global index works for three wires and fails for
  six: the offset grows past the corridor's width and the vertical walks out the
  far side, into the zone or behind the source column.
- **The stagger is ordered by rise, longest first.** Verticals fan outward from
  the zone, so the outer end of the corridor is exactly where the labels have to
  sit. Assign in declaration order and whichever wire happens to be declared last
  ends up out there — and if it has a long vertical it sweeps down through every
  label in the corridor. Long verticals go tight against the zone; the label end
  is left to the short ones. A final pass walks any label still covering someone
  else's connector clear of it.

### Layout is derived

Column width, corridor width and the zone are all shares of the well; the zone's
rows and both side columns reserve the same 26px header band, so a source row and
a platform row share one optical top edge. That shared band is where the column
headers live. A frame around each side column is deliberately *not* drawn — the
zone border is the only container in the drawing, and a second one would make the
sources look like they were inside something too.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The partner-integration pitch: three platforms in, three surfaces out.
 *
 *  Two focal components, which is upstream's rule for this type — the API that
 *  everything writes through and the record it writes to. They are what separate
 *  a platform from a pile of tools, and naming both is the argument. */
export const PartnerIntegrations: Story = {
  name: 'Partner integrations',
  args: {
    eyebrow: 'Partner Integrations',
    pageNumber: 24,
    title: ['Plug into the booking API, ', { accent: 'not into a spreadsheet.' }],
    lead: 'Registration and ticketing platforms write availability, holds and bookings through one documented API — and pickup, commission and rooming lists are read back off the same record.',
    footnote:
      'Illustrative surface and protocol names. Rate limits, sandbox endpoints and the webhook retry schedule are omitted.',
    children: ({ width, height }) => (
      <PlatformIntegration
        width={width}
        height={height}
        zoneLabel="EventPipe platform"
        sourcesLabel="Source systems"
        consumersLabel="Consumers"
        sources={[
          { name: 'Registration', sublabel: 'Team rosters' },
          { name: 'Ticketing', sublabel: 'Orders and gate scans' },
          { name: 'Event CRM', sublabel: 'Contacts and segments' },
        ]}
        consumers={[
          { name: 'Pickup Reports', sublabel: 'Operator dashboards' },
          { name: 'Finance', sublabel: 'Invoices and commission' },
          { name: 'Partner Portal', sublabel: 'Read-only, scoped' },
        ]}
        rows={[
          {
            kind: 'bar',
            name: 'Booking API',
            sublabel: 'Availability · holds · book · cancel',
            focal: true,
          },
          {
            kind: 'row',
            nodes: [
              { name: 'Rate Engine', tag: 'svc', sublabel: 'Taxes and fees resolved' },
              { name: 'Block Ledger', tag: 'core', sublabel: 'Rooms · rates · pickup', focal: true },
              { name: 'Rooming Lists', tag: 'svc', sublabel: 'Per hotel, per night' },
            ],
          },
          { kind: 'bar', name: 'Reconciliation', sublabel: 'Nightly folio match' },
        ]}
        wires={[
          { from: 'Registration', to: 'Booking API', label: 'REST' },
          { from: 'Ticketing', to: 'Booking API', label: 'Webhook' },
          { from: 'Event CRM', to: 'Booking API', label: 'SFTP', dashed: true },
          { from: 'Booking API', to: 'Pickup Reports', label: 'JSON', tone: 'accent' },
          { from: 'Booking API', to: 'Finance', label: 'CSV' },
          { from: 'Booking API', to: 'Partner Portal', label: 'REST', tone: 'link' },
        ]}
        internal={[
          { from: 'Booking API', to: 'Block Ledger', tone: 'accent' },
          { from: 'Rate Engine', to: 'Block Ledger' },
          { from: 'Block Ledger', to: 'Rooming Lists' },
          { from: 'Reconciliation', to: 'Block Ledger', dashed: true },
        ]}
        footer={[
          {
            name: 'Identity and Audit',
            sublabel: 'SSO · scoped API keys · every write attributed',
            label: 'Auth',
          },
        ]}
        legend={[
          { label: 'Focal', kind: 'focal' },
          { label: 'Platform service', kind: 'step' },
          { label: 'Source system', kind: 'input' },
          { label: 'Consumer', kind: 'external' },
          { label: 'Serve path', line: 'accent' },
        ]}
      />
    ),
  },
}

/** The same platform at full surface count, and no footer band.
 *
 *  Four sources and four consumers rather than three, the identity plane split off
 *  into its own diagram per upstream's advice, and the well's whole height given
 *  back to the columns — which is what "layout is derived" is actually for. One
 *  focal here rather than two: the claim is about the write path, not the store. */
export const OperatorSurfaces: Story = {
  name: 'Operator surfaces',
  args: {
    eyebrow: 'Integration Surfaces',
    pageNumber: 25,
    title: ['Thirteen surfaces, ', { accent: 'one write path.' }],
    lead: 'Every system a housing company already runs either writes through the booking API or reads from it. Nothing touches the ledger directly, which is why any number in a report has one traceable source.',
    footnote:
      'Identity, secrets and the audit sink are a separate integration plane and are drawn on their own slide. Illustrative surface names.',
    children: ({ width, height }) => (
      <PlatformIntegration
        width={width}
        height={height}
        zoneLabel="EventPipe platform"
        sourcesLabel="What writes in"
        consumersLabel="What reads out"
        sources={[
          { name: 'Registration', sublabel: 'Team rosters' },
          { name: 'Ticketing', sublabel: 'Orders and gate scans' },
          { name: 'Spreadsheets', sublabel: 'Operator uploads' },
          { name: 'Hotel CRS', sublabel: 'Inventory and rates' },
        ]}
        consumers={[
          { name: 'Pickup Reports', sublabel: 'Operator dashboards' },
          { name: 'Finance', sublabel: 'Invoices and commission' },
          { name: 'Rooming Lists', sublabel: 'One file per hotel' },
          { name: 'Partner API', sublabel: 'Read-only, scoped' },
        ]}
        rows={[
          {
            kind: 'bar',
            name: 'Booking API',
            sublabel: 'The only way anything is written',
            focal: true,
          },
          {
            kind: 'row',
            nodes: [
              { name: 'Rate Engine', tag: 'svc', sublabel: 'Taxes and fees resolved' },
              { name: 'Block Ledger', tag: 'core', sublabel: 'Rooms · rates · pickup', nodeKind: 'store' },
              { name: 'Availability', tag: 'svc', sublabel: 'Live inventory per hotel' },
            ],
          },
          {
            kind: 'bar',
            name: 'Reconciliation',
            sublabel: 'Nightly folio match · commission',
          },
        ]}
        wires={[
          { from: 'Registration', to: 'Booking API', label: 'REST' },
          { from: 'Ticketing', to: 'Booking API', label: 'Webhook' },
          { from: 'Spreadsheets', to: 'Booking API', label: 'Upload' },
          { from: 'Hotel CRS', to: 'Booking API', label: 'Nightly', dashed: true },
          { from: 'Booking API', to: 'Pickup Reports', label: 'JSON', tone: 'accent' },
          { from: 'Booking API', to: 'Finance', label: 'CSV' },
          { from: 'Booking API', to: 'Rooming Lists', label: 'Email' },
          { from: 'Booking API', to: 'Partner API', label: 'REST', tone: 'link' },
        ]}
        internal={[
          { from: 'Booking API', to: 'Block Ledger', tone: 'accent' },
          { from: 'Rate Engine', to: 'Block Ledger' },
          { from: 'Block Ledger', to: 'Availability' },
          { from: 'Reconciliation', to: 'Block Ledger', dashed: true },
        ]}
        legend={[
          { label: 'Focal', kind: 'focal' },
          { label: 'Platform service', kind: 'step' },
          { label: 'Ledger', kind: 'store' },
          { label: 'Source system', kind: 'input' },
          { label: 'Batch or file', line: 'default', dashed: true },
        ]}
      />
    ),
  },
}
