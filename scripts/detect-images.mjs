/* Finds the photo rectangles inside a reference slide PNG.
 *
 *   node scripts/detect-images.mjs references/slide-decks/01.png
 *
 * The reference decks are flattened exports, so rebuilding a photo-led slide
 * means cutting its photos back out. Hand-measuring 40+ rectangles off
 * screenshots would bake in a few px of error on every one, and the errors
 * show up as white slivers or clipped edges inside the rounded frames. This
 * reads the pixels instead and prints exact rects.
 *
 * How it works: mark every pixel that is not near-white as content, dilate to
 * close the white gaps *inside* a photo (sky, a shirt, a highlight) so the
 * photo becomes one blob, label connected components, then separate photos
 * from text by how densely each bounding box is filled — a photo fills its
 * box, a paragraph does not.
 *
 * Output is deliberately a report, not a crop: gradient panels and icon
 * groups also register as blobs, and only a human should decide which blobs
 * are photos worth naming. Feed the chosen rects to scripts/crop-images.mjs.
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const file = process.argv[2]
if (!file) {
  console.error('usage: node scripts/detect-images.mjs <reference.png> [minArea]')
  process.exit(1)
}
/** Minimum bounding-box area, in 2x px, for a blob to be worth reporting. */
const MIN_AREA = Number(process.argv[3] || 40000)
/** Dilation radius, in 2x px. Bigger closes larger white gaps inside a photo;
 *  smaller keeps photos separated when they sit close together or their drop
 *  shadows bridge the gap between them (slide 2-01 needs ~2). */
const RADIUS = Number(process.argv[4] || 6)
/** Brightness above which a pixel counts as background (0-255). The default
 *  247 keeps near-white paper out. Lower it to ~230 when photos carry soft
 *  drop shadows: a shadow is non-white, so at the default it bridges the gap
 *  between two adjacent photos and they merge into one blob (slide 2-01). */
const WHITE = Number(process.argv[5] || 247)

const dataUrl = `data:image/png;base64,${readFileSync(resolve(file)).toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage()

const result = await page.evaluate(
  async ({ dataUrl, MIN_AREA, RADIUS, WHITE }) => {
    const img = new Image()
    img.src = dataUrl
    await img.decode()

    const { width: W, height: H } = img
    const canvas = new OffscreenCanvas(W, H)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const { data } = ctx.getImageData(0, 0, W, H)

    /* --- 1. content mask ------------------------------------------------ */
    // Near-white is background. Saturation is checked too so pale brand
    // tints (the #f6ffff last table row, for one) are not read as paper.
    const content = new Uint8Array(W * H)
    for (let i = 0, p = 0; i < content.length; i++, p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2]
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const sat = max === 0 ? 0 : (max - min) / max
      if (max < WHITE || sat > 0.06) content[i] = 1
    }

    /* --- 2. dilate to close interior gaps ------------------------------ */
    // Separable max filter, radius R. Without this a photo containing a
    // bright sky splits into several components.
    const R = RADIUS
    const dilate = (src) => {
      const tmp = new Uint8Array(W * H)
      for (let y = 0; y < H; y++) {
        const row = y * W
        let run = 0
        // forward pass carries a countdown of "saw a 1 within R"
        for (let x = 0; x < W; x++) {
          run = src[row + x] ? R + 1 : run > 0 ? run - 1 : 0
          if (run > 0) tmp[row + x] = 1
        }
        run = 0
        for (let x = W - 1; x >= 0; x--) {
          run = src[row + x] ? R + 1 : run > 0 ? run - 1 : 0
          if (run > 0) tmp[row + x] = 1
        }
      }
      const out = new Uint8Array(W * H)
      for (let x = 0; x < W; x++) {
        let run = 0
        for (let y = 0; y < H; y++) {
          const i = y * W + x
          run = tmp[i] ? R + 1 : run > 0 ? run - 1 : 0
          if (run > 0) out[i] = 1
        }
        run = 0
        for (let y = H - 1; y >= 0; y--) {
          const i = y * W + x
          run = tmp[i] ? R + 1 : run > 0 ? run - 1 : 0
          if (run > 0) out[i] = 1
        }
      }
      return out
    }
    const closed = dilate(content)

    /* --- 3. connected components (union-find, 4-connectivity) ---------- */
    const parent = new Int32Array(W * H).fill(-1)
    const find = (a) => {
      let r = a
      while (parent[r] !== r) r = parent[r]
      while (parent[a] !== r) { const n = parent[a]; parent[a] = r; a = n }
      return r
    }
    const union = (a, b) => {
      const ra = find(a), rb = find(b)
      if (ra !== rb) parent[rb] = ra
    }
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (!closed[i]) continue
        parent[i] = i
        if (x > 0 && closed[i - 1]) union(i - 1, i)
        if (y > 0 && closed[i - W]) union(i - W, i)
      }
    }

    /* --- 4. bounding boxes + fill ratio -------------------------------- */
    const boxes = new Map()
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (parent[i] === -1) continue
        const root = find(i)
        let box = boxes.get(root)
        if (!box) { box = { x1: x, y1: y, x2: x, y2: y, px: 0 }; boxes.set(root, box) }
        if (x < box.x1) box.x1 = x
        if (x > box.x2) box.x2 = x
        if (y < box.y1) box.y1 = y
        if (y > box.y2) box.y2 = y
        if (content[i]) box.px++
      }
    }

    const out = []
    for (const box of boxes.values()) {
      // Boxes are measured on the DILATED mask, so every edge sits R px
      // outside the real artwork. Deflate before reporting, or every crop
      // comes back with a 6px white border on all four sides.
      const x = box.x1 + R
      const y = box.y1 + R
      const w = box.x2 - box.x1 + 1 - 2 * R
      const h = box.y2 - box.y1 + 1 - 2 * R
      if (w <= 0 || h <= 0) continue
      const area = w * h
      if (area < MIN_AREA) continue
      out.push({
        x, y, w, h, area,
        // fill is against the deflated box, using the undilated mask.
        fill: +Math.min(1, box.px / area).toFixed(3),
        aspect: +(w / h).toFixed(2),
      })
    }
    out.sort((a, b) => b.area - a.area)
    return { W, H, boxes: out }
  },
  { dataUrl, MIN_AREA, RADIUS, WHITE }
)

await browser.close()

const { W, H, boxes } = result
console.log(`${file}  ${W}x${H} (2x)  — ${boxes.length} blobs over ${MIN_AREA}px² (r=${RADIUS}, white>=${WHITE})\n`)
console.log('  2x rect (x y w h)          1x rect (x y w h)          fill  aspect  likely')
for (const b of boxes) {
  const one = [b.x / 2, b.y / 2, b.w / 2, b.h / 2].map((n) => String(+n.toFixed(1)).padStart(6)).join(' ')
  const two = [b.x, b.y, b.w, b.h].map((n) => String(n).padStart(6)).join(' ')
  // A photo or filled panel covers its box; a paragraph of text does not.
  const likely = b.fill > 0.85 ? 'photo/panel' : b.fill > 0.4 ? 'mixed' : 'text/icons'
  console.log(`  ${two}   ${one}  ${String(b.fill).padStart(5)}  ${String(b.aspect).padStart(5)}  ${likely}`)
}
