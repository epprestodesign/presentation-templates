import type { Meta, StoryObj } from '@storybook/react-vite'
import { LogoWall } from '../../templates/LogoWall'

/** TEMPLATES / Logo Wall — the customer-proof slide.
 *
 * Stories are the real rebuilt slides: a content object handed to the template.
 */
const meta = {
  title: 'Templates/Logo Wall',
  component: LogoWall,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Logo Wall

Headline and framing paragraph, then one or two labelled fields of third-party
marks. Each field's label is centred inside a dotted leader that spans its full
width — the deck's device for stopping two walls reading as one mass.

Marks are named, not imported: \`logos: ['team-travel-source', '365']\` resolves
through \`logo()\` in \`LogoGrid\`, which fails loudly with the list of what
exists rather than rendering a broken image.

Cells cap the mark's HEIGHT and let width find itself, because partner artwork
arrives at wildly different aspect ratios. A partial last row centres under the
full rows above it, as the reference does.

**Rebuilt from:** \`references/slide-decks/06.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof LogoWall>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 06 — Customer proof.
 *
 *  The marks are the 19 files in src/assets/partners, split by what they are:
 *  housing and travel companies on the left, event and tournament brands on the
 *  right. The original slide carries 26 customers and 22 events, so this is the
 *  same layout at a third of the density — the wall is genuinely shorter here
 *  and there is no way around that until the remaining artwork lands. Dropping
 *  files into src/assets/partners, aliasing them in LogoGrid and adding the
 *  names below is the whole job. */
export const CustomerProof: Story = {
  args: {
    eyebrow: 'Customer Proof',
    pageNumber: 6,
    title: ['The ', { accent: 'category leaders' }, ' already run on Eventpipe.'],
    lead: 'On track for 100 customers by year-end 2026, validating the core product across high-volume housing agencies, tournaments, leagues, and events. That installed base validates the core product and gives payments, distribution, and AI a route to market with no new customer-acquisition engine.',
    titleWidth: 1120,
    columns: 5,
    groups: [
      {
        label: 'Customers',
        logos: [
          'team-travel-source',
          '365',
          'traveloc',
          '435-housing',
          '288-travel',
          'atlas-travel-stay',
          'absolut-sport',
          '804-travel',
          'ah-travel',
          'bounce-travel',
        ],
      },
      {
        label: 'Events',
        logos: [
          'balloon-fiesta',
          'hockey-night-in-boston',
          'bearpaw-lacrosse',
          '3up-sports',
          'ausa',
          'asl',
          'bismarck-mandan',
          'berkshire-choral',
          'academy-of-management',
        ],
      },
    ],
  },
}

/** One field across the full width, for a deck that only has customers to show.
 *
 *  Six across rather than five: with no second group to sit beside, each mark
 *  gets a wider cell, and at that width the six-column rhythm matches the
 *  original wall's optical density better than a stretched five. */
export const SingleWall: Story = {
  args: {
    eyebrow: 'Customer Proof',
    pageNumber: 6,
    title: ['Housing agencies and event operators ', { accent: 'already run on Eventpipe.' }],
    lead: 'One installed base across high-volume housing agencies, tournaments, leagues, and events.',
    columns: 6,
    left: 98,
    width: 1042,
    groups: [
      {
        label: 'Customers & Events',
        logos: [
          'team-travel-source',
          '365',
          'traveloc',
          '435-housing',
          '288-travel',
          'atlas-travel-stay',
          'absolut-sport',
          '804-travel',
          'ah-travel',
          'bounce-travel',
          'balloon-fiesta',
          'hockey-night-in-boston',
          'bearpaw-lacrosse',
          '3up-sports',
          'ausa',
          'asl',
          'bismarck-mandan',
          'berkshire-choral',
          'academy-of-management',
        ],
      },
    ],
  },
}
