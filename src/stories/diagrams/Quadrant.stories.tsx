import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Quadrant } from '../../diagrams/Quadrant'

/** DIAGRAMS / Quadrant — two drivers, four positions, on a slide. */
const meta = {
  title: 'Diagrams/Quadrant',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Quadrant

Two independent drivers and four positions — the diagram to reach for when the
question is "which of these first" or "which of four futures".

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### Two grammars, and they are not interchangeable

- **Standard** (\`items\`) — the axes hold a **measurement** and position inside a
  cell carries meaning. Items are small labelled dots. Use it for prioritisation:
  effort × impact, cost × control.
- **Consultant** (\`cells\`) — the axes hold a **range** and the cells hold **named
  scenarios**. Position inside a cell means nothing, which is why there are no
  dots. Use it for scenario planning: four named bets across two drivers.

Reaching for the wrong one is caught by the dots: if position matters and there
are no dots, the frame is lying.

### Axis labels are Jobs-minimal

One word per arrow tip, beyond the tip, never on the line and never at the
midpoint. No arrow glyphs baked into the text, no \`HIGH\` / \`LOW\`
parentheticals, no multi-line sublabels — the word *is* the label. The standard
variant's axes are single-ended (right and up); the consultant variant's are
double-ended, one word per pole. A corner tag that disagrees with its axis words
reads as a bug in three seconds, so \`tag\` must repeat them exactly.

### No connectors

The axis cross is the figure, not a route between nodes, so it is drawn as
\`<line>\` and the orthogonal-connector rule does not apply. Axis labels sit on
open canvas with nothing beneath them to mask, so they use \`DiagramText\` rather
than \`ArrowLabel\`.

### Layout is derived

The plot is sized from the well and capped to an aspect ratio, then centred;
items are given in normalised 0–1 space and resolved against whatever plot the
component computed. Re-sizing the well re-flows every dot.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Build vs buy, as a positioning frame rather than a cost table.
 *
 *  One focal item and one focal quadrant, and they agree: the argument is that a
 *  single option sits alone in the top-left, so the accent is spent saying where
 *  rather than spread over five dots. */
export const BuildVsBuy: Story = {
  name: 'Build vs buy',
  args: {
    eyebrow: 'Build vs Buy',
    pageNumber: 22,
    title: ['Buying gets you the control of building — ', { accent: 'at a fifth of the effort.' }],
    lead: 'Every option that gives a housing team real control over blocks, rates and pickup costs a year of engineering. One does not, because the control is already built.',
    footnote:
      'Positions are illustrative and reflect a 12-month view for a 40-event operator. Effort counts internal engineering plus vendor-management time; control means the ability to change a rate, a cutoff or a commission without a ticket.',
    children: ({ width, height }) => (
      <Quadrant
        width={width}
        height={height}
        xAxis={{ high: 'Effort' }}
        yAxis={{ high: 'Control' }}
        cornerTags={['Buy', 'Build', 'Live with it', 'Sunk cost']}
        focalCorner={0}
        items={[
          {
            name: 'EventPipe',
            sublabel: 'Configure, not build',
            x: 0.2,
            y: 0.86,
            focal: true,
            labelSide: 'right',
          },
          { name: 'Build in-house', x: 0.86, y: 0.9, labelSide: 'left' },
          { name: 'Portal on top of PMS', x: 0.62, y: 0.58, labelSide: 'right' },
          { name: 'Legacy housing suite', x: 0.44, y: 0.34, labelSide: 'left' },
          { name: 'Spreadsheets + email', x: 0.16, y: 0.14, labelSide: 'right' },
        ]}
      />
    ),
  },
}

/** The same grammar carrying a planning decision instead of a purchase.
 *
 *  Nine items is close to upstream's twelve-item ceiling, which is why there are
 *  no corner tints here: at nine dots the reader is reading positions, and a
 *  tinted quadrant behind them starts competing with the marks. */
export const EffortAndImpact: Story = {
  name: 'Effort and impact',
  args: {
    eyebrow: 'Roadmap',
    pageNumber: 23,
    title: ['Nine bets on the board. ', { accent: 'Three are cheap and decisive.' }],
    lead: 'Impact is scored as room nights influenced per event; effort is engineering weeks. The top-left cluster is under a fifth of the work and most of the movement — everything on the right can wait a quarter.',
    footnote:
      'Scores from an internal planning workshop — illustrative, not committed. Effort excludes migration of blocks already in flight.',
    children: ({ width, height }) => (
      <Quadrant
        width={width}
        height={height}
        xAxis={{ high: 'Effort' }}
        yAxis={{ high: 'Impact' }}
        items={[
          {
            name: 'Rate-parity alerts',
            sublabel: '3 weeks · every event',
            x: 0.14,
            y: 0.88,
            focal: true,
            labelSide: 'right',
          },
          { name: 'Rooming-list export', x: 0.3, y: 0.72, labelSide: 'right' },
          { name: 'Sub-block splits', x: 0.62, y: 0.84, labelSide: 'right' },
          { name: 'Attendee self-service', x: 0.82, y: 0.92, labelSide: 'left' },
          { name: 'Commission recon', x: 0.88, y: 0.6, labelSide: 'left' },
          { name: 'White-label domains', x: 0.36, y: 0.38, labelSide: 'left' },
          { name: 'Cutoff reminders', x: 0.12, y: 0.62, labelSide: 'right' },
          { name: 'Custom PDF contracts', x: 0.2, y: 0.24, labelSide: 'right' },
          { name: 'Legacy CSV importer', x: 0.7, y: 0.14, labelSide: 'right' },
        ]}
      />
    ),
  },
}

/** The consultant variant: four named futures rather than a point cloud.
 *
 *  Double-ended axes because each axis is a range with two poles, and each cell's
 *  corner tag repeats those poles verbatim — the tag and the axis words agreeing
 *  is what makes the frame checkable at a glance. */
export const FourFutures: Story = {
  name: 'Four futures',
  args: {
    eyebrow: 'Scenario Planning',
    pageNumber: 24,
    title: ['Four futures for event housing. ', { accent: 'We are building for one.' }],
    lead: 'Two drivers decide the shape of this market: whether bookings consolidate onto platforms or stay fragmented, and whether the work stays manual. Only the top-right quadrant rewards owning the record.',
    footnote:
      'A scenario frame, not a forecast. Position inside a cell carries no meaning — that is what the effort-and-impact variant is for.',
    children: ({ width, height }) => (
      <Quadrant
        width={width}
        height={height}
        xAxis={{ high: 'Consolidated', low: 'Fragmented' }}
        yAxis={{ high: 'Automated', low: 'Manual' }}
        legend={[
          { label: 'Headline bet', kind: 'focal' },
          { label: 'Candidate future', kind: 'store' },
        ]}
        cells={[
          {
            tag: '01 · Fragmented / Automated',
            name: 'Self-serve long tail',
            lines: ['Thousands of small events book', 'themselves. Volume carries the margin.'],
          },
          {
            tag: '02 · Consolidated / Automated',
            name: 'The system of record',
            focal: true,
            lines: ['Housing companies run whole cities', 'on one record. Rate data compounds.'],
          },
          {
            tag: '03 · Fragmented / Manual',
            name: 'Today, more or less',
            lines: ['Spreadsheets, email chains and a', 'phone call to the hotel.'],
          },
          {
            tag: '04 · Consolidated / Manual',
            name: 'Big desk, no leverage',
            lines: ['One operator, one large team, no', 'automation. Caps out near 40 events.'],
          },
        ]}
      />
    ),
  },
}
