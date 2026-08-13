import type { Meta, StoryObj } from '@storybook/react-vite'
import { color, gradient } from '../../tokens/tokens.js'
import { amber, coral, emerald, fountainBlue, orient } from '../../tokens/palette.js'
import { Code, Grid, Page, Ramp, Section, Swatch } from './_docs'

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

Most semantic values were *sampled off the reference deck* rather than chosen, so
a rebuilt slide matches the original: the highlighted headline clause is
\`accent\` (#02adb3 — the same teal as the logo glyph's own fill), KPI numbers
are the deeper \`accent-deep\` (#02859d), and card fills are \`surface-muted\`
(#f5f5f5).

The exceptions are **Direction & status** and **accent-warm**, which were
*designed rather than sampled* — the reference deck simply has no colour for
"better than plan", and no value that survives being set on the brand gradient.
Those are built on the three supporting ramps shown below.
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
      <Section
        title="Brand ramps"
        intro="The two halves of the logo, and the source of everything below that reads as EventPipe. Shown here as well as on Palette because a semantic token is hard to judge without the ramp it came from — accent is fountain-blue 600, and seeing which step that is explains why accent-deep had to be invented rather than picked."
      >
        <Ramp
          name="fountain-blue"
          steps={fountainBlue}
          note="The teal half. Primary slide accent: highlighted headline clauses, KPI numbers, rules, chart series 1."
        />
        <Ramp
          name="orient"
          steps={orient}
          note="The blue half. Deep ends of every gradient, and chart series 2."
        />
      </Section>

      <Section
        title="Supporting families"
        intro="Both brand ramps are cool — fountain-blue sits near 183°, orient near 197° — so the system had no warm value at all, and three real gaps: emphasis on a brand surface, financial direction, and attention. These fill them. They are supporting colour: a slide should still read predominantly brand, and a deck that starts looking coral has gone wrong somewhere."
      >
        <Ramp
          name="coral"
          steps={coral}
          note="The true complement of fountain-blue — maximum separation from the brand without looking foreign beside it. Carries warm emphasis and the 'worse than plan' direction."
        />
        <Ramp
          name="amber"
          steps={amber}
          note="Attention, and a highlight that is not the accent."
        />
        <Ramp
          name="emerald"
          steps={emerald}
          note="Sits near 152°, deliberately far from teal's 183°, so it reads as a different idea rather than a slightly-off brand colour. Any closer and it muddies against the accent."
        />
      </Section>

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
          <Swatch
            label="accent-warm"
            value={color.accentWarm as string}
            note="Emphasis ON the brand gradient, where accent teal disappears"
          />
          <Swatch label="accent-warm-deep" value={color.accentWarmDeep as string} />
        </Grid>
      </Section>

      <Section
        title="Direction & status"
        intro="For B/(W) variance columns, deltas and trend arrows. These exist because the brand teal already means 'EventPipe' — the moment a slide also uses it to mean 'on plan', the two readings collide. Note that negative is coral, not a true red: an error red is too loud for a plan variance, and it fights the teal in a way coral does not."
      >
        <Grid>
          <Swatch label="positive" value={color.positive as string} note="Better than plan" />
          <Swatch label="positive-soft" value={color.positiveSoft as string} note="Row / cell fill" />
          <Swatch label="negative" value={color.negative as string} note="Worse than plan" />
          <Swatch label="negative-soft" value={color.negativeSoft as string} />
          <Swatch label="warning" value={color.warning as string} />
          <Swatch label="warning-soft" value={color.warningSoft as string} />
        </Grid>
      </Section>

      <Section
        title="Chart series"
        intro="Applied in order. Two teals alternate with two blues so a stacked series stays readable at slide scale — right for an ordered series, where the slices are steps of one quantity."
      >
        <Grid>
          {(color.series as string[]).map((hex, i) => (
            <Swatch key={hex} label={`series-${i + 1}`} value={hex} />
          ))}
        </Grid>
      </Section>

      <Section
        title="Categorical series"
        intro="For a chart whose slices are unrelated categories rather than steps of one quantity — a product-mix pie, a stacked bar of event types. The ordered series above collapses into one blur across six pie slices at slide scale; this alternates brand and supporting hues so adjacent slices always differ in hue, not only in lightness. Still brand-led: the first two entries are the logo's own colours."
      >
        <Grid>
          {(color.seriesCategorical as string[]).map((hex, i) => (
            <Swatch key={`${hex}-${i}`} label={`categorical-${i + 1}`} value={hex} />
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


