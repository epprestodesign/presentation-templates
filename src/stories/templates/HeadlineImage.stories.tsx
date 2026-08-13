import type { Meta, StoryObj } from '@storybook/react-vite'
import { HeadlineImage } from '../../templates/HeadlineImage'

/** TEMPLATES / Headline + Image — copy column left, photo mosaic right. */
const meta = {
  title: 'Templates/Headline + Image',
  component: HeadlineImage,
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
## Headline + Image

Copy column on the left, hand-composed photo mosaic on the right.

The mosaic is **absolutely positioned, not a grid**. The reference mosaics are
asymmetric on purpose — a wide establishing shot over two unequal columns, one
tall frame breaking the rhythm — and the rects below came straight out of
\`scripts/detect-images.mjs\` reading the original pixels. So absolute placement
is the faithful description of the original rather than a grid that nearly fits.

The copy column takes an array of \`blocks\`, each with its own type step, so
one template covers both reference slides (which stack their copy differently)
without growing a prop per variant.

**Rebuilt from:** \`references/slide-decks/01.png\`, \`04.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof HeadlineImage>

export default meta
type Story = StoryObj<typeof meta>

/** The mosaic geometry both reference slides share, in slide px.
 *  Detected, not measured by eye. */
const MOSAIC = {
  wide: { x: 718, y: 40, w: 482, h: 154 },
  leftShort: { x: 719, y: 202, w: 232, h: 154 },
  rightTall: { x: 959, y: 202, w: 241, h: 288 },
  leftTall: { x: 719, y: 364, w: 232, h: 316 },
  rightShort: { x: 959, y: 498, w: 241, h: 182 },
}

/** Slide 01 — "EventPipe is the system of record for event housing."
 *  Black headline up top, then the large teal statement on the floor. */
export const SystemOfRecord: Story = {
  args: {
    eyebrow: 'Series A',
    pageNumber: 1,
    title: 'EventPipe is the system of record for event housing.',
    titleWidth: 620,
    blocksTop: 390,
    blocks: [
      {
        // The whole statement is teal; the figures are additionally
        // underlined. Composable run styles, so the underlined span keeps the
        // accent colour instead of falling back to black.
        text: [
          { accent: 'The rails that book the rooms, move the money, and power the next generation of live-event travel, with ' },
          {
            text: '$1.2B+ in lifetime bookings and $820M in annual booking volume.',
            accent: true,
            underline: true,
          },
        ],
        size: 'h1',
      },
    ],
    images: [
      { src: 'mosaic/reception-bell', alt: 'Hand pressing a hotel reception bell', ...MOSAIC.wide },
      { src: 'mosaic/woman-credit-card', alt: 'Booking on a phone with a credit card', ...MOSAIC.leftShort },
      { src: 'mosaic/phone-travel-apps', alt: 'Phone home screen of travel booking apps', ...MOSAIC.rightTall },
      { src: 'mosaic/woman-airport', alt: 'Traveller walking through an airport', ...MOSAIC.leftTall },
      { src: 'mosaic/travellers-silhouette', alt: 'Silhouetted family of travellers', ...MOSAIC.rightShort },
    ],
  },
}

/** Slide 04 — Total addressable market. Teal-then-black headline, a bold
 *  claim, then two body paragraphs. Mosaic mirrors slide 01's geometry with
 *  the tall frames swapped to the other column. */
export const TotalAddressableMarket: Story = {
  args: {
    eyebrow: 'Total Addressable Market',
    pageNumber: 4,
    title: [{ accent: 'Sports gave us the wedge. ' }, 'Live events give us the market.'],
    titleWidth: 600,
    blocksTop: 300,
    blocks: [
      {
        text: [{ bold: 'EventPipe has emerged as a leading software in the rapidly growing youth sports housing market.' }],
        size: 'h3',
      },
      {
        text: [
          'In 2025, youth sports generated an estimated ',
          { bold: '$291.8 billion in total economic impact' },
          ' and more than ',
          { bold: '131.6 million hotel room nights' },
          '.',
        ],
        size: 'lead',
        spaceBefore: 14,
      },
      {
        text: [
          'EventPipe already represents approximately ',
          { bold: '2.1% of those room nights' },
          ', giving the company a proven foothold in a large, repeatable market with significant room to grow.',
        ],
        size: 'lead',
      },
    ],
    images: [
      { src: 'sports/kids-field-hockey', alt: 'Young field hockey players celebrating', ...MOSAIC.wide },
      { src: 'sports/youth-baseball', alt: 'Youth baseball batter mid-swing', x: 718, y: 202, w: 241, h: 288 },
      { src: 'sports/youth-ice-hockey', alt: 'Youth ice hockey player', x: 968, y: 202, w: 232, h: 154 },
      { src: 'sports/youth-soccer-huddle', alt: 'Youth soccer team huddle', x: 718, y: 498, w: 241, h: 182 },
      { src: 'sports/youth-basketball', alt: 'Youth basketball player dribbling', x: 968, y: 364, w: 232, h: 316 },
    ],
  },
}
