/* Audits the imagery library against the brief, and against what slides use.
 *
 *   pnpm imagery:check
 *   pnpm imagery:check --json     machine-readable, for CI
 *
 * Four questions, because each one fails differently:
 *
 *   1. SHORTFALL   — a topic in the brief that fetched fewer images than asked.
 *                    Usually a query too narrow to return enough landscape
 *                    results; the fix is rewording it, not re-running.
 *   2. UNCREDITED  — an Unsplash image with no entry in credits.json. This is a
 *                    licence problem, not a tidiness problem: their API terms
 *                    require attribution, so this is the one failure that
 *                    should block a release.
 *   3. UNUSED      — an asset no story references. Harmless, but it is how a
 *                    100MB repo happens.
 *   4. BROKEN      — a story referencing a name that does not resolve. Renders
 *                    as a thrown error at runtime, so it is worth catching in
 *                    CI rather than in a review.
 *
 * Exits non-zero on UNCREDITED or BROKEN only. A shortfall or an unused asset
 * is information, not a failure — a library is allowed to have spare capacity.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { allTopics } from './imagery-topics.mjs'

const ROOT = 'src/assets/imagery'
const CREDITS = `${ROOT}/credits.json`

/* The resolver in src/assets/imagery/index.ts globs FIVE directories, so an
 * audit that walks only `imagery` reports every team headshot, partner mark and
 * employer logo as broken. Checking a narrower scope than the thing being
 * checked is how an audit produces confident false positives — it flagged
 * employers/motus on its first run, which is present and fine. */
const SIBLINGS = ['team', 'partners', 'employers', 'events'].map((d) => `src/assets/${d}`)
const asJson = process.argv.includes('--json')

/* --- what exists ------------------------------------------------------ */
function walk(dir, base = dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full, base))
    else if (/\.(png|jpe?g|svg)$/i.test(entry)) {
      out.push(relative(base, full).replace(/\.(png|jpe?g|svg)$/i, ''))
    }
  }
  return out
}

const present = new Set([
  ...walk(ROOT),
  // Siblings are keyed by their own folder name, matching the resolver.
  ...SIBLINGS.flatMap((dir) =>
    existsSync(dir) ? walk(dir, 'src/assets') : []
  ),
])
const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {}

/* --- what slides ask for ---------------------------------------------- */
function collectRefs(dir) {
  const refs = new Map()
  const visit = (d) => {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry)
      if (statSync(full).isDirectory()) visit(full)
      else if (/\.(tsx?|mdx)$/.test(entry)) {
        const text = readFileSync(full, 'utf8')
        // img('name'), src: 'name', wall: 'name', plate: 'name', image: 'name'
        for (const m of text.matchAll(
          /(?:img\(|(?:src|wall|plate|image)\s*:\s*)['"]([a-z0-9][\w/-]*)['"]/gi
        )) {
          const name = m[1]
          if (!refs.has(name)) refs.set(name, new Set())
          refs.get(name).add(relative('src', full))
        }
      }
    }
  }
  visit(dir)
  return refs
}

const refs = collectRefs('src')

/* --- 1. shortfall ------------------------------------------------------ */
const shortfall = []
for (const topic of allTopics()) {
  const have = [...present].filter((n) => n.startsWith(`${topic.dir}/${topic.slug}-`)).length
  if (have < topic.count) {
    shortfall.push({ topic: `${topic.group}/${topic.slug}`, query: topic.query, have, want: topic.count })
  }
}

/* --- 2. uncredited ----------------------------------------------------- */
const uncredited = [...present].filter((n) => n.startsWith('unsplash/') && !credits[n])

/* --- 3. unused --------------------------------------------------------- */
// A referenced name may point at a whole folder's worth of assets via a glob,
// so only exact matches count as "used".
const unused = [...present].filter((n) => !refs.has(n)).sort()

/* --- 4. broken --------------------------------------------------------- */
const broken = [...refs.keys()]
  .filter((n) => !present.has(n))
  // Ignore paths that are clearly not imagery names (URLs, css vars, etc).
  .filter((n) => !n.startsWith('http') && n.includes('/'))
  .sort()

/* --- report ------------------------------------------------------------ */
if (asJson) {
  console.log(JSON.stringify({ shortfall, uncredited, unused, broken, total: present.size }, null, 2))
} else {
  const line = (n) => `      ${n}`
  console.log(`\nImagery audit — ${present.size} assets\n`)

  if (broken.length) {
    console.log(`  ✗ BROKEN (${broken.length}) — referenced but not present; these throw at runtime`)
    for (const n of broken) console.log(`${line(n)}   ← ${[...refs.get(n)].join(', ')}`)
    console.log()
  }

  if (uncredited.length) {
    console.log(`  ✗ UNCREDITED (${uncredited.length}) — Unsplash requires attribution`)
    for (const n of uncredited.slice(0, 10)) console.log(line(n))
    if (uncredited.length > 10) console.log(`      … and ${uncredited.length - 10} more`)
    console.log()
  }

  if (shortfall.length) {
    console.log(`  ! SHORTFALL (${shortfall.length}) — fewer images than the brief asked for`)
    console.log(`    Reword the query in scripts/imagery-topics.mjs; re-running alone will not help.`)
    for (const s of shortfall) console.log(`      ${s.topic}  ${s.have}/${s.want}  "${s.query}"`)
    console.log()
  }

  if (unused.length) {
    console.log(`  · UNUSED (${unused.length}) — no story references these by name`)
    console.log(`    Not a fault: a library is allowed spare capacity. Worth a look if the repo is growing.`)
    const byGroup = {}
    for (const n of unused) {
      const g = n.split('/').slice(0, -1).join('/') || '(root)'
      byGroup[g] = (byGroup[g] ?? 0) + 1
    }
    for (const [g, n] of Object.entries(byGroup).sort((a, b) => b[1] - a[1])) {
      console.log(`      ${String(n).padStart(4)}  ${g}`)
    }
    console.log()
  }

  const bad = broken.length + uncredited.length
  console.log(bad === 0 ? '  ✓ nothing blocking\n' : `  ${bad} blocking issue(s)\n`)
}

if (broken.length || uncredited.length) process.exitCode = 1
