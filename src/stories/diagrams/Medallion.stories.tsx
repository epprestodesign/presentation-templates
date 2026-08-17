import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Medallion } from '../../diagrams/Medallion'

/** DIAGRAMS / Medallion — tiers of the same dataset at rising quality. */
const meta = {
  title: 'Diagrams/Medallion',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Medallion

Each column is one tier of the *same* dataset — what it holds, who writes it, what
one row actually is — and the arrows over the top are promotions between adjacent
tiers. Reach for [Architecture](/docs/diagrams-architecture--docs) when the
subject is which components talk to which; reach for this when the subject is that
bronze, silver and gold are three states of one thing.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens.

### Departure 1 — promotions are orthogonal staples, not cubic arcs

Upstream draws each promotion as a cubic Bézier over the tier strip. A curve is a
lovely answer to the label problem — the label floats in the space the arc
encloses — but this deck's connector rule is orthogonal-only, and a Bézier
connector is exactly what that rule exists to prevent. The staple keeps the
property that made the arc work (the label sits *inside* the connector, on open
canvas, never on it) using axis-aligned segments and the same quarter-arc corners
\`elbow()\` uses.

The staple also fixes something the arc got wrong. Upstream chains its arcs at a
shared joint — promotion *k* ends where *k+1* begins, both at the tier's
top-centre. Two staples meeting at one x would run their vertical legs on top of
each other, which is the *no overlapping connectors* rule. So the legs are inset
from centre: out of the right of one tier, into the left of the next. It also
reads better, because now it has a direction.

### Departure 2 — field values wrap by declaration

Upstream wraps long values in an HTML \`<div>\` inside a \`<foreignObject>\`. That
renders in Chromium and is the first thing to break in an SVG export path — and
this deck has one. A value that needs two lines is declared as two strings.

### Rules kept

- **3–6 tiers.** Above six the columns are too narrow to hold a field value.
- **Exactly one focal tier**, and the promotion *into* it is promoted to accent
  automatically. The focal tier is the argument of the slide, so the arrow that
  produces it belongs to that argument.
- **Promotions are adjacent-only.** A tier that needs an input from two tiers back
  is a data-flow diagram, not a medallion.
- **Field rows line up across tiers**, so the reader can read one row sideways
  ("who writes each tier?") as well as one card downwards.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The warehouse slide: how a booking webhook becomes the number in the report.
 *
 *  The focal tier is gold, because the whole point of the slide is that the
 *  pickup report is a *derived* artefact and everything upstream of it is
 *  plumbing the reader should stop arguing about. */
export const BookingsToPickup: Story = {
  name: 'Bookings to pickup',
  args: {
    eyebrow: 'Data Platform',
    pageNumber: 30,
    title: ['The pickup report is ', { accent: 'the last tier, not the first.' }],
    lead: 'A booking webhook lands three times, gets deduped into one stay, and is aggregated into the number an operator actually reads. Each tier is the same reservation at a different grain.',
    footnote:
      'Tier and job names are illustrative for this template. Retention windows are policy, not defaults.',
    children: ({ width, height }) => (
      <Medallion
        width={width}
        height={height}
        tiers={[
          {
            name: 'Bronze',
            store: 'raw_booking_events',
            style: 'outer',
            fields: [
              { label: 'Written by', value: 'Ingest worker' },
              { label: 'Shape', value: ['JSON events', 'append-only, never edited'] },
              { label: 'One row is', value: 'One webhook delivery' },
            ],
            example: {
              label: 'One reservation looks like',
              lines: ['3 near-identical PATCH events', 'no hotel key, no dedupe'],
            },
          },
          {
            name: 'Silver',
            store: 'reconciled_stays',
            fields: [
              { label: 'Written by', value: 'Reconciliation job' },
              { label: 'Shape', value: ['Typed tables', 'rebuilt nightly'] },
              { label: 'One row is', value: 'One room night' },
            ],
            example: {
              label: 'One reservation looks like',
              lines: ['1 stay across 3 nights', 'hotel and block resolved'],
            },
          },
          {
            name: 'Gold',
            store: 'pickup_report',
            focal: true,
            fields: [
              { label: 'Written by', value: 'Reporting job' },
              { label: 'Shape', value: ['Aggregates', 'versioned by snapshot date'] },
              { label: 'One row is', value: 'One block, one day' },
            ],
            example: {
              label: 'One reservation looks like',
              lines: ['part of a pickup number', 'the figure in the report'],
            },
          },
          {
            name: 'Archive',
            store: 'cold_stays',
            style: 'cold',
            fields: [
              { label: 'Written by', value: 'Lifecycle policy' },
              { label: 'Shape', value: ['Immutable, compressed', 'restore on request'] },
              { label: 'One row is', value: 'Unchanged from silver' },
            ],
            example: {
              label: 'One reservation looks like',
              lines: ['whatever silver held', 'past the retention line'],
            },
          },
        ]}
        promotions={[
          { label: 'Dedupe' },
          { label: 'Aggregate' },
          { label: 'Age out', style: 'lifecycle' },
        ]}
      />
    ),
  },
}

/** Three tiers, no worked example, and the focal at the far end.
 *
 *  Same component, different shape: dropping the example section gives the field
 *  rows the space back rather than leaving a gap, which is what "layout is
 *  derived" is actually for. */
export const RateLineage: Story = {
  name: 'Rate lineage',
  args: {
    eyebrow: 'Data Platform',
    pageNumber: 31,
    title: ['Three rates per room, and ', { accent: 'only one of them is money.' }],
    lead: 'The contracted rate, the rate a team was shown, and the rate the folio actually settled at. Disputes are almost always a mismatch between the second and the third.',
    footnote: 'Table names are illustrative for this template.',
    /* Three tiers with no worked example carry less content than four with one,
       so the well is shortened rather than letting the cards stretch. */
    wellBottom: 592,
    children: ({ width, height }) => (
      <Medallion
        width={width}
        height={height}
        tiers={[
          {
            name: 'Contracted',
            store: 'rate_agreements',
            style: 'outer',
            fields: [
              { label: 'Written by', value: 'Housing operator' },
              { label: 'Source of truth', value: ['The signed contract', 'one per hotel per block'] },
              { label: 'One row is', value: 'A hotel, a date range, a rate' },
            ],
          },
          {
            name: 'Published',
            store: 'rates_live',
            fields: [
              { label: 'Written by', value: 'Rate service' },
              { label: 'Source of truth', value: ['Contracted plus overrides', 'taxes and fees resolved'] },
              { label: 'One row is', value: 'A date, a room type, a price' },
            ],
          },
          {
            name: 'Settled',
            store: 'rates_charged',
            focal: true,
            fields: [
              { label: 'Written by', value: 'Reconciliation job' },
              { label: 'Source of truth', value: ['The hotel folio', 'what the guest was charged'] },
              { label: 'One row is', value: 'One stay, one amount' },
            ],
          },
        ]}
        promotions={[{ label: 'Apply overrides' }, { label: 'Match folio' }]}
      />
    ),
  },
}
