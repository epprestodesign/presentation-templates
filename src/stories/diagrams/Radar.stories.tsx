import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Radar } from '../../diagrams/Radar'

/** DIAGRAMS / Radar — three to five options across three to five criteria. */
const meta = {
  title: 'Diagrams/Radar',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Radar / spider

Three to five entities across three to five criteria on one normalised scale —
the diagram to reach for when a comparison table runs out of horizontal room and
what matters is the *shape* of each option.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens.

### The one type allowed more than one colour

Everywhere else in this library, colour means focus and nothing else. Radar is the
exception, because telling entities apart *is* the job: non-focal series come from
\`role.series\` — the deck's own categorical palette — and \`role.accent\` stays
reserved for the recommended option. \`role.series[0]\` is skipped deliberately: it
*is* the accent, and a non-focal series wearing the focal colour is exactly the
failure the rule exists to prevent.

### Shapes, not numbers

Every axis must be normalised to the same 0–\`scale\` range **before** it reaches
the component. Mixing a 0–100 axis with a 0–1 axis produces a polygon that looks
like data and means nothing. The grid starts at zero — raising the inner ring to
amplify a difference is the zero-baseline trick, and if the shapes look similar,
that *is* the finding.

### Dots on the focal series only

This is the load-bearing readability rule. Four overlapping polygons with vertex
dots on every one is a bead curtain; dots on one is a recommendation. Scale ticks
appear on the **first (top) axis only** for the same reason.

### Rings and spokes are the figure

Grid rings are closed \`<polygon>\`s through the axis vertices, spokes are
\`<line>\` from the centre, and each series is a \`<polygon>\`. None is a route
between two nodes, so the orthogonal-connector rule does not apply — and there are
no connectors, and therefore no arrow labels, anywhere in this type.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** EventPipe against the two things it actually replaces.
 *
 *  Three series is the floor upstream allows — two is a bar chart's job — and the
 *  reading is the shape: one polygon reaches the outer ring on every axis, the
 *  other two collapse on everything that happens after the block is signed. */
export const AgainstTheManualProcess: Story = {
  name: 'Against the manual process',
  args: {
    eyebrow: 'Evaluation',
    pageNumber: 30,
    title: ['A spreadsheet keeps up until the block is signed. ', { accent: 'Then it stops.' }],
    lead: 'Five criteria, scored 0–10 against one rubric. The three shapes are close on setup speed and nowhere near each other on accuracy, visibility and payout — which is where a housing team spends its year.',
    footnote:
      'Invented scores from an internal rubric, normalised to 0–10 from five different native scales. Setup speed is elapsed days to a live block; payout is days from checkout to commission received.',
    children: ({ width, height }) => (
      <Radar
        width={width}
        height={height}
        axes={['Speed', 'Accuracy', 'Scale', 'Visibility', 'Payout']}
        series={[
          { name: 'EventPipe', values: [8, 9, 9, 9, 8], focal: true },
          { name: 'Legacy housing suite', values: [5, 7, 6, 4, 6] },
          { name: 'Spreadsheets + email', values: [7, 4, 3, 2, 3] },
        ]}
        legendNote="One accent. Position is the signal — colour is reserved for the recommendation."
      />
    ),
  },
}

/** A four-option shortlist, where every option wins something.
 *
 *  Four series is where the dots-on-the-focal-series-only rule starts earning its
 *  keep: the accent polygon is traceable through three overlapping fills because it
 *  is the only one carrying vertices. */
export const VendorShortlist: Story = {
  name: 'Vendor shortlist',
  args: {
    eyebrow: 'Vendor Shortlist',
    pageNumber: 31,
    title: ['Every shortlisted platform wins one axis. ', { accent: 'One holds all five.' }],
    lead: 'Read the shape, not the peaks. Three of the four options are strong on a single criterion and give ground on the rest; the accent polygon is the only one that stays outside the fourth ring the whole way round.',
    footnote:
      'Vendor names and scores are invented for illustration. Scores are a 0–10 normalisation of a longer internal scorecard and are not vendor-supplied.',
    children: ({ width, height }) => (
      <Radar
        width={width}
        height={height}
        axes={['Speed', 'Accuracy', 'Scale', 'Payout', 'Support']}
        series={[
          { name: 'EventPipe', values: [9, 9, 8, 8, 9], focal: true },
          { name: 'Northstar Housing', values: [8, 6, 9, 5, 6] },
          { name: 'Blockwise', values: [6, 8, 5, 7, 7] },
          { name: 'Rowan Events', values: [9, 5, 4, 6, 8] },
        ]}
        legendNote="Illustrative scores. One accent — the rest of the palette only separates the field."
      />
    ),
  },
}
