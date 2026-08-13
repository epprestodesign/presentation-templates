/* Prints the real path bounding boxes inside the EventPipe logo SVG.
 *
 *   node scripts/measure-logo.mjs
 *
 * EpLogo clips one source lockup into a glyph and a wordmark, and those split
 * points have to be exact — guessing them once cut the leading "e" off the
 * wordmark and shipped "aventpipe" into the watermark on every slide. Re-run
 * this if src/assets/logo/eventpipe-logo.svg is ever replaced, and copy the
 * numbers into EpLogo's SPLIT constant.
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const svg = readFileSync('src/assets/logo/eventpipe-logo.svg', 'utf8')

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(`<body style="margin:0">${svg}</body>`)

const out = await page.evaluate(() => {
  const svgEl = document.querySelector('svg')
  return {
    viewBox: svgEl.getAttribute('viewBox'),
    paths: [...svgEl.querySelectorAll('path')].map((el, i) => {
      const bb = el.getBBox()
      return {
        i,
        fill: el.getAttribute('fill'),
        x: +bb.x.toFixed(2),
        y: +bb.y.toFixed(2),
        x2: +(bb.x + bb.width).toFixed(2),
        y2: +(bb.y + bb.height).toFixed(2),
        w: +bb.width.toFixed(2),
        h: +bb.height.toFixed(2),
      }
    }),
  }
})

console.log('viewBox:', out.viewBox)
for (const p of out.paths) {
  console.log(
    `  path[${p.i}] fill=${p.fill}  x:${p.x}→${p.x2} (w ${p.w})  y:${p.y}→${p.y2} (h ${p.h})`
  )
}

await browser.close()
