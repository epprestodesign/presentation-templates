import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataGridSlide, type DataGridSlideProps } from '../../templates/DataGridSlide'
import { columns, pickupRateColumn, reservations, type Reservation } from '../data-grid/_data'

/** TEMPLATES / Data / Data Grid — a product screen on a slide. */
const meta = {
  title: 'Slide Data/Data Grid',
  component: DataGridSlide,
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
## Data Grid

A headline block over a real MUI X Data Grid, stripped of every interactive
affordance. This is how a product screen gets onto a slide without anybody
rebuilding the table by hand — or pasting a screenshot that goes stale the next
time the UI changes.

### Which table template to reach for

**This one, when the subject is the software.** "Here is what an ops manager
sees on a Monday." It should look like PipeSights, column chrome and all.

**Tint Table or Financial Table, when the subject is the data.** Those are built
from the deck's own table element, which the PowerPoint emitter turns into a
**native, editable Google Slides table**. This template exports as a flat
picture — the Data Grid is a live React component with no table structure the
emitter can walk. Right trade for a screenshot of a product; wrong one for a
model somebody will want to edit in Slides.

### Height is the author's problem

The grid runs at auto height, so its extent is row count x row height — and row
height nearly doubles between compact and comfortable. A fixed default cannot
work: 8 rows fits at compact and overruns the artboard by two at standard.

So **\`maxRows\` defaults to whatever fits**, computed from the density, the
grid's top anchor and whether there is a caption, against header and row heights
measured off the rendered grid. Everything past that gets a "+N more rows not
shown" line rather than silently running off the slide. Pass \`maxRows\`
explicitly to show fewer.
        `,
      },
    },
  },
} satisfies Meta<typeof DataGridSlide>

export default meta

/* Typed on the props with the row type pinned — see the note in
   Data Grid/Static for why `StoryObj<typeof meta>` does not work here. */
type Story = StoryObj<DataGridSlideProps<Reservation>>

/** The product screen, as an ops manager sees it. */
export const ReservationManager: Story = {
  name: 'Reservation manager',
  args: {
    eyebrow: 'Platform',
    pageNumber: 12,
    title: [{ text: 'One list for ' }, { text: 'every room block', accent: true }],
    lead: 'Reservations across every event, hotel and city — filtered, sorted and reconciled in one place instead of across a dozen spreadsheets.',
    rows: reservations,
    columns,
    caption: 'PipeSights — Reservations. Figures illustrative.',
  },
}

/** Compact density — nine rows fit where standard takes six. */
export const DenseList: Story = {
  name: 'Dense list',
  args: {
    eyebrow: 'Platform',
    pageNumber: 13,
    title: 'Volume at a glance',
    titleSize: 'h2',
    lead: 'Compact density fits half again as many rows in the same height.',
    rows: reservations,
    columns,
    density: 'compact',
    zebra: true,
  },
}

/** The 'slide' grid variant — brand-navy header, no outer border — for when the
 *  table is the subject rather than a screenshot of the product. */
export const PickupByEvent: Story = {
  name: 'Pickup by event',
  args: {
    eyebrow: 'Performance',
    pageNumber: 14,
    title: [{ text: 'Pickup against ' }, { text: 'contracted block', accent: true }],
    titleSize: 'h2',
    rows: reservations,
    columns: [...columns.slice(0, 5), pickupRateColumn],
    gridVariant: 'slide',
    caption: 'Pickup % is derived, not stored — block size against rooms actually picked up.',
  },
}
