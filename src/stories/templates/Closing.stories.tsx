import type { Meta, StoryObj } from '@storybook/react-vite'
import { Closing } from '../../templates/Closing'

/** TEMPLATES / Closing — the thank-you and contact slide. */
const meta = {
  title: 'Templates/Closing',
  component: Closing,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Closing

The last slide of the deck: a thank-you line on the brand gradient, then one
outlined card per person with a circular headshot, name, role and contact lines.
A \`CONFIDENTIAL\` tag sits bottom-left and the white watermark bottom-right —
both from \`SlideFrame\`'s chrome, not from this template.

The cards are \`OutlineCard\`: no fill at all, drawn only by a hairline border at
40% white. That value is measured — the reference border samples rgb(102,195,203)
over a rgb(0,155,169) background, which resolves to alpha 0.40. The card geometry
is measured too: 568x450 at y=177 with a 24px gap, 24px radius, 40px padding, and
a 180px portrait (the \`-lg\` team assets are 360px, exactly 2x).

The background plate is \`backgrounds/brand-hex\` **mirrored**. The reference runs
bright at top-left to deep at bottom-right with its hex tessellation on the right
half, which is that plate reversed — same artwork, flipped. The template draws the
plate itself so it can apply \`scaleX(-1)\`, rather than shipping a second copy of
a 2560px asset.

**Rebuilt from:** \`references/slide-decks/16-sdkfnsd.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Closing>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 16 — Brandon and Todd. */
export const ReachOut: Story = {
  args: {
    eyebrow: 'EventPipe',
    tag: 'CONFIDENTIAL',
    title: 'Thank you! Reach out to us!',
    people: [
      {
        name: 'Brandon Hollmann',
        role: 'Sr. Vice President',
        photo: 'circle/brandon-hollmann-lg',
        shape: 'circle',
        email: 'Brandon@eventpipe.com',
        phone: '512-468-3632',
      },
      {
        name: 'Todd Beckerman',
        role: 'Account Executive',
        photo: 'circle/todd-beckerman-lg',
        shape: 'circle',
        email: 'Todd@eventpipe.com',
        phone: '(402)-202-4072',
      },
    ],
  },
}

/** A third contact line per person, to show the block growing downward inside the
 *  measured card rather than the card being resized to suit it.
 *
 *  The headline stays plain white. An accent run is the deck's usual emphasis, but
 *  on the brand gradient the teal has almost no contrast against its own
 *  background — emphasis on this surface has to come from weight or a line break,
 *  not from colour. */
export const WithLinkedIn: Story = {
  args: {
    eyebrow: 'EventPipe',
    tag: 'CONFIDENTIAL',
    title: 'Thanks — let’s keep going.',
    people: [
      {
        name: 'Brandon Hollmann',
        role: 'Sr. Vice President',
        photo: 'circle/brandon-hollmann-lg',
        shape: 'circle',
        email: 'Brandon@eventpipe.com',
        phone: '512-468-3632',
        linkedin: 'linkedin.com/in/brandonhollmann',
      },
      {
        name: 'Todd Beckerman',
        role: 'Account Executive',
        photo: 'circle/todd-beckerman-lg',
        shape: 'circle',
        email: 'Todd@eventpipe.com',
        phone: '(402)-202-4072',
        linkedin: 'linkedin.com/in/toddbeckerman',
      },
    ],
  },
}
