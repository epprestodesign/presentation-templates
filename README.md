# EventPipe Slide Design System

Brand tokens, slide elements and slide templates for EventPipe presentations —
documented in Storybook, and exportable to **editable Google Slides**.

Built with **React 19 · TypeScript · MUI X Charts · Storybook 10 · Vite ·
Poppins · Material Symbols**.

**📖 [Browse the design system →](https://epprestodesign.github.io/presentation-templates/)**

Published to GitHub Pages from `main` on every push — see
[.github/workflows/deploy.yml](.github/workflows/deploy.yml).

```bash
pnpm install
pnpm storybook      # → http://localhost:6008
```

---

## The idea

**A slide is data, not markup.**

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

That buys three things at once:

1. **Agents can author slides.** A content object is cheap to generate, and
   TypeScript rejects a wrong shape at the boundary — so a new deck is a data
   file, not a day of layout.
2. **One spec, three renderers.** The same object feeds the React view, the
   PptxGenJS emitter (→ Google Slides / PowerPoint) and a PNG@2x raster.
3. **Consistency is structural.** Templates own geometry, so a slide cannot
   quietly drift 8px off the deck's margin.

### Why 1280 × 720

Not arbitrary. At 96 px/in it is exactly **13.333in × 7.5in** — PowerPoint's and
Google Slides' 16:9 slide. So export is a divide by 96, with no scaling and no
layout re-flow.

Verified against the emitted file: `sldSz` is `12192000 × 6858000` EMU, exact 16:9
to 1e-9.

---

## Export

```bash
pnpm export:pptx    # → export-out/eventpipe-deck.pptx
pnpm export:png     # → export-out/png/*.png   (2x, 2560×1440)
pnpm export:pdf     # → export-out/eventpipe-deck.pdf
```

**To get editable Google Slides:** upload the `.pptx` to Drive → open it →
**File → Save as Google Slides**.

What survives the round-trip, confirmed by inspecting the output XML:

| | Result |
| --- | --- |
| Text | Real text runs. A two-tone headline is **one** text box with two styled runs, so the teal emphasis survives editing. |
| Charts | Native `<c:barChart>` carrying its numbers — click it in Slides and edit the data. |
| Tables | Real `<a:tbl>`. |
| Shapes | Real rounded rectangles. |
| Poppins | Survives; it is a Google Font, so Drive does not substitute it. |
| Gradients | **Rasterised.** PptxGenJS has no gradient fill, so a gradient panel becomes a background picture with live text on top. The panel is not editable; the words are. |

---

## Structure

```
src/
  tokens/          single source of truth (JS) → generates src/styles/theme.css
  styles/          globals · theme (generated) · typography
  elements/        text · data · media · layout · brand
  templates/       22 slide archetypes
  stories/
    foundations/   11 token pages, responsive
    charts/        MUI X Charts catalogue (MIT)
    data-grid/     MUI X Data Grid catalogue (MIT)
    templates/     each story is a real rebuilt slide
  lib/pptx/        the PowerPoint / Google Slides emitter
  assets/          logo · imagery · team · partners · employers · events
scripts/           token build · asset recovery · Unsplash · screenshots · export
references/        the source decks these slides were rebuilt from
```

Tokens live in JS rather than CSS because the PPTX emitter needs numeric values —
a hand-mirrored stylesheet would drift.

---

## Values are measured, not chosen

Every colour and coordinate came out of the reference decks:

- `accent` **#02adb3** is literally the fill of the logo glyph
- KPI numbers are the deeper **#02859d**; card surfaces the measured **#f5f5f5**
- the tinted table ramp was read row by row and turned out to be **its own ramp**,
  not a step of `orient`
- `h1` is 40px, set by matching **cap height** rather than line width — Poppins
  runs wider per em than the face the originals used, so a width match left the
  letters visibly short. The trade-off: long headlines wrap one word earlier here.

Two scripts exist because guessing was not good enough — `detect-images.mjs`
finds photo rects by reading pixels, and `shoot.mjs` renders a slide at true size
so a rebuild can be **diffed** against its reference rather than eyeballed.

One token is honestly labelled as **reasoned, not measured**
(`gradient.brandVertical`); everything else was sampled.

---

## Imagery

Addressed by name, never by import:

```ts
img('unsplash/hotels-housing/hotel-lobby-1')
img('team/circle/tim-brown')
```

- **123 Unsplash images** across youth sports, hotels, live events, travel,
  platform, people and abstract — fetched from a curated brief
  (`scripts/imagery-topics.mjs`) so a re-run is reproducible
- **28 photos recovered** from the flattened reference decks
- attribution for every Unsplash image in `src/assets/imagery/credits.json`, and
  each download registered with the API as their terms require

```bash
pnpm imagery:fetch          # resume-safe; the demo tier allows 50 req/hour
pnpm imagery:fetch:all      # works through the brief, sleeping between windows
```

Needs `UNSPLASH_ACCESS_KEY` in `.env` — the **Access Key only**. The Secret Key is
for OAuth flows this repo never uses.

---

## Licensing

`@mui/x-charts` and `@mui/x-data-grid` are **MIT**; no licence key. Pro/Premium
components are deliberately not installed. The line to watch is the built-in
**export toolbar** — the obvious thing to reach for, and the thing that triggers a
licence.

---

See **[CLAUDE.md](./CLAUDE.md)** for authoring conventions, the measuring
workflow, and the mistakes worth not repeating.
