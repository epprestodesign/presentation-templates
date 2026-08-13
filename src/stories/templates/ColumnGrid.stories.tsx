import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColumnGrid } from '../../templates/ColumnGrid'

/** TEMPLATES / Column Grid — the general N-across data row, 2 to 5 wide.
 *
 * One story per column count, because the count is what the template actually
 * varies: type step, padding and gutter all move with it, so 3-up and 5-up are
 * two different specimens rather than the same one with an extra cell.
 *
 * EVERY FIGURE HERE IS INVENTED. Story data doubles as the public specimen for
 * this template, so it must be plausible without being anyone's real number.
 */
const meta = {
  title: 'Templates/Data/Column Grid',
  component: ColumnGrid,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Column Grid

Headline block, then 2–5 equal cells, each with a label, a figure, an optional
glyph and one supporting line.

\`columns\` is the primary decision. It drives a density set — type step,
padding, gutter — because a cell is 567px wide at 2-up and 221px at 5-up, and a
68px figure that reads well at the first is past the cell's inner width at the
second. Each part of that set has an escape prop for the slide that needs one.

Cells are guaranteed equal: \`minmax(0, 1fr)\` tracks plus \`min-width: 0\` on
the cells. A bare \`1fr\` is \`minmax(auto, 1fr)\`, which lets one long value
widen its own column.

\`surface\` gives the row three looks — \`muted\` (the #f5f5f5 card),
\`brand\` (the gradient, ink reversed) and \`plain\` (no card, a rule across
each column's top edge). Any cell can override it.
        `,
      },
    },
  },
} satisfies Meta<typeof ColumnGrid>

export default meta
type Story = StoryObj<typeof meta>

/** 2-up. The widest cell the template produces (567px), so it takes the full
 *  `stat` figure at 68px and a 22px label — this is the count that can carry a
 *  sentence-length supporting line without wrapping to four rows. */
export const TwoColumns: Story = {
  args: {
    eyebrow: 'Market',
    pageNumber: 9,
    title: ['Two halves of the same market, ', { accent: 'priced very differently.' }],
    lead: 'Room blocks and ticketed attendance are booked by the same operator in the same week, but only one of them has a live source of truth today.',
    titleWidth: 1000,
    sublabel: 'Addressable volume, 2026',
    columns: 2,
    cells: [
      {
        label: 'Housing & room blocks',
        value: '$6.8B',
        icon: 'hotel',
        note: 'Contracted room nights moving through event organisers each year.',
      },
      {
        label: 'Ticketing & admissions',
        value: '$2.4B',
        icon: 'confirmation_number',
        note: 'Gate and pre-sale volume at the same events, largely still off-platform.',
      },
    ],
  },
}

/** 3-up. The default, and the count most content slides land on. Figure steps
 *  down to `statSm` (44) and the label to 18. */
export const ThreeColumns: Story = {
  args: {
    eyebrow: 'Platform',
    pageNumber: 11,
    title: 'One platform, three jobs it has to do perfectly.',
    lead: 'Every metric below is measured on the live platform across the last four quarters.',
    titleWidth: 980,
    columns: 3,
    cells: [
      {
        label: 'Booking',
        value: '38s',
        icon: 'bolt',
        note: 'Median time from search to a confirmed reservation.',
      },
      {
        label: 'Reconciliation',
        value: '99.2%',
        icon: 'fact_check',
        note: 'Room-night records matching the hotel pickup report without manual repair.',
      },
      {
        label: 'Support',
        value: '2.4h',
        icon: 'support_agent',
        // Deliberately as long as its neighbours: the default `align: 'bottom'`
        // aligns the last line, so a one-line note here would leave this
        // column's figure sitting a line lower than the other two.
        note: 'Median first response during an event weekend, when the volume arrives.',
      },
    ],
  },
}

/** 4-up. Same figure size as 3-up but tighter padding, and the supporting line
 *  is where the count starts to cost you — kept to a clause here rather than a
 *  sentence. Set `value-first` so the figures read as one row across the slide. */
