import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Swimlane } from '../../diagrams/Swimlane'

/** DIAGRAMS / Swimlane — a process with its owners, on a slide. */
const meta = {
  title: 'Diagrams/Swimlane',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Swimlane

A process with the owner of every step made visible — cross-functional flows,
vendor handoffs, escalation paths.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### The handoffs carry the argument

A swimlane exists because someone asked "who does this". The accent therefore
belongs on the lane crossing that costs the most coupling or the most waiting —
not on a step, and not on every crossing.

### Routing: exit right, enter top or bottom

One convention, which is what keeps a cross-lane diagram readable: every handoff
has the same silhouette and the corridor is always the target's own column.

- Same lane, later column → a straight horizontal line.
- Different lane → out of the right face, along the source's lane, then into the
  target's horizontal face.
- Backwards (rework, escalation) → the same shape mirrored out of the left face,
  and dashed, because a solid line running right-to-left reads as a mistake.

A backwards edge must change lane. Within one lane the return leg would run at
the target's own centre line and travel through it — and upstream's answer to
that is not a clever route, it is to reorder the steps.

### Layout is derived

Lane bands split the well's height; step columns split what is left after the
label column. A step is placed by \`(lane, col)\` and never given a coordinate.
Empty cells render nothing — a lane with one step is a finding, not a hole to
fill.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The rooming-list handoff, which is the only step that leaves the platform. */
export const RoomingListHandoff: Story = {
  name: 'Rooming-list handoff',
  args: {
    eyebrow: 'Rooming List',
    pageNumber: 26,
    title: ['Four owners, ', { accent: 'one handoff' }, ' that leaves the platform.'],
    lead: 'Names move from the team to the operator to the platform without ever leaving the record. The only export is the list the hotel loads — and its confirmations come straight back to the team.',
    footnote:
      'The accent marks the crossing that introduces the coupling: every step after it depends on a hotel system responding. Traveller counts are illustrative.',
    children: ({ width, height }) => (
      <Swimlane
        width={width}
        height={height}
        columns={5}
        lanes={[
          { key: 'team', name: 'Team\nmanager' },
          { key: 'ops', name: 'Housing\noperator' },
          { key: 'epx', name: 'EventPipe' },
          { key: 'htl', name: 'Hotel' },
        ]}
        nodes={[
          { id: 'roster', lane: 'team', col: 0, name: 'Roster submitted', sublabel: '38 travellers', kind: 'input' },
          { id: 'review', lane: 'ops', col: 1, name: 'Names reviewed', sublabel: 'duplicates merged' },
          { id: 'build', lane: 'epx', col: 2, name: 'Rooming list built', sublabel: 'block · rates · names' },
          { id: 'load', lane: 'htl', col: 3, name: 'Loaded to PMS', sublabel: 'per-room confirmations', kind: 'focal' },
          { id: 'notify', lane: 'team', col: 4, name: 'Confirmations sent', sublabel: 'one email per room', kind: 'input' },
        ]}
        edges={[
          { from: 'roster', to: 'review', label: 'names' },
          { from: 'review', to: 'build' },
          { from: 'build', to: 'load', label: 'export', tone: 'accent' },
          { from: 'load', to: 'notify', label: 'confirmed' },
        ]}
        legend={[
          { label: 'Handoff out', kind: 'focal' },
          { label: 'Platform step', kind: 'step' },
          { label: 'People', kind: 'input' },
          { label: 'Leaves platform', line: 'accent' },
        ]}
      />
    ),
  },
}

/** The escalation path, with the return leg that decides who absorbs the cost. */
export const EscalationPath: Story = {
  name: 'Escalation path',
  args: {
    eyebrow: 'Escalation Path',
    pageNumber: 27,
    title: ['A walked guest is a ', { accent: 'fifteen-minute' }, ' problem.'],
    lead: 'When a hotel cannot honour a reserved room the ticket crosses three lanes before anyone calls the guest. The dashed leg is the one that matters: it decides whether the block absorbs the cost or the hotel does.',
    footnote:
      'Dashed = the return leg when the hotel declines the walk. SLA figures and timestamps are illustrative.',
    children: ({ width, height }) => (
      <Swimlane
        width={width}
        height={height}
        columns={5}
        lanes={[
          { key: 'guest', name: 'Guest' },
          { key: 'sup', name: 'Support' },
          { key: 'ops', name: 'Housing\noperator' },
          { key: 'htl', name: 'Hotel' },
        ]}
        nodes={[
          { id: 'report', lane: 'guest', col: 0, name: 'No room at desk', sublabel: '22:40 local', kind: 'input' },
          { id: 'triage', lane: 'sup', col: 1, name: 'Ticket triaged', sublabel: '15-minute SLA' },
          { id: 'check', lane: 'ops', col: 2, name: 'Block re-checked', sublabel: 'same-night inventory' },
          { id: 'walk', lane: 'htl', col: 3, name: 'Walk authorised', sublabel: 'comparable hotel', kind: 'focal' },
          { id: 'rehouse', lane: 'sup', col: 4, name: 'Guest re-housed', sublabel: 'transport booked' },
        ]}
        edges={[
          { from: 'report', to: 'triage', label: 'reported' },
          { from: 'triage', to: 'check', label: 'escalated' },
          { from: 'check', to: 'walk', label: 'authorise', tone: 'accent' },
          { from: 'walk', to: 'rehouse', label: 'walk issued' },
          { from: 'rehouse', to: 'check', label: 'if declined', dashed: true },
        ]}
        legend={[
          { label: 'Decision point', kind: 'focal' },
          { label: 'Step', kind: 'step' },
          { label: 'Guest-facing', kind: 'input' },
          { label: 'Escalation', line: 'accent' },
          { label: 'Return leg', line: 'default', dashed: true },
        ]}
      />
    ),
  },
}
