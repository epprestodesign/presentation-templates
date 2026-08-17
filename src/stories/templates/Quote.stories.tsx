import type { Meta, StoryObj } from '@storybook/react-vite'
import { Quote } from '../../templates/Quote'

/** TEMPLATES / Quote — a testimonial or pull quote, light or on the brand plate.
 *
 * Every quote, name, role and company below is INVENTED and reads as
 * illustrative. Replace them with a real, attributable quote before a deck goes
 * to a customer — a testimonial slide is a claim, not a layout.
 */
const meta = {
  title: 'Narrative/Quote',
  component: Quote,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Quote

One sentence somebody else said, at size, with the attribution beneath it: a
customer testimonial, a partner's line in a QBR, the sentence from an onboarding
call that explains the product better than the product page does.

The quote is \`RichText\`, so the clause that carries the argument can be set in
the brand teal on a light slide. Do **not** do that on the brand variant — teal on
teal is invisible, and \`accentWarm\` is the token that exists for stressing a word
against the gradient.

Attribution defaults to a **monogram**, not a headshot. A testimonial with a face
on it makes a much stronger claim than one with initials, so the template does not
make it easy to attach a real photograph to illustrative copy. \`photo\` takes an
imagery name and should carry a real person who really said the thing.

The copy stack is built inside the template rather than with \`SlideHeading\`,
which cannot set a headline on a dark surface: its \`onDark\` flag reaches the lead
but not the title, so a quote on the brand plate would render black on teal.
        `,
      },
    },
  },
} satisfies Meta<typeof Quote>

export default meta
type Story = StoryObj<typeof meta>

/** A housing-partner testimonial for a sales or QBR deck.
 *
 *  The accent run is on the clause that IS the argument — that the block, the
 *  payments and the reconciliation stopped being three systems — rather than on
 *  the whole sentence, which would flatten it back to one colour. */
export const HousingPartner: Story = {
  args: {
    eyebrow: 'Customer',
    pageNumber: 14,
    quote: [
      'We used to run a tournament out of ',
      { accent: 'four spreadsheets and a shared inbox' },
      '. Now the block, the payments and the reconciliation are the same record — and my coordinators stopped working Sundays in March.',
    ],
    attribution: {
      name: 'Danielle Prewitt',
      role: 'Director of Housing',
      company: 'Northgate Sports Travel',
    },
  },
}

/** The same template on the brand plate, for the one quote in a deck that should
 *  stop the reader.
 *
 *  Short enough for `display`, centred, and with no accent run — the gradient is
 *  already carrying the emphasis, and a teal clause on teal would disappear. */
export const BrandPullQuote: Story = {
  args: {
    surface: 'brand',
    align: 'center',
    size: 'display',
    width: 1000,
    left: 140,
    top: 168,
    eyebrow: 'Why It Matters',
    quote: 'Nobody remembers the booking site. Everybody remembers the room that was not there.',
    attribution: {
      name: 'Marcus Ovalle',
      role: 'Tournament Director',
      company: 'Cardinal Peak Events',
    },
  },
}

/** The brand pull quote run LEFT TO RIGHT instead of stacked.
 *
 *  Same copy, `layout: 'split'`. The quote takes a flexible column and the
 *  attribution a fixed one beside it, centred against each other — which is worth
 *  having because the stacked version of a short quote leaves a visible hole under
 *  the credit, and because an attribution beside the sentence reads as a source
 *  rather than as a footnote to it.
 *
 *  `align` drops back to left. Centred text inside a narrowed column is the one
 *  combination this layout cannot carry: the ragged left edge stops the quote and
 *  its credit sharing a spine, which is the only thing holding the row together.
 *
 *  Note the size drop, `display` → `h1`. The copy column is ~300px narrower here,
 *  so the sentence that set on two lines stacked would set on four — and a pull
 *  quote that wraps four times has stopped being a pull quote. Any story moving to
 *  `split` should expect to spend one step of the type scale on it. */
export const BrandPullQuoteSplit: Story = {
  name: 'Brand pull quote – side by side',
  args: {
    ...BrandPullQuote.args,
    layout: 'split',
    align: 'left',
    size: 'h1',
    width: 1100,
    left: 60,
    top: 210,
    attributionWidth: 280,
  },
}

/** A longer quote from an internal deck — the support read-out at an all-hands.
 *
 *  Dropped to `h2` because the sentence runs past thirty words; at `h1` it takes
 *  five lines and stops reading as a quote. The rule and monogram carry the
 *  attribution without a photograph, which is right for an internal slide about
 *  a customer who has not agreed to be a reference. */
export const InternalReadOut: Story = {
  args: {
    eyebrow: 'Support Read-Out',
    pageNumber: 19,
    tag: 'INTERNAL',
    size: 'h2',
    width: 940,
    top: 176,
    quote: [
      'The thing that changed our week was not a feature. It was that ',
      { accent: 'pickup stopped being a question' },
      ' — I open one screen on Monday and I already know which two hotels we are going to have a conversation about on Thursday.',
    ],
    attribution: {
      name: 'Renée Castellanos',
      role: 'Housing Operations Manager',
      company: 'Harbor Row Housing Group',
    },
  },
}
