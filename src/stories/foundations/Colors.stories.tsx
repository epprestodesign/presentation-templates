import type { Meta, StoryObj } from '@storybook/react-vite'
import { color, gradient } from '../../tokens/tokens.js'
import { Code, Grid, Page, Section, Swatch } from './_docs'

/** FOUNDATIONS / Colors — the brand ramps and the semantic layer built on them. */
const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Colors

The **semantic** layer — the only colour tokens elements and templates may
reference. The raw ramps they are built from live on the **Palette** page.

Every semantic value was *sampled off the reference deck* rather than chosen, so
a rebuilt slide matches the original: the highlighted headline clause is
\`accent\` (#02adb3 — the same teal as the logo glyph's own fill), KPI numbers
are the deeper \`accent-deep\` (#02859d), and card fills are \`surface-muted\`
(#f5f5f5).
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

/** The semantic layer — what templates actually use. */
export const Semantic: Story = {
  render: () => (
    <Page>
      <Section title="Surfaces">
        <Grid>
          <Swatch label="surface" value={color.surface as string} />
          <Swatch label="surface-muted" value={color.surfaceMuted as string} note="Stat and feature card fill" />
          <Swatch label="surface-sunken" value={color.surfaceSunken as string} />
        </Grid>
      </Section>

      <Section
        title="Text"
        intro="Primary copy is pure black in the reference deck. The two grays are distinct roles, not a fallback chain — text-cool is reserved for body copy inside cards."
      >
        <Grid>
          <Swatch label="text" value={color.text as string} />
          <Swatch label="text-subtle" value={color.textSubtle as string} />
          <Swatch label="text-muted" value={color.textMuted as string} />
          <Swatch label="text-cool" value={color.textCool as string} note="Card body copy" />
        </Grid>
      </Section>

      <Section title="Accents">
        <Grid>
          <Swatch label="accent" value={color.accent as string} note="Highlighted headline clause" />
          <Swatch label="accent-deep" value={color.accentDeep as string} note="Large KPI numbers" />
          <Swatch label="accent-soft" value={color.accentSoft as string} />
          <Swatch label="brand-navy" value={color.brandNavy as string} note="Logo wordmark ink" />
        </Grid>
      </Section>

      <Section
        title="Chart series"
        intro="Applied in order. Two teals alternate with two blues so a stacked series stays readable at slide scale."
      >
        <Grid>
          {(color.series as string[]).map((hex, i) => (
            <Swatch key={hex} label={`series-${i + 1}`} value={hex} />
          ))}
        </Grid>
      </Section>

      <Section title="Lines">
        <Grid>
          <Swatch label="border" value={color.border as string} />
          <Swatch label="rule" value={color.rule as string} />
          <Swatch label="gridline" value={color.gridline as string} />
          <Swatch label="axis" value={color.axis as string} />
        </Grid>
      </Section>

      <Section
        title="Brand gradients"
        intro="All four run deep blue → bright teal; only the angle changes. PptxGenJS has no gradient fill, so the exporter rasterises these to a background image layer and keeps the text above them live and editable."
      >
        <Grid min={240}>
          {Object.entries(gradient).map(([name, g]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <div
                style={{
                  height: 116,
                  borderRadius: 10,
                  border: '1px solid #d4d4d4',
                  background: `linear-gradient(${g.angle}deg, ${g.from} 0%, ${g.to} 100%)`,
                }}
              />
              <div style={{ font: '600 12px/1.3 Poppins, sans-serif' }}>{kebab(name)}</div>
              <Code>
                {g.angle}deg · {g.from} → {g.to}
              </Code>
            </div>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
}


