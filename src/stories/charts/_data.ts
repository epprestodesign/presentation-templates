/* Shared demo data for the Charts pages.
 *
 * Deliberately EventPipe-shaped — room nights, booking volume, product mix,
 * event categories — rather than "Series A / Series B". A chart catalogue is
 * read to answer "would this work for my slide?", and abstract sample data
 * makes that judgement harder than it needs to be.
 *
 * Figures are illustrative, not the real book of business.
 */

export const YEARS = ['2021', '2022', '2023', '2024', '2025']
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

/** Total revenue, USD thousands — the shape used on the core-business slide. */
export const revenue = [610, 940, 1610, 2750, 4480]

/** Revenue split by product line, for stacks and areas. */
export const byProduct = {
  reservationFees: [420, 620, 1000, 1720, 2700],
  transaction: [140, 240, 450, 780, 1310],
  payments: [50, 80, 160, 250, 470],
}

/** Room nights booked, millions. */
export const roomNights = [0.5, 0.7, 1.0, 1.4, 1.9]

/** Bookings by event category, for pie and radar. */
export const byCategory = [
  { label: 'Youth sports', value: 41 },
  { label: 'Citywide events', value: 22 },
  { label: 'Festivals', value: 16 },
  { label: 'Conferences', value: 12 },
  { label: 'Esports', value: 9 },
]

/** Average daily rate against room nights, for scatter. */
export const rateVsVolume = [
  { x: 129, y: 210, id: 'Regional' },
  { x: 148, y: 320, id: 'State' },
  { x: 165, y: 480, id: 'National' },
  { x: 189, y: 610, id: 'Championship' },
  { x: 212, y: 720, id: 'Citywide' },
  { x: 241, y: 880, id: 'Marquee' },
  { x: 268, y: 1020, id: 'Flagship' },
]

/** Operational scores 0–100, for radar. */
export const operationalScores = {
  metrics: ['Fill rate', 'Attach rate', 'On-time pickup', 'Support SLA', 'Retention'],
  eventpipe: [88, 72, 94, 91, 96],
  manual: [54, 21, 63, 48, 71],
}

/** A short run for sparklines. */
export const trend = [12, 15, 14, 18, 22, 21, 27, 31, 30, 36]

/** Formats thousands the way the deck's axes do. */
export const thousands = (v: number | null) =>
  v === null ? '' : v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)

export const usd = (v: number | null) => (v === null ? '' : `$${v.toLocaleString()}`)
