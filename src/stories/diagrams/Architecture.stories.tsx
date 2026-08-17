import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiagramSlide } from '../../templates/DiagramSlide'
import { Architecture } from '../../diagrams/Architecture'

/** DIAGRAMS / Architecture — components and connections, on a slide. */
const meta = {
  title: 'Diagrams/Architecture',
  component: DiagramSlide,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Architecture

Components and the connections between them — the diagram to reach for when the
question is "what talks to what".

Ported from the [diagram-design](https://github.com/cathrynlavery/diagram-design)
skill (MIT) and reskinned onto EventPipe tokens. Three deliberate departures from
upstream: **Poppins throughout** (upstream splits serif / sans / mono; the
technical register is rebuilt from size, weight and tracking instead), **no
shadows or gradients**, and \`link\` is **orient-700** rather than a blue the
deck does not contain.

### What the port keeps

The six connector rules, because they are what separate an editorial diagram
from Mermaid output:

- **Orthogonal connectors only.** Every bend is a quarter-arc. A diagonal line
  between nodes sharing neither axis is a hard fail, so \`elbow()\` cannot emit
  one.
- **Arrows behind boxes.** Connectors render before nodes.
- **Fanned attach points.** Several edges on one side of a node each get their
  own point, spread \`L·k/(N+1)\` along it — no two connectors share a point.
- **Masked labels with a visible gap.** The mask stops the stroke bleeding
  through the text; the 6–10px gap keeps the connector traceable past it. Both
  are required.
- **One or two focal nodes.** \`kind: 'focal'\` is the accent. Four focal nodes
  means nothing is focal.

### Layout is derived

Zones are columns, nodes stack inside them, everything snaps to the 4px grid.
Adding a node re-flows its column rather than requiring new coordinates for
every node to its right — which is the property that makes 27 types maintainable.
        `,
      },
    },
  },
} satisfies Meta<typeof DiagramSlide>

export default meta
type Story = StoryObj<typeof meta>

/** The platform, as an integration partner needs to understand it.
 *
 *  One focal node — the system of record — because that is the whole argument of
 *  the slide: everything else is a surface onto it. */
export const PlatformOverview: Story = {
  name: 'Platform overview',
  args: {
    eyebrow: 'Platform Architecture',
    pageNumber: 18,
    title: ['Every surface writes to ', { accent: 'one record.' }],
    lead: 'Booking sites, the operator console and partner integrations are all views onto the same block, rates and pickup data — which is why the numbers reconcile without an export.',
    footnote:
      'Simplified: queueing, retries and the reporting replica are omitted. Illustrative component names.',
    children: ({ width, height }) => (
      <Architecture
        width={width}
        height={height}
        zones={[
          {
            label: 'Surfaces',
            nodes: [
              { id: 'presto', name: 'Presto Sites', sublabel: 'Team + attendee booking', tag: 'web', kind: 'input' },
              { id: 'console', name: 'Operator Console', sublabel: 'Housing companies', tag: 'app', kind: 'input' },
              { id: 'partner', name: 'Partner Widgets', sublabel: 'Ticketing, registration', tag: 'embed', kind: 'input' },
            ],
          },
          {
            label: 'Platform',
            nodes: [
              { id: 'api', name: 'Booking API', sublabel: 'Availability, holds, book', tag: 'api' },
              { id: 'core', name: 'System of Record', sublabel: 'Blocks · rates · pickup', tag: 'core', kind: 'focal', height: 84 },
              { id: 'recon', name: 'Reconciliation', sublabel: 'Actuals, commission', tag: 'svc' },
            ],
          },
          {
            label: 'Downstream',
            nodes: [
              { id: 'hotels', name: 'Hotel Systems', sublabel: 'PMS / CRS', tag: 'ext', kind: 'external' },
              { id: 'pay', name: 'Payments', sublabel: 'Capture + payout', tag: 'ext', kind: 'external' },
              { id: 'warehouse', name: 'Reporting Store', sublabel: 'Nightly snapshot', tag: 'db', kind: 'store' },
            ],
          },
        ]}
        edges={[
          { from: 'presto', to: 'api', label: 'book' },
          { from: 'console', to: 'api', label: 'manage' },
          { from: 'partner', to: 'api', tone: 'link', label: 'rest' },
          { from: 'api', to: 'core', tone: 'accent', label: 'writes' },
          { from: 'core', to: 'hotels', tone: 'link', label: 'rooming' },
          { from: 'core', to: 'pay', tone: 'link' },
          { from: 'recon', to: 'warehouse', dashed: true, label: 'nightly' },
        ]}
        legend={[
          { label: 'Focal', kind: 'focal' },
          { label: 'Service', kind: 'step' },
          { label: 'External', kind: 'external' },
          { label: 'External call', line: 'link' },
          { label: 'Async', line: 'default', dashed: true },
        ]}
      />
    ),
  },
}

/** A trust-boundary read of the same platform, for a security review.
 *
 *  Same component set, one zone re-toned as a boundary — which is the argument
 *  for zones being a tone rather than a separate diagram type. */
export const TrustBoundaries: Story = {
  name: 'Trust boundaries',
  args: {
    eyebrow: 'Security Review',
    pageNumber: 19,
    title: 'What crosses the boundary, and what never does',
    titleSize: 'h2',
    lead: 'Card data never enters the platform: the payment surface tokenises before anything is written, so the system of record holds a token and never a number.',
    footnote: 'Dashed accent marks a trust boundary. Illustrative — not a completed assessment.',
    children: ({ width, height }) => (
      <Architecture
        width={width}
        height={height}
        zoneGap={64}
        zones={[
          {
            label: 'Untrusted',
            tone: 'boundary',
            nodes: [
              { id: 'guest', name: 'Guest Browser', sublabel: 'Public internet', tag: 'user', kind: 'input' },
              { id: 'card', name: 'Card Entry', sublabel: 'Hosted fields', tag: 'pci', kind: 'boundary' },
            ],
          },
          {
            label: 'Platform',
            nodes: [
              { id: 'edge', name: 'Edge / WAF', sublabel: 'Rate limit, TLS', tag: 'net' },
              { id: 'api2', name: 'Booking API', sublabel: 'Authn + authz', tag: 'api', kind: 'focal' },
              { id: 'core2', name: 'System of Record', sublabel: 'Tokens only', tag: 'core', kind: 'store' },
            ],
          },
          {
            label: 'Processor',
            tone: 'boundary',
            nodes: [
              { id: 'vault', name: 'Card Vault', sublabel: 'Processor-held', tag: 'pci', kind: 'boundary', height: 84 },
              { id: 'settle', name: 'Settlement', sublabel: 'Payout file', tag: 'ext', kind: 'external' },
            ],
          },
        ]}
        edges={[
          { from: 'guest', to: 'edge', label: 'https' },
          { from: 'card', to: 'vault', tone: 'accent', label: 'tokenise' },
          { from: 'edge', to: 'api2', label: 'auth' },
          { from: 'api2', to: 'core2', label: 'write' },
          { from: 'core2', to: 'settle', tone: 'link', dashed: true, label: 'nightly' },
        ]}
        legend={[
          { label: 'Trust boundary', kind: 'boundary' },
          { label: 'Focal', kind: 'focal' },
          { label: 'Store', kind: 'store' },
          { label: 'External call', line: 'link' },
        ]}
      />
    ),
  },
}
