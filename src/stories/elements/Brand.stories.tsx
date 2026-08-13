import type { Meta, StoryObj } from '@storybook/react-vite'
import { EpLogo } from '../../elements/brand/EpLogo'
import { Icon } from '../../elements/brand/Icon'
import { CoBrandLockup } from '../../elements/brand/CoBrandLockup'
import { Page, Row, Section, Stage } from './_stage'

/** ELEMENTS / Brand — the mark, icons, and co-branding. */
const meta = {
  title: 'Elements/Brand',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Brand

\`EpLogo\` renders from **one set of inlined paths**. The supplied artwork is the
vertical watermark lockup; rotating it +90° gives the horizontal lockup, so one
source serves both orientations and there is no second file to drift.

Inline SVG rather than \`<img>\` because \`tone\` has to recolour the mark — an
\`<img>\` cannot be recoloured, which previously meant three near-identical files
plus an overflow-clipping window to isolate the parts.

\`size\` always means the mark's **long edge**, whichever way it is oriented.

See **Foundations/Logos** for the full specimen sheet and the watermark gutter.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Logo: Story = {
  render: () => (
    <Page>
      <Section title="Orientation" intro="Horizontal is the default; vertical is the slide watermark and is opted into.">
        <Row>
          <Stage label="horizontal · full" width={200} surface="light" height={120}>
            <EpLogo variant="full" size={180} />
          </Stage>
          <Stage label="vertical · full" note="What every content slide carries bottom-right." width={60} surface="light" height={200}>
            <EpLogo variant="full" orientation="vertical" size={142} />
          </Stage>
          <Stage label="glyph" width={60} surface="light" height={120}>
            <EpLogo variant="glyph" size={48} />
          </Stage>
        </Row>
      </Section>

      <Section title="Tone" intro="In colour the wordmark's 'event' is navy and everything else is the brand teal — straight from the artwork.">
        <Row>
          <Stage label="color" width={200} surface="light" height={110}><EpLogo variant="full" size={170} /></Stage>
          <Stage label="white on brand" width={200} surface="brand" height={110}><EpLogo variant="full" tone="white" size={170} /></Stage>
          <Stage label="black" width={200} surface="muted" height={110}><EpLogo variant="full" tone="black" size={170} /></Stage>
        </Row>
      </Section>
    </Page>
  ),
}

export const Icons: Story = {
  render: () => (
    <Page>
      <Section
        title="Icon"
        intro="The whole ~3,700-glyph Material Symbols library as one self-hosted variable font. Naming a glyph is the entire API — no per-icon import, no sprite. Rounded at weight 300 matches the reference deck's thin line icons."
      >
        <Row gap={16}>
          {['arrow_outward', 'hotel', 'stadium', 'payments', 'confirmation_number', 'handshake'].map((n) => (
            <Stage key={n} label={n} width={64} surface="light" height={90}>
              <Icon name={n} size={40} weight={300} color="var(--slide-color-accent)" />
            </Stage>
          ))}
        </Row>
      </Section>
      <Section title="On brand" intro="Icons inherit their colour, so on a dark surface they take the on-brand ink.">
        <Row gap={16}>
          {['mail', 'call', 'link'].map((n) => (
            <Stage key={n} label={n} width={64} surface="brand" height={90}>
              <Icon name={n} size={36} weight={300} color="var(--slide-color-text-on-brand)" />
            </Stage>
          ))}
        </Row>
      </Section>
    </Page>
  ),
}

export const CoBrand: Story = {
  render: () => (
    <Page>
      <Section
        title="CoBrandLockup"
        intro="Partner mark, hairline divider, then EventPipe. With no artwork supplied it renders a deliberately loud placeholder — a missing partner logo should look wrong in review rather than quietly ship as blank space."
      >
        <Row>
          <Stage label="placeholder" width={260} surface="light" height={100}>
            <CoBrandLockup coBrand={{ name: 'On Location' }} height={17} />
          </Stage>
          <Stage label="placeholder · on brand" width={260} surface="brand" height={100}>
            <CoBrandLockup coBrand={{ name: 'On Location' }} onDark height={17} />
          </Stage>
        </Row>
      </Section>
    </Page>
  ),
}
