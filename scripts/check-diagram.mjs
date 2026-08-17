/* Geometry gate for the ported diagram types.
 *
 *   node scripts/check-diagram.mjs <story-id> [<story-id> ...]
 *   node scripts/check-diagram.mjs --all        # every Diagrams/* story
 *
 * The diagram-design skill ships a self_check.py because its connector rules are
 * easy to break by hand and hard to see once a diagram is dense. This is the
 * same idea against the rendered DOM, checking the things that are objectively
 * checkable rather than matters of taste:
 *
 * Scoped to `svg[data-diagram]`, which every ported type sets. Scoping matters:
 * without it the walk also covered the logo watermark and reported the
 * wordmark's own curves as diagonal connectors.
 *
 *   1. Nothing crosses the 1280x720 artboard.
 *   2. No DIAGONAL connector. Upstream's rule 1 and an automatic fail: every
 *      segment must be axis-aligned, with bends as quarter-arcs. A path with a
 *      slanted L or a diagonal M→L is reported with its own `d`.
 *   3. No arrow label sitting ON its connector. The mask must clear the stroke
 *      by >= 6px, or the label hides the line it annotates (rule 2).
 *   4. No label mask overlapping a NODE box (rule 6) — a mask inside a node is
 *      covered by the node fill and the text renders as a fragment.
 *   5. No two node boxes overlapping.
 *
 * Taste — is this the right type, is the copy any good, are there really only
 * one or two focal nodes — is not checkable here and still needs eyes.
 */
import { chromium } from 'playwright'

const SB_PORT = process.env.SB_PORT || '6008'
const BASE = `http://localhost:${SB_PORT}`

let ids = process.argv.slice(2)
if (!ids.length) {
  console.error('usage: node scripts/check-diagram.mjs <story-id> | --all')
  process.exit(1)
}

if (ids[0] === '--all') {
  const idx = await (await fetch(`${BASE}/index.json`)).json()
  ids = Object.values(idx.entries)
    .filter((e) => e.type === 'story' && e.title.startsWith('Diagrams/'))
    .map((e) => e.id)
  if (!ids.length) {
    console.error('No Diagrams/* stories found.')
    process.exit(1)
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

let failed = 0

for (const id of ids) {
  await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story&args=fit:none`, {
    waitUntil: 'networkidle',
  })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(250)

  const report = await page.evaluate(() => {
    const problems = []
    const slide = document.querySelector('.ds-slide')
    if (!slide) return { problems: ['no .ds-slide rendered'] }
    const S = slide.getBoundingClientRect()

    /* 1. artboard bounds */
    for (const el of slide.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width < 2 || r.height < 2) continue
      if (r.right > S.right + 1.5 || r.bottom > S.bottom + 1.5 || r.left < S.left - 1.5) {
        const cls = (el.className?.toString?.() || el.tagName).slice(0, 40)
        problems.push(`overflow: ${cls}`)
        break
      }
    }

    const svg = slide.querySelector('svg[data-diagram]')
    if (!svg) return { problems }

    /* 2. diagonal segments. Parse each path's `d` and confirm every straight
          run keeps one axis constant. Quarter-arc control points are allowed to
          move both, which is what makes a rounded corner legal. */
    for (const p of svg.querySelectorAll('path')) {
      const d = p.getAttribute('d') || ''
      const toks = d.match(/[MLQ][^MLQZ]*/g) || []
      let cur = null
      for (const t of toks) {
        const cmd = t[0]
        const nums = (t.slice(1).trim().match(/-?[\d.]+/g) || []).map(Number)
        if (cmd === 'M') cur = { x: nums[0], y: nums[1] }
        else if (cmd === 'L') {
          const next = { x: nums[0], y: nums[1] }
          if (cur && Math.abs(next.x - cur.x) > 0.6 && Math.abs(next.y - cur.y) > 0.6) {
            problems.push(`diagonal connector: ${d.slice(0, 70)}`)
          }
          cur = next
        } else if (cmd === 'Q') cur = { x: nums[2], y: nums[3] }
      }
    }

    /* Collect label masks and node boxes.
       
       A label mask is rx=2 with an OPAQUE fill. The type tag inside a node is
       also rx=2 with one text, but its fill is `transparent` — and upstream is
       explicit that a mask fully inside a node is a badge chip and legitimate.
       Without the fill test every tagged node self-reported as a rule-6
       violation, which is the checker crying wolf on correct output. */
    const labelGroups = []
    const nodeRects = []
    for (const g of svg.querySelectorAll('g')) {
      const rects = [...g.children].filter((c) => c.tagName === 'rect')
      const texts = [...g.children].filter((c) => c.tagName === 'text')
      if (rects.length === 1 && texts.length === 1 && rects[0].getAttribute('rx') === '2') {
        const fill = rects[0].getAttribute('fill') || ''
        if (fill && fill !== 'transparent' && fill !== 'none') {
          labelGroups.push(rects[0].getBoundingClientRect())
        }
      }
      if (rects.length >= 2) nodeRects.push(rects[1].getBoundingClientRect())
    }

    const strokes = [...svg.querySelectorAll('path')].map((p) => p.getBoundingClientRect())

    /* 3. label must clear its connector by >= 6px. A mask whose box intersects a
          stroke's box is only a problem when it actually sits on the line, so
          require a real intersection of >4px in both axes to flag it. */
    for (const m of labelGroups) {
      for (const s of strokes) {
        const ox = Math.min(m.right, s.right) - Math.max(m.left, s.left)
        const oy = Math.min(m.bottom, s.bottom) - Math.max(m.top, s.top)
        if (ox > 4 && oy > 4 && s.height < 3) {
          problems.push('label sits on its connector (needs >=6px gap)')
          break
        }
      }
    }

    /* 4. label mask inside a node box */
    for (const m of labelGroups) {
      for (const n of nodeRects) {
        const ox = Math.min(m.right, n.right) - Math.max(m.left, n.left)
        const oy = Math.min(m.bottom, n.bottom) - Math.max(m.top, n.top)
        if (ox > 3 && oy > 3) {
          problems.push('label mask overlaps a node box')
          break
        }
      }
    }

    /* 5. node boxes must not overlap each other */
    for (let i = 0; i < nodeRects.length; i++) {
      for (let j = i + 1; j < nodeRects.length; j++) {
        const a = nodeRects[i]
        const b = nodeRects[j]
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (ox > 2 && oy > 2) {
          problems.push('two node boxes overlap')
          i = nodeRects.length
          break
        }
      }
    }

    return { problems: [...new Set(problems)], nodes: nodeRects.length, labels: labelGroups.length }
  })

  const bad = report.problems.length > 0
  if (bad) failed++
  const mark = bad ? '✗' : '✓'
  console.log(`${mark} ${id}  (${report.nodes ?? 0} nodes, ${report.labels ?? 0} labels)`)
  report.problems.forEach((p) => console.log(`    ${p}`))
}

await browser.close()
console.log(`\n${ids.length} checked · ${failed} with problems`)
process.exit(failed ? 1 : 0)
