import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { AccessMatrix } from '../../diagrams/AccessMatrix'

/** DIAGRAMS / Access Matrix — who can read or write what, per role. */
const meta = {
  title: 'Diagrams/Access Matrix',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Access Matrix

Rows are resources, columns are roles, every intersection is a permission. The
diagram to reach for in a security review when the question is *who can do what*
— as opposed to *who can talk to what*, which is
[Platform Integration](/docs/diagrams-platform-integration--docs).

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill's \`dp-security-matrix\` type (MIT), reskinned onto EventPipe tokens.

### A matrix has no connectors

Upstream is explicit about it and it is worth restating, because drawing one is
tempting: the information is entirely in the cell contents and their fills, and
an arrow pointing into a cell is a different diagram type. This is the one ported
type with no arrowheads and no arrow labels at all.

### One deliberate departure: the levels are the deck's own semantics

Upstream's closed set is \`full | rw | read | none\`, styled with ink at four
opacities. That is a matrix in one colour, where the reader has to consult the
legend to learn that a slightly darker grey means write access. EventPipe already
has \`positive\` / \`warning\` / \`negative\`, so:

| Level | Role | Reads as |
|---|---|---|
| \`full\`, \`write\` | \`role.positive\` at two strengths | allowed — same answer, different scope |
| \`read\` | \`ink @ 0.03\` | allowed but inert |
| \`conditional\` | \`role.warning\` | allowed *if* — scoped, masked, time-boxed |
| \`none\` | \`role.negative\` | refused |

The grid becomes scannable before the legend is read, which is the whole point of
putting a permissions table on a slide instead of in a spreadsheet.

### One focal cell

\`focal: true\` on exactly one intersection, and it carries a second line. It is
not decoration — it is the one access rule that distinguishes this posture from a
generic table, and it is what the slide's headline should be about.

### Layout is derived

Column widths come from the well's width, the row stride from its height, so a
4 × 6 matrix and a 5 × 8 both fill the well. Divided dimensions *floor* to the
4px grid rather than rounding — rounding four columns outward by 2px each pushed
the right-hand banner past the artboard.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The security-review slide. Six resources, four roles, one rule under review.
 *
 *  The focal cell is the whole argument: a hotel never holds guest PII until the
 *  rooming list is released, which is the control the reviewer is here to check. */
export const PlatformRoles: Story = {
  name: 'Platform roles',
  args: {
    eyebrow: 'Security Review',
    pageNumber: 28,
    title: ['A hotel sees a rooming list. ', { accent: 'Never a database.' }],
    lead: 'Every role that touches a block, mapped against the six resources worth arguing about. Amber means access exists but is scoped — masked, own-property-only, or released on a date.',
    footnote:
      'Illustrative — reflects the intended model, not a completed assessment. Service accounts and support break-glass are on a separate matrix.',
    children: ({ width, height }) => (
      <AccessMatrix
        width={width}
        height={height}
        cornerLabel={['Resource', 'vs. platform role']}
        roles={[
          { name: 'Housing Operator', code: 'ops · operator' },
          { name: 'Event Organiser', code: 'ops · organiser' },
          { name: 'Hotel Partner', code: 'partner · hotel' },
          { name: 'Team Manager', code: 'guest · team' },
        ]}
        resources={[
          { name: 'Room blocks', hint: 'inventory' },
          { name: 'Negotiated rates', hint: 'contracted' },
          { name: 'Reservations', hint: 'guest records' },
          { name: 'Guest PII', hint: 'name · email · card' },
          { name: 'Commission & payouts', hint: 'finance' },
          { name: 'Audit log', hint: 'immutable' },
        ]}
        cells={[
          { row: 0, col: 0, value: 'Full control', level: 'full' },
          { row: 0, col: 1, value: 'Read + write', level: 'write' },
          { row: 0, col: 2, value: 'Own property', level: 'conditional' },
          { row: 0, col: 3, value: 'Read only', level: 'read' },

          { row: 1, col: 0, value: 'Full control', level: 'full' },
          { row: 1, col: 1, value: 'Read only', level: 'read' },
          { row: 1, col: 2, value: 'Own property', level: 'conditional' },
          { row: 1, col: 3, value: 'No access', level: 'none' },

          { row: 2, col: 0, value: 'Full control', level: 'full' },
          { row: 2, col: 1, value: 'Read + write', level: 'write' },
          { row: 2, col: 2, value: 'Own property', level: 'conditional' },
          { row: 2, col: 3, value: 'Own team', level: 'conditional' },

          { row: 3, col: 0, value: 'Read only', level: 'read' },
          { row: 3, col: 1, value: 'Masked', level: 'conditional' },
          { row: 3, col: 2, value: 'Rooming list only', sub: 'released at cut-off', focal: true },
          { row: 3, col: 3, value: 'Own team', level: 'read' },

          { row: 4, col: 0, value: 'Full control', level: 'full' },
          { row: 4, col: 1, value: 'Read only', level: 'read' },
          { row: 4, col: 2, value: 'No access', level: 'none' },
          { row: 4, col: 3, value: 'No access', level: 'none' },

          { row: 5, col: 0, value: 'Read only', level: 'read' },
          { row: 5, col: 1, value: 'Read only', level: 'read' },
          { row: 5, col: 2, value: 'No access', level: 'none' },
          { row: 5, col: 3, value: 'No access', level: 'none' },
        ]}
      />
    ),
  },
}

/** The same type at a different shape: three roles, four resources.
 *
 *  A narrower matrix for the integration conversation rather than the audit —
 *  which is the case for deriving the grid instead of fixing it. Nothing here is
 *  re-specified; the columns simply get wider. */
export const PartnerApiScopes: Story = {
  name: 'Partner API scopes',
  args: {
    eyebrow: 'Integration Partners',
    pageNumber: 29,
    title: ['Three scopes, ', { accent: 'and nothing else on the menu.' }],
    lead: 'What a partner token can reach, by tier. Ticketing partners get availability and can create reservations; a registration widget gets availability only.',
    footnote: 'Scopes are illustrative names for this template. Rate limits and IP allow-listing are separate controls.',
    children: ({ width, height }) => (
      <AccessMatrix
        width={width}
        height={height}
        cornerLabel={['Endpoint group', 'vs. token scope']}
        roles={[
          { name: 'Housing Partner', code: 'scope · housing' },
          { name: 'Ticketing Partner', code: 'scope · ticketing' },
          { name: 'Registration Widget', code: 'scope · public' },
        ]}
        resources={[
          { name: 'Availability & rates', hint: 'read path' },
          { name: 'Create reservation', hint: 'write path' },
          { name: 'Modify or cancel', hint: 'write path' },
          { name: 'Pickup report', hint: 'aggregate' },
        ]}
        cells={[
          { row: 0, col: 0, value: 'Read + write', level: 'write' },
          { row: 0, col: 1, value: 'Read only', level: 'read' },
          { row: 0, col: 2, value: 'Read only', level: 'read' },

          { row: 1, col: 0, value: 'Full control', level: 'full' },
          { row: 1, col: 1, value: 'Read + write', level: 'write' },
          { row: 1, col: 2, value: 'No access', level: 'none' },

          { row: 2, col: 0, value: 'Full control', level: 'full' },
          { row: 2, col: 1, value: 'Own bookings', level: 'conditional' },
          { row: 2, col: 2, value: 'No access', level: 'none' },

          { row: 3, col: 0, value: 'Read only', level: 'read' },
          { row: 3, col: 1, value: 'Own bookings only', sub: 'no block-level totals', focal: true },
          { row: 3, col: 2, value: 'No access', level: 'none' },
        ]}
      />
    ),
  },
}
