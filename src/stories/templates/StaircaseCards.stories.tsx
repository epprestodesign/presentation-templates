import type { Meta, StoryObj } from '@storybook/react-vite'
import { StaircaseCards } from '../../templates/StaircaseCards'

/** TEMPLATES / Staircase Cards — a headline over gradient cards stepped upward.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content object
 * handed to the template, which is the contract the whole system rests on: a new
 * slide is data, not markup.
 */
const meta = {
  title: 'Templates/Staircase Cards',
  component: StaircaseCards,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Staircase Cards

Three gradient cards stepped up and to the right. Body copy sits at the top of
each card, the bold label on its floor, and a very large translucent numeral is
ghosted in behind the label.

The template takes the first (lowest) card's top edge and one \`step\`, and
derives the rest, so a fourth stage costs nothing. \`numbered\` turns the ghost
numerals off for a set of stages that is not a sequence.

**Rebuilt from:** \`references/slide-decks/24.png\`, \`09-wef.png\`.

### A note on the gradient

The brief for this template called for \`gradient.brandCardAlt\` (135deg, dark
top-left → bright bottom-right). Sampling the corners of all six reference cards
says otherwise: #02658c at the bottom-left rising to #02abb2 at the top-right, on
both slides, which is \`gradient.brand\` (45deg, orient-800 → fountain-blue-600)
to within a byte per channel. The measured value ships. \`surface: 'brandAlt'\`
flips any card or the whole row to the other diagonal for a deck that wants it.
        `,
      },
    },
  },
} satisfies Meta<typeof StaircaseCards>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 24 — Integration roadmap. Three numbered steps.
 *
 *  Cards measure 348x360 at x = 43 / 444 / 845 and y = 279 / 240 / 191, so the
 *  gap is 53 and the rightmost edge lands at 1193 — 2px clear of the watermark
 *  gutter. The reference's own rises are 39 then 49px; the template applies one
 *  44px step, which puts the third card exactly where the reference has it and
 *  the middle one 5px low. Card radius measures ~14–16, so `radius.panel`.
 *
 *  Inside a card: 28px padding (body copy starts at x=73 against a card edge at
 *  43), body copy at 17px — measured, and the widest reference line comes back
 *  274.6px in Poppins against a sampled 277 — and titles at 22px. Both are
 *  scale steps: `lead` and `h3`.
 *
 *  The ghost numeral is a 150px figure (its stem measures 105.5px tall, i.e. a
 *  0.70 cap ratio) inset 36 from the right, at 15% white — derived by unmixing
 *  the sampled #27a5b4 against the gradient behind it. */
export const IntegrationRoadmap: Story = {
  args: {
    eyebrow: 'Feature Requests',
    title: [{ accent: 'Integration Roadmap: ' }, 'From Simple Links to Fully Embedded Booking'],
    titleWidth: 900,
    cards: [
      {
        title: 'Static Booking Hyperlinks',
        body: [
          'Direct, static links from event pages, emails, and social media to EventPipe-made Presto booking pages. No API work — quick, trackable, and brand-consistent.',
        ],
      },
      {
        title: 'Triggered Post-Purchase Offers',
        body: [
          'Hotel booking links/modules embedded in Showpass confirmation pages and emails. Passes event details to EventPipe for a more relevant booking experience.',
        ],
      },
      {
        title: 'Embedded Bookings',
        body: [
          'EventPipe widgets fully embedded in Showpass ticketing flows. Real-time hotel recommendations based on event date, location, and ticket quantity — book without leaving the purchase flow.',
        ],
      },
    ],
  },
}

/** Slide 09 — Implementation & support model. The same staircase, unnumbered.
 *
 *  Identical card geometry to the roadmap slide, sitting 32px higher (top = 247
 *  rather than 279) because this headline is shorter. `numbered: false` because
 *  these three are facets of one model rather than an ordered sequence — the
 *  reference carries no numerals at all.
 *
 *  Each card runs several short paragraphs with a bold lead-in instead of one
 *  block, which is why `body` is an array of RichText rather than a string.
 *
 *  The reference sets this slide's card titles ~26px against slide 24's 22px.
 *  Both take `h3` (22) — 26 is not a step, and h2 at 32 would be a much larger
 *  error than the 4px this gives up.
 *
 *  The reference also carries an "ON LOCATION | eventpipe" lockup in the
 *  watermark area. That is chrome, so it is passed as data: with no `src` the
 *  lockup renders its deliberately obvious placeholder until the partner's
 *  artwork lands. */
export const ImplementationAndSupport: Story = {
  args: {
    eyebrow: 'Client Onboarding',
    coBrand: { name: 'ON LOCATION' },
    title: [{ accent: 'Implementation & Support Model: ' }, 'Fast, Focused, and Fully Supported'],
    titleWidth: 720,
    top: 247,
    numbered: false,
    cards: [
      {
        title: 'Timeline',
        body: [
          [{ text: 'Discovery & Configuration — ', bold: true }, '1–2 weeks'],
          [{ text: 'Training — ', bold: true }, '3 recorded/live onboarding sessions'],
          [{ text: 'Go Live — ', bold: true }, 'Configurable per department or rollout size'],
        ],
      },
      {
        title: 'Support Structure',
        body: [
          [{ text: 'Dedicated CSM + Account Manager', bold: true }],
          [{ text: 'Monthly check-ins, Quarterly Business Reviews', bold: true }],
          [{ text: 'In-app ticketing & live calendar booking link', bold: true }],
        ],
      },
      {
        title: 'Onboarding Fee',
        body: ['$10,000', 'for 60–100 users'],
      },
    ],
  },
}
