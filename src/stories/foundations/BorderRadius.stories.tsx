import type { Meta, StoryObj } from '@storybook/react-vite'
import { radius } from '../../tokens/tokens.js'
import { Code, Grid, Page, Section, Specimen } from './_docs'

/** FOUNDATIONS / Border Radius */
const meta = {
  title: 'Foundations/Border Radius',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: { description: { component: `
## Border Radius

Four steps, measured off the reference deck. Images and cards differ by 2px and
that difference is real — a photo inside a card reads wrong at the card's radius.
        ` } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const NOTES: Record<keyof typeof radius, string> = {
  sm: 'Cover panels and photo tiles — at cover scale an 8px arc reads as a button',
  image: 'Photos, mosaic frames, device shots',
  card: 'Stat and feature cards',
  panel: 'Large gradient panels and wells',
  panelLg: 'Closing contact cards and the full-bleed photo frame',
  pill: 'Fully rounded — badges and dots',
}

export const Radii: Story = {
  render: () => (
    <Page>
      <Section title="Radii" intro="Applied as `radius.card` etc. from the token module, never as a literal.">
        <Grid min={180}>
          {Object.entries(radius).map(([name, value]) => (
            <Specimen key={name} label={name} meta={`${value}px`} minHeight={120}>
              <div
                style={{
                  width: '100%',
                  height: 84,
                  borderRadius: Math.min(value, 42),
                  background: 'var(--slide-gradient-brand)',
                }}
              />
            </Specimen>
          ))}
        </Grid>
        <div style={{ marginTop: 10 }}>
          <Code>pill is 999 — clamped in this preview so the shape stays legible</Code>
        </div>
      </Section>
      <Section title="Where each is used">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(Object.entries(NOTES) as [keyof typeof radius, string][]).map(([name, note]) => (
            <div key={name} style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 90, font: '600 13px/1.4 Poppins, sans-serif' }}>{name}</div>
              <Code>{radius[name]}px</Code>
              <div style={{ font: '400 13px/1.5 Poppins, sans-serif', color: '#546e7a' }}>{note}</div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}