export const FourColumns: Story = {
  args: {
    eyebrow: 'Traction',
    pageNumber: 6,
    title: ['Four quarters of compounding, ', { accent: 'with no change in spend.' }],
    titleWidth: 1000,
    sublabel: 'Trailing twelve months',
    columns: 4,
    order: 'value-first',
    cells: [
      { label: 'Reservations', value: '1.4M', icon: 'event_available', note: 'up from 940K' },
      { label: 'Room nights', value: '3.7M', icon: 'hotel', note: 'up from 2.6M' },
      { label: 'Events hosted', value: '5.2K', icon: 'stadium', note: 'up from 3.9K' },
      { label: 'Active operators', value: '312', icon: 'groups', note: 'up from 214' },
    ],
  },
}

/** 5-up — the count the density table exists for. The cell is 221px wide, so
 *  the figure drops to `statMd` (36), the label to body (15) and the note to
 *  caption (11), and the gutter closes from 16 to 12. Holding the 3-up settings
 *  here would push a five-glyph figure past the cell's inner width.
 *
 *  Notes are two or three words at this width; anything longer wraps to three
 *  lines and the row stops scanning left to right. */
export const FiveColumns: Story = {
  args: {
    eyebrow: 'Operating Model',
    pageNumber: 14,
    title: 'The five numbers we run the business on.',
    lead: 'Reviewed monthly. Every one of them is a ratio rather than a total, so the board reads the same at any size of business.',
    titleWidth: 900,
    sublabel: 'FY26 to date',
    columns: 5,
    order: 'value-first',
    // Shorter well than the default. At 5-up the stack is only ~90px tall, so a
    // 324px card leaves a band of empty fill above the figure that reads as a
    // mistake rather than as air. Still lands on 660 like every other row here.
    top: 380,
    height: 280,
    cells: [
      { label: 'Gross margin', value: '78%', icon: 'percent', note: 'FY26 to date' },
      { label: 'Net retention', value: '118%', icon: 'autorenew', note: 'trailing 12 mo' },
      { label: 'Payback', value: '11 mo', icon: 'schedule', note: 'blended CAC' },
      { label: 'Attach rate', value: '2.7', icon: 'linked_services', note: 'modules per account' },
      { label: 'Rule of 40', value: '46', icon: 'speed', note: 'growth + margin' },
    ],
  },
}

/** The three fills, in one row: `muted`, `brand` and `plain`. The point of the
 *  story is that they are one component — the gradient cell reverses its ink and
 *  the ruled cell drops its horizontal padding so its label sits on the same
 *  text margin as the headline, but all three keep identical width and height.
 *
 *  The fourth cell repeats `plain` so the ruled variant reads as a pair of
 *  columns rather than as one cell that lost its card.
 *
 *  This is also the `align: 'top'` specimen. A ruled column has to hang from
 *  its rule — bottom-aligning it would leave the figure floating in the middle
 *  of nothing — and top-aligned content wants a well sized to it, hence the
 *  shorter `height` here. */
export const Surfaces: Story = {
  args: {
    eyebrow: 'Foundations',
    pageNumber: 'A2',
    title: 'Three fills, one cell.',
    lead: 'The row keeps its geometry whichever surface it is given; only the fill and the ink change.',
    titleWidth: 900,
    columns: 4,
    align: 'top',
    top: 366,
    height: 230,
    cells: [
      {
        label: 'Muted',
        value: '$4.1M',
        icon: 'payments',
        note: 'The default #f5f5f5 card.',
        surface: 'muted',
      },
      {
        label: 'Brand',
        value: '92%',
        icon: 'verified',
        note: 'The gradient, with the ink reversed.',
        surface: 'brand',
      },
      {
        label: 'Plain',
        value: '1.31x',
        icon: 'trending_up',
        note: 'Ruled, no card.',
        surface: 'plain',
      },
      {
        label: 'Plain',
        value: '46 days',
        icon: 'schedule',
        note: 'Ruled, no card.',
        surface: 'plain',
      },
    ],
  },
}
