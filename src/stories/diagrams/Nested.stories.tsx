import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Nested } from '../../diagrams/Nested'

/** DIAGRAMS / Nested — containment, on a slide. */
const meta = {
  title: 'Diagrams/Nested',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Nested containment

Rings inside rings. The type to reach for when the relationship is **A contains
B**, not *A calls B*: scope cascades, blast radius, trust zones — and the one
this deck needs most often, an event containing blocks containing reservations
containing room nights.

Outer is broader, inner is more specific, and the innermost ring is the atom the
whole figure is really about. If the levels aren't genuinely nested, this is the
wrong type: peers are [Architecture](/?path=/docs/diagrams-architecture--docs),
and strata are [Layer Stack](/?path=/docs/diagrams-layer-stack--docs).

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Layout is derived

Every ring is the previous one inset by \`(padX, padY)\`, so adding a level
re-flows the whole figure instead of needing five new rectangles. Stroke and fill
ramp inward from depth alone — a 3-level and a 5-level figure both run faint →
ink with no per-story tuning.

### Two departures from upstream

- **\`padX\` > \`padY\`** (48 / 28, against upstream's 24–32 / 32–36). The well is
  1155×380 — roughly 3:1 — so equal insets would drive the innermost ring to 5:1
  and the figure would read as stacked bands rather than containment.
- **An optional aside column.** A ring block filling 1155px has to be four levels
  deep before it looks composed, so \`notes\` puts up to two annotations in a
  reserved right-hand column — *outside* the rings, because upstream is explicit
  that content inside a ring which isn't part of the hierarchy belongs in a
  sibling diagram.

### The focal rule

Exactly one level carries \`focal\`, and it should be the innermost. Accent on two
rings collapses the hierarchy it exists to rank.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Four levels, focal on the atom.
 *
 *  The argument is that every reported number is the innermost ring rolled up, so
 *  the innermost ring is the only one carrying a figure — the other three exist to
 *  show what it is nested in. */
export const EventContainment: Story = {
  name: 'What an event contains',
  args: {
    eyebrow: 'Data Model',
    pageNumber: 20,
    title: ['Every number we report is ', { accent: 'a room night.' }],
    lead: 'Pickup, attrition and commission are not separate datasets. They are the innermost ring of this figure, rolled up — which is why an operator can correct one reservation and every total above it moves in the same refresh.',
    footnote:
      'Illustrative figures for a single event. Registration, ticketing and travel reference the event by id and sit outside the containment.',
    children: ({ width, height }) => (
      <Nested
        width={width}
        height={height}
        levels={[
          { label: 'Event', note: 'Spring Cup · 412 teams' },
          { label: 'Room block', note: '9 hotels · 1,840 rooms' },
          { label: 'Reservation', note: '3,106 bookings' },
          {
            label: 'Room night',
            focal: true,
            figure: '11,940',
            name: 'Room nights',
            sublabel: 'One guest, one date, one rate',
          },
        ]}
        notes={[
          {
            label: 'Why the innermost ring',
            text: 'Pickup and commission are both sums over room nights. Nothing above this ring is stored as a total.',
          },
          {
            label: 'What sits outside',
            text: 'Registration, ticketing and travel hold their own records and reference the event by id.',
          },
        ]}
      />
    ),
  },
}

/** Three levels, focal on the exposure.
 *
 *  Same component, used as a blast-radius read: the outer rings are labelled with
 *  what does NOT change, which is the claim the slide is making. */
export const BlastRadius: Story = {
  name: 'Blast radius of a cutoff change',
  args: {
    eyebrow: 'Operator Console',
    pageNumber: 21,
    title: ['Extending one cutoff moves ', { accent: '318 rooms' }, ' — and nothing else'],
    lead: 'The change is scoped to a single block. The event, the other eight properties and every reservation already confirmed are untouched; the only thing that moves is the rooms still held on the old date.',
    footnote:
      'Illustrative. Attrition exposure is recalculated on save, so the figure is the number an operator sees before confirming.',
    children: ({ width, height }) => (
      <Nested
        width={width}
        height={height}
        levels={[
          { label: 'Event · 9 properties', note: 'Unaffected' },
          { label: 'Block · Riverside Suites', note: 'Cutoff 14 Mar becomes 28 Mar' },
          {
            label: 'Held rooms',
            focal: true,
            figure: '318',
            name: 'Rooms held two weeks longer',
            sublabel: 'Attrition exposure moves with them',
          },
        ]}
        notes={[
          {
            label: 'What the operator sees',
            text: 'The room count and the exposure, before confirming. No downstream report needs rebuilding.',
          },
          {
            label: 'What stays fixed',
            text: 'Confirmed reservations keep their rate. Only unsold held rooms are in scope.',
          },
        ]}
        legend={[
          { label: 'In scope', kind: 'focal' },
          { label: 'Unaffected', kind: 'step' },
        ]}
      />
    ),
  },
}
