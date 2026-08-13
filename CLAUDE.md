# Working in this repo

Conventions for anyone — human or agent — adding slides, elements or templates.
Read this before writing code; most of it exists because something broke.

## The one rule everything follows

**A slide is DATA, not markup.**

```tsx
<StatGrid
  eyebrow="Traction"
  pageNumber={5}
  title="Growth across every operation metric."
  cards={[
    { label: 'Reservations', value: '1.2M', icon: 'arrow_outward' },
    { label: 'Room Nights',  value: '1.9M', icon: 'arrow_outward' },
  ]}
/>
```

A template owns geometry. A story is pure content. Never hardcode slide copy
inside a template, and never position content from inside a story.

This is not stylistic. It is what lets one spec drive three renderers — the React
view, the PptxGenJS emitter (→ **editable** Google Slides), and PNG@2x. A slide
written as markup can only ever export as a flattened picture.

## Geometry

Every length is **px inside a 1280×720 space**. Never rem, %, vw, or `calc` on
slide geometry.

1280×720 at 96 px/in is exactly 13.333in × 7.5in — PowerPoint's and Google
Slides' 16:9 slide. So export is a divide by 96, with no scaling and no re-flow.
Verified: the emitted `sldSz` is `12192000 × 6858000` EMU, exact 16:9 to 1e-9.

**The watermark reserves an 85px right gutter.** Any full-width content well on a
slide showing the watermark must stop at `grid.watermarkGutter`, not
`grid.marginX`, or it runs under the wordmark. Slide 07 proved this the hard way.

## Colour and type

Reference `var(--slide-*)` or import from `src/tokens/tokens.js`. **Never
hardcode a hex.** Elements use the semantic layer only — never a raw ramp step
(`orient[600]`). Reaching past the semantic layer is how a deck ends up with six
slightly different teals.

Sizes come from `ds-text-*` utility classes or `typeClass()`.

> **Do not declare `font:` or `font: inherit` in a CSS module that also receives a
> `ds-text-*` class.** Module CSS is injected after globals, so at equal
> specificity it wins — silently collapsing every headline to body size. This cost
> a full debugging round.

Manual line breaks: `'Static Booking\nHyperlinks'`. `AccentText` sets
`white-space: pre-line`, and explicit breaks beat `text-wrap: balance`.

## Measure, do not guess

Coordinates come from the pixels, not from eyeballing a screenshot.

```bash
node scripts/detect-images.mjs references/slide-decks/03.png [minArea] [radius] [white]
```

Two settings are load-bearing:

- **`white` defaults to 247.** Drop it below 245 when a `#f5f5f5` panel is
  swallowing its contents — the card fill is 245, so at the default the whole
  card counts as content.
- **`radius` is the dilation.** Lower it when photos sit close together; raise it
  when one photo splits into several blobs.

**When sampling a gradient, sample all four corners.** On a 45° gradient the
top-left and bottom-right are both mid-tones, so that pair cannot distinguish 45°
from 135°. I mislabelled a token exactly this way.

## Verify before claiming done

Storybook runs on **:6008**. Do not start a second instance.

```bash
npx tsc --noEmit                                   # must be clean
node scripts/shoot.mjs <story-id> out.png 2        # a slide, at true size
node scripts/shoot-page.mjs <story-id> out.png     # a docs page, full height
```

Then **read the PNG** and compare it to its reference. This loop has caught every
real defect in the repo: a headline 2.4× too small, the watermark gutter, a black
underline, a missing fourth card, a title rendering black on teal.

Report what still differs. An honest discrepancy list is worth more than a claim
of done.

## Sidebar structure

```
Introduction
Foundations/   Colors · Palette · Typography · Icons · Logos · Imagery ·
               Border Radius · Spacing · Elevation · Motion · Grid & Safe Areas
Charts/        MUI X Charts (MIT) — a catalogue, not slide elements
Data Grid/     MUI X Data Grid (MIT) — for mocking product UI to screenshot
Elements/      the pieces a slide is assembled from
Templates/     the archetypes; each story is a real rebuilt slide
```

Foundations and the MUI X sections are **documentation** — they reflow with the
browser. Only Templates use the fixed artboard, and each template's `meta` opts
in:

```ts
parameters: { layout: 'fullscreen', backgrounds: { value: 'stage' } }
```

## Imagery

Address by name, never by import:

```ts
img('mosaic/reception-bell')          // recovered from the reference decks
img('unsplash/hotels-housing/hotel-lobby-1')
img('team/circle/tim-brown')
img('employers/redfin')
```

One registry covers `imagery/`, `team/`, `partners/`, `employers/`, `events/`. An
unknown name throws with the list of valid ones rather than rendering a broken
image.

**Name assets by content, never by source filename.** `EP TEam.png` is a close-up
of glasses reflecting code, not a team photo — naming it `team-code-glasses` made
an agent pick the wrong image.

`operating-layer-flattened/*` are **not** photographs. The reference composites a
scrim and the card title onto the image, so those crops contain baked-in text.
Use them only for a 1:1 rebuild.

## Motion

**Nothing on a slide animates.** Slides are rasterised by headless Chromium for
export, so anything that animates on mount is captured mid-transition — a
half-drawn chart in a PDF nobody checked. MUI X charts always get
`skipAnimation`. Motion belongs to the deck player only.

## Licensing

`@mui/x-charts` and `@mui/x-data-grid` are **MIT**. Pro/Premium are deliberately
not installed. The line to watch is the **built-in export toolbar** — the obvious
thing to reach for, and the thing that triggers a licence. Export goes through
our own Playwright/PptxGenJS pipeline instead.

Unsplash images carry attribution in `src/assets/imagery/credits.json`, and the
fetch script pings each photo's `download_location`, which their API terms
require. Do not remove either.

## Adding a slide to an existing template

Write a story. That is the whole job.

## Adding a template

1. `src/templates/<Name>.tsx` + `.module.css`
2. `src/stories/templates/<Name>.stories.tsx` — real rebuilt slides as stories
3. Add its title to the `storySort` list in `.storybook/preview.tsx`
4. Measure, verify, and list what still differs

## Commands

```bash
pnpm storybook        # :6008
pnpm build:tokens     # src/tokens/*.js → src/styles/theme.css
pnpm crop:images      # recover photos from the reference PNGs
pnpm imagery:fetch    # Unsplash, resume-safe (50 req/hour on the demo tier)
pnpm export:pptx      # → editable Google Slides / PowerPoint
pnpm export:png       # → 2x rasters
pnpm export:pdf       # → one PDF, 13.333in × 7.5in pages
```
