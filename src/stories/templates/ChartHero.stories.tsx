import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartHero } from '../../templates/ChartHero'
import { YEARS } from '../charts/_data'

/** TEMPLATES / Chart Hero — one chart, nearly the whole slide. */
const meta = {
  title: 'Slide Charts/Chart Hero',
  component: ChartHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Chart Hero

For the slide where one trend IS the argument. A compact headline, then a
single plot across the full content well.

The headline defaults to \`h2\` rather than the deck's usual \`h1\` on purpose:
a 40px sentence over a 500px plot gets read first, which inverts what this
slide is for. If the words should lead, use **Headline + Chart** instead.

The well stops at \`grid.watermarkGutter\` (1195), not at \`marginX\` — a
full-width chart is exactly the case where a plot would otherwise run under the
rotated wordmark.

**Figures are invented.** Story data is a public specimen, not a book of
business.
        `,
      },
    },
  },
} satisfies Meta<typeof ChartHero>

export default meta
type Story = StoryObj<typeof meta>

/** Thousands, keeping the half-steps distinct.
 *
 *  `_data.ts`'s `thousands` ROUNDS, so on an axis whose ticks land on 1500 it
 *  prints "2K" twice — which is what it did here at 1x before this was
 *  written. Anything with sub-thousand gridlines needs this instead. */
const k = (v: number) =>
  v === 0 ? '0' : v % 1000 === 0 ? `${v / 1000}K` : `${(v / 1000).toFixed(1)}K`

/** The default shape: a gradient bar series with its values printed, and the
 *  headline reduced to a caption for the curve.
 *
 *  Room nights are carried in THOUSANDS rather than millions because MUI's bar
 *  labels print the raw value and bypass `format` — in millions the 1.0 point
 *  rendered as a bare "1" between "0.7" and "1.4". Integers make the labels
 *  consistent, and the axis still abbreviates, which is what the reference deck
 *  does too. */
export const RoomNights: Story = {
  args: {
    eyebrow: 'Traction',
    pageNumber: 9,
    title: ['Room nights booked have ', { accent: 'roughly quadrupled in four years.' }],
    chart: {
      kind: 'bar',
      title: 'Room Nights Booked',
      subtitle: 'All event types',
      unit: 'Thousands of nights',
      fill: 'brandVertical',
      valueLabels: true,
      yMax: 2400,
      format: k,
      categories: YEARS,
      series: [{ name: 'Room nights', data: [520, 715, 1010, 1420, 1930] }],
    },
    footnote: 'Illustrative figures. Room nights counted at check-out, net of cancellations.',
  },
}

/** A line instead, with the floating callout the deck uses to name the one
 *  number the chart exists to deliver. Nothing else on the slide competes with
 *  it — no lead paragraph, no footnote.
 *
 *  The last category is four characters, not "2026E". On a point scale the
 *  final tick label is centred on the plot's right edge, so a fifth character
 *  is clipped to an ellipsis; the estimate is flagged in the subtitle instead. */
export const AttachRate: Story = {
  args: {
    eyebrow: 'Product',
    pageNumber: 12,
    title: 'Every additional product a customer adopts compounds the revenue per booking.',
    titleWidth: 820,
    /* This headline wraps to two lines, and the default chartTop is sized for
       one — it left 33px between the headline and the chart's own title where
       the one-line stories have 71, so the two blocks read as one crowded
       stack. Matched to the rest of the set rather than eyeballed. */
    chartTop: 232,
    chart: {
      kind: 'line',
      title: 'Revenue per Booking',
      subtitle: 'Blended across reservation, transaction and payment products. 2026 estimated.',
      yMin: 0,
      yMax: 40,
      format: (v) => `$${v}`,
      categories: ['2021', '2022', '2023', '2024', '2025', '2026'],
      series: [{ name: 'Revenue per booking', data: [8.4, 11.2, 15.7, 21.3, 27.9, 34.1] }],
      callout: { value: '$34', label: '2026E per booking' },
    },
  },
}

/** Headline, lead AND footnote, which is as much copy as this template takes
 *  before it stops being a hero chart.
 *
 *  ONE series. Support load was originally plotted beside bookings to make the
 *  point in the headline, but at 15K against 786K it drew as a flat line along
 *  the axis — a series that cannot be read is worse than a sentence. The
 *  comparison moved to the footnote. */
export const BookingVolume: Story = {
  args: {
    eyebrow: 'Platform',
    pageNumber: 10,
    title: ['Booking volume grows ', { accent: 'without a matching rise in support load.' }],
    lead: 'Self-service rooming lists and automated pickup reporting absorb the growth.',
    chartTop: 236,
    chart: {
      kind: 'line',
      title: 'Bookings Processed',
      subtitle: 'Confirmed reservations across all managed events',
      yMin: 0,
      yMax: 800000,
      format: k,
      categories: ['2021', '2022', '2023', '2024', '2025'],
      series: [{ name: 'Bookings', data: [148000, 216000, 341000, 512000, 786000] }],
    },
    footnote: 'Illustrative figures. Support contacts over the same period rose 1.7x, against 5.3x bookings.',
  },
}
