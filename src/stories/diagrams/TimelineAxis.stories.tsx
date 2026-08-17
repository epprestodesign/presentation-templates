import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { TimelineAxis, role } from '../../diagrams/TimelineAxis'

/** DIAGRAMS / Timeline Axis — events positioned proportionally in time. */
const meta = {
  title: 'Diagrams/Timeline Axis',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Timeline Axis

An axis with **real spacing**: every event sits where its date falls on one linear
scale, so the gaps between events are the gaps between dates.

### Not a replacement for \`Templates/Narrative/Timeline\`

The deck already has a milestone rail, and it is still the right choice for most
slides. The two answer different questions:

| | Subject | Spacing |
|---|---|---|
| \`Templates/Narrative/Timeline\` | **Sequence** — what happens, in order | Even. Each milestone gets equal room, because equal room is equal emphasis. |
| \`Diagrams/Timeline Axis\` | **Interval** — how long between things | Proportional. A five-month gap is drawn five times a one-month gap. |

Reach for this one only when the unevenness is the point. A room block signed at
T-180 and a cut-off at T-5 are not two adjacent steps, and a rail that draws them
as adjacent steps is quietly telling the reader the wrong thing. When the
intervals are roughly even, the milestone rail will look better.

### Ported from diagram-design

From the [diagram-design](https://github.com/cathrynlavery/diagram-design) skill
(MIT), reskinned onto EventPipe tokens. Upstream's rule for this type is blunt:
*"if intervals are non-equal, space the circles non-equally — don't fake linear
spacing for aesthetics."* Its three anti-patterns are even spacing, a missing
unit, and crowded labels; all three are handled in the component rather than left
to the author:

- **Positions come from dates.** \`x = (date − t0) / (t1 − t0) × width\`. There
  is no way to place an event anywhere else.
- **Every dot carries its own timestamp**, formatted into the label's metadata
  line, and the tick step is chosen from the domain — five-minute ticks for an
  incident, month ticks for a release history — so the unit is never in question.
- **Labels are packed, not alternated and hoped for.** Each label takes the
  shallowest free slot in (side, lane) order, its measured box is reserved
  against later ones, and a second-lane label is refused unless its leader line
  can reach the axis without crossing a first-lane box. Two lanes a side.

### Span brackets

The one annotation that makes an uneven axis legible: a bracket with a masked
\`ArrowLabel\` measuring the distance between two dates. **86 DAYS** over a wide
gap next to **12 DAYS** over a narrow one says more about how a process actually
runs than either pair of dots does. Spans share one band, so they must not
overlap in time.

No \`<path>\` is emitted — the baseline, the ticks, the leaders and the brackets
are rules and measures, not connectors.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The room-block calendar, which is the canonical uneven interval.
 *
 *  Contract at T-180, then almost nothing for three months, then five dates
 *  crammed into the last fortnight and one after the event. Drawn evenly it
 *  looks like a steady eight-step process. Drawn honestly it shows where the
 *  work actually is — and that is the argument of the slide. */
export const RoomBlockCalendar: Story = {
  name: 'Room-block calendar',
  args: {
    eyebrow: 'How Housing Runs',
    pageNumber: 22,
    title: ['Three quiet months, then ', { accent: 'twelve days.' }],
    lead: 'Eight dates govern a room block, and five of them land inside the last fortnight before arrival — which is why a housing team that is comfortable in May is underwater in August.',
    footnote:
      'Illustrative calendar for a single summer tournament. Dates relative to event start; T-0 is first arrival.',
    children: ({ width, height }) => (
      <TimelineAxis
        width={width}
        height={height}
        start="2026-02-20"
        end="2026-09-14"
        axisLabel="2026 Season"
        events={[
          { date: '2026-03-02', name: 'Contract signed', sublabel: 'T-180', kind: 'milestone' },
          { date: '2026-04-14', name: 'Inventory loaded', sublabel: 'T-137' },
          { date: '2026-05-18', name: 'Booking opens', sublabel: 'T-103' },
          { date: '2026-08-12', name: 'Rooming list due', sublabel: 'T-17' },
          { date: '2026-08-24', name: 'Cut-off', sublabel: 'T-5', kind: 'milestone' },
          { date: '2026-08-29', name: 'First arrival', sublabel: 'T-0' },
          { date: '2026-09-08', name: 'Reconciliation', sublabel: 'T+10' },
        ]}
        spans={[
          { from: '2026-05-18', to: '2026-08-12', label: '86 days quiet' },
          { from: '2026-08-12', to: '2026-08-24', label: '12 days', tone: 'accent' },
        ]}
        legend={[
          { label: 'Contract milestone', swatch: role.accent },
          { label: 'Operational date', swatch: role.muted },
          { label: 'Measured interval', line: 'soft' },
        ]}
      />
    ),
  },
}

/** The same component with a two-hour domain instead of a seven-month one.
 *
 *  Nothing about the type changes: the tick step drops to fifteen minutes and
 *  the stamps become clock times because the domain says so, and the argument is
 *  still carried by one wide gap between two narrow ones. */
export const IncidentTimeline: Story = {
  name: 'Incident timeline',
  args: {
    eyebrow: 'Reliability Review',
    pageNumber: 41,
    title: ['Detected in six minutes, ', { accent: 'escalated in fifty-one.' }],
    lead: 'The alert fired fast and the rollback was fast. Everything between them was one on-call engineer deciding whether a spike in failed holds was worth waking somebody for.',
    footnote:
      'Illustrative reconstruction of a single availability incident. Times in UTC; alert-delivery latency excluded.',
    children: ({ width, height }) => (
      <TimelineAxis
        width={width}
        height={height}
        start="2026-06-11T08:55"
        end="2026-06-11T10:35"
        axisLabel="UTC"
        events={[
          { date: '2026-06-11T09:02', name: 'Rate-limit deploy', sublabel: 'Change 4188' },
          { date: '2026-06-11T09:08', name: 'Holds failing', sublabel: 'Alert fired', kind: 'milestone' },
          { date: '2026-06-11T09:59', name: 'Incident opened', sublabel: 'Sev-2' },
          { date: '2026-06-11T10:11', name: 'Rollback', sublabel: 'Change reverted' },
          { date: '2026-06-11T10:26', name: 'Holds recovered', sublabel: 'Error rate normal' },
        ]}
        spans={[{ from: '2026-06-11T09:08', to: '2026-06-11T09:59', label: '51 min silent', tone: 'accent' }]}
      />
    ),
  },
}

/** A three-year platform history, where the domain forces month ticks and the
 *  interesting fact is the cluster — four releases inside one quarter after two
 *  years of one a year. */
export const PlatformHistory: Story = {
  name: 'Platform history',
  args: {
    eyebrow: 'Where The Platform Came From',
    pageNumber: 6,
    title: ['Two years of foundations, then ', { accent: 'a quarter of compounding.' }],
    lead: 'Everything shipped in the last quarter depends on the reconciliation ledger landing in 2025 — which is why the release history looks slow for two years and then does not.',
    footnote: 'Illustrative release history. Internal previews and patch releases omitted.',
    children: ({ width, height }) => (
      <TimelineAxis
        width={width}
        height={height}
        start="2024-04-01"
        end="2027-01-31"
        axisLabel="Release history"
        events={[
          { date: '2024-06-10', name: 'Block calendar', sublabel: 'v1' },
          { date: '2025-02-18', name: 'Booking sites', sublabel: 'v2' },
          { date: '2025-09-22', name: 'Reconciliation ledger', sublabel: 'v3', kind: 'milestone' },
          { date: '2026-08-04', name: 'Pickup forecasting' },
          { date: '2026-10-13', name: 'Partner API' },
          { date: '2026-12-01', name: 'Ticketing fork' },
        ]}
        spans={[{ from: '2026-08-04', to: '2026-12-01', label: '3 releases', tone: 'accent' }]}
        legend={[
          { label: 'Platform milestone', swatch: role.accent },
          { label: 'Release', swatch: role.muted },
        ]}
      />
    ),
  },
}
