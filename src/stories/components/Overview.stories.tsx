import type { Meta, StoryObj } from '@storybook/react-vite'
import { Page, Section } from '../foundations/_docs'
import { TEMPLATE_COUNT, USAGE, type UsageRow } from './_usage'

/** COMPONENTS / Overview — what is actually shared, measured from the source. */
const meta = {
  title: 'Components/Overview',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## What is actually shared

Every row below is **generated from the template source** by
\`pnpm usage:map\`, not maintained by hand. That matters: this is the page you
would consult before changing a shared component, so a list that quietly went
stale would fail at exactly the moment it was needed.

### The finding

The system has a **narrow spine and a long tail**. Five components carry almost
every slide; nineteen are used by one or two templates each. That is not a
defect — a staircase card genuinely is only used by the staircase slide — but it
does tell you where a style-guide edit is cheap and where it is expensive:

- Changing **SlideFrame** or **SlideHeading** moves nearly every slide in the
  deck. Treat those as the style guide itself.
- Changing anything in the tail moves one slide. Those are safe to iterate on.
- The middle — **AccentText**, **Icon**, **SlideChart** — is where an
  unconsidered change does damage that is easy to miss in review, because it
  lands on a third of the deck without being obviously "a global change".

### What to do with the tail

Resist promoting it. A single-use component is only worth generalising when a
second template genuinely wants it; until then, "shared" is a claim the code
cannot honour and the abstraction costs more than it saves.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const sans = 'Poppins, system-ui, sans-serif'

/** Reuse bands. The cuts are where the data actually steps, not round numbers:
 *  there is a real gap between SlideChart at 5 and the next component at 2. */
function tier(n: number) {
  if (n >= 15) return { name: 'Spine', note: 'Changing this moves the whole deck', color: '#0075a4' }
  if (n >= 5) return { name: 'Shared', note: 'Lands on a third of the deck at once', color: '#02adb3' }
  if (n >= 2) return { name: 'Paired', note: 'Two templates rely on it', color: '#fdb022' }
  return { name: 'Single-use', note: 'Private to one template in practice', color: '#a3a3a3' }
}

function Row({ row }: { row: UsageRow }) {
  const t = tier(row.templates.length)
  const pct = Math.round((row.templates.length / TEMPLATE_COUNT) * 100)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 1.1fr) 78px minmax(120px, 2fr)',
        gap: 16,
        alignItems: 'center',
        padding: '10px 0',
        borderTop: '1px solid #e5e5e5',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ font: `600 13px/1.4 ${sans}` }}>{row.name}</div>
        <div style={{ font: `400 11.5px/1.4 ${sans}`, color: '#7b7b7b' }}>{row.group}</div>
      </div>

      <div style={{ font: `600 13px/1.4 ${sans}`, color: t.color, whiteSpace: 'nowrap' }}>
        {row.templates.length} / {TEMPLATE_COUNT}
      </div>

      <div style={{ minWidth: 0 }}>
        {/* The bar is the point of the page — the shape of the distribution is
            what tells you the system has a spine and a tail, which a column of
            numbers alone does not. */}
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: t.color }} />
        </div>
        <div
          style={{
            font: `400 11px/1.5 ${sans}`,
            color: '#546e7a',
            marginTop: 5,
            overflowWrap: 'anywhere',
          }}
        >
          {row.templates.join(' · ')}
        </div>
      </div>
    </div>
  )
}

export const Reuse: Story = {
  render: () => {
    const bands = ['Spine', 'Shared', 'Paired', 'Single-use']
    return (
      <Page>
        <Section
          title="Reuse across templates"
          intro={`${USAGE.length} shared components across ${TEMPLATE_COUNT} templates, most-reused first. Generated from the imports in src/templates — run \`pnpm usage:map\` after adding or re-wiring a template.`}
        >
          {bands.map((band) => {
            const rows = USAGE.filter((r) => tier(r.templates.length).name === band)
            if (!rows.length) return null
            const t = tier(rows[0].templates.length)
            return (
              <div key={band} style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
                  <span style={{ font: `600 13px/1.4 ${sans}`, color: t.color }}>{band}</span>
                  <span style={{ font: `400 11.5px/1.4 ${sans}`, color: '#546e7a' }}>{t.note}</span>
                </div>
                {rows.map((r) => (
                  <Row key={`${r.group}/${r.name}`} row={r} />
                ))}
              </div>
            )
          })}
        </Section>
      </Page>
    )
  },
}
