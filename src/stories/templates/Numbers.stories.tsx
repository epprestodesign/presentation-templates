import type { Meta, StoryObj } from '@storybook/react-vite'
import { Numbers } from '../../templates/Numbers'

/** TEMPLATES / Numbers — growth rates left, absolute figures right. */
const meta = {
  title: 'Templates/Numbers',
  component: Numbers,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Numbers

The traction slide in two voices. Down the left, growth rates as bare arrowed
lines. Down the right, the absolute figures, each in a #f5f5f5 card with the
two-bar comparison that shows where it came from.

The split is the argument: the percentages are the claim, the cards are the
evidence. The left column anchors to the floor of the slide and the cards to its
ceiling, which is what gives the layout its diagonal — and what leaves the
upper-left quiet for the headline.

Each card takes a \`prior\` and a \`current\` bar. Both carry a pre-formatted
\`value\` for reading and a numeric \`amount\` for measuring. \`CompareBars\`
scales the bars off the amounts rather than trusting a drawn height — the
reference's own grey bars sit at 0.57 / 0.65 / 0.68 of their teal partners where
the figures say 0.71 / 0.76 / 0.75, so they were eyeballed, and reproducing that
would understate every gain the slide exists to show.

**Rebuilt from:** \`11-33.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Numbers>

export default meta
type Story = StoryObj<typeof meta>

/** EventPipe by the Numbers — the reference slide.
 *
 *  Reproduced verbatim, including two things the original says that a reader
 *  will notice: "Reservation Made" is singular, and the hotel-bookings figure
 *  ($214M) is not the figure its own current-year bar carries ($248M). */
/**
 *  FIGURES ARE SYNTHETIC. The layout is the real one; the numbers are not,
 *  because story data doubles as this template's public specimen. */
export const ByTheNumbers: Story = {
  args: {
    eyebrow: 'Company Performance',
    pageNumber: 11,
    title: 'Eventpipe by the Numbers',
    stats: [
      { value: '38%+', label: 'new active customers' },
      { value: '43%+', label: 'increase in reservations made' },
      { value: '38%+', label: 'increase in room nights booked' },
      { value: '36%+', label: 'in hotel bookings revenue' },
    ],
    cards: [
      {
        value: '712K',
        label: 'Reservation Made',
        prior: { value: '503K', period: '’23', amount: 464 },
        current: { value: '712K', period: '’24', amount: 650 },
      },
      {
        value: '1.9m',
        label: 'Room Nights Booked',
        prior: { value: '1.4M', period: '’23', amount: 1.3 },
        current: { value: '1.9M', period: '’24', amount: 1.7 },
      },
      {
        value: '$361m',
        label: 'Hotel Bookings',
        prior: { value: '$298M', period: '’23', amount: 283 },
        current: { value: '$412M', period: '’24', amount: 377 },
      },
    ],
  },
}
