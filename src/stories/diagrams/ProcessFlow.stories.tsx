import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { ProcessFlow } from '../../diagrams/ProcessFlow'

/** DIAGRAMS / Process Flow — who does what, with what payload, on a slide. */
const meta = {
  title: 'Diagrams/Process Flow',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Process

A sequential process where **who** does the step and **what payload** moves are
both part of the claim. Reach for [Swimlane](/docs/diagrams-swimlane--docs)
instead when the payloads do not matter; reach for this when the reader has to see,
per step, who owns it, what arrives and what leaves.

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens. Upstream this is the one
**parametric** type — every coordinate is a formula over the inputs, and two
generations from the same inputs must produce identical SVG. That property is
kept; the formulas are rederived from the well rather than from upstream's fixed
112px step slot, because a diagram that assumes 1400px wide would be scaled, and
a scaled diagram has soft hairlines and fractional type.

### Three focal slots, one entry each

- **One focal step** — the analytical or decision pivot. Its header chip is accent.
- **One focal node** — the step receiving the critical handoff.
- **One focal arrow set** — the edges touching the focal node.

### Four departures from upstream

**The focal arrow set is derived.** Upstream asks the author to declare
\`style: focal-in\` / \`focal-out\`. Any edge touching the focal node is accented
automatically here, which removes a whole class of inconsistency — with one
tightening: a **trigger** off the focal node stays muted, because accent marks
the payload path and an orchestration hop is not one.

**Payload chips are hairline, not filled.** Upstream fills each chip with a
per-format hex and sets white 5px mono inside. Codes here take their colour from
\`role.series\`, the deck's own categorical ramp, and are drawn like a type tag —
a filled chip at 8.5px is a coloured smudge.

**No dot-pattern ground.** Upstream's §2.1 paints dotted paper; its own SKILL.md
forbids that inside a slide, where the texture compounds with the chrome.

**One legend strip, from \`primitives\`.** Upstream builds a bespoke three- or
four-row legend inside the drawing. The deck already reserves 52px below the well,
and the payload row is appended automatically so an author never has to know which
series step a code was given.

### Arrows are unlabelled by default

The step number and the lane carry the semantics. A label on every arrow is
noise; \`label\` exists for the non-step concepts only — a rework loop, an
escalation.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** Contract to settlement, with pickup as the pivot. */
export const ContractToSettlement: Story = {
  name: 'Contract to settlement',
  args: {
    eyebrow: 'Block Lifecycle',
    pageNumber: 28,
    title: ['Commission settles against ', { accent: 'posted pickup.' }],
    lead: 'Six steps, three owners, one pivot. Until the hotel posts actuals against the rooming list, every commission figure in the platform is an estimate — and the step that turns it into a number is the only one EventPipe does not own.',
    footnote:
      'Chips show the payload arriving (left) and leaving (right) each step. Dashed = a nightly trigger, not a handoff. Illustrative process — deposit schedules and rebates are omitted.',
    children: ({ width, height }) => (
      <ProcessFlow
        width={width}
        height={height}
        lanes={[
          { key: 'OPS', name: 'Housing\noperator' },
          { key: 'EPX', name: 'EventPipe' },
          { key: 'HTL', name: 'Hotel' },
        ]}
        steps={[
          { number: '1', label: 'Contract' },
          { number: '2', label: 'Build' },
          { number: '3', label: 'Sell' },
          { number: '4', label: 'Rooming' },
          { number: '5', label: 'Pickup', focal: true },
          { number: '6', label: 'Settle' },
        ]}
        payloads={[
          { code: 'CT', label: 'contract' },
          { code: 'BL', label: 'block' },
          { code: 'RS', label: 'bookings' },
          { code: 'RL', label: 'rooming list' },
          { code: 'PU', label: 'actuals' },
        ]}
        nodes={[
          { id: 'contract', lane: 'OPS', step: 0, title: 'Block contracted', tool: 'rates + attrition', out: 'CT' },
          { id: 'build', lane: 'EPX', step: 1, title: 'Block loaded', tool: 'inventory + rates', in: 'CT', out: 'BL' },
          { id: 'sell', lane: 'EPX', step: 2, title: 'Rooms sold', tool: 'teams + attendees', in: 'BL', out: 'RS' },
          { id: 'rooming', lane: 'OPS', step: 3, title: 'List released', tool: 'per-hotel export', in: 'RS', out: 'RL' },
          { id: 'pickup', lane: 'HTL', step: 4, title: 'Actuals posted', tool: 'nightly from PMS', in: 'RL', out: 'PU', focal: true },
          { id: 'settle', lane: 'OPS', step: 5, title: 'Commission paid', tool: 'invoice + payout', in: 'PU' },
        ]}
        edges={[
          { from: 'contract', to: 'build' },
          { from: 'build', to: 'sell' },
          { from: 'sell', to: 'rooming' },
          { from: 'rooming', to: 'pickup' },
          { from: 'pickup', to: 'settle' },
          { from: 'pickup', to: 'sell', trigger: true },
        ]}
        legend={[
          { label: 'Focal step', kind: 'focal' },
          { label: 'Trigger', line: 'default', dashed: true },
        ]}
      />
    ),
  },
}

/** A citywide build, where the pivot is the load nobody sees. */
export const CitywideBuild: Story = {
  name: 'Citywide build',
  args: {
    eyebrow: 'Citywide Build',
    pageNumber: 29,
    title: ['A citywide block is ', { accent: 'built once' }, ' and sold everywhere.'],
    lead: 'Five steps turn a demand forecast into sellable inventory across eleven properties. The pivot is the load: until blocks, rates and cut-offs are in the record, no booking site can quote a room.',
    footnote:
      'Chips show the payload arriving (left) and leaving (right) each step. Eleven properties are modelled as one lane. Room-night figures are illustrative.',
    children: ({ width, height }) => (
      <ProcessFlow
        width={width}
        height={height}
        lanes={[
          { key: 'OWN', name: 'Event\nowner' },
          { key: 'OPS', name: 'Housing\noperator' },
          { key: 'EPX', name: 'EventPipe' },
        ]}
        steps={[
          { number: '1', label: 'Forecast' },
          { number: '2', label: 'Solicit' },
          { number: '3', label: 'Contract' },
          { number: '4', label: 'Load', focal: true },
          { number: '5', label: 'Publish' },
        ]}
        payloads={[
          { code: 'FC', label: 'forecast' },
          { code: 'RF', label: 'bids' },
          { code: 'CT', label: 'contracts' },
          { code: 'BL', label: 'sellable block' },
        ]}
        nodes={[
          { id: 'forecast', lane: 'OWN', step: 0, title: 'Demand forecast', tool: '4,200 room-nights', out: 'FC' },
          { id: 'rfp', lane: 'OPS', step: 1, title: 'RFPs issued', tool: '11 properties', in: 'FC', out: 'RF' },
          { id: 'signed', lane: 'OPS', step: 2, title: 'Blocks signed', tool: 'rates + attrition', in: 'RF', out: 'CT' },
          { id: 'load', lane: 'EPX', step: 3, title: 'Inventory loaded', tool: 'blocks + cut-offs', in: 'CT', out: 'BL', focal: true },
          { id: 'live', lane: 'EPX', step: 4, title: 'Sites live', tool: 'search + quote', in: 'BL' },
        ]}
        edges={[
          { from: 'forecast', to: 'rfp' },
          { from: 'rfp', to: 'signed' },
          { from: 'signed', to: 'load' },
          { from: 'load', to: 'live' },
        ]}
        legend={[
          { label: 'Focal step', kind: 'focal' },
          { label: 'Handoff', line: 'accent' },
        ]}
      />
    ),
  },
}
