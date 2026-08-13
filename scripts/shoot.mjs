/* Screenshots a story's slide at exactly 1280x720 (or 2x) from the running
 * Storybook, for eyeballing a rebuild against its reference PNG.
 *
 *   node scripts/shoot.mjs <story-id> [outfile] [scale]
 *
 * It loads the story in iframe.html with `fit=none` forced via the args
 * query, so the artboard renders at true size with no transform and the
 * raster is pixel-for-pixel what the exporter will produce.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [id, out = 'export-out/shot.png', scale = '2'] = process.argv.slice(2)
if (!id) {
  console.error('usage: node scripts/shoot.mjs <story-id> [outfile] [scale]')
  process.exit(1)
}

/* Storybook's port. package.json pins `-p 6008`, but Storybook silently falls
 * through to the next free port if something already holds it — which is exactly
 * what happened when a server left running from the old folder name kept 6008
 * and the real one came up on 6009, leaving every script here pointed at a dead
 * tree. SB_PORT overrides without editing four files. */
const SB_PORT = process.env.SB_PORT || '6008'

const url = `http://localhost:${SB_PORT}/iframe.html?id=${id}&viewMode=story&args=fit:none`

mkdirSync(dirname(out), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: Number(scale),
})

await page.goto(url, { waitUntil: 'networkidle' })
// Webfonts decide the metrics of every line — never shoot before they land.
await page.evaluate(() => document.fonts.ready)
const frame = page.locator('.ds-slide').first()
await frame.waitFor({ state: 'visible', timeout: 15000 })
await page.waitForTimeout(250)

await frame.screenshot({ path: out })
console.log(`✓ ${out} @${scale}x`)

await browser.close()
