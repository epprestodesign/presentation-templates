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

One source file (a 128×33 lockup) clipped into three views: the full lockup, the
hex **glyph**, and the **wordmark**. The deck uses them separately — the
bottom-right watermark stacks a rotated wordmark above an upright glyph — so
clipping one file beats maintaining three that can drift.

The split points are **measured**, not guessed. Run
\`node scripts/measure-logo.mjs\` to print the real path bounding boxes; an
earlier guess cut the leading "e" off the wordmark and shipped "aventpipe" into
every slide's watermark.

> ⚠️ **Known issue.** The glyph in \`eventpipe-logo.svg\` is an **older mark**
> than the current decks use — its inner form is an asymmetric spiral with a
> diagonal tail, where the decks show a symmetric "e" with no tail. The
> rendering below is faithful to the file; the file needs replacing. This
> likely affects \`eventpipe-prototype-ds\` too.
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
            <EpLogo variant="full" height={38} />
          </Specimen>
          <Specimen label="glyph" meta="variant='glyph'" minHeight={110}>
            <EpLogo variant="glyph" height={44} />
          </Specimen>
          <Specimen label="wordmark" meta="variant='wordmark'" minHeight={110}>
            <EpLogo variant="wordmark" width={140} />
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
              <EpLogo
                variant={variant}
                tone="white"
                {...(variant === 'wordmark' ? { width: 140 } : { height: variant === 'glyph' ? 44 : 38 })}
              />
            </Specimen>
          ))}
        </Grid>
      </Section>

      <Section title="Mono" intro="One-colour contexts, print and watermarks.">
        <Grid min={220}>
          <Specimen label="full · black" minHeight={110}>
            <EpLogo variant="full" tone="black" height={38} />
          </Specimen>
          <Specimen
            label="full · white on navy"
            minHeight={110}
            style={{ background: 'var(--slide-color-brand-navy)', border: 'none' }}
          >
            <EpLogo variant="full" tone="white" height={38} />
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
        intro="Every content slide carries this bottom-right: the wordmark rotated to read bottom-to-top, above the upright glyph, both centred on x≈1241. It reserves an 85px right-hand gutter — any full-width content well must stop there or it runs underneath, which slide 07 proved."
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
            <div style={{ width: 36, height: 101, display: 'grid', placeItems: 'center' }}>
              <div style={{ transform: 'rotate(-90deg)' }}>
                <EpLogo variant="wordmark" width={101} />
              </div>
            </div>
            <EpLogo variant="glyph" height={35} />
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
