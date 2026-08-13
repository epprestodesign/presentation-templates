import type { Meta, StoryObj } from '@storybook/react-vite'
import { BarChart, barClasses } from '@mui/x-charts/BarChart'
import { YEARS, byProduct, revenue, thousands } from './_data'
import { chartSeriesColors } from '../../lib/muiTheme'

/** CHARTS / Bar — MUI X BarChart, Community tier (MIT). */
const meta = {
  title: 'Charts/Bar',
  component: BarChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Bar

\`@mui/x-charts/BarChart\` — MIT.

Every story sets **\`skipAnimation\`**. That is not a preference: slides are
rasterised by headless Chromium for export, and a chart animating on mount is
captured mid-transition. \`SlideChart\` enforces it so a slide cannot forget.

The deck's own bar treatment adds two things MUI does not do by default —
gradient-filled bars, and the value printed above each bar rather than hidden
in a tooltip (a slide is read from across a room, never hovered). Both are shown
below and both are what \`SlideChart\` produces.
        `,
      },
    },
  },
} satisfies Meta<typeof BarChart>

export default meta
type Story = StoryObj<typeof meta>

const SIZE = { width: 720, height: 340 }

/** The plainest useful form. */
export const Basic: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [{ data: revenue, label: 'Total revenue' }],
    grid: { horizontal: true },
    borderRadius: 4,
  },
}

/** Value labels above each bar — the deck's default, since a projected slide
 *  has no hover. */
export const WithValueLabels: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, categoryGapRatio: 0.55 }],
    yAxis: [{ width: 52, valueFormatter: thousands, max: 7000 }],
    series: [{ data: revenue, label: 'Total revenue', barLabel: 'value', barLabelPlacement: 'outside' }],
    grid: { horizontal: true },
    borderRadius: 4,
    hideLegend: true,
  },
}

/** Stacked by product line. Stacks keep flat series colours — a gradient on
 *  each segment would make the boundaries unreadable. */
export const Stacked: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [
      { data: byProduct.reservationFees, label: 'Reservation fees', stack: 'total' },
      { data: byProduct.transaction, label: 'Transaction', stack: 'total' },
      { data: byProduct.payments, label: 'Payments', stack: 'total' },
    ],
    grid: { horizontal: true },
    borderRadius: 4,
  },
}

/** Grouped, for comparing two runs side by side. */
export const Grouped: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ data: YEARS, barGapRatio: 0.2 }],
    yAxis: [{ width: 52, valueFormatter: thousands }],
    series: [
      { data: byProduct.reservationFees, label: 'Reservation fees' },
      { data: byProduct.transaction, label: 'Transaction' },
    ],
    grid: { horizontal: true },
    borderRadius: 4,
  },
}

/** Horizontal, which reads better when category names are long. */
export const Horizontal: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    layout: 'horizontal',
    yAxis: [{ data: ['Youth sports', 'Citywide', 'Festivals', 'Conferences', 'Esports'], width: 110 }],
    xAxis: [{ valueFormatter: (v: number) => `${v}%` }],
    series: [{ data: [46, 19, 14, 13, 8], label: 'Share of bookings' }],
    grid: { vertical: true },
    borderRadius: 4,
    hideLegend: true,
  },
}

/** The deck's gradient fill.
 *
 *  `gradientUnits="userSpaceOnUse"` is the detail that matters: the gradient
 *  stretches across the whole plot and is then clipped to each bar, so a short
 *  bar shows only the dark end. The default (`objectBoundingBox`) restretches
 *  the full gradient inside every bar, which makes a 1-unit bar and a 10-unit
 *  bar look identically coloured and destroys the sense of scale. */
export const BrandGradient: Story = {
  args: { ...SIZE, skipAnimation: true, series: [{ data: revenue }] },
  render: () => (
    <BarChart
      {...SIZE}
      skipAnimation
      xAxis={[{ data: YEARS, categoryGapRatio: 0.55 }]}
      yAxis={[{ width: 52, valueFormatter: thousands, max: 7000 }]}
      series={[{ data: revenue, label: 'Total revenue', barLabel: 'value', barLabelPlacement: 'outside' }]}
      grid={{ horizontal: true }}
      borderRadius={4}
      hideLegend
      // barClasses.element resolves to "MuiBarChart-element". Hand-writing
      // ".MuiBarElement-root" silently matches nothing and the bars stay flat —
      // always go through the exported class map.
      sx={{ [`& .${barClasses.element}`]: { fill: 'url(#ep-bar-gradient)' } }}
    >
      <defs>
        <linearGradient id="ep-bar-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="0" y2="0">
          <stop offset="0%" stopColor="#01658b" />
          <stop offset="100%" stopColor={chartSeriesColors[0]} />
        </linearGradient>
      </defs>
    </BarChart>
  ),
}
