import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeadlineChart } from '../../templates/HeadlineChart'

/** TEMPLATES / Headline + Chart — copy column left, chart(s) right. */
const meta = {
  title: 'Templates/Headline + Chart',
  component: HeadlineChart,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Headline + Chart

Copy on the left, one or two charts on the right, and optionally a
before → after figure pair on the floor of the copy column.

Charts are declared as data (\`ChartSpec\`), not as Recharts markup. That is
deliberate: the same spec is handed to PptxGenJS's native \`addChart\`, so the
chart arrives in Google Slides as a **real chart object whose numbers can be
edited** rather than a flat picture. Recharts is only the HTML renderer.

Two departures from Recharts defaults, both matching the deck: bars take a
vertical brand gradient, and every value is printed above its bar instead of
hidden behind a tooltip — a slide is read from across a room, never hovered.

**Rebuilt from:** \`references/slide-decks/08.png\`, \`16.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof HeadlineChart>

export default meta
type Story = StoryObj<typeof meta>

/** Thousands separator, matching the reference axis labels ("12K", "10K"). */
const thousands = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v))

/** Slide 08 — Core business. Single gradient bar series with value labels,
 *  plus the $5.2M → $8.4M pair under the paragraph. */
export const CoreBusiness: Story = {
  args: {
    eyebrow: 'Core Business',
    pageNumber: 8,
    title: ['The core software business is growing ', { accent: 'before the new layers arrive.' }],
    titleWidth: 560,
    body: 'Reservation fees create a durable base. Transactional products add revenue per booking as customers adopt more of the platform. Payments and distribution layer on top of base plan for accelerated growth.',
    delta: {
      label: 'Base Plan Revenue',
      from: { value: '$5.2M', caption: '2026' },
      to: { value: '$8.4M', caption: '2027' },
    },
    chartLeft: 620,
    chartTop: 150,
    chartHeight: 480,
    charts: [
      {
        kind: 'bar',
        title: 'Total Revenue',
        subtitle: 'Management Base Plan',
        unit: 'USD $000s',
        fill: 'brandVertical',
        valueLabels: true,
        yMax: 8000,
        format: thousands,
        categories: ['2023', '2024A', '2025', '2026E', '2027E'],
        series: [{ name: 'Revenue', data: [940, 1610, 2750, 4480, 7300] }],
      },
    ],
  },
}

/** Slide 16 — Company performance. Two charts side by side: a stacked revenue
 *  bar, and an EBITA line carrying the floating margin callout. */
export const CompanyPerformance: Story = {
  args: {
    eyebrow: 'Company Performance',
    pageNumber: 16,
    title: 'The base plan reaches scale and profitability before the full upside is counted.',
    titleWidth: 1080,
    lead: 'Core revenue grows through customer expansion and higher activity. The plan then layers payments, distribution, ticketing, and international growth over time.',
    chartLeft: 40,
    chartTop: 300,
    chartHeight: 330,
    charts: [
      {
        kind: 'stackedBar',
        title: 'Revenue',
        subtitle: 'Figures in thousands (USD $000s)',
        yMax: 8000,
        format: thousands,
        categories: ['2023A', '2024A', '2025A', '2026E', '2027E'],
        series: [
          { name: 'Reservation Fees', data: [780, 1050, 2600, 3300, 6280] },
          { name: 'Transaction Revenue', data: [480, 780, 1000, 2600, 4180] },
        ],
      },
      {
        kind: 'line',
        title: 'EBITA',
        subtitle: 'Figures in thousands (USD $000s)',
        valueLabels: true,
        yMin: -140,
        yMax: 40,
        format: (v) => `${v}`,
        categories: ['2024', '2025', '2026', '2027', '2028'],
        series: [{ name: 'EBITA margin', data: [-120, -120, -60, -19, 18.2] }],
        callout: { value: '15.6%', label: '2027 EBITA Margin' },
      },
    ],
  },
}
