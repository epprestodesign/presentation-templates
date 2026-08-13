import type { Meta, StoryObj } from '@storybook/react-vite'
import { radius, shadow } from '../../tokens/tokens.js'
import { Grid, Page, Section, Specimen } from './_docs'

/** FOUNDATIONS / Elevation */
const meta = {
  title: 'Foundations/Elevation',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: { description: { component: `
## Elevation

Two shadows only. A slide is a flat medium: depth is used for the floating photo
clusters and the chart callout, and nowhere else. More levels would read as UI
rather than as a slide.
        ` } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Levels: Story = {
  render: () => (
    <Page>
      <Section
        title="Elevation"
        intro="Two shadows only. A slide is a flat medium — depth is used for the floating photo clusters and the chart callout, and nowhere else. More levels would read as UI, not as a slide."
      >
        <Grid min={230}>
          {Object.entries(shadow).map(([name, value]) => (
            <Specimen key={name} label={name} meta={value} minHeight={140}>
              <div
                style={{
                  width: '78%',
                  height: 86,
                  borderRadius: radius.card,
                  background: '#fff',
                  boxShadow: value,
                }}
              />
            </Specimen>
          ))}
        </Grid>
      </Section>
    </Page>
  ),
}
