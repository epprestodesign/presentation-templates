import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Venn } from '../../diagrams/Venn'

/** DIAGRAMS / Venn — where two or three domains overlap, on a slide. */
const meta = {
  title: 'Diagrams/Venn',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Venn / set overlap

Where two or three domains meet — the diagram to reach for when the argument is
"this belongs to both" or "only one thing sits in the middle".

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Two or three circles, never four

Four sets have fifteen regions and stop being a drawing. Above three, upstream's
instruction is to use a matrix instead.

### Honest radii

\`size\` scales each radius by **√size**, so it is *area* that is proportional,
not radius. Drawing equal circles for a 4:1 set is the dishonesty anti-pattern;
scaling radius directly is the same lie in the other direction, because it makes
4:1 look like 16:1.

### Labels never cross a stroke

Set names sit **outside** their circle along the set's own ring vector, so a name
always leaves the figure rather than cutting back across it. Region labels sit
**inside** their overlap, at the middle of the lens measured along the line
joining the two centres — not at the midpoint of the centres, which for unequal
radii falls outside the smaller circle entirely.

### One accent, and a leader when the region is small

The sweet spot is tinted by **intersecting clip paths** — each \`clipPath\`
clipped by the previous one, so N chained circles leave exactly the region where
all N overlap. When that region is too cramped to hold words, \`callout\` pulls
the label out to open canvas on an **orthogonal leader** with a masked
\`ArrowLabel\` on the visible stretch. The circles themselves are \`<circle>\`
elements — geometry, not connectors — so the orthogonal rule applies only to that
leader.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Three systems, one shared record.
 *
 *  The exclusive lobes carry what each system uniquely holds; the pairwise
 *  overlaps are deliberately unlabelled because at this radius a lens label and
 *  the centre label collide, and the centre is the whole argument. */
export const ThreeSystems: Story = {
  name: 'Three systems',
  args: {
    eyebrow: 'Product Strategy',
    pageNumber: 25,
    title: ['Three systems ask an attendee ', { accent: 'the same three questions.' }],
    lead: 'Housing, ticketing and registration each collect a name, a party size and a payment. EventPipe sits where all three overlap, so the attendee answers once and every system gets the answer.',
    footnote:
      'Illustrative. Overlap areas are schematic and do not represent measured record counts.',
    children: ({ width, height }) => (
      <Venn
        width={width}
        height={height}
        sets={[{ name: 'Housing' }, { name: 'Ticketing' }, { name: 'Registration' }]}
        regions={[
          { sets: [0], label: 'Rates', sublabel: 'Blocks, cutoff, pickup' },
          { sets: [1], label: 'Seats', sublabel: 'Passes, gates' },
          { sets: [2], label: 'Rosters', sublabel: 'Teams, waivers' },
        ]}
        callout={{
          sets: [0, 1, 2],
          name: 'One attendee record',
          sublabel: 'Name, party size, payment — captured once',
          label: 'Sweet spot',
        }}
      />
    ),
  },
}

/** Two sets, and the contested strip between them.
 *
 *  Two circles is where a Venn is at its clearest: the lens is wide enough to
 *  carry a name and a sublabel inside it, so there is no leader and the accent
 *  sits on the overlap itself. */
export const WhereTheLineSits: Story = {
  name: 'Where the line sits',
  args: {
    eyebrow: 'Division of Responsibility',
    pageNumber: 26,
    title: ['The block is the one thing ', { accent: 'both sides have to agree on.' }],
    lead: 'Event owners own the audience and the calendar. Housing companies own the hotel relationships and the contracts. The overlap is narrow, contested, and the only part that has to be a single shared record.',
    footnote:
      'Illustrative division of responsibility. Actual contract terms vary by market and by event.',
    children: ({ width, height }) => (
      <Venn
        width={width}
        height={height}
        sets={[
          { name: 'Event owner', sublabel: 'Audience & calendar' },
          { name: 'Housing company', sublabel: 'Hotels & contracts' },
        ]}
        regions={[
          {
            sets: [0, 1],
            label: 'The room block',
            sublabel: 'Rates · cutoff · pickup',
            focal: true,
          },
        ]}
      />
    ),
  },
}

/** The same two-set frame with honest sizes.
 *
 *  Radius scales with √size, so the housing circle is twice the radius and four
 *  times the area of the ticketing circle. Note that the lens label is not at the
 *  midpoint of the two centres — that point falls outside the smaller circle. */
export const ProportionalSets: Story = {
  name: 'Proportional sets',
  args: {
    eyebrow: 'Attach Rate',
    pageNumber: 27,
    title: ['Nine in ten events book rooms. ', { accent: 'One in six also books tickets.' }],
    lead: 'The housing set is four times the ticketing set and the circles say so — radius scales with the square root of the count, so it is area that carries the ratio. The overlap is where the second product pays for itself.',
    footnote:
      'Invented figures for a single 12-month period. Radius scales with √size so that area, not radius, is proportional to the count.',
    children: ({ width, height }) => (
      <Venn
        width={width}
        height={height}
        sets={[
          { name: 'Housing events', sublabel: '1,240 last year', size: 4 },
          { name: 'Ticketing events', sublabel: '310 last year', size: 1 },
        ]}
        regions={[{ sets: [0, 1], label: 'Both', sublabel: '214', focal: true }]}
      />
    ),
  },
}
