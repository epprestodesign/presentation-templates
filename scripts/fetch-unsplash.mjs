/* Batch-downloads the curated imagery brief from Unsplash, once.
 *
 *   pnpm imagery:fetch                 # everything missing
 *   pnpm imagery:fetch hotel-lobby     # just topics matching a substring
 *   pnpm imagery:fetch --force         # re-download even if present
 *   pnpm imagery:fetch --dry           # show the plan, call nothing
 *
 * Needs UNSPLASH_ACCESS_KEY in .env. See .env.example — the Access Key alone,
 * never the Secret.
 *
 * Why download rather than hotlink: a slide must render identically offline,
 * in CI, and in five years. Hotlinking makes every export depend on a live API
 * and a rate limit, and a photo that 404s later silently breaks a deck.
 *
 * TWO API GUIDELINE OBLIGATIONS, both implemented here and neither optional:
 *
 *  1. Registering the download. Unsplash requires a GET to the photo's
 *     `links.download_location` whenever a photo is actually taken. It is what
 *     credits the photographer's download count; skipping it while using the
 *     images is a terms violation, not a nicety.
 *  2. Attribution. Photographer name and profile link, with a utm_source, are
 *     written to credits.json next to the files and surfaced in the Imagery
 *     foundation page — so attribution travels with the asset instead of living
 *     in someone's memory.
 *
 * Rate limits: a demo app gets 50 requests/hour, production 5000. The brief is
 * sized with that in mind, and a 403 is reported as a rate limit rather than as
 * a mystery failure.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { allTopics } from './imagery-topics.mjs'

const OUT_ROOT = 'src/assets/imagery'
const CREDITS = `${OUT_ROOT}/credits.json`
/** Long edge to request. 2560 matches the deck's 2x export so a full-bleed
 *  photo never upscales. */
const WIDTH = 2560

/* --- env ------------------------------------------------------------- */
function loadEnv() {
  const path = resolve('.env')
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const env = { ...loadEnv(), ...process.env }
const KEY = env.UNSPLASH_ACCESS_KEY
const APP = env.UNSPLASH_APP_NAME || 'eventpipe_slides'

const args = process.argv.slice(2)
const force = args.includes('--force')
const dry = args.includes('--dry')
const filters = args.filter((a) => !a.startsWith('--'))

if (!KEY && !dry) {
  console.error(
    'Missing UNSPLASH_ACCESS_KEY.\n\n' +
      '  1. cp .env.example .env\n' +
      '  2. paste your Access Key (not the Secret) into UNSPLASH_ACCESS_KEY\n' +
      '  3. pnpm imagery:fetch\n\n' +
      'Run with --dry to preview the plan without a key.'
  )
  process.exit(1)
}

const auth = { Authorization: `Client-ID ${KEY}`, 'Accept-Version': 'v1' }

/* --- helpers --------------------------------------------------------- */
async function api(url) {
  const res = await fetch(url, { headers: auth })
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining')
    throw new Error(
      `Rate limited (403). Remaining: ${remaining ?? 'unknown'}. ` +
        'Demo apps allow 50 requests/hour — wait, or apply for production access.'
    )
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.json()
}

/** Unsplash requires this call when a photo is actually taken. */
async function registerDownload(photo) {
  try {
    await fetch(`${photo.links.download_location}&client_id=${KEY}`, { headers: auth })
  } catch {
    // Non-fatal for the file, but say so — it is a compliance step, and a
    // silent skip is exactly how a whole library ends up unregistered.
    console.warn(`    ! could not register download for ${photo.id}`)
  }
}

async function saveImage(photo, outPath) {
  // `raw` plus explicit params is the documented way to ask for a size.
  const url = `${photo.urls.raw}&w=${WIDTH}&q=80&fm=jpg&fit=max`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`image ${res.status} for ${photo.id}`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()))
}

/* --- run ------------------------------------------------------------- */
const topics = allTopics().filter(
  (t) => filters.length === 0 || filters.some((f) => t.slug.includes(f) || t.group.includes(f))
)

if (topics.length === 0) {
  console.error(`No topics match ${filters.join(', ')}. See scripts/imagery-topics.mjs.`)
  process.exit(1)
}

const credits = existsSync(CREDITS) ? JSON.parse(readFileSync(CREDITS, 'utf8')) : {}
let fetched = 0
let skipped = 0
let failed = 0

console.log(
  `${topics.length} topics · ${topics.reduce((n, t) => n + t.count, 0)} images · ${WIDTH}px` +
    (dry ? '  [dry run]' : '')
)

for (const topic of topics) {
  const wanted = Array.from({ length: topic.count }, (_, i) => ({
    name: `${topic.slug}-${i + 1}`,
    path: resolve(`${OUT_ROOT}/${topic.dir}/${topic.slug}-${i + 1}.jpg`),
  }))
  const missing = force ? wanted : wanted.filter((w) => !existsSync(w.path))

  if (missing.length === 0) {
    skipped += wanted.length
    continue
  }

  console.log(`\n${topic.group}/${topic.slug}  "${topic.query}"  (${missing.length} needed)`)
  if (dry) continue

  try {
    const data = await api(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic.query)}` +
        `&per_page=${Math.max(topic.count * 2, 10)}&orientation=${topic.orientation}&content_filter=high`
    )
    if (!data.results?.length) {
      console.warn(`    ! no results — reword the query in scripts/imagery-topics.mjs`)
      failed += missing.length
      continue
    }

    for (const [i, slot] of missing.entries()) {
      const photo = data.results[i]
      if (!photo) {
        console.warn(`    ! only ${data.results.length} results; ${slot.name} unfilled`)
        failed++
        continue
      }
      await saveImage(photo, slot.path)
      await registerDownload(photo)

      const key = `${topic.dir}/${slot.name}`
      credits[key] = {
        id: photo.id,
        description: photo.description || photo.alt_description || '',
        photographer: photo.user.name,
        photographerUrl: `${photo.user.links.html}?utm_source=${APP}&utm_medium=referral`,
        photoUrl: `${photo.links.html}?utm_source=${APP}&utm_medium=referral`,
        query: topic.query,
        group: topic.group,
        width: WIDTH,
      }
      console.log(`    ✓ ${slot.name}.jpg — ${photo.user.name}`)
      fetched++
    }
  } catch (err) {
    console.error(`    ✗ ${topic.slug}: ${err.message}`)
    failed += missing.length
    // A rate limit will not resolve within this run.
    if (String(err.message).includes('Rate limited')) break
  }
}

if (!dry && fetched > 0) {
  mkdirSync(dirname(resolve(CREDITS)), { recursive: true })
  writeFileSync(resolve(CREDITS), JSON.stringify(credits, null, 2) + '\n')
}

console.log(
  `\n${fetched} fetched · ${skipped} already present · ${failed} failed` +
    (fetched ? `\nAttribution written to ${CREDITS}` : '')
)
if (failed) process.exitCode = 1
