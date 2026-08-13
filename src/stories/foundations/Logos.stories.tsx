import type { Meta, StoryObj } from '@storybook/react-vite'
import { EpLogo } from '../../elements/brand/EpLogo'
import { CoBrandLockup } from '../../elements/brand/CoBrandLockup'
import { Code, Grid, Page, Section, Specimen } from './_docs'

const partners = import.meta.glob<string>('../../assets/partners/*.{png,jpg,jpeg}', {
  eager: true,
  import: 'default',
  query: '?url',
})

/** FOUNDATIONS / Logos — the EventPipe mark, its parts, and partner logos. */
const meta = {
  title: 'Foundations/Logos',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Logos

One set of paths, inlined from the current artwork
(\`references/logo/Eventpipe Logo.svg\`, a 34×142 viewBox).

The source **is** the vertical watermark lockup — reading bottom-to-top it is
the glyph, then "event", then "pipe". Rotating the whole thing +90° puts the
glyph on the left and the wordmark reading left-to-right, which is the standard
horizontal lockup. **So one file serves both orientations** and there is no
second asset to drift.

Inlined as SVG rather than loaded through \`<img>\` so \`tone\` can recolour the
mark. An \`<img>\` cannot be recoloured, which previously meant shipping three
near-identical files and clipping them through an overflow window to isolate
the parts.

\`size\` always means the mark's **long edge**, whichever way it is oriented, so
a caller never has to know which axis it is asking about.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The three views, on each surface they are used on. */
export const Variants: Story = {
  render: () => (
    <Page>
      <Section
        title="On light"
        intro="Full colour on white and the #f5f5f5 card surface — the default for content slides."
      >
        <Grid min={220}>
          <Specimen label="full" meta="variant='full'" minHeight={110}>
            <EpLogo variant="full" orientation="horizontal" size={132} />
          </Specimen>
          <Specimen label="glyph" meta="variant='glyph'" minHeight={110}>
            <EpLogo variant="glyph" orientation="horizontal" size={44} />
          </Specimen>
          <Specimen label="wordmark" meta="variant='wordmark'" minHeight={110}>
            <EpLogo variant="wordmark" orientation="horizontal" size={100} />
          </Specimen>
        </Grid>
      </Section>

      <Section
        title="On the brand gradient"
        intro="The white variant. Used on dividers, covers, the closing slide and over photography."
      >
        <Grid min={220}>
          {(['full', 'glyph', 'wordmark'] as const).map((variant) => (
            <Specimen
              key={variant}
              label={`${variant} · white`}
              minHeight={110}
              style={{ background: 'var(--slide-gradient-brand-bleed)', border: 'none' }}
            >
              <EpLogo variant={variant} orientation="horizontal" tone="white" size={variant === 'glyph' ? 44 : 122} />
            </Specimen>
          ))}
        </Grid>
      </Section>

      <Section title="Mono" intro="One-colour contexts, print and watermarks.">
        <Grid min={220}>
          <Specimen label="full · black" minHeight={110}>
            <EpLogo variant="full" orientation="horizontal" tone="black" size={132} />
          </Specimen>
          <Specimen
            label="full · white on navy"
            minHeight={110}
            style={{ background: 'var(--slide-color-brand-navy)', border: 'none' }}
          >
            <EpLogo variant="full" orientation="horizontal" tone="white" size={132} />
          </Specimen>
        </Grid>
      </Section>
    </Page>
  ),
}

/** How the watermark is composed. */
export const Watermark: Story = {
  render: () => (
    <Page>
      <Section
        title="The slide watermark"
        intro="Every content slide carries this bottom-right. It is the artwork as supplied — wordmark reading bottom-to-top above the glyph — placed as one mark. It reserves an 85px right-hand gutter: any full-width content well must stop there or it runs underneath, which slide 07 proved."
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 420,
            height: 260,
            border: '1px solid #e5e5e5',
            borderRadius: 10,
            background: '#fff',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 24,
              bottom: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <EpLogo variant="full" orientation="vertical" size={142} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: 85,
              background: 'rgba(2,173,179,0.08)',
              borderLeft: '1px dashed rgba(2,173,179,0.5)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 92,
              top: 14,
              font: '600 11px/1.3 Poppins, sans-serif',
              color: '#02859d',
            }}
          >
            85px watermark gutter →
          </div>
        </div>
      </Section>
    </Page>
  ),
}

/** Partner and customer marks. */
export const Partners: Story = {
  render: () => (
    <Page>
      <Section
        title="Partner logos"
        intro="Drop a file into src/assets/partners/ and it appears here automatically. Shown on white at even optical size, since partner marks arrive at wildly different aspect ratios and padding."
      >
        <Grid min={170}>
          {Object.entries(partners).map(([path, url]) => (
            <Specimen key={path} label={path.split('/').pop()!.replace(/\.\w+$/, '')} minHeight={104}>
              <img
                src={url}
                alt=""
                style={{ maxWidth: '100%', maxHeight: 64, width: 'auto', objectFit: 'contain' }}
              />
            </Specimen>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
}

/** The co-brand lockup, including its placeholder state. */
export const CoBrand: Story = {
  render: () => (
    <Page>
      <Section
        title="Co-brand lockup"
        intro="Partner mark, hairline divider, then EventPipe — as on the client onboarding slide. With no artwork supplied it renders a deliberately loud placeholder, so a missing partner logo looks wrong in review rather than quietly shipping as blank space."
      >
        <Grid min={260}>
          <Specimen label="with artwork" minHeight={100}>
            <CoBrandLockup
              coBrand={{ name: '365', src: Object.values(partners)[0] }}
              height={17}
            />
          </Specimen>
          <Specimen label="placeholder" meta="no src supplied" minHeight={100}>
            <CoBrandLockup coBrand={{ name: 'On Location' }} height={17} />
          </Specimen>
          <Specimen
            label="placeholder · on brand"
            minHeight={100}
            style={{ background: 'var(--slide-gradient-brand-bleed)', border: 'none' }}
          >
            <CoBrandLockup coBrand={{ name: 'On Location' }} onDark height={17} />
          </Specimen>
        </Grid>
        <div style={{ marginTop: 14 }}>
          <Code>Supply `src` once the partner artwork arrives; nothing else changes.</Code>
        </div>
      </Section>
    </Page>
  ),
}
