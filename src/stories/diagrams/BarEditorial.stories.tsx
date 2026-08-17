import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { BarEditorial } from '../../diagrams/BarEditorial'

/** DIAGRAMS / Bar (Editorial) — a bar chart drawn in the diagram register. */
const meta = {
  title: 'Diagrams/Bar (Editorial)',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Bar (Editorial)

A bar chart drawn by hand in the diagram register — same hairlines, same eyebrow
tracking, same one-focal-element rule, same 4px grid as \`Diagrams/Architecture\`
and \`Diagrams/Current State\`.

### When to use the MUI chart instead

The deck has a full chart system at \`Templates/Charts/*\` and it is still the
right answer whenever:

- the data is **live** or comes from a query,
- the chart needs a real **axis library** — log scales, time axes, dual axes,
- anything has to respond to a **tooltip, legend toggle or resize**,
- or there are enough series that a colour scale has to be generated.

Reach for this one when the chart sits **inside a diagram**: on a slide next to a
topology, in a sequence of drawings, where a charting library's defaults would
switch visual languages mid-deck. Four bars and a gridline do not need a
dependency; matching the ink around them does.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### What the port enforces

- **The value axis starts at zero.** Not a prop, not overridable. A truncated
  baseline turns a 6% difference into a 3× one, which is the single most common
  chart deception and upstream's second listed anti-pattern.
- **One focal bar.** \`kind: 'focal'\` is the accent; everything else is
  \`muted @ 0.15\`. Accent on four bars is accent on nothing.
- **Bars are at least half the pitch**, so the gap never outweighs the mark.
- **Ticks land on round numbers** via a 1 / 2 / 2.5 / 5 nice-scale. A gridline at
  4,317 is a gridline nobody reads.
- **≤ 8 bars.** Past that, group into periods or split the chart.

### Horizontal is a first-class orientation

Not a fallback. Upstream's rule is that long category labels or more than eight
categories mean horizontal bars, and EventPipe's categories are things like
"Youth sports — multi-night" which cannot be set under a 90px column at any
honest angle. **Rotated labels are the anti-pattern; a different orientation is
the fix.** In vertical mode a category label wraps to at most two lines; needing
a third is the signal to switch.

### The reference rule

A dashed \`negative\` rule for a plan, a target or a prior-year actual, with its
label in a **reserved right-hand margin** rather than a slot inside the plot.
Squeezing it between the last bar and the plot edge either overlaps a bar or
lands on the rule it names; a reserved gutter always works and costs less width
than a redraw.

No \`<path>\` is emitted — bars, gridlines and the baseline are shapes and rules.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Room nights by event category — the vertical default.
 *
 *  One focal bar, because the slide has one claim: youth sports is not a segment
 *  alongside the others, it is the business. The dashed rule is last season, so
 *  the reader can see which categories moved. */
export const RoomNightsByCategory: Story = {
  name: 'Room nights by category',
  args: {
    eyebrow: 'Where The Volume Is',
    pageNumber: 14,
    title: ['Youth sports is not a segment. ', { accent: 'It is the business.' }],
    lead: 'Multi-night youth tournaments book more room nights than every other category combined, and they book them in the tightest windows — which is what the product is built around.',
    footnote:
      'Illustrative distribution across a full season. Dashed rule is the prior season for the same category mix.',
    children: ({ width, height }) => (
      <BarEditorial
        width={width}
        height={height}
        valueLabel="Room nights"
        reference={{ value: 34000, label: 'Prior season avg' }}
        data={[
          { label: 'Youth sports', value: 148000, kind: 'focal' },
          { label: 'Citywide events', value: 62000 },
          { label: 'Conferences', value: 41000 },
          { label: 'Festivals', value: 24000 },
          { label: 'Corporate', value: 11000 },
        ]}
      />
    ),
  },
}

/** The same type, horizontal, because these labels do not fit under a column.
 *
 *  Eight rows and names of ten to twenty characters is exactly the condition
 *  upstream names for switching orientation. */
export const PickupByHotelTier: Story = {
  name: 'Pickup by hotel tier',
  args: {
    eyebrow: 'Where Blocks Fill',
    pageNumber: 15,
    title: ['Mid-tier limited-service fills first, ', { accent: 'every time.' }],
    lead: 'Ranked by the share of contracted rooms that actually get picked up. The tiers at the bottom are not badly negotiated — they are the overflow the block never needed.',
    footnote:
      'Illustrative pickup rates across one season of contracted blocks. Excludes blocks released before cut-off.',
    children: ({ width, height }) => (
      <BarEditorial
        width={width}
        height={height}
        orientation="horizontal"
        valueLabel="Pickup rate"
        format={(n) => `${n}%`}
        reference={{ value: 62, label: 'Portfolio avg' }}
        gridlines={5}
        data={[
          { label: 'Mid-tier limited service', value: 91, kind: 'focal' },
          { label: 'Extended stay', value: 84 },
          { label: 'Upper midscale', value: 76 },
          { label: 'Airport full service', value: 58 },
          { label: 'Downtown full service', value: 47 },
          { label: 'Resort / destination', value: 33 },
          { label: 'Luxury', value: 19 },
        ]}
      />
    ),
  },
}

/** Grouped: contracted against actualised.
 *
 *  Upstream's grouped variant puts the accent on the PRIMARY SERIES rather than a
 *  single bar, which is the one case where the accent legitimately repeats — the
 *  focal unit is the series, and the neutral series is the baseline it is being
 *  read against. Two groups is the cap. */
export const ContractedVersusActual: Story = {
  name: 'Contracted vs actual',
  args: {
    eyebrow: 'Attrition',
    pageNumber: 16,
    title: ['We contract for the peak and ', { accent: 'settle for the middle.' }],
    lead: 'Every category picks up less than it contracts; the gap is attrition, and it is widest exactly where the contracts are largest. Closing half of it is worth more than any new category.',
    footnote:
      'Illustrative season totals. Actualised counts are post-reconciliation; contracted counts are at cut-off.',
    children: ({ width, height }) => (
      <BarEditorial
        width={width}
        height={height}
        valueLabel="Room nights"
        seriesNames={['Contracted at cut-off', 'Actualised']}
        data={[
          { label: 'Youth sports', value: 168000, value2: 148000 },
          { label: 'Citywide', value: 84000, value2: 62000 },
          { label: 'Conferences', value: 52000, value2: 41000 },
          { label: 'Festivals', value: 31000, value2: 24000 },
        ]}
      />
    ),
  },
}
