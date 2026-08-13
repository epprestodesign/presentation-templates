/* Screenshots a story as a flowing page, for the Styles documentation.
 *
 *   node scripts/shoot-page.mjs <story-id> [outfile] [width]
 *
 * scripts/shoot.mjs is for slides: it targets the fixed 1280x720 artboard. The
 * Styles pages are documentation and reflow with the viewport, so they need a
 * full-page capture at a chosen width instead — which is also how you check
 * that a page really is responsive rather than a fixed-width block.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [id, out = 'export-out/page.png', width = '1440'] = process.argv.slice(2)
if (!id) {
  console.error('usage: node scripts/shoot-page.mjs <story-id> [outfile] [width]')
  process.exit(1)
}

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})

await page.goto(`http://localhost:6008/iframe.html?id=${id}&viewMode=story`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

await page.screenshot({ path: out, fullPage: true })
console.log(`✓ ${out} @${width}px wide`)

await browser.close()
