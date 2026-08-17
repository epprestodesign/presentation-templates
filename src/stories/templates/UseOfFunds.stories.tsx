import type { Meta, StoryObj } from '@storybook/react-vite'
import { UseOfFunds } from '../../templates/UseOfFunds'

/** TEMPLATES / Use of Funds — tier rows left, gradient spec panel right. */
const meta = {
  title: 'Slide Data/Use of Funds',
  component: UseOfFunds,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Use of Funds

Tier rows on the left — amount, title, description — and a brand-gradient spec
panel on the right holding labelled sections of key/value rows.

Its own template rather than a variant of **Financial Table**, which was the
obvious-looking move and the wrong one: it shares nothing structural with a model
table. No period columns, no summary block, no variance group, no right-aligned
figures. Forcing it in would have produced a different template wearing Financial
Table's name.

Two values are reused rather than reinvented: the amount cell's tint is the
**lightest step of the measured table ramp** (\`#f6ffff\`) — the reference uses
the same value in both places — and the panel is \`gradient.brand\` at 45°,
confirmed by sampling all four corners.

The reference fills the panel with \`{{TOKEN}}\` placeholders, so this slide is
designed to be filled in. \`value\` is a plain string: pass the token through and
it renders, which is what you want while a round is still being negotiated.

**Rebuilt from:** \`references/slide-decks/17.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof UseOfFunds>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 17 — the raise, with the reference's placeholder tokens intact.
 *
 *  FIGURES ARE SYNTHETIC. The layout is the real one; the numbers are not,
 *  because story data doubles as this template's public specimen. */
export const TheRaise: Story = {
  args: {
    eyebrow: 'Growth Thesis – EventPipe Pay',
    pageNumber: 17,
    title: '$8.7M to clear the development hurdle and keep compounding.',
    lead: 'This is not survival capital. The base plan reaches profitability on its own. The raise funds the build that unlocks the next revenue layers.',
    tiers: [
      { amount: '$4.5M', title: 'Product and infrastructure', description: 'Payments, APIs, AI workflows' },
      {
        amount: '$3.0M',
        title: 'Bridge Funding',
        description: 'Development capital, not runway. Name the specific build or launch spend this covers.',
      },
      { amount: '$1.2M', title: 'Working capital', description: 'Operating runway and virtual-card processing float' },
    ],
    sections: [
      {
        label: 'What this round is designed to prove',
        rows: [
          { label: 'Payments adoption', value: '{{PAY_PENETRATION}}' },
          { label: 'Distribution launch', value: '{{TICKETING_PARTNERS}}' },
          { label: 'Target revenue', value: '{{TARGET_REVENUE}}' },
          { label: 'Customers at plan end', value: '{{TARGET_CUSTOMERS}}' },
          { label: 'Runway', value: '{{RUNWAY_MONTHS}}' },
        ],
      },
      {
        label: 'Round structure',
        rows: [
          { label: 'Instrument', value: '{{ROUND_INSTRUMENT}}' },
          { label: 'Valuation / range', value: '{{ROUND_VALUATION}}' },
          { label: 'Committed / soft-circled', value: '{{ROUND_COMMITTED}}' },
          { label: 'Lead status', value: '{{LEAD_STATUS}}' },
        ],
      },
    ],
  },
}

/** The same template with the tokens filled in, to show what it becomes. */
export const Filled: Story = {
  args: {
    ...TheRaise.args,
    sections: [
      {
        label: 'What this round is designed to prove',
        rows: [
          { label: 'Payments adoption', value: '41% of bookings' },
          { label: 'Distribution launch', value: '3 ticketing partners' },
          { label: 'Target revenue', value: '$9.7M' },
          { label: 'Customers at plan end', value: '71' },
          { label: 'Runway', value: '26 months' },
        ],
      },
      {
        label: 'Round structure',
        rows: [
          { label: 'Instrument', value: 'Priced equity' },
          { label: 'Valuation / range', value: '$48–58M pre' },
          { label: 'Committed / soft-circled', value: '$3.6M' },
          { label: 'Lead status', value: 'In diligence' },
        ],
      },
    ],
  },
}
