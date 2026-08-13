import type { Meta, StoryObj } from '@storybook/react-vite'
import { type as typeTokens } from '../../tokens/tokens.js'
import { Code, Page, Section } from './_docs'

/** FOUNDATIONS / Typography — Poppins and the slide type scale. */
const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Typography

**Poppins** throughout, self-hosted from \`@fontsource/poppins\` — never a CDN
link. That is not a preference: the export scripts render slides in headless
Chromium, and a webfont that failed to load would silently change every line
break and every measurement in the deck.

Sizes are px in the 1280×720 slide space. They were set by matching **cap
height** to the reference deck rather than line width, because Poppins runs
wider per em than the face the original decks used. A width match would have
left the letters visibly short; the trade-off is that long headlines wrap one
word earlier here than in the originals.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SPECIMEN: Record<string, string> = {
  display: 'The booking layer is built.',
  h1: 'Growth across every operation metric.',
  h2: 'Revenue durability',
  h3: 'Booking SaaS',
  h4: 'Base Plan Revenue',
  lead: 'EventPipe connects event operators, housing companies, hotels, teams, and attendees around one live source of truth.',
  body: 'Reservation fees create a durable base. Transactional products add revenue per booking as customers adopt more of the platform.',
  bodySm: 'Share of 2025 revenue from the ten largest customers.',
  caption: 'Figures in thousands (USD $000s)',
  eyebrow: 'Core Business',
  pageNumber: '08',
  stat: '$8.4M',
  statSm: '615K',
}

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

/** Every step in the scale, at true slide size. */
export const Scale: Story = {
  render: () => (
    <Page>
      <Section
        title="The scale"
        intro="Rendered at true slide size — a 64px display step is 64px here, so what you see is what a slide gets. Long specimens wrap against the browser width rather than a fixed column, which is also a useful check that a step behaves when its copy runs long."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {Object.entries(typeTokens.scale).map(([name, s]) => (
            <div
              key={name}
              style={{
                display: 'grid',
                // Label column is fixed; the specimen takes the rest, so the
                // page reflows without the labels ever wrapping.
                gridTemplateColumns: 'minmax(150px, 190px) 1fr',
                gap: 24,
                alignItems: 'baseline',
                paddingBottom: 22,
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ font: '600 13px/1.3 Poppins, sans-serif' }}>{kebab(name)}</div>
                <Code>
                  {s.size}px · {s.weight} · lh {s.lineHeight} · {s.tracking}
                </Code>
              </div>
              <div
                className={`ds-text-${kebab(name)}`}
                style={{ minWidth: 0, overflowWrap: 'anywhere' }}
              >
                {SPECIMEN[name] ?? name}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

/** The weights that ship. */
export const Weights: Story = {
  render: () => (
    <Page>
      <Section
        title="Weights"
        intro="Only these four ship, plus italics at 400/600/700. Every additional weight is another font file the export has to load before it can measure a line, so the set is kept to what the deck actually uses."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {Object.entries(typeTokens.weights).map(([name, weight]) => (
            <div key={name} style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'baseline' }}>
              <div style={{ minWidth: 150 }}>
                <div style={{ font: '600 13px/1.3 Poppins, sans-serif' }}>{name}</div>
                <Code>{weight}</Code>
              </div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: weight, fontSize: 26 }}>
                EventPipe is the system of record
              </div>
              <div
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: weight,
                  fontSize: 26,
                  fontStyle: 'italic',
                  color: '#546e7a',
                }}
              >
                italic
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}

/** Colour roles that pair with the scale. */
export const InkRoles: Story = {
  render: () => (
    <Page>
      <Section
        title="Ink roles"
        intro="Applied as modifier classes on any step. The two grays are distinct roles rather than a fallback chain."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['ds-text-subtle', 'text-subtle — secondary copy'],
            ['ds-text-muted', 'text-muted — labels and roles'],
            ['ds-text-cool', 'text-cool — body copy inside cards'],
            ['ds-text-accent', 'text-accent — the highlighted headline clause'],
            ['ds-text-accent-deep', 'text-accent-deep — large KPI numbers'],
          ].map(([cls, label]) => (
            <div key={cls} className={`ds-text-h3 ${cls}`}>
              {label}
            </div>
          ))}
          <div
            style={{
              background: 'var(--slide-gradient-brand-bleed)',
              borderRadius: 10,
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div className="ds-text-h3 ds-text-on-brand">text-on-brand — over the gradient</div>
            <div className="ds-text-body ds-text-on-brand-subtle">
              text-on-brand-subtle — supporting copy over the gradient
            </div>
          </div>
        </div>
      </Section>
    </Page>
  ),
}
