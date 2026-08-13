import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataGrid } from '@mui/x-data-grid'
import { columns, pickupRateColumn, reservations } from './_data'

/** DATA GRID / Basics — the Community grid, MIT. */
const meta = {
  title: 'Data Grid/Basics',
  component: DataGrid,
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Basics

\`@mui/x-data-grid\` — MIT. Sorting, filtering, pagination, row selection and
column sizing are all Community features.

**This is for mocking product UI to screenshot, not for putting on a slide.**
For a slide table use \`Elements/Data → DataTable\`, which is static and exports
to an editable Google Slides table. See \`Data Grid/Overview\` for why.
        `,
      },
    },
  },
} satisfies Meta

export default meta

/* Not StoryObj<typeof meta>: `component: DataGrid` makes the grid's own props
   the inferred args type, which would force every render-based story to declare
   a redundant `args`. These stories compose the grid inside a sized wrapper
   instead, since the grid needs a bounded height to virtualise against. */
type Story = StoryObj

const FRAME = { style: { height: 480, width: '100%' } }

export const Default: Story = {
  render: () => (
    <div {...FRAME}>
      <DataGrid rows={reservations} columns={columns} />
    </div>
  ),
}

/** Paginated, which is how a real screen would show 60+ reservations. */
export const Pagination: Story = {
  render: () => (
    <div {...FRAME}>
      <DataGrid
        rows={reservations}
        columns={columns}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  ),
}

/** Checkbox selection, for bulk actions like a reservation edit. */
export const Selection: Story = {
  render: () => (
    <div {...FRAME}>
      <DataGrid
        rows={reservations}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </div>
  ),
}

/** A derived column. `valueGetter` computes it and `valueFormatter` presents it —
 *  keeping the raw numbers sortable rather than sorting formatted strings. */
export const DerivedColumn: Story = {
  render: () => (
    <div {...FRAME}>
      <DataGrid
        rows={reservations}
        columns={[...columns.slice(0, 5), pickupRateColumn, ...columns.slice(5)]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: 'pickupRate', sort: 'desc' }] },
        }}
      />
    </div>
  ),
}

/** Density and a quick-filter toolbar — both Community. */
export const CompactWithFilter: Story = {
  render: () => (
    <div {...FRAME}>
      <DataGrid
        rows={reservations}
        columns={columns}
        density="compact"
        showToolbar
        initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
      />
    </div>
  ),
}

/** Loading and empty states, which a mock usually needs alongside the happy path. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ font: '600 13px/1.6 Poppins, sans-serif', marginBottom: 6 }}>Loading</div>
        <div style={{ height: 240 }}>
          <DataGrid rows={[]} columns={columns} loading />
        </div>
      </div>
      <div>
        <div style={{ font: '600 13px/1.6 Poppins, sans-serif', marginBottom: 6 }}>Empty</div>
        <div style={{ height: 240 }}>
          <DataGrid rows={[]} columns={columns} />
        </div>
      </div>
    </div>
  ),
}
