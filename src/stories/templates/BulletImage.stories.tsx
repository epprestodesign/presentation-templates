import type { Meta, StoryObj } from '@storybook/react-vite'
import { BulletImage } from '../../templates/BulletImage'

/** TEMPLATES / Bullets + Image — checkmark list left, photography right.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Narrative/Bullets + Image',
  component: BulletImage,
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
## Bullets + Image

The product-capability slide: headline, a checkmark list of what the module
does, and photography floating on the right.

The marker is one Material Symbols glyph rather than a disc with a tick drawn on
top of it — filled \`check_circle\` *is* a solid disc with the check knocked out,
so the accent colour reproduces the reference exactly and any other glyph drops
in without the element changing.

The photo cluster is a **single** asset. The three photos overlap and their drop
shadows merge, so no detector setting separates them and
\`scripts/crop-images.mjs\` took the crop whole. It is placed with
\`radius: 0\`, because the corners are already rounded inside the pixels and
re-applying the image radius would clip the shadows.

> **Asset defect.** That crop starts at 2x (1268, 234), which is *inside* the
> reference headline, so the bottom of "…ent" from "Management" is baked into
> the asset's top-left corner. It hides under this deck's own headline on the
> rebuilt slide and nowhere else, so the asset needs retouching (or re-exporting
> from source) before it is reused — the crop rect cannot simply move, because
> the topmost photo begins 2px below it.

**Rebuilt from:** \`references/slide-decks/2-01.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof BulletImage>

export default meta
type Story = StoryObj<typeof meta>

/** Slide 2-01 — Hotel RFP & Contract Management.
 *
 *  Geometry read off the reference with a pixel probe: markers 28px across on a
 *  74px pitch starting at y=415, copy at x=88.5 wrapping by x=530, and the photo
 *  cluster on the rect `scripts/crop-images.mjs` cut it from — [1268, 234, 1080,
 *  1114] at 2x, so 634, 117, 540, 557 in slide space.
 *
 *  The upper-left quadrant is empty on purpose. The list sits low so the
 *  cluster reads as the top half of a diagonal rather than a column beside the
 *  copy. */
export const HotelRfpAndContracts: Story = {
  args: {
    eyebrow: 'Company Overview',
    pageNumber: 8,
    watermark: true,
    title: 'Hotel RFP & Contract Management',
    titleWidth: 760,
    bullets: [
      [{ bold: 'Manage all hotel RFPs and contracts for AOM events from one centralized dashboard.' }],
      [{ bold: 'Capture rates, terms, and rebate details directly in digital contract workflows.' }],
      [{ bold: 'Give hotels and partners real-time visibility into RFP status and approvals.' }],
      [{ bold: 'Automate reminders for key dates like deposits, cut-offs, and attrition deadlines.' }],
    ],
    bulletsTop: 408,
    bulletsWidth: 492,
    images: [
      {
        src: 'clusters/rfp-photo-cluster',
        alt: 'A contract handshake, a traveller arriving at a hotel, and digital documents being signed on a laptop',
        x: 634,
        y: 117,
        w: 540,
        h: 557,
        // The asset already carries its rounded corners and drop shadows.
        radius: 0,
      },
    ],
  },
}

/** The same shape with placeholder copy, for picking the template up as a
 *  starting point for the next module slide in the section.
 *
 *  Three separate photos on the cluster's footprint rather than the
 *  pre-composed asset, for two reasons. It shows the template does not care how
 *  many images the right-hand side is — and `clusters/rfp-photo-cluster` cannot
 *  be reused as-is: its crop rect starts at 2x (1268, 234), which is inside the
 *  reference headline, so the bottom of "…ent" from "Management" is baked into
 *  the asset's top-left corner. On the faithful rebuild it hides under this
 *  deck's own headline; anywhere else it is a floating black smudge. */
export const Blank: Story = {
  args: {
    eyebrow: 'Company Overview',
    pageNumber: 1,
    title: 'Module name goes here',
    bullets: [
      [{ bold: 'What the module does, in one sentence that runs to about two lines.' }],
      [{ bold: 'The second capability, phrased the same way.' }],
      [{ bold: 'The third capability.' }],
    ],
    // Drawn from `mosaic/`, which are clean photo crops. The `operating-layer-flattened/`
    // set is not usable here: those crops come off the slide-03 cards and still
    // carry the card's title text along their bottom edge.
    images: [
      { src: 'mosaic/woman-airport', alt: 'Traveller walking through an airport', x: 928, y: 118, w: 243, h: 304 },
      { src: 'mosaic/reception-bell', alt: 'Hand pressing a hotel reception bell', x: 637, y: 221, w: 275, h: 205 },
      { src: 'mosaic/phone-travel-apps', alt: 'Phone home screen of travel booking apps', x: 755, y: 442, w: 352, h: 230 },
    ],
  },
}
