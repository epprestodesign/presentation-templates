import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartStats } from '../../templates/ChartStats'
import { YEARS, revenue } from '../charts/_data'

/** TEMPLATES / Chart + Stats — one chart with a rail of KPI callouts. */
const meta = {
  title: 'Templates/Charts/Chart + Stats',
  component: ChartStats,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Chart + Stats

One chart with three or four stat callouts beside it (\`railPlacement: 'right'\`)
or beneath it (\`'bottom'\`). The chart carries the shape of the story; the rail
carries the figures the audience is meant to leave with.

Placement is driven by the chart, not the content: a bar chart with five or more
categories needs the width and pushes the rail to the floor, while a line with a
long y-range can give up a column.

The rail reuses the deck's \`StatCard\` at stepped-down type — \`statSm\` over
\`bodySm\`, not \`stat\` over \`h4\`. A 68px number in a 300px rail out-shouts
the plot it is annotating. Any card can still override.

**Figures are invented.**
        `,
      },
    },
  },
} satisfies Meta<typeof ChartStats>

export default meta
type Story = StoryObj<typeof meta>

/** Thousands, keeping the half-steps distinct — `_data.ts`'s `thousands`
 *  rounds, so an axis with a 1500 gridline prints "2K" twice. */
const k = (v: number) =>
  v === 0 ? '0' : v % 1000 === 0 ? `${v / 1000}K` : `${(v / 1000).toFixed(1)}K`

/** Rail on the right — a line chart gives up the column comfortably. The last
 *  card takes the brand fill so the number the slide is actually about is the
 *  one that reads first. */
export const GrowthScorecard: Story = {
  args: {
    eyebrow: 'By the Numbers',
    pageNumber: 7,
    title: ['Five years of compounding, ', { accent: 'and the base is still widening.' }],
    chart: {
      kind: 'line',
      title: 'Total Revenue',
      subtitle: 'USD $000s',
      yMin: 0,
      yMax: 5000,
      format: k,
      categories: YEARS,
      series: [{ name: 'Revenue', data: revenue }],
    },
    stats: [
      { label: 'Revenue CAGR', value: '64%' },
      { label: 'Net revenue retention', value: '128%' },
      { label: 'Events managed', value: '4.6K' },
      { label: 'Gross margin', value: '78%', surface: 'brand' },
    ],
  },
}

/** Rail beneath — a bar chart with six categories needs the full width, so the
 *  callouts take the floor instead. Four across the well gives each card ~279px,
 *  which fits a two-word label without wrapping.
 *
 *  None of the four carries a `note`. StatCard bottom-aligns its stack, so one
 *  card with an extra line under the figure lifts only that figure and the row
 *  of numbers stops reading as a row. */
export const QuarterInReview: Story = {
  args: {
    eyebrow: 'Q4 Review',
    pageNumber: 18,
    title: 'Peak season delivered the strongest quarter on record.',
    lead: 'Volume held through the shoulder months rather than collapsing after the summer tournaments.',
    railPlacement: 'bottom',
    top: 232,
    chart: {
      kind: 'bar',
      title: 'Room Nights by Month',
      subtitle: 'Thousands of nights',
      fill: 'brandVertical',
      valueLabels: true,
      yMax: 260,
      format: (v) => String(v),
      categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [{ name: 'Room nights', data: [214, 198, 162, 147, 121, 96] }],
    },
    stats: [
      { label: 'Room nights', value: '938K' },
      { label: 'Bookings', value: '312K' },
      { label: 'Average daily rate', value: '$172' },
      { label: 'Cancellation rate', value: '4.1%' },
    ],
  },
}

/** Three cards rather than four, on a stacked bar. A shorter rail lets each
 *  card carry a line of supporting copy, which four at this height cannot. */
export const ProductMix: Story = {
  args: {
    eyebrow: 'Product',
    pageNumber: 13,
    title: 'The platform earns more from every booking it already handles.',
    railWidth: 320,
    chart: {
      kind: 'stackedBar',
      title: 'Revenue by Product Line',
      subtitle: 'USD $000s',
      yMax: 5000,
      format: k,
      categories: YEARS,
      series: [
        { name: 'Reservation fees', data: [420, 620, 1000, 1720, 2700] },
        { name: 'Transaction', data: [140, 240, 450, 780, 1310] },
        { name: 'Payments', data: [50, 80, 160, 250, 470] },
      ],
    },
    stats: [
      {
        label: 'Attach rate',
        value: '72%',
        description: 'of customers now run at least two products.',
      },
      {
        label: 'Revenue per booking',
        value: '$34',
        description: 'blended across the full product set.',
      },
      {
        label: 'Payments volume',
        value: '$214M',
        description: 'processed through the platform in 2025.',
      },
    ],
  },
}
