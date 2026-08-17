import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { DataModel } from '../../diagrams/DataModel'

/** DIAGRAMS / Data Model — entities and cardinality, on a slide. */
const meta = {
  title: 'Diagrams/Data Model',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## ER / data model

Entities, their fields, and the cardinality between them. The type for a schema,
an API resource graph or a domain model: the reader's question is *what is stored
where, and how many of each*.

If the question is "what calls what", that is
[Architecture](/?path=/docs/diagrams-architecture--docs). If it is "what contains
what", that is [Nested](/?path=/docs/diagrams-nested--docs).

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Three decisions the port had to make

- **No mono, so keys are lettered.** Upstream prefixes a primary key with \`#\` and
  a foreign key with \`→\`, both in Geist Mono. The deck has no mono — and, harder,
  it loads only Poppins' latin subset, which has no \`U+2192\`. A \`→\` would fall
  back to the system face and put a second typeface on the slide. Keys are
  therefore marked **PK** and **FK** in the eyebrow register, and the FK marker
  takes \`role.link\`, the colour the library already uses for *this crosses to
  something else*.
- **Tag right, name left.** Upstream's header order is tag then name. Kept
  literally, a 4-character tag and a 6-character tag push their names to different
  x — and a column of entities with ragged names looks accidental. Names are flush
  left at a fixed inset; the tag is flush right in the header band.
- **Relationships are straightened by the component.** Upstream says "lay out so
  most relationships are straight lines, not tangles", which is normally the
  author's job and the first thing to rot. Here an edge with no explicit source
  field takes its source y *from its target*, clamped into the source box — so the
  line comes out straight whenever the two boxes overlap vertically at all, and
  falls back to a routed elbow only when they genuinely do not.

### Stepped runs are two elbows

A relationship that has to change y is drawn as two elbows meeting on the gutter's
vertical leg. That is the only routing which keeps both corners as quarter-arcs
*and* keeps the vertical leg off the target's own outline — a single elbow turns at
the target's edge and draws its descent down the box's border.

### Height is by content

Never padded to a common box. A three-field lookup does not pretend to be as
substantial as the aggregate root, which carries the accent.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Six entities, four columns, focal on the aggregate root.
 *
 *  Every foreign key in the model points at `block`, which is the slide's whole
 *  argument — so `block` is the only accent and it sits on the centre column. */
export const BlockModel: Story = {
  name: 'The block is the root',
  args: {
    eyebrow: 'Data Model',
    pageNumber: 28,
    title: ['Six tables, and ', { accent: 'the block is the root.' }],
    lead: 'Every rate, reservation and guest resolves through one block record — so cutoff, attrition and commission are properties of a row rather than a report someone assembles at month end.',
    footnote:
      'PK marks a primary key, FK a foreign key. Illustrative field names; audit and soft-delete columns omitted.',
    children: ({ width, height }) => (
      <DataModel
        width={width}
        height={height}
        entityWidth={208}
        columns={[
          [
            {
              id: 'event',
              name: 'Event',
              tag: 'entity',
              fields: [
                { name: 'event_id', type: 'uuid', key: 'pk' },
                { name: 'name', type: 'text' },
                { name: 'city', type: 'text' },
                { name: 'starts_on', type: 'date' },
              ],
            },
            {
              id: 'hotel',
              name: 'Property',
              tag: 'entity',
              fields: [
                { name: 'hotel_id', type: 'uuid', key: 'pk' },
                { name: 'name', type: 'text' },
                { name: 'distance_mi', type: 'numeric' },
              ],
            },
          ],
          [
            {
              id: 'block',
              name: 'Block',
              tag: 'root',
              kind: 'focal',
              fields: [
                { name: 'block_id', type: 'uuid', key: 'pk' },
                { name: 'event_id', type: 'uuid', key: 'fk' },
                { name: 'hotel_id', type: 'uuid', key: 'fk' },
                { name: 'cutoff_on', type: 'date' },
                { name: 'rooms_held', type: 'int' },
                { name: 'status', type: 'enum' },
              ],
            },
          ],
          [
            {
              id: 'rate',
              name: 'Rate',
              tag: 'lookup',
              kind: 'store',
              fields: [
                { name: 'rate_id', type: 'uuid', key: 'pk' },
                { name: 'block_id', type: 'uuid', key: 'fk' },
                { name: 'stay_date', type: 'date' },
                { name: 'amount', type: 'money' },
              ],
            },
            {
              id: 'reservation',
              name: 'Reservation',
              tag: 'entity',
              fields: [
                { name: 'reservation_id', type: 'uuid', key: 'pk' },
                { name: 'block_id', type: 'uuid', key: 'fk' },
                { name: 'guest_id', type: 'uuid', key: 'fk' },
                { name: 'nights', type: 'int' },
                { name: 'status', type: 'enum' },
              ],
            },
          ],
          [
            {
              id: 'guest',
              name: 'Guest',
              tag: 'entity',
              fields: [
                { name: 'guest_id', type: 'uuid', key: 'pk' },
                { name: 'name', type: 'text' },
                { name: 'email', type: 'text' },
                { name: 'team', type: 'text' },
              ],
            },
          ],
        ]}
        relationships={[
          { from: 'event', to: 'block', toField: 'event_id', fromCard: '1', toCard: 'N', label: 'has' },
          { from: 'hotel', to: 'block', toField: 'hotel_id', fromCard: '1', toCard: 'N', label: 'hosts' },
          { from: 'block', to: 'rate', toField: 'block_id', fromCard: '1', toCard: 'N', label: 'rates' },
          {
            from: 'block',
            to: 'reservation',
            toField: 'block_id',
            fromCard: '1',
            toCard: 'N',
            label: 'holds',
          },
          {
            from: 'reservation',
            to: 'guest',
            toField: 'guest_id',
            fromCard: 'N',
            toCard: '1',
            label: 'booked',
          },
        ]}
        legend={[
          { label: 'Aggregate root', kind: 'focal' },
          { label: 'Entity', kind: 'step' },
          { label: 'Lookup', kind: 'store' },
        ]}
      />
    ),
  },
}

/** A four-entity chain, including one relationship inside a column.
 *
 *  `commission → invoice` is the vertical case: cardinality goes left of the run
 *  and the relationship label right of it, because three masks on one side of a
 *  40px row gap cannot all fit. */
export const CommissionChain: Story = {
  name: 'What commission is computed from',
  args: {
    eyebrow: 'Revenue Model',
    pageNumber: 29,
    title: ['Commission is ', { accent: 'a row, not a spreadsheet.' }],
    lead: 'Every commissionable dollar traces to one room night, and every invoice line traces back to it. Nothing in the chain is derived at report time — which is why restating a night restates the invoice.',
    footnote:
      'PK marks a primary key, FK a foreign key. Illustrative field names; tax and adjustment lines omitted.',
    children: ({ width, height }) => (
      <DataModel
        width={width}
        height={height}
        columns={[
          [
            {
              id: 'res',
              name: 'Reservation',
              tag: 'entity',
              fields: [
                { name: 'reservation_id', type: 'uuid', key: 'pk' },
                { name: 'block_id', type: 'uuid', key: 'fk' },
                { name: 'checkin_on', type: 'date' },
                { name: 'nights', type: 'int' },
              ],
            },
          ],
          [
            {
              id: 'night',
              name: 'Room Night',
              tag: 'root',
              kind: 'focal',
              fields: [
                { name: 'night_id', type: 'uuid', key: 'pk' },
                { name: 'reservation_id', type: 'uuid', key: 'fk' },
                { name: 'stay_date', type: 'date' },
                { name: 'rate_amount', type: 'money' },
                { name: 'commissionable', type: 'bool' },
              ],
            },
          ],
          [
            {
              id: 'comm',
              name: 'Commission',
              tag: 'ledger',
              kind: 'store',
              fields: [
                { name: 'commission_id', type: 'uuid', key: 'pk' },
                { name: 'night_id', type: 'uuid', key: 'fk' },
                { name: 'pct', type: 'numeric' },
                { name: 'amount', type: 'money' },
              ],
            },
            {
              id: 'inv',
              name: 'Invoice',
              tag: 'entity',
              fields: [
                { name: 'invoice_id', type: 'uuid', key: 'pk' },
                { name: 'event_id', type: 'uuid', key: 'fk' },
                { name: 'period', type: 'text' },
                { name: 'total', type: 'money' },
              ],
            },
          ],
        ]}
        relationships={[
          {
            from: 'res',
            to: 'night',
            toField: 'reservation_id',
            fromCard: '1',
            toCard: 'N',
            label: 'spans',
          },
          {
            from: 'night',
            to: 'comm',
            toField: 'night_id',
            fromCard: '1',
            toCard: '0..1',
            label: 'earns',
            tone: 'accent',
          },
          { from: 'comm', to: 'inv', fromCard: 'N', toCard: '1', label: 'billed' },
        ]}
        legend={[
          { label: 'Aggregate root', kind: 'focal' },
          { label: 'Entity', kind: 'step' },
          { label: 'Ledger', kind: 'store' },
        ]}
      />
    ),
  },
}
