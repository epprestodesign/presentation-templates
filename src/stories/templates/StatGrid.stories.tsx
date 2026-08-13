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
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible. Styles pages keep the
    // responsive default instead.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
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

/** Slide 37 — Traction. Four tiles, label above the number, corner arrow.
 *
 *  Geometry taken from `scripts/detect-images.mjs` on the reference rather than
 *  read off the image: four tiles at x = 16, 316, 616, 916, each 284x322 with a
 *  16px gap, so the row runs 16 → 1200. That starts 24px inside the 40px text
 *  margin the rest of the deck holds, and stops at 1200 — exactly clear of the
 *  85px watermark gutter.
 *
 *  The fourth tile is the same content as the third on the brand gradient. That
 *  is faithful to the original, which repeats "Annual Events / 4.8K" there —
 *  evidently a placeholder demonstrating the reversed fill. Left as-is so the
 *  rebuild matches; swap in the real fourth metric when there is one. */
export const Traction: Story = {
  args: {
    eyebrow: 'Traction',
    pageNumber: 5,
    title: 'Growth across every operation metric.',
    lead: 'EventPipe connects event operators, housing companies, hotels, teams, and attendees around one live source of truth.',
    titleWidth: 1100,
    sublabel: '2026 Estimated Forecast',
    sublabelSize: 'h2',
    sublabelWidth: 260,
    columns: 4,
    inset: 16,
    // 4 × 284 + 3 × 16
    wellWidth: 1184,
    cards: [
      { label: 'Reservations', value: '1.2M', icon: 'arrow_outward' },
      { label: 'Room Nights', value: '1.9M', icon: 'arrow_outward' },
      { label: 'Annual Events', value: '4.8K', icon: 'arrow_outward' },
      { label: 'Annual Events', value: '4.8K', icon: 'arrow_outward', surface: 'brand' },
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

/** Slide 12 — 2024 highlights. Two labelled column groups: completed results on
 *  the muted fill with a check badge, pipeline targets on the gradient with the
 *  arrow. The badge is carrying meaning here rather than decoration — done
 *  versus forecast — which is why it is a StatCard prop and not a story-level
 *  flourish. */
export const HighlightsAndResults: Story = {
  args: {
    eyebrow: 'Company Performance',
    watermark: true,
    title: ['2024 Highlights & Results accounted for\n', { text: '$2.1m in revenue', accent: true, underline: true }],
    titleWidth: 1100,
    groups: [
      { label: 'Q3 2024\nResults', span: 2 },
      { label: 'Sales\nPipeline', span: 2 },
    ],
    columns: 4,
    inset: 16,
    wellWidth: 1184,
    top: 360,
    height: 322,
    cards: [
      { label: 'Active\nCustomers', value: '27', icon: 'check', iconBadge: true },
      { label: 'Onboarding\n7 new Customers', value: '$377k', note: 'est ARR', icon: 'check', iconBadge: true },
      { label: 'Q4\nPipeline', value: '$1.0M', icon: 'arrow_outward', surface: 'brand' },
      { label: 'Q4\nNew Bookings Target', value: '250k', icon: 'arrow_outward', surface: 'brand' },
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
