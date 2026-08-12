import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const svg = readFileSync('src/assets/logo/eventpipe-logo.svg', 'utf8')
const b = await chromium.launch()
const p = await b.newPage()
await p.setContent(`<body style="margin:0">${svg}</body>`)
const out = await p.evaluate(() => {
  const svgEl = document.querySelector('svg')
  const vb = svgEl.getAttribute('viewBox')
  const paths = [...svgEl.querySelectorAll('path')].map((el, i) => {
    const bb = el.getBBox()
    return { i, fill: el.getAttribute('fill'),
             x: +bb.x.toFixed(2), y: +bb.y.toFixed(2),
             w: +bb.width.toFixed(2), h: +bb.height.toFixed(2),
             x2: +(bb.x + bb.width).toFixed(2), y2: +(bb.y + bb.height).toFixed(2) }
  })
  return { viewBox: vb, paths }
})
console.log('viewBox:', out.viewBox)
for (const q of out.paths) console.log(`  path[${q.i}] fill=${q.fill}  x:${q.x}→${q.x2} (w ${q.w})  y:${q.y}→${q.y2} (h ${q.h})`)
await b.close()
