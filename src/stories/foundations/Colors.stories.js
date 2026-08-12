/** FOUNDATIONS / Colors — the brand ramps and the semantic tokens on top. */
import { palette } from '../../tokens/palette.js'
import { color, gradient, tableTint } from '../../tokens/tokens.js'

export default {
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
tokens** attach meaning, and are the only thing elements and templates are
allowed to reference.

Every semantic value below was sampled off the reference deck rather than
chosen, so a rebuilt slide matches the original: the highlighted headline
clause is \`accent\` (#02adb3, the same teal as the logo glyph), KPI numbers
are the deeper \`accent-deep\` (#02859d), and card fills are \`surface-muted\`
(#f5f5f5).
        `,
      },
    },
  },
}

const swatch = (label, value, note = '') => `
  <div style="display:flex; flex-direction:column; gap:6px;">
    <div style="height:56px; border-radius:8px; background:${value};
      border:1px solid rgba(0,0,0,0.08);"></div>
    <div style="font:600 12px/1.3 Poppins, sans-serif;">${label}</div>
    <div style="font:400 11px/1.3 ui-monospace, monospace; color:#7b7b7b;">${value}</div>
    ${note ? `<div style="font:400 11px/1.4 Poppins, sans-serif; color:#546e7a;">${note}</div>` : ''}
  </div>`

const grid = (items, min = 120) => `
  <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(${min}px,1fr));
    gap:16px; max-width:1100px;">${items}</div>`

const heading = (text, sub = '') => `
  <h3 style="font:700 15px/1.3 Poppins, sans-serif; margin:28px 0 4px;">${text}</h3>
  ${sub ? `<p style="font:400 13px/1.5 Poppins, sans-serif; color:#546e7a; margin:0 0 14px; max-width:640px;">${sub}</p>` : ''}`

/** The four primitive ramps. */
export const Ramps = {
  render: () => ({
    template: `<div>${Object.entries(palette)
      .map(([name, steps]) => {
        const label = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        return heading(label) + grid(
          Object.entries(steps).map(([step, hex]) => swatch(step, hex)).join(''), 96
        )
      })
      .join('')}</div>`,
  }),
}

/** The semantic layer — what templates actually use. */
export const Semantic = {
  render: () => ({
    template: `<div>
      ${heading('Surfaces')}
      ${grid([
        swatch('surface', color.surface),
        swatch('surface-muted', color.surfaceMuted, 'Stat and feature card fill'),
        swatch('surface-sunken', color.surfaceSunken),
      ].join(''))}

      ${heading('Text', 'Primary copy is pure black in the reference deck. The two grays are distinct roles, not a fallback chain — `text-cool` is reserved for body copy inside cards.')}
      ${grid([
        swatch('text', color.text),
        swatch('text-subtle', color.textSubtle),
        swatch('text-muted', color.textMuted),
        swatch('text-cool', color.textCool, 'Card body copy'),
      ].join(''))}

      ${heading('Accents')}
      ${grid([
        swatch('accent', color.accent, 'Highlighted headline clause'),
        swatch('accent-deep', color.accentDeep, 'Large KPI numbers'),
        swatch('accent-soft', color.accentSoft),
        swatch('brand-navy', color.brandNavy, 'Logo wordmark ink'),
      ].join(''))}

      ${heading('Chart series', 'Applied in order. Two teals alternate with two blues so a stacked series stays readable at slide scale.')}
      ${grid(color.series.map((hex, i) => swatch(`series-${i + 1}`, hex)).join(''))}
    </div>`,
  }),
}

/** Gradients, and the note about why they matter to export. */
export const Gradients = {
  parameters: {
    docs: {
      description: {
        story:
          'All four run deep blue → bright teal; only the angle changes. PptxGenJS has no gradient fill, so the exporter rasterises these to a background image layer and keeps the text above them live and editable.',
      },
    },
  },
  render: () => ({
    template: `<div>${grid(
      Object.entries(gradient)
        .map(([name, g]) => {
          const css = `linear-gradient(${g.angle}deg, ${g.from} 0%, ${g.to} 100%)`
          const label = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
          return `<div style="display:flex; flex-direction:column; gap:6px;">
            <div style="height:110px; border-radius:10px; background:${css};"></div>
            <div style="font:600 12px/1.3 Poppins, sans-serif;">${label}</div>
            <div style="font:400 11px/1.4 ui-monospace, monospace; color:#7b7b7b;">${g.angle}deg · ${g.from} → ${g.to}</div>
          </div>`
        })
        .join(''),
      220
    )}</div>`,
  }),
}

/** The measured table ramp. */
export const TableTint = {
  parameters: {
    docs: {
      description: {
        story:
          'Sampled row-by-row off the four integration slides. Deliberately not the `orient` ramp — every step reads brighter, and the samples do not fit one cyan at descending opacity either, so it is kept as its own measured ramp. Rows apply top-to-bottom in order.',
      },
    },
  },
  render: () => ({
    template: `<div style="max-width:720px;">
      <div style="border-radius:8px; overflow:hidden; border:1px solid rgba(0,0,0,0.08);">
        <div style="background:${tableTint.header}; color:${tableTint.headerText};
          font:700 13px/1 Poppins, sans-serif; padding:16px 20px;">header</div>
        ${tableTint.rows
          .map(
            (hex, i) => `<div style="background:${hex}; padding:16px 20px;
              font:500 13px/1 Poppins, sans-serif; display:flex; justify-content:space-between;">
              <span>row-${i + 1}</span>
              <span style="font-family:ui-monospace, monospace; opacity:.65;">${hex}</span>
            </div>`
          )
          .join('')}
      </div>
    </div>`,
  }),
}
