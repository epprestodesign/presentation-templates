import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartDuo } from '../../templates/ChartDuo'
import { color } from '../../tokens/tokens.js'
import { YEARS, byProduct } from '../charts/_data'

/** TEMPLATES / Chart Duo — two charts side by side, each with its caption. */
const meta = {
  title: 'Slide Charts/Chart Duo',
  component: ChartDuo,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Chart Duo

Two charts side by side, each carrying its own caption — for a claim that needs
a pair to stand up: volume beside rate, revenue beside margin.

A panel is \`{ chart, caption }\` rather than a bare \`ChartSpec\`. The caption
is the template's, not the chart's: \`ChartSpec.title\` is the plot's header and
sits above it, while the caption is the takeaway and sits below, where it can be
RichText and accent a clause.

**Give the two charts different titles.** \`SlideChart\` derives its gradient's
SVG id from the title, so two untitled charts on one slide share an id.

**Figures are invented.**
        `,
      },
    },
  },
} satisfies Meta<typeof ChartDuo>

export default meta
type Story = StoryObj<typeof meta>

/** Thousands, keeping the half-steps distinct — `_data.ts`'s `thousands`
 *  rounds, so an axis with a 1500 gridline prints "2K" twice. */
const k = (v: number) =>
  v === 0 ? '0' : v % 1000 === 0 ? `${v / 1000}K` : `${(v / 1000).toFixed(1)}K`

/** The core pairing: what came in, beside what was kept. Two units, so the
 *  panels are framed — the muted card fill is what stops a reader carrying the
 *  left chart's dollar scale across to the right chart's percentages.
 *
 *  A one-line headline, so the well comes up from its default. */
export const RevenueAndMargin: Story = {
  args: {
    eyebrow: 'Company Performance',
    pageNumber: 16,
    title: ['Revenue compounds while ', { accent: 'the cost of serving it falls.' }],
    top: 176,
    framed: true,
    panels: [
      {
        chart: {
          kind: 'stackedBar',
          title: 'Revenue by Product',
          subtitle: 'USD $000s',
          yMax: 5000,
          format: k,
          categories: YEARS,
          series: [
            { name: 'Reservation fees', data: byProduct.reservationFees },
            { name: 'Transaction', data: byProduct.transaction },
            { name: 'Payments', data: byProduct.payments },
          ],
        },
        caption: ['Transaction and payment products now carry ', { accent: 'a third of revenue.' }],
      },
      {
        chart: {
          kind: 'line',
          title: 'Gross Margin',
          subtitle: 'Percent of revenue',
          yMin: 40,
          yMax: 90,
          format: (v) => `${v}%`,
          categories: YEARS,
          series: [{ name: 'Gross margin', data: [51, 58, 66, 71, 78] }],
        },
        caption: 'Margin improves as more of the mix moves to software the platform already runs.',
      },
    ],
  },
}

/** Unframed, and one panel captioned rather than both — the well still
 *  reserves the caption band on both sides so the plots stay level. The right
 *  chart's series are unrelated event CATEGORIES, so its segments take
 *  `color.seriesCategorical`: five teals would collapse into one blur at slide
 *  scale, and hue difference is what keeps the segments apart. */
export const MixAndRate: Story = {
  args: {
    eyebrow: 'Demand',
    pageNumber: 11,
    title: 'Volume and rate move together as events get larger.',
    lead: 'Bigger events fill more rooms and negotiate at higher nightly rates.',
    top: 220,
    panels: [
      {
        chart: {
          kind: 'bar',
          title: 'Average Daily Rate',
          subtitle: 'Blended, USD',
          fill: 'brandVertical',
          valueLabels: true,
          yMax: 260,
          format: (v) => `$${v}`,
          categories: ['Regional', 'State', 'National', 'Citywide', 'Marquee'],
          series: [{ name: 'ADR', data: [129, 148, 172, 205, 238] }],
        },
        caption: ['Marquee events clear ', { accent: '$238 a night' }, ' — 1.8x a regional.'],
      },
      {
        chart: {
          kind: 'stackedBar',
          title: 'Room Nights by Event Type',
          subtitle: 'Thousands of nights',
          format: (v) => v.toLocaleString(),
          categories: ['2023', '2024', '2025'],
          series: [
            { name: 'Youth sports', data: [410, 560, 720], color: color.seriesCategorical[0] },
            { name: 'Citywide', data: [190, 260, 380], color: color.seriesCategorical[1] },
            { name: 'Festivals', data: [120, 150, 210], color: color.seriesCategorical[2] },
            { name: 'Conferences', data: [80, 110, 160], color: color.seriesCategorical[3] },
          ],
        },
      },
    ],
  },
}
