import type { Meta, StoryObj } from '@storybook/react-vite'
import { Process } from '../../templates/Process'

/** TEMPLATES / Process — numbered steps, in a row or as a two-column list.
 *
 * Stories are content objects. Every name and figure below is illustrative.
 */
const meta = {
  title: 'Templates/Narrative/Process',
  component: Process,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Process

Three to five numbered steps explaining how something works. Each step is a
number, a title, a description and an optional glyph — which is what separates it
from \`Diagram\`'s flow variant, where a node is a label and a picture. Flow names
the participants in a chain; Process explains what each part involves.

Numbers are **derived from position** and zero-padded to match the deck's page
numbers. A hand-numbered deck ships a 1-2-3-3-5 eventually, and inserting a step
means retyping the rest. \`number\` is still there for the real exceptions — a step
'0', or two steps that happen at once.

Two arrangements:

- **row** — steps side by side, with a chevron in each gap. The connector slot is
  always rendered and only its glyph is hidden on the first step: dropping the
  element makes the first card wider than the rest by exactly the connector
  column, a bug this repo has shipped twice.
- **list** — a two-column grid on \`grid-auto-rows: 1fr\`, for four or five steps
  whose descriptions run to two or three lines. An odd count leaves an empty
  cell, never a taller row.
        `,
      },
    },
  },
} satisfies Meta<typeof Process>

export default meta
type Story = StoryObj<typeof meta>

/** Customer onboarding, as a partner or prospect sees it.
 *
 *  Four steps in a row is the shape this variant is tuned for: at 1155px of well
 *  the cards land at ~245px, which holds a two-word title over three lines of
 *  copy. Ghost numerals rather than chips, because the cards already carry the
 *  #f5f5f5 fill and a filled disc on a filled card is one container too many. */
export const CustomerOnboarding: Story = {
  args: {
    eyebrow: 'Implementation',
    pageNumber: 7,
    title: ['From signature to ', { accent: 'first event live' }],
    lead: 'One implementation lead owns the whole sequence. Most housing companies run a real event on EventPipe inside six weeks.',
    steps: [
      {
        icon: 'flag',
        title: 'Kick-off',
        description:
          'We map your event calendar, your hotel relationships and who does what on your team.',
      },
      {
        icon: 'settings_suggest',
        title: 'Configure',
        description:
          'Contracts, rate structures and attrition terms loaded, with your policies set once and inherited by every event.',
      },
      {
        icon: 'palette',
        title: 'Brand & launch',
        description:
          'Booking sites styled to your brand and your organisers, then opened for a live event.',
      },
      {
        icon: 'support_agent',
        title: 'Hand-off',
        description:
          'Training recorded for later hires, and a named support contact who already knows your setup.',
      },
    ],
  },
}

/** What actually happens when a parent books a room — the slide that explains
 *  the product to somebody who has never run event housing.
 *
 *  Five steps, so this is the list variant: each step needs a full sentence, and
 *  five columns of 190px would wrap every one of them into a stripe. The chevron
 *  is irrelevant in a grid, so no connector is involved. */
export const HowABookingFlows: Story = {
  args: {
    variant: 'list',
    eyebrow: 'Product',
    pageNumber: 8,
    title: ['One booking, ', { accent: 'five systems of record updated' }],
    lead: 'The parent sees a booking page. Behind it, five things have to stay true at once.',
    steps: [
      {
        icon: 'link',
        title: 'The team books on the event site',
        description:
          'A branded booking site, inside the block, with only the hotels that event actually contracted.',
      },
      {
        icon: 'inventory',
        title: 'Inventory decrements',
        description:
          'The block draws down in real time, so the next family sees what is genuinely left.',
      },
      {
        icon: 'credit_card',
        title: 'Payment is captured',
        description:
          'Deposit or card on file, against the rules the housing company set for that event.',
      },
      {
        icon: 'sync_alt',
        title: 'The hotel gets the reservation',
        description:
          'Rooming lists delivered the way each property wants them, without a spreadsheet in between.',
      },
      {
        icon: 'receipt_long',
        title: 'Commission is accrued',
        description:
          'Every room night carries its commission terms forward to reconciliation after the event.',
      },
    ],
  },
}

/** Three steps, no connectors — an internal process slide for an all-hands.
 *
 *  `connector: false` because these are concurrent stages of one quarter rather
 *  than a hand-off from one team to the next; a chevron would claim an order the
 *  work does not have. The slot is still reserved, so the three cards stay
 *  exactly equal. Outline cards, to sit differently from the filled row above. */
export const SupportEscalation: Story = {
  args: {
    variant: 'row',
    surface: 'outline',
    numberStyle: 'chip',
    connector: false,
    eyebrow: 'Support Operations',
    pageNumber: 21,
    tag: 'INTERNAL',
    title: ['Three tiers, ', { accent: 'one clock' }],
    lead: 'Every inbound question starts at tier one and carries the same response target regardless of where it lands.',
    steps: [
      {
        icon: 'headset_mic',
        title: 'Tier 1 — Housing support',
        description:
          'Booking questions, rooming-list changes and site issues. Resolves the large majority the same day.',
      },
      {
        icon: 'engineering',
        title: 'Tier 2 — Implementation',
        description:
          'Anything touching a contract, a block structure or a payment rule goes to the team that configured it.',
      },
      {
        icon: 'bug_report',
        title: 'Tier 3 — Engineering',
        description:
          'Reproducible defects only, with the event and the block already identified in the ticket.',
      },
    ],
  },
}
