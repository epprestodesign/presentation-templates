import type { Meta, StoryObj } from '@storybook/react-vite'
import { canvas, grid } from '../../tokens/tokens.js'
import { Code, Page, Section } from './_docs'

/** FOUNDATIONS / Grid & Safe Areas */
const meta = {
  title: 'Foundations/Grid & Safe Areas',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: { description: { component: `
## Grid & Safe Areas

The product design system has **Breakpoints**; a slide has none. It never
reflows, so there is nothing to break at — instead there is one fixed canvas and
the safe areas inside it.

1280×720 is not arbitrary: at 96px/inch it is exactly 13.333in × 7.5in, which is
PowerPoint's and Google Slides' 16:9 slide. So \`1px === 1/96in\` and the
exporter is a divide-by-96 with no layout re-flow.
        ` } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Canvas: Story = {
  render: () => (
    <Page>
      <Section
        title="One canvas, no breakpoints"
        intro="A slide never reflows, so there is nothing to break at. The product design system has Breakpoints; this one has a single fixed canvas and the safe areas inside it."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {[
            ['Canvas', `${canvas.width} × ${canvas.height} px`],
            ['Physical', `${canvas.inchWidth.toFixed(3)}in × ${canvas.inchHeight}in at ${canvas.pxPerInch}px/in`],
            ['Why', 'Exactly PowerPoint / Google Slides 16:9, so 1px = 1/96in and export is a divide-by-96'],
            ['Export scale', `${canvas.exportScale}× (${canvas.width * 2} × ${canvas.height * 2})`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 110, font: '600 13px/1.5 Poppins, sans-serif' }}>{k}</div>
              <div style={{ font: '400 13px/1.5 Poppins, sans-serif', color: '#546e7a' }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Safe areas"
        intro="Margins and the vertical anchors the reference deck lands on. Templates position against these rather than inventing coordinates — that is what keeps 40 slides putting their headline in the same place."
      >
        {/* Scaled preview of the artboard with its anchors drawn on. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: canvas.width * 0.6,
            aspectRatio: `${canvas.width} / ${canvas.height}`,
            border: '1px solid #d4d4d4',
            borderRadius: 6,
            background: '#fff',
            overflow: 'hidden',
            font: '600 9px/1 Poppins, sans-serif',
          }}
        >
          {/* margins */}
          <div
            style={{
              position: 'absolute',
              inset: `${(grid.marginTop / canvas.height) * 100}% ${(grid.marginX / canvas.width) * 100}%`,
              border: '1px dashed rgba(2,173,179,0.55)',
              background: 'rgba(2,173,179,0.04)',
            }}
          />
          {/* watermark gutter */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: `${(grid.watermarkGutter / canvas.width) * 100}%`,
              background: 'rgba(0,0,0,0.05)',
              borderLeft: '1px dashed rgba(0,0,0,0.3)',
            }}
          />
          {/* vertical anchors */}
          {(
            [
              ['chromeY', grid.chromeY],
              ['titleY', grid.titleY],
              ['leadY', grid.leadY],
              ['bodyY', grid.bodyY],
            ] as const
          ).map(([label, y]) => (
            <div key={label} style={{ position: 'absolute', left: 0, right: 0, top: `${(y / canvas.height) * 100}%` }}>
              <div style={{ borderTop: '1px solid rgba(2,133,157,0.8)' }} />
              <div style={{ color: '#02859d', padding: '2px 0 0 4px' }}>
                {label} · {y}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(
            [
              ['marginX', grid.marginX, 'Left and right page margin'],
              ['watermarkGutter', grid.watermarkGutter, 'Reserved for the wordmark — full-width wells must stop here'],
              ['columns / gutter', `${grid.columns} / ${grid.gutter}px`, `Column width ${grid.columnWidth.toFixed(2)}px`],
              ['contentWidth', grid.contentWidth, '1280 − 2 × marginX'],
            ] as const
          ).map(([k, v, note]) => (
            <div key={k} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <div style={{ minWidth: 150, font: '600 13px/1.4 Poppins, sans-serif' }}>{k}</div>
              <Code>{typeof v === 'number' ? `${v}px` : v}</Code>
              <div style={{ font: '400 13px/1.5 Poppins, sans-serif', color: '#546e7a' }}>{note}</div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}
