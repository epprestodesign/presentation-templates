import type { Meta, StoryObj } from '@storybook/react-vite'
import { Agenda } from '../../templates/Agenda'

/** TEMPLATES / Agenda — numbered running order on the brand background. */
const meta = {
  title: 'Templates/Openers/Agenda',
  component: Agenda,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Agenda

Display title, then numbered rows of a large numeral, a bold heading and a
supporting line — on one of the supplied brand background plates.

The plate is real artwork (\`backgrounds/brand-hex\`), not the CSS gradient. The
gradient underneath it *is* a token, sampled from this very plate's corners, but
the hex tessellation over it cannot be reproduced exactly in CSS, so the plate
ships as an asset and \`SlideFrame\` layers content over it.

Rows distribute evenly down the available height instead of sitting on fixed
anchors. This is the one well in the system that flexes vertically, because an
agenda's length is genuinely variable — a 4-item and a 6-item agenda should both
look deliberate.

**Rebuilt from:** \`references/slide-decks/18-34.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Agenda>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 18-34 — the five-part running order. */
export const FivePart: Story = {
  args: {
    eyebrow: 'EventPipe',
    title: 'Agenda',
    items: [
      {
        title: 'Introductions & Collaborative Discussion',
        detail: 'Team introductions and recent updates',
      },
      {
        title: 'EventPipe Platform Overview',
        detail: 'A tour of the tools that make group hotel booking faster and easier than ever',
      },
      {
        title: 'Platform Acceleration Plans',
        detail: 'EventPipe Pay and Partnership/Integration Strategy',
      },
      {
        title: 'Capital Plan',
        detail: 'Investment strategy, growth roadmap, and capital allocation priorities',
      },
      {
        title: 'Wrap Up & Next Steps',
        detail: 'Key takeaways, open discussion, and defined next steps',
      },
    ],
  },
}

/** Three items, to show the rows redistributing rather than bunching at the top. */
export const ThreePart: Story = {
  args: {
    eyebrow: 'EventPipe',
    title: 'Agenda',
    plate: 'backgrounds/brand-arrows',
    items: [
      { title: 'Where we are', detail: 'Platform, traction and the current book of business' },
      { title: 'Where we are going', detail: 'Payments, distribution and ticketing' },
      { title: 'What we need', detail: 'Capital plan and use of funds' },
    ],
  },
}
