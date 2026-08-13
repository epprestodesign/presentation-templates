import type { Meta, StoryObj } from '@storybook/react-vite'
import { palette } from '../../tokens/palette.js'
import { color, gradient, tableTint } from '../../tokens/tokens.js'

/** FOUNDATIONS / Colors — the brand ramps and the semantic tokens on top. */
const meta = {
  title: 'Foundations/Colors',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## Colors

Two tiers. **Ramps** are raw values derived from the EventPipe logo —
\`orient\` is its blue half, \`fountain-blue\` its teal half. **Semantic
tokens** attach meaning, and are the only thing elements and templates may
reference.

Every semantic value was sampled off the reference deck rather than chosen, so
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

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'

function Swatch({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        style={{
          height: 56,
          borderRadius: 8,
          background: value,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      />
      <div style={{ font: '600 12px/1.3 Poppins, sans-serif' }}>{label}</div>
      <div style={{ font: `400 11px/1.3 ${mono}`, color: '#7b7b7b' }}>{value}</div>
      {note && <div style={{ font: '400 11px/1.4 Poppins, sans-serif', color: '#546e7a' }}>{note}</div>}
    </div>
  )
}

function Grid({ children, min = 120 }: { children: React.ReactNode; min?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap: 16,
        maxWidth: 1100,
      }}
    >
      {children}
    </div>
  )
}

function Heading({ text, sub }: { text: string; sub?: string }) {
  return (
    <>
      <h3 style={{ font: '700 15px/1.3 Poppins, sans-serif', margin: '28px 0 4px' }}>{text}</h3>
      {sub && (
        <p
          style={{
            font: '400 13px/1.5 Poppins, sans-serif',
            color: '#546e7a',
            margin: '0 0 14px',
            maxWidth: 660,
          }}
        >
          {sub}
        </p>
      )}
    </>
  )
}

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

/** The four primitive ramps. */
export const Ramps: Story = {
  render: () => (
    <div>
      {Object.entries(palette).map(([name, steps]) => (
        <div key={name}>
          <Heading text={kebab(name)} />
          <Grid min={96}>
            {Object.entries(steps).map(([step, hex]) => (
              <Swatch key={step} label={step} value={hex} />
            ))}
          </Grid>
        </div>
      ))}
    </div>
  ),
}

/** The semantic layer — what templates actually use. */
export const Semantic: Story = {
  render: () => (
    <div>
      <Heading text="Surfaces" />
      <Grid>
        <Swatch label="surface" value={color.surface as string} />
        <Swatch label="surface-muted" value={color.surfaceMuted as string} note="Stat and feature card fill" />
        <Swatch label="surface-sunken" value={color.surfaceSunken as string} />
      </Grid>

      <Heading
        text="Text"
        sub="Primary copy is pure black in the reference deck. The two grays are distinct roles, not a fallback chain — text-cool is reserved for body copy inside cards."
      />
      <Grid>
        <Swatch label="text" value={color.text as string} />
        <Swatch label="text-subtle" value={color.textSubtle as string} />
        <Swatch label="text-muted" value={color.textMuted as string} />
        <Swatch label="text-cool" value={color.textCool as string} note="Card body copy" />
      </Grid>

      <Heading text="Accents" />
      <Grid>
        <Swatch label="accent" value={color.accent as string} note="Highlighted headline clause" />
        <Swatch label="accent-deep" value={color.accentDeep as string} note="Large KPI numbers" />
        <Swatch label="accent-soft" value={color.accentSoft as string} />
        <Swatch label="brand-navy" value={color.brandNavy as string} note="Logo wordmark ink" />
      </Grid>

      <Heading
        text="Chart series"
        sub="Applied in order. Two teals alternate with two blues so a stacked series stays readable at slide scale."
      />
      <Grid>
        {(color.series as string[]).map((hex, i) => (
          <Swatch key={hex} label={`series-${i + 1}`} value={hex} />
        ))}
      </Grid>
    </div>
  ),
}

/** Gradients, and why they matter to export. */
export const Gradients: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All four run deep blue → bright teal; only the angle changes. PptxGenJS has no gradient fill, so the exporter rasterises these to a background image layer and keeps the text above them live and editable.',
      },
    },
  },
  render: () => (
    <Grid min={220}>
      {Object.entries(gradient).map(([name, g]) => {
        const css = `linear-gradient(${g.angle}deg, ${g.from} 0%, ${g.to} 100%)`
        return (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 110, borderRadius: 10, background: css }} />
            <div style={{ font: '600 12px/1.3 Poppins, sans-serif' }}>{kebab(name)}</div>
            <div style={{ font: `400 11px/1.4 ${mono}`, color: '#7b7b7b' }}>
              {g.angle}deg · {g.from} → {g.to}
            </div>
          </div>
        )
      })}
    </Grid>
  ),
}

/** The measured table ramp. */
export const TableTint: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Sampled row-by-row off the four integration slides. Deliberately not the orient ramp — every step reads brighter, and the samples do not fit one cyan at descending opacity either, so it is kept as its own measured ramp. Rows apply top-to-bottom in order.',
      },
    },
  },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
        <div
          style={{
            background: tableTint.header,
            color: tableTint.headerText,
            font: '700 13px/1 Poppins, sans-serif',
            padding: '16px 20px',
          }}
        >
          header
        </div>
        {tableTint.rows.map((hex, i) => (
          <div
            key={hex}
            style={{
              background: hex,
              padding: '16px 20px',
              font: '500 13px/1 Poppins, sans-serif',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>row-{i + 1}</span>
            <span style={{ fontFamily: mono, opacity: 0.65 }}>{hex}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}
