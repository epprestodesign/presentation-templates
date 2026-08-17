import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Scatter } from '../../diagrams/Scatter'

/** DIAGRAMS / Scatter — correlation as a drawing, not as a chart widget. */
const meta = {
  title: 'Diagrams/Scatter',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Scatter

Two continuous variables against each other, for when the *relationship* is the
message — or the absence of one. Drawn in the diagram register: hairline
gridlines and dividers, Poppins at the diagram type sizes, 4px grid.

### This is not a replacement for \`Templates/Charts/*\`

The deck's MUI X charts and this are counterparts:

- **Reach for the MUI chart** when the data is live, when the axis needs real
  machinery — self-computing ticks, tooltips, brushing — or when the chart *is*
  the slide.
- **Reach for this one** when the plot is one element inside a drawing and must
  match the diagram set's hairlines and type. Quadrant names in the \`eyebrow\`
  role read as diagram annotation; the same labels inside a chart widget read as
  chart chrome.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT), reskinned onto EventPipe tokens and Poppins.

### Upstream rules kept

- **5–30 points.** Fewer and prose is better; more and it wants binning.
- **Label the focal point and one or two notable outliers.** Not all of them.
- **No bubble-size encoding.** Area perception is unreliable — a third variable
  goes in the group colour or a second panel.
- **Trend line only when the trend is already obvious.** A forced fit is
  dishonest, so \`trend\` takes explicit endpoints rather than computing one.
- **Zero is an editorial decision**, so both domains are explicit. Including it
  is right when absolute position matters and wrong when the cloud is small and
  far from the origin — upstream lists both mistakes.

### Why the dots are \`<circle>\`

A dot is a data mark, not a connector, so the connector rules do not apply to it;
gridlines and the trend guide are \`<line>\` for the same reason. The one
\`<path>\` in the drawing is the callout leader, which is a real orthogonal elbow
with its label on open canvas.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Rate against volume, split into quadrants by event tier.
 *
 *  The quadrants are the argument: the top-left and bottom-right corners are
 *  where the business is, and they are two different businesses. */
export const RateAgainstVolume: Story = {
  name: 'Rate against volume',
  args: {
    eyebrow: 'Portfolio Review',
    pageNumber: 26,
    title: ['Two businesses, ', { accent: 'one platform.' }],
    lead: 'Negotiated average daily rate against room nights per event. Tournaments trade rate for volume and conferences do the opposite — which is why one pricing rule cannot serve both.',
    footnote:
      'One dot per sample event. Rates are negotiated ADR, not realised revenue. All figures invented for this template.',
    children: ({ width, height }) => (
      <Scatter
        width={width}
        height={height}
        xDomain={[0, 6000]}
        yDomain={[100, 260]}
        xTicks={4}
        yTicks={4}
        xFormat={(v) => v.toLocaleString('en-US')}
        yFormat={(v) => `$${v}`}
        xLabel="Room nights per event"
        yLabel="Negotiated ADR"
        groups={['Youth tournament', 'Conference', 'Festival']}
        quadrants={{
          x: 3000,
          y: 180,
          labels: [
            'High rate · small block',
            'High rate · large block',
            'Low rate · large block',
            'Low rate · small block',
          ],
        }}
        trend={{ from: [1200, 232], to: [5200, 146] }}
        points={[
          { x: 5100, y: 155, group: 0, focal: true, label: 'Regional finals', labelSide: 'below' },
          { x: 4200, y: 142, group: 0 },
          { x: 3600, y: 131, group: 0 },
          { x: 2900, y: 138, group: 0 },
          { x: 4700, y: 149, group: 0 },
          { x: 1800, y: 224, group: 1 },
          { x: 2200, y: 241, group: 1, label: 'Medical congress', labelSide: 'right' },
          { x: 1400, y: 208, group: 1 },
          { x: 2600, y: 236, group: 1 },
          { x: 1200, y: 196, group: 1 },
          { x: 3100, y: 178, group: 2 },
          { x: 2400, y: 166, group: 2 },
          { x: 3800, y: 192, group: 2 },
          { x: 1600, y: 158, group: 2 },
        ]}
      />
    ),
  },
}

/** One group, a visible trend, and a callout on the worst case.
 *
 *  No legend, because there is nothing to name — which frees the whole bottom
 *  band for the axis title and leaves the cloud room to breathe. */
export const LeadTimeAgainstAttrition: Story = {
  name: 'Lead time against attrition',
  args: {
    eyebrow: 'Housing Operations',
    pageNumber: 27,
    title: ['Blocks released late ', { accent: 'come back unsold.' }],
    lead: 'Share of each block handed back at cut-off, against how many days the block was open for booking. The relationship is close to linear, and it is the strongest single predictor in the sample.',
    footnote:
      'One dot per sample block. Dashed guide is drawn, not fitted — it marks a visible trend rather than a regression. Figures invented for this template.',
    children: ({ width, height }) => (
      <Scatter
        width={width}
        height={height}
        xDomain={[0, 180]}
        yDomain={[0, 40]}
        xTicks={6}
        yTicks={4}
        yFormat={(v) => `${v}%`}
        xLabel="Days the block was open for booking"
        yLabel="Share of block released at cut-off"
        trend={{ from: [30, 30], to: [175, 8] }}
        annotation={{ point: 0, text: 'Late release', dx: 260, dy: 0 }}
        points={[
          { x: 38, y: 31, focal: true, label: '4-week block', labelSide: 'above' },
          { x: 52, y: 27 },
          { x: 61, y: 22 },
          { x: 74, y: 19 },
          { x: 88, y: 24 },
          { x: 96, y: 14 },
          { x: 110, y: 12 },
          { x: 128, y: 9 },
          { x: 146, y: 11 },
          { x: 168, y: 6, label: '24-week block', labelSide: 'above' },
        ]}
      />
    ),
  },
}
