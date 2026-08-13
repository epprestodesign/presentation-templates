import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccentText } from '../../elements/text/AccentText'
import { Page, Row, Section, Stage } from './_stage'

/** ELEMENTS / Text — the run model every headline is built from. */
const meta = {
  title: 'Elements/Text',
  component: AccentText,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Text

\`AccentText\` renders **rich text as data**. That is the single most important
component in the system, because it is what keeps a headline exportable.

A two-tone headline written as runs becomes **one PowerPoint text box with two
styled runs** — so in Google Slides the presenter edits the words and the teal
emphasis survives. The same headline written as JSX with a \`<span>\` could only
ever export as a picture of a headline.

### The three run forms

\`\`\`ts
'plain text'                                     // no styling
{ accent: 'teal text' }                          // shorthand, one style
{ text: 'teal AND underlined', accent: true, underline: true }
\`\`\`

Styles **compose**. They were mutually exclusive at first, which silently
rendered the opening slide's underlined figures in black when the reference has
them teal *and* underlined.

### Manual line breaks

Use \`\\n\`. The reference breaks headlines at chosen words — "Static Booking /
Hyperlinks" — which natural wrapping cannot reproduce. Explicit breaks beat
\`text-wrap: balance\`, which only governs automatic wrapping.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const RunForms: Story = {
  render: () => (
    <Page>
      <Section
        title="Composable runs"
        intro="Each specimen is one AccentText. The size comes from a ds-text-* class, never from the component — which is why AccentText declares no font properties at all."
      >
        <Row>
          <Stage label="plain" width={520} surface="light">
            <AccentText className="ds-text-h2" content="Growth across every operation metric." />
          </Stage>
          <Stage label="accent shorthand" width={520} surface="light">
            <AccentText
              className="ds-text-h2"
              content={['The core business is growing ', { accent: 'before the layers arrive.' }]}
            />
          </Stage>
          <Stage
            label="accent + underline, composed"
            note="The form that had to exist: the opening slide sets its figures teal AND underlined. With mutually-exclusive styles the underlined span fell back to black."
            width={520}
            surface="light"
          >
            <AccentText
              className="ds-text-h2"
              content={[
                { accent: 'with ' },
                { text: '$400M+ in lifetime bookings', accent: true, underline: true },
              ]}
            />
          </Stage>
          <Stage label="bold · italic · muted" width={520} surface="light">
            <AccentText
              className="ds-text-lead"
              content={[
                'In 2025, youth sports generated ',
                { bold: '$186 billion' },
                ' — ',
                { italic: 'an estimate' },
                ' — ',
                { muted: 'source: SFIA' },
              ]}
            />
          </Stage>
        </Row>
      </Section>

      <Section
        title="Manual line breaks"
        intro="Left wraps naturally at the column width; right uses \\n to break where the reference does."
      >
        <Row>
          <Stage label="automatic" width={360} surface="light">
            <AccentText className="ds-text-h3" content="Static Booking Hyperlinks" />
          </Stage>
          <Stage label="explicit \n" width={360} surface="light">
            <AccentText className="ds-text-h3" content={'Static Booking\nHyperlinks'} />
          </Stage>
        </Row>
      </Section>

      <Section
        title="On the brand gradient"
        intro="Accent teal is effectively invisible on the brand surface, so emphasis there has to come from weight or a line break — not hue. Templates pass onDark, which switches the ink to white."
      >
        <Row>
          <Stage label="accent on brand — do not do this" width={520} surface="brand">
            <AccentText
              className="ds-text-h3 ds-text-on-brand"
              content={['Emphasis in ', { accent: 'teal disappears' }, ' here.']}
            />
          </Stage>
          <Stage label="weight instead" width={520} surface="brand">
            <AccentText
              className="ds-text-h3 ds-text-on-brand"
              content={['Emphasis by ', { bold: 'weight' }, ' survives.']}
            />
          </Stage>
        </Row>
      </Section>
    </Page>
  ),
}
