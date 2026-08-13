import type { Meta, StoryObj } from '@storybook/react-vite'
import { SlideFrame } from '../../elements/layout/SlideFrame'
import { SlideHeading } from '../../elements/layout/SlideHeading'
import { Page, Row, Section, Stage } from './_stage'

/** ELEMENTS / Layout — the artboard, its chrome, and the copy stack. */
const meta = {
  title: 'Elements/Layout',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Layout

\`SlideFrame\` establishes the **1280×720 coordinate space** the whole system
depends on. Children position absolutely in px against it, which is what makes
the PowerPoint export a divide-by-96 rather than a layout re-flow.

Two fit modes, and the distinction matters:
- \`contain\` scales the artboard to its container, for Storybook and the deck
  player. The transform is visual only — the coordinate space never changes.
- \`none\` renders at exactly 1280×720, which the export scripts use so headless
  Chromium rasterises pixel-for-pixel with no resampling.

\`SlideChrome\` carries the eyebrow, page number, tag and watermark. Every
coordinate in it was measured off the reference rather than chosen, and it lives
in one component so no template can drift.

> The watermark reserves an **85px right gutter**. Any full-width content well on
> a slide showing it must stop at \`grid.watermarkGutter\`, not \`grid.marginX\`,
> or it runs under the wordmark.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Surfaces: Story = {
  render: () => (
    <Page>
      <Section
        title="SlideFrame surfaces"
        intro="Shown at contain, so each is the whole artboard scaled down. A brand slide can take a real artwork plate instead of the CSS gradient — the plate carries a hex tessellation that CSS cannot reproduce."
      >
        <Row>
          <div style={{ width: 420 }}>
            <SlideFrame eyebrow="Light" pageNumber={1}>
              <SlideHeading title="White paper, the default." width={600} />
            </SlideFrame>
          </div>
          <div style={{ width: 420 }}>
            <SlideFrame surface="brand" eyebrow="Brand" pageNumber={2}>
              <SlideHeading title="The gradient, full bleed." width={600} onDark />
            </SlideFrame>
          </div>
          <div style={{ width: 420 }}>
            <SlideFrame surface="brand" plate="backgrounds/brand-hex" eyebrow="Plate" pageNumber={3}>
              <SlideHeading title="A real artwork plate." width={600} onDark />
            </SlideFrame>
          </div>
          <div style={{ width: 420 }}>
            <SlideFrame surface="navy" eyebrow="Navy" pageNumber={4} tag="Confidential">
              <SlideHeading title="Solid logo navy." width={600} onDark />
            </SlideFrame>
          </div>
        </Row>
      </Section>

      <Section
        title="SlideHeading"
        intro="The copy stack: headline, lead, body, and paragraphs at one size. It is a single flex column on purpose — the headline's height depends on where it wraps, so anything anchored to a fixed y below it eventually collides. Keeping the stack together makes that impossible."
      >
        <Stage label="headline + lead + body" width={620} surface="light" height={280}>
          <div style={{ position: 'relative', height: 240 }}>
            <SlideHeading
              title={['The core business is growing ', { accent: 'before the layers arrive.' }]}
              lead="Reservation fees create a durable base."
              body="Transactional products add revenue per booking as customers adopt more of the platform."
              width={560}
              top={0}
              left={0}
            />
          </div>
        </Stage>
      </Section>
    </Page>
  ),
}
