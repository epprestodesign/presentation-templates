import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { LineEditorial } from '../../diagrams/LineEditorial'

/** DIAGRAMS / Line (Editorial) — a trend as a drawing, not as a chart widget. */
const meta = {
  title: 'Diagrams/Line (Editorial)',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Line (Editorial)

A continuous trend over time or a sequential index, drawn in the diagram
register: hairline gridlines, Poppins at the diagram type sizes, every
coordinate on the 4px grid.

### This is not a replacement for \`Templates/Charts/*\`

The deck already has a MUI X chart system, and the two are counterparts, not
competitors:

- **Reach for the MUI chart** when the data is live, when the axis needs real
  machinery — ticks it computes itself, tooltips, zoom, responsive re-scaling —
  or when the chart *is* the slide.
- **Reach for this one** when the chart is one element inside a drawing and has
  to match the diagram set. Beside a \`NodeBox\` and a \`Connector\`, a MUI chart
  reads as a screenshot pasted onto a diagram; this reads as part of it.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens and Poppins.

### Upstream rules kept

- **4–12 points.** Fewer is a stat, more is a period aggregate.
- **≤5 series.** Above that it is mush; the palette is \`role.series\` applied in
  declaration order so series 2 looks the same on every slide.
- **Vertex dots on the focal series only.** Dots on four series is noise.
- **No splines.** A \`<polyline>\` is honest about where the samples are; a
  smoothed curve invents values between them.
- **Legend below the drawing**, never inside it, and only when more than one
  series needs naming.

### Why the series is a \`<polyline>\`

The connector rules forbid a diagonal \`<path>\` — correctly, because a connector
must be orthogonal. But a data mark is not a connector: the slant *is* the
information. Drawing the series as \`<polyline>\` keeps that distinction honest,
and keeps the geometry gate looking at connectors. The one \`<path>\` in the
drawing is the callout leader, which is a real elbow.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Three event types across one booking window.
 *
 *  Three series, one focal, and a shaded band rather than a fourth series — the
 *  cut-off window is context for all three curves, not a curve of its own. */
export const PickupCurve: Story = {
  name: 'Pickup curve',
  args: {
    eyebrow: 'Housing Operations',
    pageNumber: 24,
    title: ['Youth tournaments pick up ', { accent: 'late, then all at once.' }],
    lead: 'Cumulative rooms booked against a 2,500-room block, by weeks out. Conferences fill early and flatten; tournaments do almost half their pickup inside the cut-off window.',
    footnote:
      'Illustrative shape drawn from three sample blocks; figures invented for this template. Cumulative, not net of cancellations.',
    children: ({ width, height }) => (
      <LineEditorial
        width={width}
        height={height}
        xLabels={['T-12', 'T-10', 'T-8', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'EVENT']}
        yMax={2500}
        yTicks={5}
        yFormat={(v) => v.toLocaleString('en-US')}
        valueLabel="Rooms booked"
        band={{ from: 5, to: 7, label: 'Cut-off window' }}
        series={[
          {
            name: 'Youth tournament',
            focal: true,
            points: [40, 180, 420, 760, 1080, 1520, 1960, 2280, 2440, 2500],
          },
          {
            name: 'Citywide conference',
            points: [120, 300, 520, 760, 940, 1180, 1420, 1620, 1740, 1800],
          },
          {
            name: 'Music festival',
            points: [20, 60, 140, 260, 420, 700, 1160, 1620, 1980, 2160],
          },
        ]}
      />
    ),
  },
}

/** One series, an area, and a callout.
 *
 *  A single series earns the area fill because the area means something here —
 *  rooms handed back are a total, not a rate — and it earns the callout because
 *  one curve leaves enough open canvas to place a leader honestly. */
export const CutOffRelease: Story = {
  name: 'Cut-off release',
  args: {
    eyebrow: 'Housing Operations',
    pageNumber: 25,
    title: ['Everything hinges on ', { accent: 'one week.' }],
    lead: 'Rooms released back to hotels per week across the same window. The spike is the cut-off date: whatever is unsold that Friday leaves the block, and re-booking it later costs the operator the negotiated rate.',
    footnote: 'Weekly releases, not cumulative. Illustrative figures invented for this template.',
    children: ({ width, height }) => (
      <LineEditorial
        width={width}
        height={height}
        xLabels={['T-12', 'T-10', 'T-8', 'T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'EVENT']}
        yMax={500}
        yTicks={5}
        valueLabel="Rooms released"
        annotation={{ point: 5, text: 'Cut-off', dx: -260, dy: 0 }}
        series={[
          {
            name: 'Rooms released',
            focal: true,
            area: true,
            points: [40, 60, 90, 140, 210, 480, 260, 120, 60, 20],
          },
        ]}
      />
    ),
  },
}
