/* Prints every Templates story into one PDF, one slide per page.
 *
 *   pnpm export:pdf                → export-out/eventpipe-deck.pdf
 *   pnpm export:pdf tint-table     → only ids containing "tint-table"
 *
 * Needs Storybook running on :6008.
 *
 * Page size is 13.333in x 7.5in — the artboard's own dimensions, so a slide
 * fills the page exactly with no margin and no scaling. That is the same
 * arithmetic the PPTX emitter relies on (1280x720 at 96 px/in), which is why
 * the PDF and the PowerPoint agree page for page.
 *
 * Chromium can only print the page it is on, so slides are collected into ONE
 * document by building a single HTML page of 2x rasters — printing each story
 * separately would give one PDF per slide and no way to merge them without an
 * extra dependency.
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'export-out/eventpipe-deck.pdf'
const SB = 'http://localhost:6008'

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
  .map(([id, v]) => ({ id, label: `${v.title} · ${v.name}` }))

if (stories.length === 0) {
  console.error('No matching Templates stories.')
  process.exit(1)
}

mkdirSync('export-out', { recursive: true })

const browser = await chromium.launch()
const shooter = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 2,
})

console.log(`Rasterising ${stories.length} slides…`)
const pages = []

for (const story of stories) {
  try {
    await shooter.goto(`${SB}/iframe.html?id=${story.id}&viewMode=story&args=fit:none`, {
      waitUntil: 'networkidle',
    })
    await shooter.evaluate(() => document.fonts.ready)
    const frame = shooter.locator('.ds-slide').first()
    await frame.waitFor({ state: 'visible', timeout: 15000 })
    await shooter.waitForTimeout(200)
    const buf = await frame.screenshot({ type: 'png' })
    pages.push(`data:image/png;base64,${buf.toString('base64')}`)
    console.log(`  ✓ ${story.label}`)
  } catch (err) {
    console.error(`  ✗ ${story.id}: ${String(err).split('\n')[0]}`)
  }
}

await shooter.close()

// One page per slide, each exactly the artboard's physical size.
const printer = await browser.newPage()
await printer.setContent(`<!doctype html><html><head><style>
  @page { size: 13.3333in 7.5in; margin: 0; }
  html, body { margin: 0; padding: 0; }
  img { display: block; width: 13.3333in; height: 7.5in; page-break-after: always; }
  img:last-child { page-break-after: auto; }
</style></head><body>${pages.map((d) => `<img src="${d}">`).join('')}</body></html>`)

await printer.pdf({
  path: OUT,
  width: '13.3333in',
  height: '7.5in',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
})

await browser.close()
console.log(`\n✓ ${OUT}  (${pages.length} pages, 13.333in x 7.5in)`)
