import type { Meta, StoryObj } from '@storybook/react-vite'
import { PieChart } from '@mui/x-charts/PieChart'
import { byCategory } from './_data'

/** CHARTS / Pie — MUI X PieChart, Community tier (MIT). */
const meta = {
  title: 'Charts/Pie',
  component: PieChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Pie & Donut

\`@mui/x-charts/PieChart\` — MIT. A donut is a pie with an \`innerRadius\`.

All stories set **\`skipAnimation\`** for the same export reason as every other
chart here.

A caution rather than a feature: a pie is only readable at slide distance with
**four or five slices at most**, and only when the differences are large. Beyond
that a horizontal bar sorted by value communicates the same thing far better —
see \`Charts/Bar → Horizontal\`.
        `,
      },
    },
  },
} satisfies Meta<typeof PieChart>

export default meta
type Story = StoryObj<typeof meta>

const data = byCategory.map((d, i) => ({ id: i, value: d.value, label: d.label }))
const SIZE = { width: 560, height: 320 }

export const Basic: Story = {
  args: { ...SIZE, skipAnimation: true, series: [{ data }] },
}

/** Donut — the centre hole gives the labels somewhere to breathe. */
export const Donut: Story = {
  args: { ...SIZE, skipAnimation: true, series: [{ data, innerRadius: 68, paddingAngle: 2, cornerRadius: 4 }] },
}

/** Percentages on the arcs, so the slide does not depend on a legend. */
export const WithArcLabels: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    series: [
      {
        data,
        innerRadius: 56,
        arcLabel: (item) => `${item.value}%`,
        arcLabelMinAngle: 24,
      },
    ],
  },
}

/** One slice pulled out to make a point. */
export const HighlightOneSlice: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    series: [
      {
        data: data.map((d, i) => (i === 0 ? { ...d, ...{} } : d)),
        innerRadius: 56,
        paddingAngle: 2,
        cornerRadius: 4,
        highlightScope: { highlight: 'item', fade: 'global' },
      },
    ],
  },
}
