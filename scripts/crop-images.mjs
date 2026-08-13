/* Cuts the source photos back out of the flattened reference PNGs.
 *
 *   node scripts/crop-images.mjs
 *
 * The reference decks arrived as flattened 2x exports with no separate image
 * assets, so rebuilding a photo-led slide means recovering its photos. Every
 * rect below came from scripts/detect-images.mjs reading the actual pixels,
 * not from measuring a screenshot by eye — a few px of error shows up as a
 * white sliver or a clipped edge once the photo sits in a rounded frame.
 *
 * Coordinates are 2x (native to the reference files). Divide by two for slide
 * space. Output keeps the 2x resolution so a slide exported at 2x never
 * upscales a photo.
 *
 * Re-run freely: it is idempotent and overwrites.
 */
import { execFile } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { promisify } from 'node:util'
import { dirname, resolve } from 'node:path'

const run = promisify(execFile)
const REF = 'references/slide-decks'
const OUT = 'src/assets/imagery'

/** [sourceFile, [x, y, w, h] in 2x px, outputName] */
const CROPS = [
  /* --- Slide 01, "system of record" mosaic ------------------------------ */
  ['01.png', [1436, 80, 964, 308], 'mosaic/reception-bell'],
  ['01.png', [1438, 404, 464, 308], 'mosaic/woman-credit-card'],
  ['01.png', [1918, 404, 482, 576], 'mosaic/phone-travel-apps'],
  ['01.png', [1438, 728, 464, 632], 'mosaic/woman-airport'],
  ['01.png', [1918, 996, 482, 364], 'mosaic/travellers-silhouette'],

  /* --- Slide 04, youth-sports TAM mosaic -------------------------------- */
  ['04.png', [1436, 80, 964, 308], 'sports/kids-field-hockey'],
  ['04.png', [1436, 404, 482, 576], 'sports/youth-baseball'],
  ['04.png', [1936, 404, 464, 308], 'sports/youth-ice-hockey'],
  ['04.png', [1436, 996, 482, 364], 'sports/youth-soccer-huddle'],
  ['04.png', [1936, 728, 464, 632], 'sports/youth-basketball'],

  /* --- Slide 03, the five operating-layer cards -------------------------
   * Detected with white=244 rather than the default 247. The #f5f5f5 card
   * fill is 245, so at the default the whole card counts as content and the
   * crop comes back with the title and bullet list baked in. Dropping the
   * threshold below 245 makes the card read as background and isolates the
   * photo — the card itself is rebuilt in CSS. */
  ['03.png', [80, 548, 450, 512], 'operating-layer/contract-signing'],
  ['03.png', [546, 548, 450, 512], 'operating-layer/booking-confirmed-phone'],
  ['03.png', [1012, 548, 450, 512], 'operating-layer/dashboard-pointing'],
  ['03.png', [1478, 548, 450, 512], 'operating-layer/commission-growth'],
  ['03.png', [1944, 548, 450, 512], 'operating-layer/handshake-suits'],

  /* --- Slide 10, the four value-creation cards (same white=244 reason) --- */
  ['10.png', [78, 893, 504, 366], 'value/booking-saas-devices'],
  ['10.png', [662, 893, 504, 366], 'value/payment-terminal'],
  ['10.png', [1246, 893, 504, 366], 'value/presto-phone'],
  ['10.png', [1830, 893, 504, 366], 'value/ai-glasses-code'],

  /* --- Slide 2-01, the floating photo cluster ---------------------------
   * Cropped as ONE image rather than three. The bottom photo overlaps the
   * gap between the two above it, so the cluster is genuinely one connected
   * region — no detector setting separates them. Keeping it whole also
   * preserves the soft drop shadows, which would be hard to rebuild. */
  ['2-01.png', [1268, 234, 1080, 1114], 'clusters/rfp-photo-cluster'],

  /* --- Brand background plates -----------------------------------------
   * Supplied as clean, content-free plates. Each is a gradient PLUS artwork —
   * a hex tessellation, and in one case chevron arrows. The gradient alone is
   * already a token (`gradient.brandBleed`, sampled from these very corners),
   * but the overlay pattern is artwork: cheap to keep as an asset, fiddly and
   * inexact to rebuild in CSS. SlideFrame layers content over these via
   * `plate`, and falls back to the CSS gradient when no plate is named. */
  ['20.png', [0, 0, 2560, 1440], 'backgrounds/brand-hex'],
  ['06-1_bg.png', [0, 0, 2560, 1440], 'backgrounds/brand-arrows'],

  /* --- Full-bleed slides -----------------------------------------------
   * Cropped at full canvas. These are a photo inside a branded gradient
   * frame with one large rounded corner — not a simple inset — so the exact
   * rebuild uses the whole composition as a background image. The FullBleed
   * template reproduces the frame in CSS separately, for new photography. */
  ['Demo.png', [0, 0, 2560, 1440], 'full-bleed/demo-dashboard'],
  ['Demo-1.png', [0, 0, 2560, 1440], 'full-bleed/demo-1'],
  ['Demo-2.png', [0, 0, 2560, 1440], 'full-bleed/demo-2'],
  ['Demo-3.png', [0, 0, 2560, 1440], 'full-bleed/demo-3'],
  ['EP TEam.png', [0, 0, 2560, 1440], 'full-bleed/team-code-glasses'],
  ['EP TEam-1.png', [0, 0, 2560, 1440], 'full-bleed/team-1'],
]

let ok = 0
let failed = 0

for (const [src, [x, y, w, h], name] of CROPS) {
  const out = resolve(`${OUT}/${name}.png`)
  mkdirSync(dirname(out), { recursive: true })
  try {
    // sips takes the offset as (y x) and the size as (height width).
    await run('sips', [
      '--cropOffset', String(y), String(x),
      '--cropToHeightWidth', String(h), String(w),
      resolve(`${REF}/${src}`),
      '--out', out,
    ])
    console.log(`  ✓ ${name}.png  ${w}x${h}  ← ${src}`)
    ok++
  } catch (err) {
    console.error(`  ✗ ${name}  ← ${src}: ${err.message.split('\n')[0]}`)
    failed++
  }
}

console.log(`\n${ok} cropped, ${failed} failed → ${OUT}/`)
if (failed) process.exitCode = 1
