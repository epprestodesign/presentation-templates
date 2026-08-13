import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from '../../elements/brand/Icon'
import { Code, Grid, Page, Section, Specimen } from './_docs'

/** FOUNDATIONS / Icons — the full Material Symbols library. */
const meta = {
  title: 'Foundations/Icons',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Icons

The complete **Material Symbols** library — roughly 3,700 glyphs — shipped as
three variable fonts (rounded, outlined, sharp) from the \`material-symbols\`
package. Self-hosted, never a CDN: the export scripts render in headless
Chromium and an icon font that failed to load would leave ligature *text* on the
slide instead of a glyph.

Naming a glyph is the whole API — \`<Icon name="arrow_outward" />\`. There is no
per-icon import and no sprite to maintain, which is what makes an
agent-authored slide cheap to write.

**Rounded at weight 300** is the default, because it matches the thin geometric
line icons in the reference deck.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The glyphs the reference deck actually uses, by role. */
const IN_USE: { group: string; note: string; icons: string[] }[] = [
  {
    group: 'Metrics',
    note: 'The corner mark on a KPI tile. The reference uses a plain diagonal arrow, not a zigzag trend line.',
    icons: ['arrow_outward', 'trending_up', 'show_chart', 'bar_chart', 'monitoring'],
  },
  {
    group: 'Housing & travel',
    note: 'The ecosystem and product slides.',
    icons: ['hotel', 'signpost', 'room_service', 'stadium', 'flight', 'luggage', 'bed', 'apartment'],
  },
  {
    group: 'Commerce',
    note: 'Payments, ticketing and distribution.',
    icons: ['credit_card', 'confirmation_number', 'local_activity', 'payments', 'receipt_long', 'account_balance'],
  },
  {
    group: 'Workflow',
    note: 'Registration, contracts and reporting.',
    icons: ['how_to_reg', 'description', 'checklist', 'handshake', 'schedule', 'sync', 'groups'],
  },
  {
    group: 'Contact',
    note: 'The closing and team slides.',
    icons: ['mail', 'call', 'link', 'language', 'location_on'],
  },
]

/** The icons the deck uses, grouped by the job they do. */
export const InUse: Story = {
  render: () => (
    <Page>
      {IN_USE.map(({ group, note, icons }) => (
        <Section key={group} title={group} intro={note}>
          <Grid min={132}>
            {icons.map((name) => (
              <Specimen key={name} label={name} minHeight={84}>
                <Icon name={name} size={40} weight={300} color="var(--slide-color-accent)" />
              </Specimen>
            ))}
          </Grid>
        </Section>
      ))}
    </Page>
  ),
}

/** The three styles, side by side. */
export const Styles: Story = {
  render: () => (
    <Page>
      <Section
        title="Styles"
        intro="All three ship. Rounded is the default because it sits best with Poppins' geometry and the rounded card language of the deck; outlined and sharp are available when a deck wants a different voice."
      >
        <Grid min={200}>
          {(['rounded', 'outlined', 'sharp'] as const).map((style) => (
            <Specimen key={style} label={style} meta={`material-symbols-${style}`} minHeight={110}>
              <div style={{ display: 'flex', gap: 14 }}>
                {['hotel', 'stadium', 'payments'].map((name) => (
                  <Icon key={name} name={name} style={style} size={34} weight={300} />
                ))}
              </div>
            </Specimen>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
}

/** Weight and fill, the two variable axes worth using. */
export const WeightAndFill: Story = {
  render: () => (
    <Page>
      <Section
        title="Weight"
        intro="The variable font runs 100–700. The deck reads as 300; heavier weights start to compete with Poppins Bold headlines."
      >
        <Grid min={132}>
          {[100, 200, 300, 400, 500, 600, 700].map((weight) => (
            <Specimen key={weight} label={`wght ${weight}`} minHeight={84}>
              <Icon name="stadium" size={40} weight={weight} />
            </Specimen>
          ))}
        </Grid>
      </Section>

      <Section
        title="Fill"
        intro="Filled glyphs read as a state change rather than a decoration, so the deck stays outlined and keeps fill for emphasis."
      >
        <Grid min={132}>
          {[false, true].map((filled) => (
            <Specimen key={String(filled)} label={filled ? 'FILL 1' : 'FILL 0'} minHeight={84}>
              <Icon name="confirmation_number" size={40} weight={300} filled={filled} />
            </Specimen>
          ))}
        </Grid>
      </Section>

      <Section
        title="Optical size"
        intro="`opsz` tracks the rendered size automatically inside the component. Without it a small icon looks spindly next to a large one — these are the same glyph at four sizes, each optically corrected."
      >
        <Grid min={132}>
          {[16, 24, 40, 64].map((size) => (
            <Specimen key={size} label={`${size}px`} minHeight={90}>
              <Icon name="hotel" size={size} weight={300} />
            </Specimen>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
}

/** A live search across a curated slice, so a name can be found without
 *  leaving Storybook. The full 3,700 are all available by name. */
export const Finder: Story = {
  render: () => {
    const ALL = IN_USE.flatMap((g) => g.icons).concat([
        'calendar_month', 'group_add', 'inventory', 'key', 'lock', 'map',
        'notifications', 'percent', 'person', 'price_check', 'query_stats',
        'rate_review', 'search', 'settings', 'share', 'shopping_cart', 'star',
        'support_agent', 'task_alt', 'timeline', 'verified', 'visibility',
        'warning', 'work',
      ])
    const unique = [...new Set(ALL)].sort()

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [query, setQuery] = useState('')
    const hits = unique.filter((n) => n.includes(query.trim().toLowerCase()))

    return (
      <Page>
        <Section
          title="Finder"
          intro="A curated slice, searchable. Any of the ~3,700 Material Symbols names works in the component even if it is not listed here — this is a convenience, not the catalogue."
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter icon names…"
            style={{
              font: '400 14px/1.4 Poppins, sans-serif',
              padding: '10px 14px',
              border: '1px solid #d4d4d4',
              borderRadius: 8,
              width: '100%',
              maxWidth: 360,
              marginBottom: 20,
            }}
          />
          {hits.length === 0 ? (
            <Code>no matches in this slice — the name may still be valid</Code>
          ) : (
            <Grid min={126}>
              {hits.map((name) => (
                <Specimen key={name} label={name} minHeight={76}>
                  <Icon name={name} size={32} weight={300} />
                </Specimen>
              ))}
            </Grid>
          )}
        </Section>
      </Page>
    )
  },
}
