import type { Meta, StoryObj } from '@storybook/react-vite'
import { FinancialTable } from '../../templates/FinancialTable'

/** TEMPLATES / Financial Table — the model table. */
const meta = {
  title: 'Templates/Financial Table',
  component: FinancialTable,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Financial Table

Headline, a lead that says what the numbers mean, then a nine-column model
table: teal period headings, a highlighted #f5f5f5 block holding the two lines
the audience should leave with, and grey detail rows underneath.

The deck's one deliberately dense slide. Everything else is built to be read
from the back of the room; this is built for the person who came to check the
arithmetic — which is why it is the only template that drops to body size.

Three things it takes over from the author:

- **Negatives come out in parentheses.** Cells are passed as *numbers* and the
  grid formats them, so \`-32\` renders \`($32)\`. Ninety hand-typed cells is
  ninety chances to type \`-$32\` once.
- **Thousands separators.** Done without \`Intl\`, so a trimmed-ICU build of
  headless Chromium cannot silently render \`1440\`.
- **Column formats.** The last column is a variance percentage on every row
  regardless of whether that row's figures are dollars or unit counts, so it is
  declared once on the table rather than per row.

Pass a string instead of a number for anything the formatter should not be
guessing at, and \`null\` for a period with no figure — it prints the en dash
the reference uses.

**Rebuilt from:** \`345.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof FinancialTable>

export default meta
type Story = StoryObj<typeof meta>

/** Bookings & revenue by product — the reference slide.
 *
 *  Nine columns: six periods, then the variance group. The white channel and
 *  the split it reads as come from `groupAfter: 6`. */
export const BookingsAndRevenue: Story = {
  args: {
    eyebrow: 'Company Performance',
    pageNumber: 12,
    title: 'Bookings & Revenue by Eventpipe Product',
    lead: [
      'Bookings are projected to ',
      { text: 'grow significantly from 2024 to 2025', bold: true, underline: true },
      ', driven by strong enterprise momentum and modeled on three fully ramped reps with ',
      { text: '$600K quotas at an 80% discount', bold: true, underline: true },
      '. Revenue also grows year-over-year, with ',
      { text: '$600K in 2025 attributed to new product lines', bold: true, underline: true },
      '. ',
      { text: 'EBITDA improves by $1.2M, reaching -$1.5M in 2025', bold: true, underline: true },
      '.',
    ],
    // Narrower than the template's default so the lead breaks onto four lines
    // as the reference does; at 1000 it collapses to three and opens a hole
    // above the table.
    titleWidth: 940,
    headers: [
      'Figures in thousands (USD $000s)',
      '2024A',
      'Q1 2025',
      'Q2 2025',
      'Q3 2025',
      'Q4 2025',
      '2025B',
      'B/(W) $',
      'B/(W) %',
    ],
    groupAfter: 6,
    // Whatever a row's own unit is, the last column is always a variance
    // percentage — declared once here rather than eight times below.
    columnFormats: [null, null, null, null, null, null, null, 'percent'],
    summaryRows: [
      { label: 'Bookings', format: 'number', cells: [971, 432, 288, 432, 288, 1440, 469, 48] },
      { label: 'Total Revenue', format: 'currency', cells: [2088, 357, 445, 692, 2513, 4009, 1921, 92] },
    ],
    rows: [
      { label: 'Subscription', format: 'currency', cells: [525, 138, 138, 138, 138, 551, 26, 5] },
      { label: 'Booking fees', format: 'currency', cells: [957, 98, 163, 326, 1518, 2104, 1148, 120] },
      { label: 'EP+', format: 'currency', cells: [41, 11, 8, 6, 1, 26, -15, -37] },
      // A product with no revenue in a period gets null, not a zero: the
      // reference prints a dash, because "we had not shipped it yet" and "we
      // shipped it and sold nothing" are different statements.
      { label: 'Presto', format: 'currency', cells: [null, null, 15, 44, 224, 284, 284, null] },
      { label: 'Booking protection', format: 'currency', cells: [478, 73, 84, 124, 433, 714, 236, 49] },
      { label: 'Teams Mgmt', format: 'currency', cells: [null, 9, 30, 60, 222, 321, 321, null] },
      { label: 'Professional services', format: 'currency', cells: [120, 30, 10, null, null, 40, -80, -67] },
      { label: 'Customer refunds', format: 'currency', cells: [-32, -2, -3, -5, -23, -33, -1, 3] },
    ],
  },
}
