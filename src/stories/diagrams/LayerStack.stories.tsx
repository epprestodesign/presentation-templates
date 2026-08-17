import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { LayerStack } from '../../diagrams/LayerStack'

/** DIAGRAMS / Layer Stack — abstraction levels, on a slide. */
const meta = {
  title: 'Diagrams/Layer Stack',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Layer stack

Contiguous horizontal bands, top to bottom. The type for anything where every
level sits **on top of** the one below and speaks only to its neighbours: the OSI
model, a cascade, a tech stack — or the platform's own abstraction levels, from a
booking site down to a single reservation record.

If the levels are not genuinely stacked, this is the wrong type. Parallel things
are [Architecture](/?path=/docs/diagrams-architecture--docs); containment is
[Nested](/?path=/docs/diagrams-nested--docs).

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### One silhouette, not N boxes

Upstream is specific and it matters: the stack is a single rounded rectangle with
hairline dividers, not five cards with gaps between them. Gaps would say *these
are peers*; a shared outline says *these are strata of one thing*. Bands are
therefore clipped to the silhouette rather than rounded individually — a per-band
\`rx\` would round the interior corners too and the stack would come apart at the
seams.

### Fills: all paper, hairline dividers

Upstream offers two treatments — alternating paper / paper-2, or all paper with
dividers — and says to pick one and hold it. This holds the second. An opacity
ramp down the stack was tried and rejected: it reads as a value scale, which
invites the reader to think the bottom layer is heavier, when the only thing a
stack claims is *order*.

### Direction lives outside

The arrow saying which way abstraction runs is in the left margin, never inside a
band. It is **drawn** as a line with an arrowhead rather than typeset as an arrow
glyph, because the deck loads only Poppins' latin subset — a \`→\` would silently
fall back to the system face and put a second typeface on the slide.

### The focal rule

One band carries \`focal\`: the layer under discussion, the bottleneck, the one
the slide is arguing about. Its accent stroke replaces the two hairline seams that
bound it, so the accent is never cut in half by a grey divider.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Five layers, focal on the record everything else is a view onto.
 *
 *  The right-hand column carries a concrete example per layer, which is what stops
 *  an abstraction stack reading as five synonyms for "the platform". */
export const PlatformLayers: Story = {
  name: 'Platform abstraction levels',
  args: {
    eyebrow: 'Platform Model',
    pageNumber: 26,
    title: ['Each level ', { accent: 'only knows the one below it.' }],
    lead: 'A booking site never reads a hotel contract, and a reservation record never learns which site sold it. That separation is the reason a new booking surface takes a sprint rather than a quarter.',
    footnote:
      'Simplified. Queueing, caching and the reporting replica sit alongside the stack rather than in it.',
    children: ({ width, height }) => (
      <LayerStack
        width={width}
        height={height}
        direction={{ label: 'Abstraction', dir: 'up' }}
        layers={[
          {
            index: 'L5',
            name: 'Booking Site',
            sublabel: 'What a team or attendee sees',
            note: 'Team code, dates, one price',
          },
          {
            index: 'L4',
            name: 'Event Setup',
            sublabel: 'What an operator configures',
            note: 'Properties, cutoffs, room types',
          },
          {
            index: 'L3',
            name: 'Availability',
            sublabel: 'What the API answers',
            note: 'Holds, quotas, overflow',
          },
          {
            index: 'L2',
            name: 'System of Record',
            sublabel: 'Blocks, rates and pickup',
            note: 'The only writable truth',
            focal: true,
          },
          {
            index: 'L1',
            name: 'Reservation Record',
            sublabel: 'One guest, one stay',
            note: 'The unit every total rolls up from',
          },
        ]}
      />
    ),
  },
}

/** Four layers read downward — resolution order rather than abstraction.
 *
 *  Same component, arrow reversed. The focal band is the layer that answers most
 *  of the time, which is also the only one an operator controls: that coincidence
 *  is the argument. */
export const RateCascade: Story = {
  name: 'Rate resolution cascade',
  args: {
    eyebrow: 'Rate Model',
    pageNumber: 27,
    title: ['A nightly rate is ', { accent: 'the first layer that answers.' }],
    lead: 'Four places can price a night and they are consulted in order, top down. Nine nights in ten are answered by the contracted block rate — the one layer a housing company actually controls.',
    footnote:
      'Illustrative shares. Rack rate is a fallback only; any night that reaches it is flagged for review.',
    children: ({ width, height }) => (
      <LayerStack
        width={width}
        height={height}
        direction={{ label: 'Resolution order', dir: 'down' }}
        layers={[
          {
            index: '01',
            name: 'Event Override',
            sublabel: 'Set by the housing company',
            note: '2% of nights',
          },
          {
            index: '02',
            name: 'Block Rate',
            sublabel: 'Contracted with the property',
            note: '91% of nights',
            focal: true,
          },
          {
            index: '03',
            name: 'Season Rate',
            sublabel: 'Date-banded fallback',
            note: '6% of nights',
          },
          {
            index: '04',
            name: 'Rack Rate',
            sublabel: 'The property’s published price',
            note: '1% — flagged for review',
          },
        ]}
      />
    ),
  },
}
