import type { Meta, StoryObj } from '@storybook/react-vite'
import { Cover } from '../../templates/Cover'

/** TEMPLATES / Cover — the opening slide.
 *
 * Stories are the real rebuilt slides. Each one is nothing but a content
 * object handed to the template, which is the contract the whole system rests
 * on: a new slide is data, not markup.
 */
const meta = {
  title: 'Templates/Cover',
  component: Cover,
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
## Cover

Brand plate with the hex tessellation, a title well top-left, a placeholder
panel top-right, and a strip of photography along the floor.

One four-column grid drives the whole composition — inset 16px, 16px gutters,
300px columns — so \`titleSpan\`, \`panelSpan\` and each photo's \`span\` reflow
it instead of needing new coordinates. \`panel\` picks the placeholder fill the
three reference variants ship: \`brand\`, \`black\`, \`white\`.

**Rebuilt from:** \`references/slide-decks/0-01-ep.png\`, \`0-01-black.png\`,
\`0-01-white.png\`.
        `,
      },
    },
  },
} satisfies Meta<typeof Cover>

export default meta
type Story = StoryObj<typeof meta>

/** The floor strip, identical across all three variants.
 *
 *  Spans come from `scripts/detect-images.mjs` and a scanline read of the
 *  reference rather than the eye: the photos land on 616 / 300 / 300 at
 *  x = 16 / 648 / 964, y = 417, h = 287 — which is spans of 2 / 1 / 1 on the
 *  cover's 300px grid, since 2 × 300 + the 16px gutter is exactly 616. */
const MEDIA = [
  { src: 'cover-crowd', alt: 'Crowd celebrating in a stadium', span: 2 },
  { src: 'cover-search-travel', alt: 'Travellers in an airport terminal' },
  { src: 'cover-travel-apps', alt: 'Travel booking apps on a phone' },
]

/** The primary cover. The top-right panel is a brand-filled placeholder
 *  waiting for a product shot or a video still.
 *
 *  The reference carries no chrome at all — no eyebrow, page number, tag or
 *  watermark — so the watermark is off. A cover is the one slide that is not
 *  numbered, and the wordmark would land on the crowd photo. */
export const BrandPanel: Story = {
  args: {
    watermark: false,
    panel: 'brand',
    media: MEDIA,
  },
}

/** Same cover, black placeholder — the variant used when the panel will hold a
 *  video still or a dark screenshot. */
export const BlackPanel: Story = {
  args: {
    watermark: false,
    panel: 'black',
    media: MEDIA,
  },
}

/** Same cover, white placeholder — for a partner logo wall or a light UI
 *  screenshot. */
export const WhitePanel: Story = {
  args: {
    watermark: false,
    panel: 'white',
    media: MEDIA,
  },
}

/** The same template carrying real cover copy, which the reference variants
 *  leave empty. The well fills from its floor up, so a one-line and a two-line
 *  title both sit on the same baseline. */
export const WithTitle: Story = {
  args: {
    watermark: false,
    panel: 'brand',
    media: MEDIA,
    title: 'The booking layer for live events',
    subtitle: 'Series A — investor presentation',
    meta: 'August 2026 · Confidential',
  },
}
