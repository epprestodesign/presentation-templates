import type { Meta, StoryObj } from '@storybook/react-vite'
import { ImageMosaic } from '../../elements/media/ImageMosaic'
import { Page, Row, Section, Stage } from './_stage'
import { img } from '../../assets/imagery'

/** ELEMENTS / Media — photography, people and logos. */
const meta = {
  title: 'Elements/Media',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Media

Imagery is addressed **by name**, never by import — \`img('mosaic/reception-bell')\`
— so a slide spec stays plain data an agent can write. One registry covers
\`imagery/\`, \`team/\`, \`partners/\`, \`employers/\` and \`events/\`, and an unknown
name throws with the list of valid ones rather than rendering a broken image.

\`ImageMosaic\` is **absolutely positioned, not a grid**. The reference mosaics are
asymmetric by design, and the rects came out of \`detect-images.mjs\` reading the
original pixels — so absolute placement reproduces the original exactly rather
than approximating it with a grid that nearly fits.

See **Foundations/Imagery** for the full library.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

/** The geometry both reference mosaics share, in slide px. Detected, not measured by eye. */
const MOSAIC = {
  wide: { x: 0, y: 0, w: 482, h: 154 },
  leftShort: { x: 1, y: 162, w: 232, h: 154 },
  rightTall: { x: 241, y: 162, w: 241, h: 288 },
  leftTall: { x: 1, y: 324, w: 232, h: 316 },
  rightShort: { x: 241, y: 458, w: 241, h: 182 },
}

export const Mosaic: Story = {
  render: () => (
    <Page>
      <Section
        title="ImageMosaic"
        intro="A wide establishing shot over two unequal columns, one tall frame breaking the rhythm. Every rect here is the reference's own, read from its pixels."
      >
        <Stage label="slide 01's mosaic" width={490} surface="light" height={680}>
          <div style={{ position: 'relative', height: 640 }}>
            <ImageMosaic
              images={[
                { src: 'mosaic/reception-bell', alt: 'Hotel reception bell', ...MOSAIC.wide },
                { src: 'mosaic/woman-credit-card', alt: 'Booking on a phone', ...MOSAIC.leftShort },
                { src: 'mosaic/phone-travel-apps', alt: 'Travel apps', ...MOSAIC.rightTall },
                { src: 'mosaic/woman-airport', alt: 'Traveller at an airport', ...MOSAIC.leftTall },
                { src: 'mosaic/travellers-silhouette', alt: 'Silhouetted travellers', ...MOSAIC.rightShort },
              ]}
            />
          </div>
        </Stage>
      </Section>

      <Section
        title="Naming"
        intro="Assets are named by CONTENT, never by source filename. 'EP TEam.png' is a close-up of glasses reflecting code, not a team photo — naming it team-code-glasses made an agent pick the wrong image for a team slide."
      >
        <Row>
          {['full-bleed/demo-code-glasses', 'full-bleed/travel-airport-silhouettes'].map((n) => (
            <Stage key={n} label={n.split('/')[1]} note={n} width={320} surface="light">
              <img src={img(n)} alt="" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
            </Stage>
          ))}
        </Row>
      </Section>
    </Page>
  ),
}
