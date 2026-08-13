/* Demo rows for the Data Grid pages — a plausible EventPipe reservation list.
 *
 * Real-shaped columns (event, hotel, room block, pickup, rate) rather than
 * lorem, because the point of this section is judging whether the grid fits an
 * actual PipeSights screen. Names and figures are invented.
 */
import type { GridColDef } from '@mui/x-data-grid'

export interface Reservation {
  id: number
  event: string
  hotel: string
  city: string
  blockSize: number
  pickup: number
  rate: number
  arrival: string
  status: 'Confirmed' | 'Pending' | 'Waitlist' | 'Cancelled'
}

const EVENTS = [
  'Midwest Classic',
  'Spring Invitational',
  'National Championship',
  'Coastal Cup',
  'Summer Showcase',
  'Winter Open',
]
const HOTELS = [
  'Hyatt Place Downtown',
  'Courtyard Riverfront',
  'Hilton Garden Inn',
  'Residence Inn North',
  'Embassy Suites Central',
  'Marriott Convention',
]
const CITIES = ['Indianapolis', 'Orlando', 'Phoenix', 'Nashville', 'Denver', 'Dallas']
const STATUSES: Reservation['status'][] = ['Confirmed', 'Pending', 'Waitlist', 'Cancelled']

/** Deterministic so the grid does not reshuffle between renders — a story that
 *  changes on every reload cannot be diffed or reviewed. */
export const reservations: Reservation[] = Array.from({ length: 60 }, (_, i) => {
  const blockSize = 20 + ((i * 17) % 180)
  return {
    id: i + 1,
    event: EVENTS[i % EVENTS.length],
    hotel: HOTELS[(i * 3) % HOTELS.length],
    city: CITIES[(i * 5) % CITIES.length],
    blockSize,
    pickup: Math.round(blockSize * (0.42 + ((i * 7) % 50) / 100)),
    rate: 119 + ((i * 13) % 160),
    arrival: `2026-0${1 + (i % 9)}-${String(1 + ((i * 11) % 27)).padStart(2, '0')}`,
    status: STATUSES[i % STATUSES.length],
  }
})

export const columns: GridColDef<Reservation>[] = [
  { field: 'event', headerName: 'Event', flex: 1, minWidth: 170 },
  { field: 'hotel', headerName: 'Hotel', flex: 1.2, minWidth: 200 },
  { field: 'city', headerName: 'City', width: 130 },
  { field: 'blockSize', headerName: 'Block', type: 'number', width: 90 },
  { field: 'pickup', headerName: 'Pickup', type: 'number', width: 100 },
  {
    field: 'rate',
    headerName: 'Rate',
    type: 'number',
    width: 100,
    valueFormatter: (value: number) => `$${value}`,
  },
  { field: 'arrival', headerName: 'Arrival', width: 120 },
  { field: 'status', headerName: 'Status', width: 130 },
]

/** Pickup as a share of the block — used by the value-getter demo. */
export const pickupRateColumn: GridColDef<Reservation> = {
  field: 'pickupRate',
  headerName: 'Pickup %',
  type: 'number',
  width: 110,
  valueGetter: (_value, row) => Math.round((row.pickup / row.blockSize) * 100),
  valueFormatter: (value: number) => `${value}%`,
}
