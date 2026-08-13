import type { Meta, StoryObj } from '@storybook/react-vite'
import { Comparison } from '../../templates/Comparison'

/** TEMPLATES / Comparison — the old way on top, EventPipe underneath.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Templates/Data/Comparison',
  component: Comparison,
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
## Comparison

A headline over a two-sided panel: the old way on top in muted grey, the same
journey with EventPipe beneath it on the brand gradient.

**One template, two band variants.** The two reference slides look like
different layouts and are not. Both draw a single 16px-radius panel from the
page margin, split into two equal bands with a hairline of white between them,
muted first and gradient second, with the ink inverted on the second. Both carry
a side label and an ordered run of steps. What differs is only the furniture
around the steps — slide 02 sets them as inline copy separated by a three-dash
rule, slide 13 boxes them in cards under a dotted rail — so that is a
\`variant\` on \`ComparisonBand\` rather than a second template. Splitting them
would have duplicated the panel, the surfaces, the gap and the corner clipping
in order to express a difference in decoration.

The panel is a rounded, clipped column. Bands are square-cornered and know
nothing about where they sit; the panel supplies the outer radius and the
\`gap\` shows the white artboard through as the hairline divider.

The gradient band is \`gradient.brandVertical\`, **not** the 45deg
\`gradient.brand\` the stat cards use. Four-corner sampling on both references
puts the axis 2–3deg off vertical — bright top, dark bottom — and 45deg on a
band 5.6x wider than it is tall reads as a left-to-right wash instead.

Slide 13's figures row is two lines of type rather than \`StatCard\`, because
StatCard locks its label to \`ds-text-h4\` and the reference sets that label at
body weight so it stays one line. A \`labelSize\` prop on StatCard would let it
fold back in.

**Rebuilt from:** \`references/slide-decks/02.png\`, \`13.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Comparison>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 02 — Problem. Five steps of the booking workflow, the old way in
 *  italic grey above and the EventPipe way in white on the gradient below.
 *
 *  Geometry read off the reference with a pixel probe, not estimated: the panel
 *  runs 40 → 1200 with its top at y=269, two 206px bands with a 4px white
 *  hairline between them, and 16px corners (the grey band's bottom corners and
 *  the teal band's top corners are square, which is what the clipped panel
 *  produces). Copy sits 78px down inside each band — deliberately low, not
 *  centred, since only 38px is left below it.
 *
 *  The one intentional deviation: the reference panel ends at x=1200 and this
 *  stops 5px short at 1195, the watermark gutter. A full-width well on a slide
 *  that shows the wordmark holds that gutter, and 5px is not worth a special
 *  case in the system. */
export const OldWayVsEventPipe: Story = {
  args: {
    eyebrow: 'Problem',
    pageNumber: 2,
    // Explicit breaks. The reference splits this headline after "operational"
    // and after "and" — a deliberate three-line shape, not where a 990px
    // column happens to wrap — and Poppins wraps a word earlier than the
    // original face, so left to itself it lands somewhere else.
    title: [
      'The booking looks simple. ',
      { accent: 'Behind it is operational\ncomplexity.' },
      ' Hotels, contracts, pickup, and\ncommissions all have to stay in sync.',
    ],
    titleWidth: 1010,
    top: 269,
    bandHeight: 206,
    bandGap: 4,
    bands: [
      {
        variant: 'inline',
        surface: 'muted',
        // The old way is italic throughout — the deck's tell for "this is the
        // past". A flag on the band, not italic runs in the content, because it
        // applies to every word on the side.
        italic: true,
        // Both labels break after "Organizers" in the reference. Declared, not
        // left to the cell width — see ComparisonBand.module.css for why no
        // single width gets both bands there.
        label: 'Organizers\nOld Way',
        steps: [
          ['From ', { text: 'manually sourcing', bold: true }, ' hotel inventory'],
          ['To ', { text: 'juggling emails and spreadsheets', bold: true }],
          ['To ', { text: 'chasing commissions', bold: true }, ' from hotels'],
          ['To ', { text: 'managing guest lists', bold: true }, ' manually'],
          ['To ', { text: 'limited visibility', bold: true }, ' into reservations'],
        ],
      },
      {
        variant: 'inline',
        surface: 'brand',
        label: 'Organizers\nwith EventPipe',
        steps: [
          ['From ', { text: 'in-app hotel contracting', bold: true }],
          ['To ', { text: 'launching custom booking sites', bold: true }, ' in minutes'],
          ['To ', { text: 'automated commission tracking', bold: true }],
          ['To ', { text: 'centralized guest management', bold: true }],
          ['To ', { text: 'real-time reservation reporting', bold: true }],
        ],
      },
    ],
  },
}

