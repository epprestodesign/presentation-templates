import type { Meta, StoryObj } from '@storybook/react-vite'
import { LineChart } from '@mui/x-charts/LineChart'
import { YEARS, byProduct, revenue, roomNights, thousands } from './_data'

/** CHARTS / Line — MUI X LineChart, Community tier (MIT). Area is a Line with `area: true`. */
const meta = {
  title: 'Charts/Line',
  component: LineChart,
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Line & Area

\`@mui/x-charts/LineChart\` — MIT. There is no separate AreaChart export: an area
is a line series with \`area: true\`, which is worth knowing before hunting for
one.

All stories set **\`skipAnimation\`** — slides are rasterised for export and an
animating chart is captured mid-transition.

Use a line when the x-axis is continuous and the trend matters more than the
individual values. When the audience needs to read specific figures, a bar with
value labels is the better slide (see \`Charts/Bar\`).
        `,
      },
    },
  },
} satisfies Meta<typeof LineChart>

export default meta
type Story = StoryObj<typeof meta>

const SIZE = { width: 720, height: 340 }

export const Basic: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, scaleType: 'point' }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [{ data: revenue, label: 'Total revenue' }],
    grid: { horizontal: true },
  },
}

export const MultipleSeries: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, scaleType: 'point' }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [
      { data: byProduct.reservationFees, label: 'Reservation fees' },
      { data: byProduct.transaction, label: 'Transaction' },
      { data: byProduct.payments, label: 'Payments' },
    ],
    grid: { horizontal: true },
  },
}

/** Area — the same component with `area: true`. */
export const Area: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, scaleType: 'point' }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [{ data: revenue, label: 'Total revenue', area: true }],
    grid: { horizontal: true },
    hideLegend: true,
  },
}

/** Stacked areas, for composition over time. */
export const StackedArea: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, scaleType: 'point' }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [
      { data: byProduct.reservationFees, label: 'Reservation fees', area: true, stack: 'total' },
      { data: byProduct.transaction, label: 'Transaction', area: true, stack: 'total' },
      { data: byProduct.payments, label: 'Payments', area: true, stack: 'total' },
    ],
    grid: { horizontal: true },
  },
}

/** Curved, and with the marks hidden — calmer on a busy slide. */
export const SmoothNoMarks: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, scaleType: 'point' }],
    yAxis: [{ width: 52 }],
    series: [{ data: roomNights, label: 'Room nights (m)', curve: 'monotoneX', showMark: false }],
    grid: { horizontal: true },
    hideLegend: true,
  },
}

/** A negative range, as on the EBITA slide. Note the y-axis min must leave room
 *  for the labels or `outside` placement clips them. */
export const NegativeValues: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: ['2024', '2025', '2026', '2027', '2028'], scaleType: 'point' }],
    yAxis: [{ width: 52, min: -140, max: 40 }],
    series: [{ data: [-96, -104, -48, -12, 14], label: 'EBITA' }],
    grid: { horizontal: true },
    hideLegend: true,
  },
}
