import type { Meta, StoryObj } from '@storybook/react-vite'
import { TeamGrid } from '../../templates/TeamGrid'

/** TEMPLATES / Team Grid — the account-team slide.
 *
 * Stories are the real rebuilt slides: a content object handed to the template,
 * nothing else.
 */
const meta = {
  title: 'Templates/People & Partners/Team Grid',
  component: TeamGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Team Grid

Headline, a paragraph of framing, then a muted panel holding a grid of circular
headshots — each beside a name, a role and a row of contact icons.

Rows are a fixed 185px and the block is centred in the panel rather than
distributed to fill it, so a three-person team gets the same row as a four-person
one. Contact icons render only for the channels a person actually has, and their
\`mailto:\` / \`tel:\` hrefs stay live because these slides are also read in a
browser.

**Rebuilt from:** \`references/slide-decks/Slide-sdfknd.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof TeamGrid>

export default meta
type Story = StoryObj<typeof meta>

/** "Your Event Success Partners at EventPipe" — the account-team slide.
 *
 *  Contact details are placeholders on the eventpipe.com domain: the reference
 *  is a flattened export, so the hrefs behind its icons did not survive. They
 *  are present rather than omitted because the icon row's whole job is to be
 *  clickable, and an icon with no href would quietly stop being that. */
export const EventSuccessPartners: Story = {
  args: {
    eyebrow: 'EventPipe Team',
    title: ['Your ', { accent: 'Event Success Partners' }, ' at EventPipe'],
    lead: 'Think of us as your go-to crew for all things fan housing. From building your custom booking experience to coordinating with hotels, troubleshooting guest issues, and driving conversions through marketing support, your dedicated EventPipe account team is here to make the entire process smooth, strategic, and successful.',
    titleWidth: 1090,
    columns: 2,
    people: [
      {
        name: 'Tim Brown',
        role: 'Chief Executive Officer & Co-founder',
        photo: 'circle/tim-brown',
        email: 'tim@eventpipe.com',
        phone: '+1 513 555 0100',
        linkedin: 'https://www.linkedin.com/company/eventpipe/',
      },
      {
        name: 'Brandon Hollmann',
        role: 'Local Leadership in Cincinnati',
        photo: 'circle/brandon-hollmann',
        email: 'brandon@eventpipe.com',
        phone: '+1 513 555 0101',
        linkedin: 'https://www.linkedin.com/company/eventpipe/',
      },
      {
        name: 'Patricia Driscoll',
        role: 'Director Of Customer Success & Support',
        photo: 'circle/patricia-driscoll',
        email: 'patricia@eventpipe.com',
        phone: '+1 513 555 0102',
        linkedin: 'https://www.linkedin.com/company/eventpipe/',
      },
      {
        name: 'Samantha Barnes',
        role: 'Account Manager',
        photo: 'circle/samantha-barnes',
        email: 'samantha@eventpipe.com',
        phone: '+1 513 555 0103',
        linkedin: 'https://www.linkedin.com/company/eventpipe/',
      },
    ],
  },
}

/** Three people, and one of them without a published phone number.
 *
 *  Both are the cases that break a hand-built version of this slide: the fixed
 *  row height means the odd count leaves a clean empty cell instead of stretching
 *  three rows across the panel, and the missing channel drops its icon rather
 *  than rendering a dead glyph. */
export const PartialTeam: Story = {
  args: {
    ...EventSuccessPartners.args,
    people: [
      EventSuccessPartners.args!.people![0]!,
      { ...EventSuccessPartners.args!.people![1]!, phone: undefined },
      EventSuccessPartners.args!.people![2]!,
    ],
  },
}

/** An empty grid, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Team',
    title: ['Your ', { accent: 'named contacts' }, ' at EventPipe'],
    lead: 'One or two lines of supporting copy that set up who these people are and what they own.',
    people: [
      { name: 'First Last', role: 'Job title', photo: 'circle/tim-brown', email: 'first@eventpipe.com' },
      {
        name: 'First Last',
        role: 'Job title',
        photo: 'circle/samantha-barnes',
        email: 'first@eventpipe.com',
      },
    ],
  },
}
