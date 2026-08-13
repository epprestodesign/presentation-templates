import type { Meta, StoryObj } from '@storybook/react-vite'
import { Statement } from '../../templates/Statement'

/** TEMPLATES / Statement — the closing slide.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Templates/Closing/Statement',
  component: Statement,
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
## Statement

One sentence at display size on the brand plate, a supporting paragraph, and a
row of labelled contact columns along the floor — with the horizontal lockup
opposite them.

This is the only template that renders a logo itself. Every other slide takes
the rotated watermark from \`SlideChrome\`; the sign-off slide sets the mark
horizontally at size, so stories pass \`watermark: false\` and let the lockup
take the corner.

**Rebuilt from:** \`references/slide-decks/18.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Statement>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 18 — the closing statement.
 *
 *  Chrome is the reference's own: the section label top-left, the deck date in
 *  the page-number slot (a string, so it prints as written rather than being
 *  zero-padded), and CONFIDENTIAL bottom-left. The rotated watermark is off
 *  because the horizontal lockup takes that corner — measured at 228px wide,
 *  right edge on the 40px page margin.
 *
 *  Anchors measured off the reference: statement cap-top at y = 136, contact
 *  row at y = 486, contact columns at x = 40 and x = 435.
 *
 *  The statement carries an explicit break rather than trusting the column
 *  width to wrap it after "built." — a closing line is read as two beats, and
 *  where it divides is content, not a consequence of the measure. */
export const ClosingStatement: Story = {
  args: {
    eyebrow: 'Investor Presentation',
    pageNumber: 'AUG 2026',
    tag: 'Confidential',
    watermark: false,
    title: 'The booking layer is built.\nNow we monetize the rails.',
    lead: 'EventPipe already powers the workflow and the volume. This Series A scales payments, distribution, and AI on top of the operating system live events already use.',
    contacts: [
      { label: 'Contacts', value: 'dante@eventpipe.com' },
      { label: 'Website', value: 'www.eventpipe.com' },
    ],
  },
}

/** Three contact columns rather than two, which is what the column grid is
 *  for: the row re-pitches itself instead of needing a third absolute box.
 *
 *  Note what is NOT here — a teal accent run. The deck's usual trick of
 *  setting the emphasis clause in `accent` needs a light surface behind it; on
 *  the brand plate the teal all but disappears, so a statement carries its
 *  emphasis in the line break instead. */
export const ThreeContacts: Story = {
  args: {
    eyebrow: 'Investor Presentation',
    pageNumber: 'AUG 2026',
    tag: 'Confidential',
    watermark: false,
    title: 'The booking layer is built.\nNow we monetize the rails.',
    lead: 'EventPipe already powers the workflow and the volume. This Series A scales payments, distribution, and AI on top of the operating system live events already use.',
    contacts: [
      { label: 'Contacts', value: 'dante@eventpipe.com' },
      { label: 'Website', value: 'www.eventpipe.com' },
      { label: 'Deck', value: 'eventpipe.com/series-a' },
    ],
  },
}

/** A statement with no contact row — the mid-deck version, where the slide is
 *  a pause rather than a sign-off. */
export const Blank: Story = {
  args: {
    eyebrow: 'Section',
    pageNumber: 1,
    title: 'The one sentence this section has to land.',
    lead: 'One or two supporting lines underneath it.',
    // No sign-off here, so the deck's usual rotated watermark takes the corner.
    logo: false,
  },
}
