import type { Meta, StoryObj } from '@storybook/react-vite'
import { FeatureCards } from '../../templates/FeatureCards'

/** TEMPLATES / Feature Cards — headline plus a row of photo cards.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content object
 * handed to the template, which is the contract the whole system rests on: a new
 * slide is data, not markup.
 */
const meta = {
  title: 'Templates/Narrative/Feature Cards',
  component: FeatureCards,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Feature Cards

Headline block, then a row of photo cards across the floor of the slide. Two
layouts, one template:

- \`photo-top\` — the photo bleeds to the card's top edge, is scrimmed, and the
  title is reversed onto it; a ruled list sits in the #f5f5f5 well beneath.
- \`photo-bottom\` — a flat #f5f5f5 card with the title and copy at the top and
  the photo inset along the bottom.

The row is a CSS grid inside an absolutely positioned well, so \`columns\`
re-flows it rather than needing new coordinates. Each entry in \`cards\` passes
straight through to \`FeatureCard\`.

**Rebuilt from:** \`references/slide-decks/03.png\`, \`10.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof FeatureCards>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 03 — One operating layer. Five cards, photo bleeding to the top edge.
 *
 *  Geometry read off the reference with `scripts/detect-images.mjs` and a pixel
 *  probe rather than eyeballed: the row runs y = 274 → 680 (the floor being the
 *  40px bottom margin), each card 225 wide at an 8px gap, and the photo/well
 *  boundary sits at y = 528.5, i.e. 255px of photo and 151px of list. The card
 *  radius measures 16 — `radius.panel`, not the 10px `radius.card` the KPI tiles
 *  use. Left edge is the 40px page margin; the row is left to fill to the 85px
 *  watermark gutter, which makes each card 224.6 instead of the reference's 225
 *  and stops it 2px short of the reference's x=1197 — the reference runs 2px
 *  under the wordmark, and the rule wins over the copy.
 *
 *  Two type choices are deliberate compromises against a reference that was not
 *  built on this scale. The card titles measure 18.7px, so they take `h4` (18)
 *  rather than the `h3` (22) that card titles normally get. The ruled list
 *  measures 11.5px at a 16px line pitch: `bodySm` (13/19.5) would overflow the
 *  measured 151px well by 20px, so the list takes `caption` (11/15.4), whose
 *  pitch lands within 0.6px of the reference.
 *
 *  Headline width is 1010, set by the lead rather than by the headline: Poppins
 *  sets that sentence 1005px wide, so anything narrower breaks it onto a second
 *  line where the reference keeps it on one. The headline's own break is not a
 *  width decision at all — AccentText sets `text-wrap: balance`, so a two-line
 *  headline splits evenly whatever column it is given. That costs the
 *  reference's break after "bid"; it is a system-wide choice, not this slide's.
 *
 *  The photos here are the reference's own card crops, which means each one has
 *  the original scrim and white title baked into its lower third. The card's
 *  scrim therefore goes solid earlier than the reference's does, to bury them —
 *  see the note in FeatureCard.module.css. */
export const OperatingLayer: Story = {
  args: {
    eyebrow: 'EventPipe',
    pageNumber: 3,
    title: 'One operating layer, from the first hotel bid to the final payout.',
    lead: 'EventPipe connects event operators, housing companies, hotels, teams, and attendees around one live source of truth.',
    titleWidth: 1010,
    layout: 'photo-top',
    titleSize: 'h4',
    bodySize: 'caption',
    cards: [
      {
        title: 'Build and secure hotel supply',
        image: 'unsplash/platform/contract-signing-1',
        alt: 'Signing a hotel contract on a laptop',
        bullets: [
          'Run hotel RFPs and compare bids and terms',
          'Manage rates, terms, rebates, and deadlines',
          'Turn negotiated rooms into contracted inventory',
        ],
      },
      {
        title: 'Turn contracted rooms into bookings',
        image: 'unsplash/travel/booking-on-phone-1',
        alt: 'A phone showing a confirmed booking',
        bullets: [
          'Launch branded booking sites for each event',
          'Give teams and attendees a direct path to book',
          'Convert contracted inventory into live reservations',
        ],
      },
      {
        title: 'Operate every event in real time',
        image: 'unsplash/platform/dashboard-laptop-1',
        alt: 'Pointing at a live booking dashboard',
        bullets: [
          'See inventory and demand in real time',
          'Know who booked and where gaps remain',
          'Track pickup and performance as bookings come in',
        ],
      },
      {
        title: 'Connect performance to payout',
        image: 'unsplash/platform/payment-terminal-1',
        alt: 'Commission growth visualised over an open hand',
        bullets: [
          'Give every partner the same numbers',
          'Automate commission and payment flows',
          'Connect booking activity through to final payout',
        ],
      },
      {
        title: ['Earn ', { text: 'beyond the room booking', bold: true }],
        image: 'unsplash/people/handshake-partnership-1',
        alt: 'Two people shaking hands over a deal',
        bullets: [
          'Add booking protection at checkout',
          'Generate revenue through commission protection',
          'Capture commissionable bookings beyond the block',
        ],
      },
    ],
  },
}

/** Slide 10 — Four ways to create value. Four flat cards, photo on the floor.
 *
 *  This row is measured 17px wider than the text column on the left: cards at
 *  x = 23 / 315 / 607 / 899, 284 wide, 8px gap, ending at 1183. That is faithful
 *  to the reference and still clear of the watermark gutter, so `inset` and
 *  `wellWidth` are set explicitly rather than defaulting to the page margin.
 *
 *  The row sits lower and shorter than slide 03's — y = 322.5 → 645.5 — because
 *  the headline here carries a two-line lead. Inside each card the padding runs
 *  20/16/16 and the photo is a fixed 183px band on the floor, which is what
 *  lines the four photos up across the row even though the copy above them is
 *  not the same length.
 *
 *  Type matches the reference exactly here: the title measures 22px (`h3`) and
 *  the body 13px at a 19px pitch (`bodySm`, 13/19.5). */
export const FourWaysToCreateValue: Story = {
  args: {
    eyebrow: 'Company Overview',
    pageNumber: 10,
    title: ['One Translation. ', { accent: 'Four ways to create value.' }],
    lead: 'The expansion path is simple: monetize the same event-housing workflow, then make it available wherever event-goers make payments.',
    titleWidth: 1000,
    layout: 'photo-bottom',
    top: 322,
    height: 323,
    inset: 23,
    // 4 × 284 + 3 × 8
    wellWidth: 1160,
    cardPaddingTop: 20,
    cards: [
      {
        title: 'Booking SaaS',
        body: [
          'The system of record already in place, with room to monetise further at checkout and post-block.',
        ],
        image: 'value/booking-saas-devices',
        alt: 'The booking platform on a laptop and a phone',
      },
      {
        title: 'Payments',
        body: [
          'EventPipe Pay captures economics on booking volume that already flows through the platform.',
        ],
        image: 'value/payment-terminal',
        alt: 'A guest tapping to pay at a hotel front desk',
      },
      {
        title: 'Distribution',
        body: ['Put contracted hotel inventory inside ticketing, registration, and travel channels.'],
        image: 'value/presto-phone',
        alt: 'The Presto booking page on a phone',
      },
      {
        title: 'AI',
        body: ['Automate work on proprietary operating data and increase events per coordinator.'],
        image: 'value/ai-glasses-code',
        alt: 'Code reflected in a pair of glasses',
      },
    ],
  },
}

/* --- Column-count variants ---------------------------------------------
 *
 * The template already re-flows on `columns` — the well is a grid and the cards
 * share whatever is left after the gutters — so these are content, not new
 * layout code. They exist because the count is the decision an author actually
 * makes, and seeing the four side by side is what tells you where the copy has
 * to shorten.
 *
 * The honest limit: at 5 the card is ~226px wide, and a title of more than two
 * words wraps. Every deck that has reached for 5 here would have read better as
 * 4 with a stronger claim in each. Kept anyway, because the alternative is
 * someone forcing it with inline widths.
 */

const FLAT = {
  eyebrow: 'Platform',
  layout: 'flat' as const,
  titleWidth: 1000,
  top: 322,
  height: 300,
}

/** Two columns — the most room per card, for a genuine either/or. */
export const TwoColumns: Story = {
  args: {
    ...FLAT,
    pageNumber: 11,
    title: ['Two halves of ', { accent: 'one workflow.' }],
    lead: 'Everything the platform does falls into one of these.',
    columns: 2,
    cards: [
      {
        title: 'Build the block',
        body: [
          'Contract hotels, load rates and attrition terms, and publish a branded booking site — once per event, not once per hotel.',
        ],
      },
      {
        title: 'Run the block',
        body: [
          'Track pickup nightly, release unsold rooms at cut-off, and reconcile commissions without exporting anything.',
        ],
      },
    ],
  },
}

/** Three — the comfortable default for a claim with a middle term. */
export const ThreeColumns: Story = {
  args: {
    ...FLAT,
    pageNumber: 12,
    title: ['Three jobs, ', { accent: 'one record.' }],
    lead: 'Each one is a spreadsheet somewhere else.',
    columns: 3,
    cards: [
      { title: 'Contracting', body: ['Rates, counts and attrition agreed per hotel and stored once.'] },
      { title: 'Booking', body: ['Teams book against the block on a site that carries the event brand.'] },
      { title: 'Reconciliation', body: ['Rooms actualised, commissions and rebates paid on schedule.'] },
    ],
  },
}

/** Four — the reference deck's own count. */
export const FourColumns: Story = {
  args: {
    ...FLAT,
    pageNumber: 13,
    title: ['Four ways ', { accent: 'to create value.' }],
    lead: 'Monetise the same workflow, then take it where the payments already are.',
    columns: 4,
    cards: [
      { title: 'Booking SaaS', body: ['The system of record, with room to monetise at checkout.'] },
      { title: 'Payments', body: ['Economics on volume that already flows through the platform.'] },
      { title: 'Distribution', body: ['Contracted inventory inside ticketing and registration.'] },
      { title: 'AI', body: ['Automate on operating data; more events per coordinator.'] },
    ],
  },
}

/** Five — the practical ceiling. Titles must stay to two words. */
export const FiveColumns: Story = {
  args: {
    ...FLAT,
    pageNumber: 14,
    title: ['The full ', { accent: 'operating stack.' }],
    lead: 'Five surfaces, one underlying record.',
    columns: 5,
    cards: [
      { title: 'Contract', body: ['Rates and terms per hotel.'] },
      { title: 'Build', body: ['Blocks, policies, branded site.'] },
      { title: 'Book', body: ['Teams reserve against the block.'] },
      { title: 'Track', body: ['Pickup nightly against contract.'] },
      { title: 'Settle', body: ['Actualise, reconcile, pay out.'] },
    ],
  },
}
