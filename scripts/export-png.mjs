/* Rasterises every Templates story to PNG at 2x.
 *
 *   pnpm export:png                    → export-out/png/<story-id>.png
 *   pnpm export:png stat-grid          → only ids containing "stat-grid"
 *
 * Needs Storybook running on :6008.
 *
 * This is the third renderer of the same slide specs — alongside the React view
 * and the PPTX emitter. It exists for the cases the other two cannot serve: a
 * Slack paste, a PDF page, an image in a doc. Rendered at `fit=none` so the
 * artboard is its true 1280x720 and the raster is 2560x1440 with no resampling,
 * matching the reference decks exactly.
 *
 * Docs stories are skipped — an autodocs page is not a slide.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const OUT = 'export-out/png'
const SB = 'http://localhost:6008'
const SCALE = 2

const filter = process.argv.slice(2).filter((a) => !a.startsWith('--'))

const index = await fetch(`${SB}/index.json`)
  .then((r) => r.json())
  .catch(() => {
    console.error(`Cannot reach Storybook at ${SB}. Start it with \`pnpm storybook\`.`)
    process.exit(1)
  })

const stories = Object.entries(index.entries)
  .filter(([, v]) => v.title.startsWith('Templates/') && v.name !== 'Docs')
  .filter(([id]) => filter.length === 0 || filter.some((f) => id.includes(f)))
  .map(([id, v]) => ({ id, title: v.title, name: v.name }))

if (stories.length === 0) {
  console.error('No matching Templates stories.')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: SCALE,
})

console.log(`${stories.length} slides → ${OUT} @${SCALE}x`)
let ok = 0
let failed = 0

for (const story of stories) {
  try {
    await page.goto(`${SB}/iframe.html?id=${story.id}&viewMode=story&args=fit:none`, {
      waitUntil: 'networkidle',
    })
    // Webfonts decide every line break; shooting before they land silently
    // produces a differently-wrapped slide.
    await page.evaluate(() => document.fonts.ready)
    const frame = page.locator('.ds-slide').first()
    await frame.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(200)
    await frame.screenshot({ path: `${OUT}/${story.id}.png` })
    console.log(`  ✓ ${story.title} · ${story.name}`)
    ok++
  } catch (err) {
    console.error(`  ✗ ${story.id}: ${String(err).split('\n')[0]}`)
    failed++
  }
}

await browser.close()
console.log(`\n${ok} exported, ${failed} failed`)
if (failed) process.exitCode = 1
