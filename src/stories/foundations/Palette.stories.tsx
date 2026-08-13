import type { Meta, StoryObj } from '@storybook/react-vite'
import { palette } from '../../tokens/palette.js'
import { Grid, Page, Section, Swatch } from './_docs'

/** FOUNDATIONS / Palette — the raw primitive ramps. */
const meta = {
  title: 'Foundations/Palette',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Palette

Tier 1. Raw values with no meaning attached — \`orient\` is the blue half of the
EventPipe logo, \`fountain-blue\` its teal half.

**Elements and templates must not reference these directly.** They exist so the
semantic tokens on the **Colors** page have something to be built from, and so
the ramps are documented. Reaching past the semantic layer to a raw step is how
a deck ends up with six slightly different teals.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const kebab = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

const RAMP_NOTES: Record<string, string> = {
  orient: 'The blue half of the logo. Deep ends of gradients, chart series 2.',
  fountainBlue:
    'The teal half of the logo. The primary slide accent: highlighted headline clauses, KPI numbers, rules, chart series 1.',
  neutral:
    'True hue-less gray. Slide surfaces read as neutral in the reference deck, not as the product UI\u2019s cool graphite. Step 100 is exactly the #f5f5f5 card fill.',
  blueGrey:
    'One borrowed Material ramp. The reference sets card body copy in #546e7a \u2014 cooler than neutral, and distinct enough on screen to keep rather than flatten.',
}

export const Ramps: Story = {
  render: () => (
    <Page>
      {Object.entries(palette).map(([name, steps]) => (
        <Section key={name} title={kebab(name)} intro={RAMP_NOTES[name]}>
          <Grid min={124}>
            {Object.entries(steps).map(([step, hex]) => (
              <Swatch key={step} label={step} value={hex} height={64} />
            ))}
          </Grid>
        </Section>
      ))}
    </Page>
  ),
}
