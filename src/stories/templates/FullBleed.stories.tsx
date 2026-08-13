import type { Meta, StoryObj } from '@storybook/react-vite'
import { FullBleed } from '../../templates/FullBleed'

/** TEMPLATES / Full Bleed — a photograph filling the slide. */
const meta = {
  title: 'Templates/Full Bleed',
  component: FullBleed,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { value: 'stage' },
    docs: {
      description: {
        component: `
## Full Bleed

Six of the reference slides are a single photograph filling the whole canvas,
inside a branded gradient frame whose right-hand corners are rounded. The frame
is not a simple inset — the photo runs off the left edge and only the top, right
and bottom are held in — so the recovered assets are the whole composition at
full canvas, and rebuilding one of those slides means placing one asset. Those
stories are one line each, which is the honest amount of markup they need.

The \`frame\` prop is for the other direction: applying that frame in CSS to
**new** photography that arrives without one. Measured off the recovered
compositions — 20px on the top, right and bottom, 0 on the left, 24px on the two
right corners, over \`gradient.brand\` (#01658b → #02adb3, which is exactly what
the plate's corners sample as). Setting \`image\` and \`frame\` together on a
recovered asset would double the frame, so it is off by default.

None of the six reference slides carries chrome — no eyebrow, no page number, no
watermark — so the stories turn the watermark off. The surface is still declared
photographic, which is what flips the chrome ink to white if a deck does put an
eyebrow or a headline on one. Nor does any of the six have a title baked into the
plate, so any of them can introduce any section: the template supplies the words.

The story names describe the photograph, not the asset. Two of the recovered
names are wrong — \`team-code-glasses\` is a close-up of glasses reflecting code
and \`team-1\` is an airport family silhouette; neither is a team photo — so
naming a story after the file would have mislabelled the slide.

**Rebuilt from:** \`Demo.png\`, \`Demo-1.png\`, \`Demo-2.png\`, \`Demo-3.png\`,
\`EP TEam.png\`, \`EP TEam-1.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof FullBleed>

export default meta
type Story = StoryObj<typeof meta>

/* Stories are named for what the photograph shows, not for the asset. The
   recovered names are unreliable — `full-bleed/team-code-glasses` and
   `full-bleed/team-1` are not team photos, they are a close-up of glasses
   reflecting code and an airport family silhouette. Those names are being
   corrected separately; the `image` values here are the current ones. */

/** Demo.png — two colleagues at a laptop dashboard. */
export const DashboardReview: Story = {
  args: {
    image: 'full-bleed/demo-dashboard',
    alt: 'Two colleagues reviewing a dashboard on a laptop',
    watermark: false,
  },
}

/** Demo-1.png */
export const GrowthHologram: Story = {
  args: {
    image: 'full-bleed/demo-1',
    alt: 'A hand holding a floating bar-chart hologram showing percentage growth',
    watermark: false,
  },
}

/** Demo-2.png */
export const ServerRacks: Story = {
  args: {
    image: 'full-bleed/demo-2',
    alt: 'Rows of blue-lit server racks',
    watermark: false,
  },
}

/** Demo-3.png */
export const HexInterface: Story = {
  args: {
    image: 'full-bleed/demo-3',
    alt: 'A hand touching a hex-tiled interface of icons',
    watermark: false,
  },
}

/** EP TEam.png — the deck's PipeSights demo opener, despite the file name. */
export const CodeInGlasses: Story = {
  args: {
    image: 'full-bleed/team-code-glasses',
    alt: 'Code reflected in a pair of glasses',
    watermark: false,
  },
}

/** EP TEam-1.png — the closing-remarks opener, despite the file name. */
export const AirportFamily: Story = {
  args: {
    image: 'full-bleed/team-1',
    alt: 'A family walking through an airport terminal at sunset',
    watermark: false,
  },
}

/** The other path: the gradient frame applied in CSS to a photograph that
 *  arrives without one, plus a headline over a scrim. This is how a future deck
 *  gets the reference look from new photography. */
export const FramedWithHeadline: Story = {
  args: {
    image: 'unsplash/hotels-housing/hotel-lobby-1',
    alt: 'A hotel lobby',
    frame: true,
    scrim: 0.34,
    eyebrow: 'EventPipe',
    title: ['Every room, ', { accent: 'one contract.' }],
    titleWidth: 720,
    titleTop: 420,
  },
}
