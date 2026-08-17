import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartStack } from '../../templates/ChartStack'
import { color } from '../../tokens/tokens.js'
import { YEARS } from '../charts/_data'

/** TEMPLATES / Chart Stack — two full-width charts sharing one x-axis. */
const meta = {
  title: 'Slide Charts/Chart Stack',
  component: ChartStack,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Chart Stack

Two charts stacked vertically, each the full width of the content well. For a
metric and its driver: the reader compares by dropping a finger down the slide
rather than scanning across two side-by-side x-axes.

**Shared categories are the precondition, not a nicety.** Stacking two charts
with different x-axes invites a comparison that is not there. Pass the same
\`categories\` to both.

Rows are equal by construction rather than by two hand-tuned heights — an
unequal pair makes the upper series look larger at a glance, which is the exact
misreading a stack exists to prevent.

**Figures are invented.**
        `,
      },
    },
  },
} satisfies Meta<typeof ChartStack>

export default meta
type Story = StoryObj<typeof meta>

/** Thousands, keeping the half-steps distinct — `_data.ts`'s `thousands`
 *  rounds, so an axis with a 1500 gridline prints "2K" twice. */
const k = (v: number) =>
  v === 0 ? '0' : v % 1000 === 0 ? `${v / 1000}K` : `${(v / 1000).toFixed(1)}K`

/** The canonical use: the outcome on top, the thing that produced it below.
 *  Same years on both, so the 2024 step in room nights lines up vertically with
 *  the 2024 step in event count.
 *
 *  A one-line headline, so the stack comes up from its default and gives both
 *  plots the height back. */
export const MetricAndDriver: Story = {
  args: {
    eyebrow: 'Traction',
    pageNumber: 9,
    title: ['Room nights follow event count ', { accent: 'almost exactly.' }],
    top: 164,
    charts: [
      {
        kind: 'bar',
        title: 'Room Nights Booked',
        subtitle: 'Thousands of nights',
        fill: 'brandVertical',
        valueLabels: true,
        yMax: 2400,
        format: k,
        categories: YEARS,
        series: [{ name: 'Room nights', data: [520, 715, 1010, 1420, 1930] }],
      },
      {
        kind: 'line',
        title: 'Events Managed',
        subtitle: 'Count of events with at least one confirmed block',
        yMin: 0,
        yMax: 5200,
        format: k,
        categories: YEARS,
        series: [{ name: 'Events', data: [980, 1420, 2140, 3260, 4610] }],
      },
    ],
    footnote: 'Illustrative figures. Both series cover the same twelve-month periods.',
  },
}

/** A total on top, broken apart by event type below.
 *
 *  Both rows carry the SAME `yMax`. That is the whole trick of this pairing:
 *  the lower stack's totals then reach exactly the height of the bar above
 *  them, so "the mix adds up to the total" is something the reader sees rather
 *  than something the caption has to assert.
 *
 *  It is 6000 against a 4480 peak, not a snug 5000, because in a half-height
 *  row the value label printed above the tallest bar is clipped by the top of
 *  the plot when the bar reaches 90% of the scale. Headroom is cheaper than
 *  losing the number.
 *
 *  The lower chart's segments are unrelated CATEGORIES, so they take
 *  `color.seriesCategorical` — brand teal and orient for the two largest, then
 *  coral and amber, so adjacent segments differ in hue rather than only in
 *  lightness at slide scale. */
export const RevenueAndMix: Story = {
  args: {
    eyebrow: 'Revenue',
    pageNumber: 14,
    title: 'Growth is broad, not one category running hot.',
    lead: 'Every event type contributed to the last two years of revenue.',
    top: 214,
    charts: [
      {
        kind: 'bar',
        title: 'Total Revenue',
        subtitle: 'USD $000s',
        fill: 'brandVertical',
        valueLabels: true,
        yMax: 6000,
        format: k,
        categories: YEARS,
        series: [{ name: 'Revenue', data: [610, 940, 1610, 2750, 4480] }],
      },
      {
        kind: 'stackedBar',
        title: 'Revenue by Event Type',
        subtitle: 'USD $000s',
        yMax: 6000,
        format: k,
        categories: YEARS,
        series: [
          { name: 'Youth sports', data: [250, 385, 660, 1130, 1840], color: color.seriesCategorical[0] },
          { name: 'Citywide', data: [134, 207, 354, 605, 985], color: color.seriesCategorical[1] },
          { name: 'Festivals', data: [98, 150, 258, 440, 717], color: color.seriesCategorical[2] },
          { name: 'Conferences', data: [73, 113, 193, 330, 538], color: color.seriesCategorical[3] },
          { name: 'Esports', data: [55, 85, 145, 245, 400], color: color.seriesCategorical[4] },
        ],
      },
    ],
  },
}
