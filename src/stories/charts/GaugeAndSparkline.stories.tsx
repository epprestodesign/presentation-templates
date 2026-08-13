import type { Meta, StoryObj } from '@storybook/react-vite'
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import { color } from '../../tokens/tokens.js'
import { trend } from './_data'

/** CHARTS / Gauge & Sparkline — the two compact forms, both Community (MIT). */
const meta = {
  title: 'Charts/Gauge & Sparkline',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Gauge & Sparkline

\`@mui/x-charts/Gauge\` and \`@mui/x-charts/SparkLineChart\` — both MIT.

These are the two chart types that work *inside* something else. A sparkline
belongs in a KPI tile, beside the number it qualifies; a gauge belongs where a
single value against a known ceiling is the whole story (fill rate, quota
attainment).

Neither should be the subject of a slide on its own — at that size the audience
cannot read it, and a big number with a one-line caption says more.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Gauges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
      {[
        { value: 88, label: 'Fill rate' },
        { value: 72, label: 'Attach rate' },
        { value: 96, label: 'Retention' },
      ].map((g) => (
        <div key={g.label} style={{ textAlign: 'center' }}>
          <Gauge
            width={150}
            height={150}
            value={g.value}
            text={({ value }) => `${value}%`}
            sx={{
              [`& .${gaugeClasses.valueText}`]: { fontSize: 22, fontWeight: 700 },
              [`& .${gaugeClasses.valueArc}`]: { fill: color.accent as string },
              [`& .${gaugeClasses.referenceArc}`]: { fill: color.border as string },
            }}
          />
          <div style={{ font: '600 13px/1.4 Poppins, sans-serif' }}>{g.label}</div>
        </div>
      ))}
    </div>
  ),
}

/** A gauge as a partial arc, which reads better in a tile than a full circle. */
export const GaugeArc: Story = {
  render: () => (
    <Gauge
      width={220}
      height={140}
      value={72}
      startAngle={-110}
      endAngle={110}
      innerRadius="70%"
      outerRadius="100%"
      text={({ value }) => `${value}%`}
      sx={{
        [`& .${gaugeClasses.valueText}`]: { fontSize: 26, fontWeight: 700 },
        [`& .${gaugeClasses.valueArc}`]: { fill: color.accentDeep as string },
        [`& .${gaugeClasses.referenceArc}`]: { fill: color.border as string },
      }}
    />
  ),
}

/** Sparklines, sized as they would sit inside a KPI tile. */
export const Sparklines: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
      {(['line', 'bar'] as const).map((plotType) => (
        <div key={plotType} style={{ width: 220 }}>
          <div style={{ font: '600 13px/1.4 Poppins, sans-serif', marginBottom: 4 }}>
            Room nights · {plotType}
          </div>
          <SparkLineChart
            data={trend}
            height={64}
            plotType={plotType}
            showHighlight={false}
            color={color.accent as string}
            area={plotType === 'line'}
          />
        </div>
      ))}
    </div>
  ),
}
