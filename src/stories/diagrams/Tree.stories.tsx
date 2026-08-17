import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Tree } from '../../diagrams/Tree'

/** DIAGRAMS / Tree — hierarchy, on a slide. */
const meta = {
  title: 'Diagrams/Tree',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Tree / hierarchy

Root at the top, children fanning out below. The type for taxonomy, dependency
and decision breakdowns — **what is a kind of what**, not what talks to what.

If the nodes are people, teams or accountable owners, reach for
[Org Chart](/?path=/docs/diagrams-org-chart--docs) instead: a tree shows
structure, an org chart shows responsibility. Org Chart imports this file's
layout, so the two are the same geometry with different node content.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### The layout measures itself

\`measure()\` returns a subtree's width as \`max(nodeWidth, Σ children + gaps)\`
and \`place()\` centres each parent over the block its children occupy. That
recursion is the whole reason this is a component and not an SVG: adding a leaf
widens its parent's subtree, which re-flows every sibling to its right and
re-centres every ancestor above it. **No story in this file contains a
coordinate.**

### Connectors are a bus, not N elbows

Upstream's tree spec is explicit — the parent drops one short vertical, a
horizontal bus spans the siblings, and each child takes a vertical drop into its
top edge. Drawn as one trunk, one arch with quarter-arcs at both corners, and one
straight drop per interior child. A path per child would redraw the shared trunk
N times, and two connectors on one stroke is a rule violation.

They are also **headless**: direction in a tree is carried by position, and an
arrowhead on a bus would have to land on one arm of the arch and not the other.

### Budget

Max depth 4, max breadth 5 per level, **one** focal node — root *or* a critical
leaf, never both. Branch labels sit in the row gap, which is the only place a
node box cannot cover their mask.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** A decision tree, focal on the outcome that costs someone work.
 *
 *  The accent is on `Overflow hotel` rather than the root, because the slide's
 *  claim is about the terminal states: three of the four resolve themselves and
 *  one does not. */
export const PlacementDecision: Story = {
  name: 'Where a booking lands',
  args: {
    eyebrow: 'Booking Logic',
    pageNumber: 22,
    /* One-line title, two-line lead. At h2 the first draft ran to two lines and
       pushed a three-line lead into the well, where the root node's top border
       struck through the last sentence — the geometry gate bounds against the
       artboard, not the heading block, so only the screenshot caught it. */
    title: ['Every request lands somewhere, ', { accent: 'including the misses.' }],
    lead: 'A team code routes into that team’s held rooms; anything without one draws on shared event inventory. The two states on the right are the ones that reach an operator — which is the point of drawing it.',
    footnote:
      'Simplified: rate eligibility, minimum-stay rules and manual overrides are omitted. Illustrative logic.',
    children: ({ width, height }) => (
      <Tree
        width={width}
        height={height}
        root={{
          id: 'req',
          name: 'Booking request',
          sublabel: 'Team or attendee',
          children: [
            {
              id: 'team',
              name: 'Team code given',
              sublabel: 'Roster booking',
              edgeLabel: 'has code',
              children: [
                { id: 'held', name: 'Team block', sublabel: 'Rooms still held' },
                {
                  id: 'overflow',
                  name: 'Overflow hotel',
                  sublabel: 'Operator confirms',
                  kind: 'focal',
                  edgeLabel: 'block full',
                },
              ],
            },
            {
              id: 'gen',
              name: 'No team code',
              sublabel: 'General attendee',
              edgeLabel: 'no code',
              children: [
                { id: 'event', name: 'Event block', sublabel: 'Shared inventory' },
                { id: 'wait', name: 'Waitlist', sublabel: 'Operator called', edgeLabel: 'sold out' },
              ],
            },
          ],
        }}
        legend={[
          { label: 'Needs an operator', kind: 'focal' },
          { label: 'Resolves itself', kind: 'step' },
        ]}
      />
    ),
  },
}

/** A taxonomy at full breadth — three branches, two leaves each.
 *
 *  Six leaves is the widest level, and node width is derived from the leaf count,
 *  so this story and the four-leaf one above share every other number. */
export const InventoryTaxonomy: Story = {
  name: 'How inventory is classified',
  args: {
    eyebrow: 'Inventory Model',
    pageNumber: 23,
    title: ['Three kinds of inventory, ', { accent: 'one set of rules.' }],
    lead: 'Contracted, courtesy and overflow rooms behave differently at cutoff — but all three are held, released and reported through the same block record, so an operator never reconciles across three systems.',
    footnote:
      'Illustrative taxonomy. Spot-rate rooms sit outside the contracted block and are reported separately.',
    children: ({ width, height }) => (
      <Tree
        width={width}
        height={height}
        root={{
          id: 'inv',
          name: 'Room inventory',
          sublabel: 'Everything a block can hold',
          children: [
            {
              id: 'contracted',
              name: 'Contracted',
              sublabel: 'Signed rate and cutoff',
              children: [
                { id: 'teamb', name: 'Team block', sublabel: 'Held per roster' },
                { id: 'attb', name: 'Attendee block', sublabel: 'Open to anyone' },
              ],
            },
            {
              id: 'courtesy',
              name: 'Courtesy',
              sublabel: 'No attrition risk',
              children: [
                { id: 'staff', name: 'Staff rooms', sublabel: 'Organiser held' },
                { id: 'vip', name: 'Named holds', sublabel: 'Unbooked, reserved' },
              ],
            },
            {
              id: 'overflow',
              name: 'Overflow',
              sublabel: 'Opened on demand',
              kind: 'focal',
              children: [
                { id: 'sister', name: 'Sister property', sublabel: 'Same contract' },
                { id: 'spot', name: 'Spot rate', sublabel: 'Booked at market' },
              ],
            },
          ],
        }}
        legend={[
          { label: 'Opened on demand', kind: 'focal' },
          { label: 'Standing inventory', kind: 'step' },
        ]}
      />
    ),
  },
}
