import type { Meta, StoryObj } from '@storybook/react-vite'
import { RadarChart } from '@mui/x-charts/RadarChart'
import { operationalScores } from './_data'

/** CHARTS / Radar — MUI X RadarChart, Community tier (MIT). */
const meta = {
  title: 'Charts/Radar',
  component: RadarChart,
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Radar

\`@mui/x-charts/RadarChart\` — MIT. All stories set **\`skipAnimation\`**.

Radar works on a slide for exactly one job: showing that one option covers more
ground than another across several dimensions at once. The shape does the
talking, which is why it survives being read from across a room.

It is a poor choice for reading values — the axes are hard to follow round the
circle — and it becomes noise past about six dimensions.
        `,
      },
    },
  },
} satisfies Meta<typeof RadarChart>

export default meta
type Story = StoryObj<typeof meta>

const SIZE = { width: 480, height: 400 }

export const Basic: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    radar: { max: 100, metrics: operationalScores.metrics },
    series: [{ label: 'On EventPipe', data: operationalScores.eventpipe }],
  },
}

/** The comparison this chart type is actually for. */
export const Comparison: Story = {
  args: {
    ...SIZE,
    skipAnimation: true,
    radar: { max: 100, metrics: operationalScores.metrics },
    series: [
      { label: 'On EventPipe', data: operationalScores.eventpipe, fillArea: true },
      { label: 'Managed manually', data: operationalScores.manual, fillArea: true },
    ],
  },
}
