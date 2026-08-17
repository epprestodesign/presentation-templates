import type { Meta, StoryObj } from '@storybook/react-vite'
import { FullBleed } from '../../templates/FullBleed'

/** TEMPLATES / Full Bleed — a photograph filling the slide. */
const meta = {
  title: 'Showcase/Full Bleed',
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
   recovered names are unreliable — `full-bleed/demo-code-glasses` and
   `full-bleed/travel-airport-silhouettes` are not team photos, they are a close-up of glasses
   reflecting code and an airport family silhouette. Those names are being
   corrected separately; the `image` values here are the current ones. */

/** Demo.png — two colleagues at a laptop dashboard. */
export const DashboardReview: Story = {
  args: {
    image: 'full-bleed/demo-dashboard-review',
    alt: 'Two people reviewing an analytics dashboard on a laptop',
    title: 'Platform Walkthrough',
    arrow: true,
    scrim: 0.34,
    watermark: false,
  },
}

/** Demo-1.png */
export const GrowthHologram: Story = {
  args: {
    image: 'full-bleed/demo-growth-hologram',
    alt: 'A hand holding a floating bar-chart hologram',
    title: 'Growth & Performance',
    arrow: true,
    scrim: 0.34,
    watermark: false,
  },
}

/** Demo-2.png */
export const ServerRacks: Story = {
  args: {
    image: 'full-bleed/demo-datacenter',
    alt: 'Blue-lit server racks in a datacenter',
    title: 'Infrastructure at Scale',
    arrow: true,
    scrim: 0.34,
    watermark: false,
  },
}

/** Demo-3.png */
export const HexInterface: Story = {
  args: {
    image: 'full-bleed/demo-platform-hex-ui',
    alt: 'A hand touching a hex-tiled interface',
    title: 'Product & Integrations',
    arrow: true,
    scrim: 0.34,
    watermark: false,
  },
}

/** EP TEam.png — the deck's PipeSights demo opener, despite the file name. */
export const CodeInGlasses: Story = {
  args: {
    image: 'full-bleed/demo-code-glasses',
    alt: 'Glasses reflecting lines of code',
    title: 'PipeSights Demo',
    arrow: true,
    scrim: 0.34,
    watermark: false,
  },
}

/** EP TEam-1.png — the closing-remarks opener, despite the file name. */
export const AirportFamily: Story = {
  args: {
    image: 'full-bleed/travel-airport-silhouettes',
    alt: 'Silhouetted family travelling through an airport',
    title: 'Closing Remarks',
    arrow: true,
    scrim: 0.34,
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
    // No wordmark: the frame already carries the brand on all four edges, and a
    // rotated logo inside a gradient border reads as two marks competing.
    watermark: false,
    arrow: true,
  },
}

/** The company photo — the one genuinely EventPipe image in the set.
 *
 *  Supplied as a 2768x2080 screenshot and cropped to 16:9 from y=300, which
 *  frames the group properly AND drops the Slack icon the screenshot carried in
 *  its top-right corner. That icon would otherwise have shipped on the slide.
 *
 *  Uses the CSS `frame` rather than a baked-in one, because unlike the recovered
 *  full-bleed plates this photo arrives unframed. */
export const OurTeamAndCompany: Story = {
  args: {
    image: 'full-bleed/team-topgolf',
    alt: 'The EventPipe team at Topgolf',
    frame: true,
    scrim: 0.4,
    title: 'Our Team & Company',
    arrow: true,
    watermark: false,
  },
}
