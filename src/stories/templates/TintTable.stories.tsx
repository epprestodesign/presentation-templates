import type { Meta, StoryObj } from '@storybook/react-vite'
import { TintTable } from '../../templates/TintTable'

/** TEMPLATES / Tint Table — black header, cyan-ramped rows. */
const meta = {
  title: 'Templates/Tint Table',
  component: TintTable,
  tags: ['autodocs'],
  parameters: {
    // A slide is a fixed 1280x720 artboard: fullscreen so nothing crops it, and
    // the grey stage so its white edge stays visible. Styles pages keep the
    // responsive default instead.
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Tint Table

Headline block over a full-width table: pure black header, then rows filled
from the measured 5-step cyan ramp, lightest last.

The integration deck's workhorse — **five reference slides are this one
layout**, differing only in column count and row content. Which is exactly the
argument for a template: they were five hand-built slides that drifted from
each other, and they are now one component with five content objects.

Row tint comes from the row's **index**, not its data, so reordering rows keeps
the ramp intact and a row can never pick the wrong colour. A table longer than
the five-step ramp holds the lightest step rather than wrapping back to the
darkest.

**Rebuilt from:** \`Slide=4r.png\`, \`Slide-sdf.png\`, \`Slid-fdsf.png\`,
\`Slide-dfknf.png\`, \`Slide-dfl.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof TintTable>

export default meta
type Story = StoryObj<typeof meta>

/** Two-column geometry shared by the four Showpass integration slides. */
const TWO_COL = [319, 836]
const PLACEMENT_HEADERS = ['Suggested Placement', 'Integration Description']

/** Phase 1 — static booking links. */
export const Phase1StaticLinks: Story = {
  args: {
    eyebrow: 'Showpass & EventPipe',
    title: 'Phase 1 – Static Booking Links',
    lead: 'Direct links from consumer-facing event pages to EventPipe-made Presto pages.',
    titleWidth: 900,
    headers: PLACEMENT_HEADERS,
    columnWidths: TWO_COL,
    minRowHeight: 128,
    rows: [
      {
        label: 'Event Pages\n(on the event website)',
        cells: [
          {
            bullets: [
              'Embed a static “Book Your Hotel” link in the event details section. Clicking redirects to an EventPipe-branded Presto booking page with event info manually pre-set.',
            ],
          },
        ],
      },
      {
        label: 'Emails',
        cells: [
          {
            bullets: [
              'Include a static booking link in email campaigns or newsletters. Link sends users to the corresponding EventPipe Presto page for the event.',
            ],
          },
        ],
      },
      {
        label: 'Social Media Posts',
        cells: [
          {
            bullets: [
              'Share static booking links in social content and promotions. Each link routes directly to the EventPipe Presto event page.',
            ],
          },
        ],
      },
    ],
  },
}

/** Phase 2 — post-purchase offers. */
export const Phase2PostPurchase: Story = {
  args: {
    eyebrow: 'Showpass & EventPipe',
    title: 'Phase 2 – Post-Purchase Offers',
    lead: 'Booking links/modules surfaced after ticket purchase, with event/date/location context passed to EventPipe for a tailored experience.',
    titleWidth: 900,
    headers: PLACEMENT_HEADERS,
    columnWidths: TWO_COL,
    minRowHeight: 190,
    rows: [
      {
        label: 'Showpass\nConfirmation Page',
        cells: [
          {
            bullets: [
              'Place a booking module or call-to-action beneath order confirmation details. Automatically directs to an EventPipe page with matching event details.',
            ],
          },
        ],
      },
      {
        label: 'Purchase\nConfirmation Emails',
        cells: [
          {
            bullets: [
              'Include a booking link within the order receipt email. Links pre-fill event/location/date data in the EventPipe booking page for a more relevant experience.',
            ],
          },
        ],
      },
    ],
  },
}

/** Phase 3 — embedded bookings. */
export const Phase3Embedded: Story = {
  args: {
    eyebrow: 'Showpass & EventPipe',
    title: 'Phase 3 – Embedded Bookings',
    lead: 'Fully embedded EventPipe booking widget inside Showpass flows. Dynamically loads hotel recommendations based on purchase details in real time.',
    titleWidth: 900,
    headers: PLACEMENT_HEADERS,
    columnWidths: TWO_COL,
    minRowHeight: 190,
    rows: [
      {
        label: 'Ticket Selection Flow',
        cells: [
          {
            bullets: [
              'Hotel widget appears during ticket/package selection, pulling event date, location, and ticket count to suggest hotel options and room sizes.',
              'Hotel options remain visible and bookable alongside ticket checkout. Updates dynamically if ticket selections change.',
            ],
          },
        ],
      },
      {
        label: 'Post-Purchase Screen',
        cells: [
          {
            bullets: [
              'If lodging isn’t booked during checkout, the same dynamic widget appears in the confirmation screen with easy “complete your trip” booking.',
            ],
          },
        ],
      },
    ],
  },
}

/** White-label booking link — four placement rows. */
export const WhiteLabelPlacements: Story = {
  args: {
    eyebrow: 'White Label Booking Link',
    title: 'Drive more traffic and get more bookings',
    lead: 'For best visibility, we recommend placing the hotel link in the following places:',
    titleWidth: 900,
    headers: ['Location in your experience', 'Suggestion'],
    columnWidths: [355, 800],
    minRowHeight: 104,
    rows: [
      {
        label: 'Hotel Tab',
        cells: [{ bullets: ['Add a "Hotel" tab near the top of your event website, close to ticketing info.'] }],
      },
      {
        label: 'Ticket Confirmation\nPage & Emails',
        cells: [{ bullets: ['Include the hotel link in the purchase confirmation flow and follow-up emails.'] }],
      },
      {
        label: 'Ticket Checkout Page',
        cells: [{ bullets: ['Add a popup or redirect to hotel accommodations after purchase is complete.'] }],
      },
      {
        label: 'Directory / Schedule',
        cells: [{ bullets: ['Add a “Book Hotels” CTA below “More Info” in each event row'] }],
      },
    ],
  },
}

/** Event graphics — the only three-column table, and the only one with a
 *  tracked note between the lead and the table. */
export const EventGraphics: Story = {
  args: {
    eyebrow: 'Event Graphics',
    title:
      'To ensure a visually branded experience, please upload the following assets into the following Google Drive link. Please note, our design team will work with whatever images you provide along with the branding displayed on the event’s website.',
    titleSize: 'lead',
    titleWidth: 1030,
    note: 'The only required graphic is the most up to date logo.*',
    tableTop: 288,
    headers: ['Asset Type', 'Size (px)', 'Notes'],
    columnWidths: [286, 268, 601],
    minRowHeight: 92,
    rows: [
      { label: 'Event Logo', cells: ['200 x 200', { bullets: ['Displayed over background'] }] },
      { label: 'Background Image', cells: ['1400 x 1400', { bullets: ['Main site background'] }] },
      { label: 'Hotel Background', cells: ['1400 x 120', { bullets: ['Banner image behind hotel listings'] }] },
      { label: 'Display Images', cells: ['340 x 215', { bullets: ['For hotel cards or event visuals'] }] },
      { label: 'Advertisements', cells: ['160 x 320', { bullets: ['Optional sponsor or promotional ads'] }] },
    ],
  },
}
