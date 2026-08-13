import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatGrid } from '../../templates/StatGrid'

/** TEMPLATES / Stat Grid — headline plus a row of KPI tiles.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Templates/Stat Grid',
  component: StatGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Stat Grid

Headline block, optional secondary label, and a row of KPI tiles on the floor
of the slide.

Tiles are a CSS grid inside an absolutely positioned well, so \`columns\`
re-flows the row rather than needing new coordinates. Each entry in \`cards\`
passes straight through to \`StatCard\`, so one row can mix the \`muted\`
(#f5f5f5) and \`brand\` (gradient) fills the way the revenue-durability slide
does.

**Rebuilt from:** \`references/slide-decks/37.png\`, \`07.png\`, \`393.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof StatGrid>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 37 — Traction. Three tiles, label above the number, corner arrow.
 *
 *  The original runs its tiles from x=16 (breaking the 40px text margin the
 *  rest of the deck holds) and sizes the row to 887px rather than stretching
 *  it to the right margin. Both are reproduced here via `inset` and
 *  `wellWidth`; drop them to get the system default instead. */
export const Traction: Story = {
  args: {
    eyebrow: 'Traction',
    watermark: false,
    title: 'Growth across every operation metric.',
    lead: 'EventPipe connects event operators, housing companies, hotels, teams, and attendees around one live source of truth.',
    titleWidth: 1100,
    sublabel: '2026 Estimated Forecast',
    sublabelSize: 'h2',
    sublabelWidth: 260,
    columns: 3,
    inset: 16,
    wellWidth: 887,
    cards: [
      { label: 'Reservations', value: '1.2M', icon: 'arrow_outward' },
      { label: 'Room Nights', value: '1.9M', icon: 'arrow_outward' },
      { label: 'Annual Events', value: '4.8K', icon: 'arrow_outward' },
    ],
  },
}

/** Slide 07 — Revenue durability. Six tiles in two rows; the second row
 *  reverses onto the brand gradient. Value sits above the label here. */
export const RevenueDurability: Story = {
  args: {
    eyebrow: 'Quality of Revenue',
    pageNumber: 7,
    title: 'Revenue durability',
    titleWidth: 700,
    columns: 3,
    top: 290,
    height: 390,
    cards: [
      {
        value: '615K',
        label: 'Gross Revenue Retention',
        description: 'Booking volume retained from the prior-year cohort, before expansion.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '615K',
        label: 'Net Revenue Retention',
        description: 'Including expansion inside existing accounts — the platform growing per customer.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '615K',
        label: 'Logo Retention',
        description: 'Share of active customers retained year over year.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '615K',
        label: 'Top-10 Concentration',
        description: 'Share of 2025 revenue from the ten largest customers.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
        surface: 'brand',
      },
      {
        value: '615K',
        label: 'Largest Single Customer',
        description: 'The single-customer exposure an investor underwrites first.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
        surface: 'brand',
      },
      {
        value: '615K',
        label: '2024 Cohort Expansion',
        description: 'What the 2024 cohort spent in 2025 versus 2024 — the compounding proof.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
        surface: 'brand',
      },
    ],
  },
}

/** An empty grid, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Section',
    pageNumber: 1,
    title: ['Headline goes here, with ', { accent: 'the emphasis in teal.' }],
    lead: 'One or two lines of supporting copy that set up the numbers below.',
    columns: 3,
    cards: [
      { label: 'Metric one', value: '00' },
      { label: 'Metric two', value: '00' },
      { label: 'Metric three', value: '00' },
    ],
  },
}