/** Slide 13 — Partnership strategy. Today's four-step drop-off above, the
 *  connected EventPipe journey below, under two KPIs and a partner note.
 *
 *  Same panel, different band interior: a dotted rail carries the side label and
 *  a trailing chevron, and the four steps sit in cards. Measured — 145px bands
 *  with an 8px hairline, a 54px rail, 75px cards on a 4px gap, 8px card corners.
 *
 *  The reference panel sits at x=44 and ends at 1182; this one holds the page
 *  margin and the watermark gutter instead (40 → 1195), which is why the cards
 *  come out ~12px wider than the original. */
export const TodayVsEventPipe: Story = {
  args: {
    eyebrow: 'Partnership Strategy',
    pageNumber: 13,
    // The reference breaks after "event", which no automatic wrap picks — the
    // two halves are too uneven for `text-wrap: balance` to choose it.
    title: ['Put the hotel offer ', { accent: 'where the event\ndecision already happens' }],
    titleWidth: 760,
    lead: 'Today, a fan buys a ticket or an attendee registers, then leaves to find a hotel. EventPipe already manages the contracted inventory. The missing piece is opening that door at the moment of intent.',
    // The lead runs the full width of the slide while the headline breaks at
    // 700px, so the two need separate measures.
    leadWidth: 1140,
    figures: [
      { value: '$20B+', label: 'Annual hotel spend linked to event events' },
      { value: '30%', label: 'Book within 48 hours of ticket purchase' },
    ],
    note: {
      icon: 'handshake',
      title: [
        {
          text: 'POTENTIAL DISTRIBUTION PARTNER IDENTIFIED',
          accent: true,
          bold: true,
          italic: true,
        },
      ],
      body: [
        { text: 'We have found a partner for ticket distribution and are in development.', italic: true },
      ],
    },
    top: 383,
    bandHeight: 145,
    bandGap: 8,
    bands: [
      {
        variant: 'stepped',
        surface: 'muted',
        label: 'Today',
        steps: [
          'Buy Ticket',
          'Leave the platform',
          'Search for a hotel',
          'Lose the contracted event inventory',
        ],
      },
      {
        variant: 'stepped',
        surface: 'brand',
        label: 'With EventPipe',
        steps: [
          'Buy ticket or register',
          'See the event hotel block',
          'Add a room in the same journey',
          'Complete one connected trip',
        ],
      },
    ],
  },
}

/** An empty two-band panel, for picking the template up as a starting point. */
export const Blank: Story = {
  args: {
    eyebrow: 'Section',
    pageNumber: 1,
    title: ['The way it works today. ', { accent: 'The way it works with EventPipe.' }],
    titleWidth: 990,
    bands: [
      {
        variant: 'inline',
        surface: 'muted',
        italic: true,
        label: 'Old way',
        steps: ['First step', 'Second step', 'Third step', 'Fourth step'],
      },
      {
        variant: 'inline',
        surface: 'brand',
        label: 'With EventPipe',
        steps: ['First step', 'Second step', 'Third step', 'Fourth step'],
      },
    ],
  },
}
