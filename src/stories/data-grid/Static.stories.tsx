import type { Meta, StoryObj } from '@storybook/react-vite'
import { StaticGrid, type StaticGridProps } from '../../elements/data/StaticGrid'
import { columns, pickupRateColumn, reservations, type Reservation } from './_data'

/** DATA GRID / Static — the grid with every interaction removed, for slides. */
const meta = {
  title: 'Data Grid/Static',
  component: StaticGrid,
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Static

The same MIT Data Grid as **Basics**, with pagination, sorting, filtering, the
column menu, resize handles, hover fills and focus rings all removed. Use this
one on a slide; use **Basics** when mocking a live screen.

### Two props are load-bearing

\`disableVirtualization\` and \`autoHeight\` are not styling choices. The grid
normally renders only the rows in view and recycles the rest as you scroll —
but both export paths rasterise the slide in **headless Chromium, where nothing
ever scrolls**. A virtualised grid therefore exports with blank space where its
off-screen rows should be. Auto height removes the internal scroller for the
same reason: with one, any row past the fold is simply absent from the export.

Row count is consequently the author's problem. \`maxRows\` makes that explicit
and adds a **"+N more rows not shown"** line, because a table that just stops
looks like a defect, whereas one that says what it left out reads as a
deliberate excerpt.

### It exports as a picture

The PowerPoint emitter walks the deck's own table element and emits a **native,
editable Google Slides table**. It cannot do that here — the Data Grid is a live
React component with no table structure the emitter can traverse, so this
exports flat. Right trade for a screenshot of the product; wrong one for a
financial model somebody will want to edit in Slides. For that, use
\`Elements/Data → DataTable\`.
        `,
      },
    },
  },
} satisfies Meta<typeof StaticGrid>

export default meta

/* Typed on the PROPS, not on `typeof meta`.
 *
 * StaticGrid is generic in its row type, and `StoryObj<typeof meta>` reads the
 * component's signature with the generic resolved to its `GridValidRowModel`
 * constraint. A `GridColDef<Reservation>[]` is not assignable to
 * `GridColDef<GridValidRowModel>[]` — `valueGetter` takes the row as a
 * parameter, which makes the column type invariant in it — so every story's
 * `columns` arg failed. Naming the props with the row type pinned fixes it at
 * the one place it is actually decided. */
type Story = StoryObj<StaticGridProps<Reservation>>

/** The default: eight rows, product chrome, remainder noted. */
export const Default: Story = {
  args: {
    rows: reservations,
    columns,
    maxRows: 8,
  },
}

/** Compact density fits about half again as many rows in the same height. */
export const Compact: Story = {
  args: {
    rows: reservations,
    columns,
    maxRows: 12,
    density: 'compact',
  },
}

/** Zebra striping. Off by default — it reads as product UI, and the tinted rows
 *  can fight the brand once the grid is on a slide beside teal. */
export const Zebra: Story = {
  args: {
    rows: reservations,
    columns,
    maxRows: 10,
    zebra: true,
  },
}

/** The 'slide' variant: no outer border, header on brand navy. For a table that
 *  is the subject of the slide rather than a screenshot of the product. */
export const SlideVariant: Story = {
  name: 'Slide variant',
  args: {
    rows: reservations,
    columns: [...columns.slice(0, 5), pickupRateColumn],
    maxRows: 8,
    variant: 'slide',
  },
}

/** Short enough to need no truncation, so no "+N more" line appears. */
export const NoTruncation: Story = {
  name: 'No truncation',
  args: {
    rows: reservations.slice(0, 5),
    columns,
  },
}
