import type { Meta, StoryObj } from '@storybook/react-vite'
import { Code, Grid, Page, Section, Specimen } from './_docs'
import { motion } from '../../tokens/tokens.js'

/** FOUNDATIONS / Motion — slide transitions, and where motion is banned. */
const meta = {
  title: 'Foundations/Motion',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Motion

Motion in this system belongs to the **deck player** — advancing between slides —
and nowhere else.

That is a hard rule with a concrete reason: every slide is also rasterised by
headless Chromium for the PNG and PPTX exports. Anything that animates on mount
gets captured **mid-transition**, so an animated chart or a fading card silently
produces a broken export. MUI X charts are therefore always given
\`skipAnimation\`, and no element animates itself.

Durations respect \`prefers-reduced-motion\`: the player falls back to an instant
cut, which is also what the exporters see.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Transitions: Story = {
  render: () => (
    <Page>
      <Section
        title="Durations & easing"
        intro="Used by the deck player for slide advance. Deliberately few — a presentation is paced by the speaker, not by the software."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(motion.duration).map(([name, ms]) => (
            <div key={name} style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 90, font: '600 13px/1.4 Poppins, sans-serif' }}>{name}</div>
              <Code>{ms}ms</Code>
            </div>
          ))}
          <div style={{ height: 8 }} />
          {Object.entries(motion.easing).map(([name, curve]) => (
            <div key={name} style={{ display: 'flex', gap: 14, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 90, font: '600 13px/1.4 Poppins, sans-serif' }}>{name}</div>
              <Code>{curve}</Code>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Slide advance"
        intro="Hover a tile to preview. `cut` is the default: a deck of dense information slides reads better with no transition at all, and it is the only option that matches the exported PDF exactly."
      >
        <Grid min={210}>
          {Object.entries(motion.transitions).map(([name, note]) => (
            <Specimen key={name} label={name} meta={note} minHeight={130}>
              <div
                style={{
                  width: '100%',
                  height: 92,
                  borderRadius: 8,
                  background: 'var(--slide-gradient-brand)',
                  transition:
                    name === 'cut'
                      ? 'none'
                      : `all ${motion.duration.slide}ms ${motion.easing.standard}`,
                  opacity: name === 'fade' ? 0.55 : 1,
                  transform: name === 'push' ? 'translateX(-6%)' : 'none',
                }}
              />
            </Specimen>
          ))}
        </Grid>
      </Section>

      <Section title="Banned on slides">
        <div style={{ font: '400 13.5px/1.7 Poppins, sans-serif', color: '#546e7a', maxWidth: '68ch' }}>
          No entrance animations, no scroll-triggered reveals, no chart draw-in, no
          hover states on slide content. A slide has no hover — it is projected. And
          anything that moves on mount will be captured half-finished by the export
          scripts.
        </div>
      </Section>
    </Page>
  ),
}
