import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pillars } from '../../templates/Pillars'

/** TEMPLATES / Pillars — three tinted columns of white cards under one banner. */
const meta = {
  title: 'Templates/Pillars',
  component: Pillars,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Pillars

Three #f5f5f5 panels side by side, each a coloured column heading over a stack of
white cards, with a pill-shaped banner laid across all three tops — dotted leader
lines either side of centred, tracked caps and a chevron at the right end.

It looks like one panel divided into three; it is not. Probing the reference shows
white running the full panel height at x=421–429 and x=811–819, so the columns are
three separate panels with an 8px gap. That is why the banner is its own layer over
them rather than a child of the first panel, and why each panel carries a top
padding big enough to clear it.

The card stacks distribute. Column one has three cards at 105px and column three
has five at 62px, and both start at y=330 and finish at y=658 — so cards are
\`flex: 1\` and a column takes as many as its content needs without any story
touching a height.

The tone (teal / navy / black) applies to a column's heading *and* its cards,
because the reference always matches them; it reads as one column colour rather
than two independent decisions.

**Rebuilt from:** \`references/slide-decks/357-45.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Pillars>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 357-45 — the partnership strategy slide. */
export const PartnershipStrategy: Story = {
  args: {
    eyebrow: 'Partnership Strategy',
    title: [{ accent: 'Over $1 billion in total bookings' }, ', with $260M annually and growing'],
    banner: { label: 'Powering seamless hotel booking at scale', icon: 'chevron_right' },
    columns: [
      {
        title: 'Who We Serve',
        tone: 'accent',
        cards: [
          'Sports Housing Providers',
          'Event Producers & Organizers',
          // Explicit break: the reference wraps after "Membership", and Poppins
          // runs wide enough that automatic wrapping breaks a word earlier.
          'Associations & Membership\nOrganizations',
        ],
      },
      {
        title: 'Where We Operate',
        tone: 'navy',
        cards: ['CVBs & Sports Commissions', 'Facilities & Venues', 'Travel Management Companies'],
      },
      {
        title: 'What We Power',
        tone: 'ink',
        cards: [
          'Sports & Team Travel',
          'Citywide Events',
          'Multi-Day Events',
          'Music & Food Festivals',
          'Esports Tournaments',
        ],
      },
    ],
  },
}

/** No banner, and uneven column lengths — the stacks still start and end
 *  together because the cards distribute. */
export const NoBanner: Story = {
  args: {
    eyebrow: 'Platform',
    title: ['Three layers, ', { accent: 'one operating system for group travel.' }],
    columns: [
      {
        title: 'Book',
        tone: 'accent',
        cards: ['Custom booking sites', 'Room block management'],
      },
      {
        title: 'Pay',
        tone: 'navy',
        cards: ['Card on file', 'Split payments', 'Commission reconciliation', 'Payouts'],
      },
      {
        title: 'Report',
        tone: 'ink',
        cards: ['Pickup reporting', 'Attrition tracking', 'Rebate forecasting'],
      },
    ],
  },
}
