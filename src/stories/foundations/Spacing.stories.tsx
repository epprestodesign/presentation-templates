import type { Meta, StoryObj } from '@storybook/react-vite'
import { space } from '../../tokens/tokens.js'
import { Code, Page, Section } from './_docs'

/** FOUNDATIONS / Spacing */
const meta = {
  title: 'Foundations/Spacing',
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: `
## Spacing

One scale, in slide px. Use a step rather than an arbitrary gap — the scale is
what keeps two independently built slides feeling like one deck.
        ` } },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Scale: Story = {
  render: () => (
    <Page>
      <Section
        title="Spacing scale"
        intro="Slide px. Use a step rather than an arbitrary gap — the scale is what keeps two independently built slides feeling like one deck."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(space).map(([step, value]) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ minWidth: 34, font: '600 13px/1.4 Poppins, sans-serif' }}>{step}</div>
              <div style={{ minWidth: 56 }}>
                <Code>{value}px</Code>
              </div>
              <div
                style={{
                  height: 18,
                  width: value,
                  background: 'var(--slide-color-accent)',
                  borderRadius: 3,
                  flex: 'none',
                }}
              />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}
