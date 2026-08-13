import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import { rateVsVolume } from './_data'

/** CHARTS / Scatter — MUI X ScatterChart, Community tier (MIT). */
const meta = {
  title: 'Charts/Scatter',
  component: ScatterChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Scatter

\`@mui/x-charts/ScatterChart\` — MIT. All stories set **\`skipAnimation\`**.

Scatter is the hardest chart to land on a slide: it asks the audience to read
two axes at once, from a distance, usually without labels. It earns its place
only when the *relationship* is the point — here, that larger events carry both
higher rates and higher volume. If the audience needs specific values, use a
table or a bar.
        `,
      },
    },
  },
} satisfies Meta<typeof ScatterChart>

export default meta
type Story = StoryObj<typeof meta>

const SIZE = { width: 640, height: 360 }

export const Basic: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ label: 'Average daily rate ($)', min: 110, max: 290 }],
    yAxis: [{ label: 'Room nights', width: 62 }],
    series: [{ data: rateVsVolume, label: 'Events' }],
    grid: { horizontal: true, vertical: true },
  },
}

/** Two cohorts, to make a comparison rather than an observation. */
export const TwoSeries: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    xAxis: [{ label: 'Average daily rate ($)', min: 110, max: 290 }],
    yAxis: [{ label: 'Room nights', width: 62 }],
    series: [
      { data: rateVsVolume, label: 'On EventPipe' },
      {
        data: rateVsVolume.map((d) => ({ ...d, y: d.y * 0.62, id: `${d.id}-manual` })),
        label: 'Managed manually',
      },
    ],
    grid: { horizontal: true, vertical: true },
  },
}
