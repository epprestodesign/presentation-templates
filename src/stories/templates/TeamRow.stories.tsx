import type { Meta, StoryObj } from '@storybook/react-vite'
import { TeamRow } from '../../templates/TeamRow'

/** TEMPLATES / Team Row — the leadership slide.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content object
 * handed to the template, which is the contract the whole system rests on: a new
 * slide is data, not markup.
 */
const meta = {
  title: 'Templates/Team Row',
  component: TeamRow,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Team Row

Headline, then a muted panel holding one row of people — rounded-square
headshot over name, role, and a strip of prior-employer marks.

The row is a CSS grid, so \`columns\` re-flows it. The measured geometry fits
that grid exactly: panel from the 40px margin to the 85px watermark gutter,
inset 32, six columns with a 67px gap gives a 193px pitch, which is precisely
the headshot pitch on the reference.

**Rebuilt from:** \`references/slide-decks/15.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof TeamRow>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 15 — Leadership.
 *
 *  Prior-employer marks are STAND-INS. The originals are Motus, ConnectEDU,
 *  EducationDynamics, Halyard Capital, Fidelity, Redfin, Macy's, Walmart,
 *  Krossover, Runzheimer, Everway and Enterprise Fleet — none of which is in
 *  src/assets/partners, which holds this deck's customer and event marks
 *  instead. The strips below therefore prove the layout, not the biographies:
 *  drop the real marks into src/assets/partners and swap the names.
 *
 *  Roles are verbatim from the reference, including the one that runs to two
 *  lines ('Chief Technology Officer & Co-founder') — that is the case the 126px
 *  column has to survive, so it is worth keeping in the story. */
export const Leadership: Story = {
  args: {
    eyebrow: 'EventPipe Team',
    pageNumber: 15,
    title: [
      'Eventpipe’s leadership team has successfully scaled SaaS solutions ',
      { accent: 'for travel and hospitality.' },
    ],
    titleWidth: 1130,
    columns: 6,
    people: [
      {
        name: 'Tim Brown',
        role: 'Chief Executive Officer',
        photo: 'rounded/tim-brown',
        priorLogos: ['team-travel-source', '365', 'traveloc', 'atlas-travel-stay'],
      },
      {
        name: 'Michael Addesa',
        role: 'Chief Technology Officer & Co-founder',
        photo: 'rounded/michael-addesa',
        priorLogos: ['288-travel', '435-housing', 'ah-travel'],
      },
      {
        name: 'Jeff Duke Logan',
        role: 'Chief Product Officer',
        photo: 'rounded/jeff-duke-logan',
        priorLogos: ['team-travel-source', 'bounce-travel'],
      },
      {
        name: 'Christine Mancini',
        role: 'President',
        photo: 'rounded/christine-mancini',
        priorLogos: ['804-travel', '365', 'absolut-sport', 'asl'],
      },
      {
        name: 'Dante Leone',
        role: 'Vice President Finance & Strategy',
        photo: 'rounded/dante-leone',
        priorLogos: ['team-travel-source', '365'],
      },
      {
        name: 'Brandon Hollmann',
        role: 'Chief Revenue Officer',
        photo: 'rounded/brandon-hollmann',
        priorLogos: ['288-travel', 'academy-of-management', 'berkshire-choral', 'ausa'],
      },
    ],
  },
}

/** Four people instead of six, to show the row re-flowing.
 *
 *  Worth having as a story rather than a note: a four-column row gets a 240px
 *  column, which is wide enough that a two-line role no longer wraps — so the
 *  same content object reads differently at a different count, and that is the
 *  thing to check before shipping a five-person variant. */
export const FourAcross: Story = {
  args: {
    ...Leadership.args,
    columns: 4,
    people: Leadership.args!.people!.slice(0, 4),
  },
}

/** An empty row, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Team',
    pageNumber: 1,
    title: ['Headline goes here, with ', { accent: 'the emphasis in teal.' }],
    columns: 3,
    people: [
      { name: 'First Last', role: 'Job title', photo: 'rounded/tim-brown' },
      { name: 'First Last', role: 'Job title', photo: 'rounded/christine-mancini' },
      { name: 'First Last', role: 'Job title', photo: 'rounded/dante-leone' },
    ],
  },
}
