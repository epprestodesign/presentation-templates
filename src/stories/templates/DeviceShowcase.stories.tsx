import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeviceShowcase } from '../../templates/DeviceShowcase'

/** TEMPLATES / Device Showcase — a product shot in a device mockup. */
const meta = {
  title: 'Templates/Showcase/Device Showcase',
  component: DeviceShowcase,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Device Showcase

A copy column — headline, supporting line, optional points — beside a product shot
in one of the supplied device mockups.

There is no reference slide for this template. It exists because the deck ships 17
device mockups in \`src/assets/devices\` and nothing that placed them. So the copy
column sits on the same anchors as every other content slide (\`grid.titleY\`, the
page margin) rather than inventing a layout, and the device is the only new thing
on it.

Those mockups are finished compositions: each already contains its own screenshot
behind the bezel, so \`DeviceFrame\` places a device — it does not build one around
a screen image. What it does solve is that the exports sit on a fixed canvas with a
large transparent margin that differs per file: a MacBook fills 86% of its canvas
width starting 7% in, an iPhone 16 only 39% starting 25% in. Placed naively,
\`deviceWidth: 400\` would mean four different device sizes across four assets and
none of them 400. DeviceFrame carries the measured alpha bounding box of all 17, so
\`deviceWidth\` is the width of the visible device and the asset is scaled and
offset behind it.
        `,
      },
    },
  },
} satisfies Meta<typeof DeviceShowcase>

export default meta
type Story = StoryObj<typeof meta>

/** Laptop: the branded booking site, with the copy column narrowed to make room. */
export const Laptop: Story = {
  args: {
    eyebrow: 'Platform Overview',
    pageNumber: 6,
    title: ['A booking site that looks like ', { accent: 'the event, not the vendor.' }],
    lead: 'Every room block gets its own branded site, live in under a day and built from the event’s own artwork.',
    copyWidth: 460,
    device: 'MacBook Pro 17',
    alt: 'The EventPipe booking site for a youth football tournament, on a laptop',
    deviceWidth: 640,
    deviceTop: 200,
    caption: 'Custom booking site — EPIT Rhinos',
  },
}

/** Phone: a narrower device leaves room for the points list. */
export const Phone: Story = {
  args: {
    eyebrow: 'Platform Overview',
    pageNumber: 7,
    title: ['Booked in ', { accent: 'four taps.' }],
    lead: 'The same inventory, the same rates, on the phone the traveller already has in their hand.',
    copyWidth: 620,
    points: [
      {
        title: 'Live availability',
        detail: 'Rates and inventory straight from the block, never a stale PDF.',
        icon: 'bolt',
      },
      {
        title: 'Reserve now, pay later',
        detail: 'Card on file, charged on the hotel’s own schedule.',
        icon: 'credit_card',
      },
      {
        title: 'Self-serve changes',
        detail: 'Travellers edit their own dates without a call to the organiser.',
        icon: 'edit_calendar',
      },
    ],
    device: 'iPhone 16',
    alt: 'Hotel search results for a tournament, on a phone',
    deviceWidth: 268,
    deviceTop: 160,
    caption: 'Hotel list — mobile',
  },
}

/** The device side flips, for a slide that follows a right-aligned one. The copy
 *  column moves itself out of the way — the template derives its left edge from
 *  the device's, rather than the story restating the geometry. */
export const DeviceLeft: Story = {
  args: {
    eyebrow: 'Payments',
    pageNumber: 12,
    title: ['One ledger, ', { accent: 'not four hundred.' }],
    lead: 'EventPipe Pay settles the block, the rebate and the commission in one place.',
    copyWidth: 420,
    align: 'left',
    device: 'Group 2966',
    alt: 'The EventPipe Pay reconciliation ledger in a browser window',
    deviceWidth: 620,
    deviceTop: 250,
  },
}
