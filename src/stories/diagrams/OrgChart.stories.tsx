import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { OrgChart } from '../../diagrams/OrgChart'

/** DIAGRAMS / Org Chart — responsibility, on a slide. */
const meta = {
  title: 'Diagrams/Org Chart',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Org chart / responsibility map

Who owns what, and how to hand it to them. Reach for this instead of
[Tree](/?path=/docs/diagrams-tree--docs) whenever the nodes are people, teams,
queues or accountable owners: a tree shows generic hierarchy, an org chart shows
**responsibility, invocation paths and coverage gaps**.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Every node answers three questions

1. **Name** — the role or team.
2. **Invoke** — the channel, queue or handle that reaches it.
3. **Scope** — 2–4 terse ownership words. Never a sentence.

### Geometry is borrowed, not copied

\`layoutTree\` and \`treeRouting\` are imported from \`Tree.tsx\`, so subtree
measurement, row pitch and the parent-drop → bus → child-drop routing are
literally the same code. An org chart that re-implemented them would drift, and
the two types would stop looking like one library after the first fix landed in
only one of them.

### Gaps are drawn, not hidden

An owner that is not yet staffed or not yet wired up gets \`kind: 'optional'\` —
dashed, faint, still in position. Upstream is emphatic about this and it is right:
a missing route is operationally the most important thing on the chart, and
deleting the box makes the chart lie.

### Escalation is a strip, not a node

Escalation and approval rules are rules *about* the chart. Adding "if unresolved
in 30 minutes" as a box would imply someone reports to it, so it sits in a strip
beneath the drawing instead.

### Budget

Max 12 nodes, max 4 tiers, max 5 direct reports under one parent, **one** accent
node — the front door, whoever receives work that has not been triaged yet.

> All names are invented role titles. This library never renders a real person.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Ten nodes, three tiers, one unstaffed route.
 *
 *  The dashed box is the point of the slide: the chart is being shown *because*
 *  one route has no owner, and hiding it would have made the chart look finished. */
export const HousingDesk: Story = {
  name: 'How a housing desk is organised',
  args: {
    eyebrow: 'Team Operating Model',
    pageNumber: 24,
    title: ['One front door, ', { accent: 'then it belongs to someone.' }],
    lead: 'Everything ambiguous arrives at the housing desk and leaves with a named owner. The three pods are the only routes work can take — and the dashed box is the one route we have not staffed.',
    footnote:
      'Roles rather than people; channel names are illustrative. Pickup audit is currently absorbed by hotel relations.',
    children: ({ width, height }) => (
      <OrgChart
        width={width}
        height={height}
        root={{
          id: 'desk',
          name: 'Housing Desk',
          invoke: '#housing-desk',
          scope: 'Anything untriaged',
          kind: 'focal',
          children: [
            {
              id: 'ops',
              name: 'Event Ops',
              invoke: '#event-ops',
              scope: 'Blocks and cutoffs',
              children: [
                {
                  id: 'builder',
                  name: 'Block Builder',
                  invoke: 'BLK queue',
                  scope: 'Rates, room types',
                  kind: 'store',
                },
                {
                  id: 'rooming',
                  name: 'Rooming Lists',
                  invoke: 'RL queue',
                  scope: 'Roster uploads',
                  kind: 'store',
                },
              ],
            },
            {
              id: 'res',
              name: 'Reservations',
              invoke: '#reservations',
              scope: 'Guest-facing changes',
              children: [
                {
                  id: 'attendee',
                  name: 'Attendee Desk',
                  invoke: 'support inbox',
                  scope: 'Individual bookings',
                  kind: 'store',
                },
                {
                  id: 'teamsup',
                  name: 'Team Desk',
                  invoke: '#team-help',
                  scope: 'Roster bookings',
                  kind: 'store',
                },
              ],
            },
            {
              id: 'hotels',
              name: 'Hotel Relations',
              invoke: '#hotel-rel',
              scope: 'Contracts and pickup',
              children: [
                {
                  id: 'contract',
                  name: 'Contracting',
                  invoke: 'CON queue',
                  scope: 'Signed rates',
                  kind: 'store',
                },
                {
                  id: 'audit',
                  name: 'Pickup Audit',
                  invoke: 'no owner yet',
                  scope: 'Commission checks',
                  kind: 'optional',
                },
              ],
            },
          ],
        }}
        escalation={{
          label: 'Escalation',
          text: 'Unowned after 30 minutes, or anything touching a contracted rate, goes to the housing lead and then the account director.',
        }}
        legend={[
          { label: 'Front door', kind: 'focal' },
          { label: 'Pod', kind: 'step' },
          { label: 'Named owner', kind: 'store' },
          { label: 'Not yet staffed', kind: 'optional' },
        ]}
      />
    ),
  },
}

/** The same component read as a routing map, with an approval gate in it.
 *
 *  The gate uses `boundary` rather than `store`, because it is not a place work
 *  goes to be done — it is a condition work has to pass. Same tier, different
 *  meaning, and the legend says so. */
export const SupportRouting: Story = {
  name: 'Support escalation routing',
  args: {
    eyebrow: 'Support Model',
    pageNumber: 25,
    title: ['Every ticket has an owner ', { accent: 'within one hop.' }],
    lead: 'Tier 1 takes everything and routes on the first signal — booking, payment or property. Only refunds above the desk limit need a second signature, and that is a gate to pass rather than a manager to wait for.',
    footnote: 'Illustrative routing. Out-of-hours cover is handled by the on-call rota, not shown.',
    children: ({ width, height }) => (
      <OrgChart
        width={width}
        height={height}
        root={{
          id: 't1',
          name: 'Tier 1 Support',
          invoke: '#support',
          scope: 'Every inbound ticket',
          kind: 'focal',
          children: [
            {
              id: 'booking',
              name: 'Booking Issues',
              invoke: 'BKG queue',
              scope: 'Holds and changes',
              children: [
                {
                  id: 'reslead',
                  name: 'Reservations Lead',
                  invoke: '#reservations',
                  scope: 'Guest changes',
                  kind: 'store',
                },
                {
                  id: 'blockowner',
                  name: 'Block Owner',
                  invoke: 'BLK queue',
                  scope: 'Inventory calls',
                  kind: 'store',
                },
              ],
            },
            {
              id: 'pay',
              name: 'Payment Issues',
              invoke: 'PAY queue',
              scope: 'Charges and refunds',
              children: [
                {
                  id: 'billing',
                  name: 'Billing Lead',
                  invoke: '#billing',
                  scope: 'Invoices, payouts',
                  kind: 'store',
                },
                {
                  id: 'gate',
                  name: 'Finance Gate',
                  invoke: 'two signatures',
                  scope: 'Refunds over limit',
                  kind: 'boundary',
                },
              ],
            },
            {
              id: 'hotel',
              name: 'Property Issues',
              invoke: '#hotel-rel',
              scope: 'Walks and no-shows',
              children: [
                {
                  id: 'relations',
                  name: 'Hotel Relations',
                  invoke: 'HOT queue',
                  scope: 'Property contact',
                  kind: 'store',
                },
              ],
            },
          ],
        }}
        escalation={{
          label: 'Approval',
          text: 'Refunds over the desk limit, and any rate change after cutoff, clear the finance gate before the reply goes out.',
        }}
        legend={[
          { label: 'Front door', kind: 'focal' },
          { label: 'Queue', kind: 'step' },
          { label: 'Named owner', kind: 'store' },
          { label: 'Approval gate', kind: 'boundary' },
        ]}
      />
    ),
  },
}
