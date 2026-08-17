import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Gantt, role } from '../../diagrams/Gantt'

/** DIAGRAMS / Gantt — tasks with a start and an end, grouped into phases. */
const meta = {
  title: 'Diagrams/Gantt',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Gantt

A plan on a shared time axis. Reach for it when the reader needs to see
**overlap** — what runs in parallel, where the plan is thickest, and which task
everything else is waiting on. A dated list cannot show that; bars on one axis
can.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### What the port enforces

- **One focal bar.** \`kind: 'focal'\` is the accent; every other bar is
  \`muted @ 0.15\`. Upstream's anti-pattern list has "equal visual weight for all
  bars" on it for good reason — if nothing is the critical path, the chart is a
  calendar.
- **No dependency arrows.** Upstream calls them a v1 anti-pattern and it holds:
  arrows between bars on a dense grid are unreadable, and the bar positions
  already carry the sequencing. This type emits no \`<path>\` at all.
- **No dates in the bar label.** The axis carries the dates. A bar labelled
  "Mar 4 – Mar 18" is a table cell that has been drawn to look like a chart.
- **≤ 12 tasks.** Past that, collapse to a phase-level view — the third story
  here is what that looks like.

### Layout is derived

The label column is a capped share of the width, the plot is what remains, and
the pitch is \`plotW / units\`. Row height comes out of the space actually
available divided by the rows actually present. One detail worth naming: row
height rounds **down** to the 4px grid rather than to the nearest step — a
30.3px fair share snapped up to 32 put seven rows twelve pixels past the well's
floor, which is a bug you only notice in the export.

### Two departures from upstream

1. **Task names live in the left column only.** Upstream also prints the name
   inside the bar; at real task-name lengths a two-week bar is 90px wide and the
   name is clipped. The column carries the name, and an optional short \`meta\`
   sits outside the bar's right edge.
2. **A milestone is a rotated square, not a path.** A diamond drawn as a
   \`<path>\` is four diagonal segments, which the geometry gate reads —
   correctly — as diagonal connectors.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The implementation plan a housing company signs up to.
 *
 *  The focal bar is inventory load, because it is the one task whose slippage
 *  moves every date to its right — and saying that in the lead while accenting a
 *  different bar is how a plan slide loses its argument. */
export const ImplementationPlan: Story = {
  name: 'Implementation plan',
  args: {
    eyebrow: 'Onboarding',
    pageNumber: 34,
    title: ['Live in eight weeks, and ', { accent: 'week three decides it.' }],
    lead: 'Everything after inventory load is configuration and rehearsal. If the block sheets arrive clean in week three the rest of the plan holds; if they do not, every date to the right of it moves.',
    footnote:
      'Illustrative plan for a single mid-size housing company. Assumes contracted inventory is available at kickoff.',
    children: ({ width, height }) => (
      <Gantt
        width={width}
        height={height}
        unitLabel="Week"
        units={['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']}
        marker={{ at: 3, label: 'Gate' }}
        phases={[
          {
            label: 'Discovery',
            tasks: [
              { name: 'Kickoff + access', start: 0, end: 1, meta: '1 wk' },
              { name: 'Contract review', start: 0, end: 2, meta: 'Housing lead' },
            ],
          },
          {
            label: 'Build',
            tasks: [
              { name: 'Inventory load', start: 2, end: 4, kind: 'focal', meta: 'Critical path' },
              { name: 'Rate + policy setup', start: 3, end: 5 },
              { name: 'Booking site theming', start: 3, end: 6, meta: 'Design' },
            ],
          },
          {
            label: 'Launch',
            tasks: [
              { name: 'Rehearsal booking', start: 5, end: 7 },
              { name: 'Public open', start: 7, end: 8, kind: 'milestone', meta: 'Go live' },
            ],
          },
        ]}
      />
    ),
  },
}

/** Peak-season readiness, where the point is that two tracks collide.
 *
 *  Same component, fewer rows, and a legend — which fits here because the row
 *  count leaves room for one. */
export const PeakSeasonReadiness: Story = {
  name: 'Peak-season readiness',
  args: {
    eyebrow: 'Operations Planning',
    pageNumber: 35,
    title: ['Two tracks, ', { accent: 'one collision in June.' }],
    lead: 'Support hiring and the pickup-forecasting rollout both land in June, which is also when the first tournaments open booking — so one of the two has to move a month.',
    footnote: 'Illustrative readiness plan. Months shown are calendar months, not fiscal periods.',
    children: ({ width, height }) => (
      <Gantt
        width={width}
        height={height}
        unitLabel="Month"
        units={['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']}
        marker={{ at: 3, label: 'Peak opens' }}
        phases={[
          {
            label: 'Capacity',
            tasks: [
              { name: 'Support hiring', start: 1, end: 4, meta: '3 hires' },
              { name: 'On-call rotation', start: 3, end: 5 },
            ],
          },
          {
            label: 'Platform',
            tasks: [
              { name: 'Pickup forecasting', start: 2, end: 4, kind: 'focal', meta: 'Contended' },
              { name: 'Load testing', start: 2, end: 3 },
              { name: 'Reconciliation batch', start: 4, end: 6 },
            ],
          },
        ]}
        legend={[
          { label: 'Contended work', kind: 'focal' },
          { label: 'Planned task', swatch: role.muted },
          { label: 'Season opens', line: 'accent', dashed: true },
        ]}
      />
    ),
  },
}

/** The phase-level view — what to draw instead of a 20-task chart.
 *
 *  Upstream caps a Gantt at twelve tasks and says to collapse past that. One bar
 *  per phase is the collapse, and it is a better executive slide than the
 *  detailed plan it summarises. */
export const PhaseLevelRoadmap: Story = {
  name: 'Phase-level roadmap',
  args: {
    eyebrow: 'Board Update',
    pageNumber: 12,
    title: 'Four phases, two of them already behind us',
    titleSize: 'h2',
    lead: 'Collapsed from the delivery plan: one bar per phase, so the shape of the year is readable without the forty tasks underneath it.',
    footnote:
      'Illustrative roadmap. Each bar summarises a phase plan held separately; quarter boundaries are calendar quarters.',
    children: ({ width, height }) => (
      <Gantt
        width={width}
        height={height}
        unitLabel="Quarter"
        units={['Q1', 'Q2', 'Q3', 'Q4']}
        marker={{ at: 2, label: 'Today' }}
        phases={[
          {
            tasks: [
              { name: 'Ledger migration', start: 0, end: 1, meta: 'Shipped' },
              { name: 'Booking site revamp', start: 0, end: 2, meta: 'Shipped' },
              { name: 'Pickup forecasting', start: 2, end: 3, kind: 'focal', meta: 'In flight' },
              { name: 'Partner API GA', start: 3, end: 4 },
            ],
          },
        ]}
        legend={[
          { label: 'In flight', kind: 'focal' },
          { label: 'Phase', swatch: role.muted },
        ]}
      />
    ),
  },
}
