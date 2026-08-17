import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatGrid } from '../../templates/StatGrid'

/** TEMPLATES / Stat Grid — headline plus a row of KPI tiles.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Slide Data/Stat Grid',
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
 *  FIGURES ARE SYNTHETIC. The layout is the real one; the numbers are not,
 *  because story data doubles as this template's public specimen.
 *
 *  The original repeats "Annual Events / 4.8K" in the fourth tile — evidently a
 *  placeholder demonstrating the reversed fill. Since the numbers are synthetic
 *  anyway, the fourth tile now carries a distinct metric, which shows the
 *  gradient variant doing something rather than echoing its neighbour. */
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
      { label: 'Reservations', value: '1.4M', icon: 'arrow_outward' },
      { label: 'Room Nights', value: '3.7M', icon: 'arrow_outward' },
      { label: 'Annual Events', value: '5.2K', icon: 'arrow_outward' },
      { label: 'Active Customers', value: '312', icon: 'arrow_outward', surface: 'brand' },
    ],
  },
}

/** Slide 07 — Revenue durability. Six tiles in two rows; the second row
 *  reverses onto the brand gradient. Value sits above the label here.
 *
 *  FIGURES ARE SYNTHETIC. The reference fills all six with the same "615K"
 *  placeholder, which reads as a bug rather than a design. Each tile now
 *  carries a plausible figure in the UNIT its label implies — retention and
 *  concentration as percentages, cohort expansion as a multiple — so the
 *  specimen also demonstrates that this template handles mixed formats. */
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
        value: '96%',
        label: 'Gross Revenue Retention',
        description: 'Booking volume retained from the prior-year cohort, before expansion.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '118%',
        label: 'Net Revenue Retention',
        description: 'Including expansion inside existing accounts — the platform growing per customer.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '93%',
        label: 'Logo Retention',
        description: 'Share of active customers retained year over year.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
      },
      {
        value: '24%',
        label: 'Top-10 Concentration',
        description: 'Share of 2025 revenue from the ten largest customers.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
        surface: 'brand',
      },
      {
        value: '6.2%',
        label: 'Largest Single Customer',
        description: 'The single-customer exposure an investor underwrites first.',
        order: 'value-first',
        valueSize: 'statSm',
        align: 'top',
        surface: 'brand',
      },
      {
        value: '1.31x',
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
    title: ['2024 Highlights & Results accounted for\n', { text: '$2.4m in revenue', accent: true, underline: true }],
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
      { label: 'Active\nCustomers', value: '34', icon: 'check', iconBadge: true },
      { label: 'Onboarding\n9 new Customers', value: '$412k', note: 'est ARR', icon: 'check', iconBadge: true },
      { label: 'Q4\nPipeline', value: '$1.3M', icon: 'arrow_outward', surface: 'brand' },
      { label: 'Q4\nNew Bookings Target', value: '285k', icon: 'arrow_outward', surface: 'brand' },
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

/* --- Revenue durability, at other column counts -------------------------
 *
 * The same three metrics, re-laid-out. Worth having as stories rather than as a
 * note: the retention trio is the slide most often rebuilt for a different
 * audience, and each count changes what the copy can carry, not just how wide
 * the cards are.
 */

const DURABILITY_CARDS = RevenueDurability.args!.cards!

/** Two-up: the pair a board actually argues about, with room for a full
 *  sentence under each. Logo retention moves into the headline instead. */
export const RevenueDurabilityTwoUp: Story = {
  name: 'Revenue durability – 2 up',
  args: {
    ...RevenueDurability.args,
    pageNumber: 7,
    title: 'Revenue durability',
    lead: 'Logo retention held at 93% over the same period.',
    columns: 2,
    top: 300,
    height: 360,
    cards: DURABILITY_CARDS.slice(0, 2),
  },
}

/** Four-up: the trio plus the expansion figure that explains why net exceeds
 *  gross. The cards narrow to ~277px, so the descriptions shorten. */
export const RevenueDurabilityFourUp: Story = {
  name: 'Revenue durability – 4 up',
  args: {
    ...RevenueDurability.args,
    pageNumber: 7,
    columns: 4,
    top: 300,
    height: 360,
    cards: [
      ...DURABILITY_CARDS.slice(0, 3).map((c) => ({
        ...c,
        description: undefined,
      })),
      {
        value: '1.31x',
        label: 'Expansion Multiple',
        order: 'value-first' as const,
        valueSize: 'statSm' as const,
        align: 'top' as const,
      },
    ],
  },
}

/** Stacked: one column, three full-width rows.
 *
 *  This is the version to use when the metrics are a SEQUENCE rather than a
 *  set — gross, then net, then logo, each qualifying the one above. Side by
 *  side, three cards read as three independent facts; stacked, the order
 *  carries the argument. It also gives each description a full measure instead
 *  of a 374px column, which is what lets the copy be a sentence rather than a
 *  fragment. */
export const RevenueDurabilityStacked: Story = {
  name: 'Revenue durability – stacked',
  args: {
    ...RevenueDurability.args,
    pageNumber: 7,
    lead: 'Each line qualifies the one above it.',
    columns: 1,
    /* Three full-width rows need the whole well, not the 360px the 3-up
       version uses: side by side the descriptions sit beside each other,
       stacked they sit under each other and the column is three times as
       tall. */
    top: 246,
    height: 414,
    cards: DURABILITY_CARDS.map((c) => ({ ...c, order: 'value-first' as const, align: 'top' as const })),
  },
}
