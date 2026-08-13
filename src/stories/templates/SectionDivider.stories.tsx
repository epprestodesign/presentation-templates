import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionDivider } from '../../templates/SectionDivider'

/** TEMPLATES / Section Divider — the slide that announces a new part of the deck.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Templates/Section Divider',
  component: SectionDivider,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible. Styles pages keep the
    // responsive default instead.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Section Divider

Label, big title, optional supporting line — on the brand plate, or on a white
card laid over it.

Copy centres itself inside whichever box it is in (the panel rect, or the
slide's margins), because a divider has no body content below it to align a
fixed headline anchor against.

**Rebuilt from:** \`references/slide-decks/20.png\` (the bare plate, which ships
as the \`backgrounds/brand-hex\` asset) and \`19.png\` (the white panel over it).
        `,
      },
    },
  },
} satisfies Meta<typeof SectionDivider>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 20 — the plate itself, plus the copy it exists to carry.
 *
 *  20.png is the clean background artwork with nothing on it, so the geometry
 *  being rebuilt here is the plate: full bleed, hexagons reading out of the
 *  dark left-hand end of the gradient. The copy is the divider's own. */
export const OnBrand: Story = {
  args: {
    eyebrow: 'Investor Presentation',
    pageNumber: 12,
    label: 'Section 03',
    title: ['Platform acceleration — ', { accent: 'where the next dollar goes.' }],
    lead: 'Payments, distribution and AI, layered on the operating system live events already run on.',
    width: 860,
  },
}

/** Slide 19 — the white card over the plate.
 *
 *  Rect measured off the reference: top / right / bottom inset 20, a 24px arc
 *  on the right-hand corners, and the left edge bleeding off the artboard. The
 *  chrome is off because the card covers all four corners it would occupy —
 *  white ink on a white card is the failure this variant invites, so the
 *  divider states its section in the copy stack instead. */
export const WhitePanel: Story = {
  args: {
    watermark: false,
    panel: true,
    label: 'Section 04',
    title: ['Capital plan'],
    lead: 'Investment strategy, growth roadmap, and where the round is allocated.',
    width: 820,
  },
}

/** A one-line divider, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Section',
    pageNumber: 1,
    label: 'Section 01',
    title: 'Section title goes here.',
  },
}
