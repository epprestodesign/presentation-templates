import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { CurrentState, role } from '../../diagrams/CurrentState'

/** DIAGRAMS / Current State — the landscape a customer runs before the platform. */
const meta = {
  title: 'Diagrams/Current State',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Current State

The **before** picture in a modernisation pitch: the tools a housing company
actually runs today, the phase each one sits in, and the file that gets emailed
between them.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), where the type is described as showing "the gap that a platform
proposal is going to close", and reskinned onto EventPipe tokens.

### Why this is a sales slide, not an engineering one

Its job is recognition. A prospect looking at their own week — the shared drive
nobody versions, the rooming list that arrives as an attachment, the analyst
whose laptop is the integration layer — has already made the argument for the
platform before the next slide loads. Three things carry that, and none of them
appear on an architecture diagram:

- **The hand-off format is on every edge.** \`CSV\`, \`EMAIL\`, \`RE-KEY\`. An
  unlabelled arrow reads as an integration; an arrow labelled EMAIL reads as a
  person doing it by hand on a Tuesday afternoon.
- **Pain flags**, drawn as a \`role.negative\` dot and explained in the legend.
  Deliberately separate from \`focal\`: focal is the one or two headline
  bottlenecks, a flag is "this hurts but it is not the headline". Upstream
  reaches for a rust-red custom hex here; the deck already has \`negative\`, so no
  new colour enters the system.
- **Cross-cutting footer bars** for layer-wide concerns — the shared mailbox, the
  spreadsheet template everyone copies from. Nothing connects to a footer bar,
  because a connector from a layer-wide service to one component is a category
  error.

### Routing: a corridor, not an elbow

Cross-zone edges leave the source's right edge, drop through a vertical in the
**zone gutter**, and enter the destination's **left** edge travelling right. That
last part is upstream's marker-visibility rule: with \`refX=7\` an arrowhead
entering a top edge while travelling upward has its whole body inside the box,
where the node's own paper mask hides it and a single pixel of tip pokes out.
Entering a side edge head-on keeps all seven pixels outside. The corridor also
guarantees no stroke crosses a component that is not its endpoint.

Labels sit at the **start** of the connector rather than its midpoint, in the
gutter just past the source zone's border, because the label names the format
leaving *that* system. A component's second outgoing edge flips its label below
the segment —
two masks stacked above two fan points twenty pixels apart would put the lower
mask on the upper stroke.

That in turn decides where the corridor vertical goes, and the obvious answer is
wrong. Every component in a zone shares one right edge, so every outgoing label
starts at the same x — and a label wide enough to reach the **middle** of the
gutter lands on whichever connector has its vertical there. The first render of
*Before EventPipe* punched a white gap through the teal vertical carrying
\`mailbox → front desks\` with the \`EMAIL\` mask two rows above it, and the
geometry gate missed it because it only tests masks against near-horizontal
strokes. So the near half of the gutter is reserved for labels and every vertical
is pushed past them: the collision becomes impossible rather than unlikely,
including a label against its own vertical. The gutter therefore needs about the
widest label plus 24px, which is why \`zoneGap\` defaults to 64.

### Density caps

≤ 2 focal components, ≤ 5 per zone, ≤ 2 labelled edges out of one side of one
component. Past the last of those there is nowhere left to put a label, which is
the cap rather than a bug.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The spreadsheet-and-email landscape, which is what most housing companies
 *  are actually running when they first talk to us.
 *
 *  Two focal components — the shared drive and the rooming-list mailbox —
 *  because they are the two places where the process has no system of record and
 *  the whole pitch is that both collapse into one. */
export const BeforeEventPipe: Story = {
  name: 'Before EventPipe',
  args: {
    eyebrow: 'Where Housing Runs Today',
    pageNumber: 8,
    title: ['Eleven tools, and ', { accent: 'the record lives in two of them.' }],
    lead: 'Contracts, rates and pickup are all real data in this landscape — they are just held in a folder and a mailbox, which is why no two reports of the same event ever agree.',
    footnote:
      'Composite of onboarding discovery across mid-size housing companies. Tool names are illustrative.',
    children: ({ width, height }) => (
      <CurrentState
        width={width}
        height={height}
        zones={[
          {
            label: 'Contracting',
            components: [
              { id: 'hotel-email', name: 'Hotel Negotiation', sublabel: 'Email threads', tag: 'inbox', kind: 'input' },
              { id: 'contracts', name: 'Signed Contracts', sublabel: 'PDF, per hotel', tag: 'doc', kind: 'store', pain: true },
              { id: 'rate-sheet', name: 'Rate Workbook', sublabel: 'One tab per event', tag: 'xlsx', kind: 'store' },
            ],
          },
          {
            label: 'The Record',
            components: [
              { id: 'drive', name: 'Shared Drive', sublabel: 'No version history', tag: 'smb', kind: 'focal' },
              { id: 'analyst', name: 'Analyst Laptop', sublabel: 'Pivot tables, macros', tag: 'local', pain: true },
              { id: 'mailbox', name: 'Rooming Mailbox', sublabel: 'Lists as attachments', tag: 'inbox', kind: 'focal' },
            ],
          },
          {
            label: 'Downstream',
            components: [
              { id: 'hotels', name: 'Hotel Front Desks', sublabel: 'Re-keyed by hand', tag: 'ext', kind: 'external', pain: true },
              { id: 'organiser', name: 'Event Organiser', sublabel: 'Weekly pickup deck', tag: 'ext', kind: 'external' },
              { id: 'finance', name: 'Commission Invoice', sublabel: 'Built after the event', tag: 'fin', kind: 'store' },
            ],
          },
        ]}
        edges={[
          { from: 'hotel-email', to: 'drive', label: 'save as', tone: 'link' },
          { from: 'contracts', to: 'drive', label: 'pdf', tone: 'link' },
          { from: 'rate-sheet', to: 'analyst', label: 'copy', tone: 'link', dashed: true },
          { from: 'drive', to: 'analyst', label: 'open' },
          { from: 'analyst', to: 'mailbox', label: 'export' },
          { from: 'mailbox', to: 'hotels', label: 're-key', tone: 'accent' },
          { from: 'analyst', to: 'organiser', label: 'email' },
          { from: 'mailbox', to: 'finance', label: 'invoice', dashed: true },
        ]}
        legend={[
          { label: 'No system of record', kind: 'focal' },
          { label: 'Pain point', swatch: role.negative },
          { label: 'Outside the company', kind: 'external' },
          { label: 'File hand-off', line: 'link' },
          { label: 'Manual step', line: 'accent' },
        ]}
      />
    ),
  },
}

/** The narrower cut: just the rooming-list hand-off, with the two cross-cutting
 *  concerns that make it worse.
 *
 *  Fewer components on purpose. The wide landscape earns recognition; this one
 *  earns a decision, and a decision slide can only hold one mechanism. */
export const RoomingListHandoff: Story = {
  name: 'Rooming-list hand-off',
  args: {
    eyebrow: 'Where The Errors Come From',
    pageNumber: 9,
    title: ['One list, ', { accent: 'four re-types.' }],
    lead: 'Between the team manager filling in a form and a guest checking in, the same twelve names are typed out four times by three different people — and every retype is a chance to lose a night.',
    footnote:
      'Illustrative hand-off for one team block. Cross-cutting rows are shared across every event the company runs.',
    children: ({ width, height }) => (
      <CurrentState
        width={width}
        height={height}
        zoneGap={56}
        zones={[
          {
            label: 'Collection',
            components: [
              { id: 'form', name: 'Team Form', sublabel: 'Google Form', tag: 'web', kind: 'input' },
              { id: 'replies', name: 'Late Replies', sublabel: 'Text + phone', tag: 'adhoc', kind: 'input', pain: true },
            ],
          },
          {
            label: 'Assembly',
            components: [
              { id: 'master', name: 'Master Workbook', sublabel: 'Emailed between three people', tag: 'xlsx', kind: 'focal' },
              { id: 'checker', name: 'Manual Check', sublabel: 'Eyeball for duplicates', tag: 'human', pain: true },
            ],
          },
          {
            label: 'Delivery',
            components: [
              { id: 'pms', name: 'Hotel PMS', sublabel: 'Typed from a PDF', tag: 'ext', kind: 'external', pain: true },
              { id: 'desk', name: 'Front Desk', sublabel: 'Prints the list again', tag: 'ext', kind: 'external' },
            ],
          },
        ]}
        edges={[
          { from: 'form', to: 'master', label: 'csv', tone: 'link' },
          { from: 'replies', to: 'master', label: 're-key', tone: 'accent' },
          { from: 'master', to: 'checker', label: 'review' },
          { from: 'checker', to: 'pms', label: 'pdf', tone: 'accent' },
          { from: 'pms', to: 'desk', label: 'print', dashed: true },
        ]}
        footers={[
          { name: 'Shared Housing Mailbox', sublabel: 'Every version of every list · no thread ownership' },
          { name: 'Workbook Template', sublabel: 'Copied per event · drifts within a week' },
        ]}
        legend={[
          { label: 'No system of record', kind: 'focal' },
          { label: 'Pain point', swatch: role.negative },
          { label: 'Manual step', line: 'accent' },
          { label: 'File hand-off', line: 'link' },
        ]}
      />
    ),
  },
}
