import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Pyramid } from '../../diagrams/Pyramid'

/** DIAGRAMS / Pyramid — a stack whose width carries the quantity, on a slide. */
const meta = {
  title: 'Diagrams/Pyramid',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Pyramid / funnel

A stack of four to six layers whose width carries the quantity. One type, two
orientations, and they mean opposite things.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Pick one orientation and stay in it

- **Pyramid** (point up) — a **hierarchy**. The apex is the rarest or most
  valuable tier; the base is foundational. Widths are structural, so they step
  linearly and no values are needed.
- **Funnel** (point down) — a **conversion**. The top is the whole audience and
  the narrow end is what converted. Widths **must** be proportional to the
  counts, because the drop-off is the only thing a funnel is for.

### Honest widths, with no floor

A stage at 14% of the top gets 14% of the width, even when that is too narrow for
a comfortable label. Clamping it to a legible minimum turns a 7× funnel into a 3×
funnel — upstream's dishonest-widths anti-pattern. Shorten the stage name
instead; if it cannot be shortened, the subject wants two diagrams.

Pyramid widths carry no quantity, so a pyramid is allowed one convenience the
funnel is not: \`apex: 'flat'\` truncates the stack a step short of the point so
the top tier can hold its own name.

### The layers are the figure

Each band is a \`<polygon>\` — a trapezoid with four points — so the sloped edges
are geometry, not connectors. There are no connectors in this type at all: side
annotations are tied to their band by a horizontal hairline, which is axis-aligned
by construction. Coral sits on exactly one layer, and never on a pyramid's base.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The demand funnel, from enquiry to a room night somebody actually slept in.
 *
 *  Widths are the counts, so the two widest steps are visibly the expensive ones.
 *  The narrow stage names are short because the geometry made them short — that
 *  is the honesty tax, and paying it is the point. */
export const DemandFunnel: Story = {
  name: 'Demand funnel',
  args: {
    eyebrow: 'Demand Funnel',
    pageNumber: 28,
    title: ['Two thirds of the loss happens ', { accent: 'before anyone books a room.' }],
    lead: 'Of a thousand event enquiries, 214 reach a contracted block and 138 turn into picked-up room nights. The widest steps are lost in qualification, not in checkout — which is where the next quarter of work goes.',
    footnote:
      'Invented figures for a single 12-month period. Band widths are proportional to the count at each stage and no minimum width is applied, which is why the last two names are short.',
    children: ({ width, height }) => (
      <Pyramid
        width={width}
        height={height}
        orientation="funnel"
        axisLabel="drop-off"
        layers={[
          {
            name: 'Event enquiries',
            sublabel: 'Inbound + outbound',
            value: 1000,
            note: '1,000 events',
          },
          { name: 'Qualified', sublabel: 'Dates, size, market', value: 610, note: '610 · −39%' },
          { name: 'Proposal sent', sublabel: 'Blocks priced', value: 392, note: '392 · −36%' },
          { name: 'Contracted', sublabel: 'Signed with hotels', value: 214, note: '214 · −45%' },
          {
            name: 'Picked up',
            sublabel: 'Room nights',
            value: 138,
            note: '138 · −36%',
            focal: true,
          },
          ]}
      />
    ),
  },
}

/** The same type as a hierarchy, pointing the other way.
 *
 *  Graded tints instead of flat paper, because a hierarchy reads better with a
 *  gradient of weight from base to apex — and the accent is on the apex, never the
 *  base, which is what keeps "the top is rare" legible. */
export const PrincipleStack: Story = {
  name: 'Principle stack',
  args: {
    eyebrow: 'Product Principles',
    pageNumber: 29,
    title: ['Nothing above the second tier matters ', { accent: 'until the inventory is true.' }],
    lead: 'Accurate inventory is the floor. Rate integrity sits on it, then contracts, then the attendee experience — and the apex, a rate benchmark nobody else can assemble, is only reachable once the three below it hold.',
    footnote:
      'A principle stack, not a roadmap. Tier order is the argument; tier width carries no quantity, which is why the apex is truncated rather than drawn to a point.',
    children: ({ width, height }) => (
      <Pyramid
        width={width}
        height={height}
        orientation="pyramid"
        apex="flat"
        fill="graded"
        axisLabel="rarer"
        layers={[
          { name: 'Rate benchmark', sublabel: 'Market-wide comparables', focal: true },
          { name: 'Attendee experience', sublabel: 'Book in under a minute' },
          { name: 'Contracts & commission', sublabel: 'Signed terms, paid out' },
          { name: 'Rate integrity', sublabel: 'One price, everywhere' },
          { name: 'True inventory', sublabel: 'What is actually available' },
        ]}
      />
    ),
  },
}
