import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatCard } from '../../elements/data/StatCard'
import { SlideChart } from '../../elements/data/SlideChart'
import { DataTable } from '../../elements/data/DataTable'
import { Page, Row, Section, Stage } from './_stage'

/** ELEMENTS / Data — KPI tiles, charts and tables. */
const meta = {
  title: 'Components/Data',
  tags: ['autodocs'],
  parameters: {
    // Explicit, not inherited. Storybook's `backgrounds` global persists across
    // navigation, and the Templates stories set it to the grey review stage —
    // so without this a docs page keeps whatever the last slide chose.
    backgrounds: { value: 'white' },
    docs: {
      description: {
        component: `
## Data

The elements that carry numbers. All three keep their content as **data** so the
PPTX emitter can rebuild them as editable objects rather than pictures — a
\`ChartSpec\` becomes a native chart whose figures can be edited in Google
Slides, and a \`DataTable\` becomes a real table.
        `,
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Stats: Story = {
  render: () => (
    <Page>
      <Section
        title="StatCard"
        intro="One component, two fills and two orders. The reference uses the muted #f5f5f5 card and the brand gradient interchangeably and reverses the ink on the second, so a single row can mix them without drifting."
      >
        <Row>
          <Stage label="muted · label-first" width={284} surface="stage" height={360}>
            <div style={{ height: 322 }}>
              <StatCard label="Reservations" value="1.2M" icon="arrow_outward" />
            </div>
          </Stage>
          <Stage label="brand · label-first" width={284} surface="stage" height={360}>
            <div style={{ height: 322 }}>
              <StatCard label="Annual Events" value="4.8K" icon="arrow_outward" surface="brand" />
            </div>
          </Stage>
          <Stage
            label="value-first + description"
            note="The revenue-durability slide puts the figure above the label and adds a sentence."
            width={340}
            surface="stage"
            height={360}
          >
            <div style={{ height: 322 }}>
              <StatCard
                value="615K"
                label="Gross Revenue Retention"
                description="Booking volume retained from the prior-year cohort, before expansion."
                order="value-first"
                valueSize="statSm"
                align="top"
              />
            </div>
          </Stage>
        </Row>
      </Section>
    </Page>
  ),
}

export const Charts: Story = {
  render: () => (
    <Page>
      <Section
        title="SlideChart"
        intro="Takes a ChartSpec, renders with MUI X. Two departures from library defaults, both matching the deck: bars carry a vertical brand gradient, and every value is printed above its bar rather than hidden in a tooltip — a slide is read from across a room and never hovered. skipAnimation is unconditional, because an animating chart is captured mid-transition by the export scripts."
      >
        <Stage label="bar · gradient · value labels" width={620} surface="light">
          <SlideChart
            width={620}
            height={340}
            spec={{
              kind: 'bar',
              title: 'Total Revenue',
              subtitle: 'Management Base Plan',
              unit: 'USD $000s',
              fill: 'brandVertical',
              valueLabels: true,
              yMax: 8000,
              format: (v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)),
              categories: ['2023', '2024A', '2025', '2026E', '2027E'],
              series: [{ name: 'Revenue', data: [940, 1610, 2750, 4480, 7300] }],
            }}
          />
        </Stage>
      </Section>
    </Page>
  ),
}

export const Tables: Story = {
  render: () => (
    <Page>
      <Section
        title="DataTable · tint"
        intro="Pure black header, then rows filled from the measured 5-step cyan ramp. The tint comes from the row's INDEX, not its data, so reordering rows keeps the ramp intact and a row can never pick the wrong colour. A table longer than the ramp holds the lightest step."
      >
        <Stage label="tint variant" width={900} surface="light">
          <DataTable
            variant="tint"
            headers={['Suggested Placement', 'Integration Description']}
            columnWidths={[260, 640]}
            minRowHeight={72}
            rows={[
              { label: 'Event Pages', cells: [{ bullets: ['Embed a static “Book Your Hotel” link in the event details section.'] }] },
              { label: 'Emails', cells: [{ bullets: ['Include a static booking link in campaigns or newsletters.'] }] },
              { label: 'Social Media', cells: [{ bullets: ['Share static booking links in social content.'] }] },
            ]}
          />
        </Stage>
      </Section>
    </Page>
  ),
}
