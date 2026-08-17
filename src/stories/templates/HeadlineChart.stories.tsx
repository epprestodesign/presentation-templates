import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeadlineChart } from '../../templates/HeadlineChart'

/** TEMPLATES / Headline + Chart — copy column left, chart(s) right. */
const meta = {
  title: 'Slide Charts/Headline + Chart',
  component: HeadlineChart,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible. Styles pages keep the
    // responsive default instead.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
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
 *  plus a before → after pair under the paragraph.
 *
 *  FIGURES ARE SYNTHETIC. The layout is the real one; the numbers are not.
 *  Story data doubles as the public specimen for this template, so it carries
 *  a plausible growth curve rather than the actual book of business. */
export const CoreBusiness: Story = {
  args: {
    eyebrow: 'Core Business',
    pageNumber: 8,
    title: ['The core software business is growing ', { accent: 'before the new layers arrive.' }],
    titleWidth: 560,
    body: 'Reservation fees create a durable base. Transactional products add revenue per booking as customers adopt more of the platform. Payments and distribution layer on top of base plan for accelerated growth.',
    delta: {
      label: 'Base Plan Revenue',
      from: { value: '$5.4M', caption: '2026' },
      to: { value: '$9.7M', caption: '2027' },
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
        yMax: 11000,
        format: thousands,
        categories: ['2023', '2024A', '2025', '2026E', '2027E'],
        series: [{ name: 'Revenue', data: [960, 1740, 2980, 5390, 9740] }],
      },
    ],
  },
}

/** Slide 16 — Company performance. Two charts side by side: a stacked revenue
 *  bar, and an EBITA line carrying the floating margin callout.
 *
 *  FIGURES ARE SYNTHETIC, as above. The stack still sums to the bar chart's
 *  totals and EBITA still crosses zero in the fourth year, because a specimen
 *  whose numbers do not hang together is a worse specimen. */
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
        yMax: 11000,
        format: thousands,
        categories: ['2023A', '2024A', '2025A', '2026E', '2027E'],
        series: [
          { name: 'Reservation Fees', data: [640, 1120, 1980, 3150, 6040] },
          { name: 'Transaction Revenue', data: [320, 620, 1000, 2240, 3700] },
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
        series: [{ name: 'EBITA margin', data: [-104, -111, -52, -13, 15.6] }],
        callout: { value: '15.6%', label: '2027 EBITA Margin' },
      },
    ],
  },
}
