/* Every recovered photo, keyed by its path without the extension.
 *
 * Slides reference imagery by name — `img('mosaic/reception-bell')` — rather
 * than importing files. That matters for the authoring model: a slide is meant
 * to be a plain data object an agent can write, and a spec full of import
 * statements is not data. It also means a missing name fails loudly at build
 * with a list of what does exist, instead of rendering a silent broken image.
 *
 * Populated by Vite's glob import, so dropping a file into this directory is
 * all it takes to make it available.
 */
/* Four sibling asset directories are globbed alongside this one, so `img()` is
 * the single resolver for every asset in the repo.
 *
 * Before this, `img()` reached only src/assets/imagery, and team headshots,
 * partner marks, employer marks and event logos each sat outside it — so three
 * separate components ended up carrying their own local `import.meta.glob`, and
 * one carried a hand-written name→filename alias table on top. One registry
 * deletes all of that, and means a slide spec never has to know which folder an
 * asset happens to live in. */
import { IMAGERY_HOST, REMOTE_IMAGERY } from './manifest'

const modules = {
  ...import.meta.glob<string>('./**/*.{png,jpg,jpeg,svg}', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
  ...import.meta.glob<string>('../{team,partners,employers,events}/**/*.{png,jpg,jpeg,svg}', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
}

/** 'mosaic/reception-bell', 'team/circle/tim-brown', 'employers/redfin' → URL. */
export const imagery: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path
      .replace(/^\.\//, '')
      .replace(/^\.\.\//, '')
      .replace(/\.(png|jpg|jpeg|svg)$/, ''),
    url,
  ])
)

/** Resolve an imagery name to a URL.
 *
 *  Local files WIN. On a developer's machine and in the export scripts the
 *  photos are on disk, so they resolve to a bundled asset — which keeps the
 *  PNG/PPTX/PDF exports working offline and byte-identical, the property the
 *  whole download-rather-than-hotlink decision was made to protect.
 *
 *  The remote host is the fallback for the DEPLOYED build only. Imagery is
 *  gitignored — original decks, staff headshots and third-party marks must not
 *  be republished — so a Pages build globs nothing and would otherwise throw on
 *  every photographic slide. Anything in the manifest is served from the public
 *  image host instead.
 *
 *  A name that is in neither still throws with the full list, which is what
 *  catches a typo at authoring time. */
export function img(name: string): string {
  return imgOrNull(name) ?? MISSING_IMAGE
}

/** Same resolution, but `null` instead of a placeholder when nothing matches.
 *
 *  For callers that can do something better than show a grey box — SlideFrame
 *  falls back to the CSS brand gradient when a named background plate is not
 *  available, which is indistinguishable from the real thing on most slides. */
export function imgOrNull(name: string): string | null {
  const local = imagery[name]
  if (local) return local

  const remote = REMOTE_IMAGERY[name]
  if (remote) return `${IMAGERY_HOST}/${remote}`

  /* DEV THROWS, PRODUCTION DEGRADES.
   *
   * Throwing is right while authoring: a typo in an image name should stop you
   * immediately, with the list of what exists. It is exactly wrong in a
   * deployed build, where the imagery is gitignored by design — there, every
   * missing asset took its whole story down with it, and 13 of 14 template
   * slides rendered as a red error panel instead of as a slide missing one
   * picture. A deck that is missing a photograph is still a deck. */
  if (import.meta.env.DEV) {
    throw new Error(
      `Unknown image "${name}". Available locally:\n  ${Object.keys(imagery).sort().join('\n  ')}`
    )
  }
  return null
}

/** A neutral plate, so a slot with no asset reads as an empty frame rather than
 *  as a broken-image glyph. Inline SVG: no network request, and it cannot 404. */
const MISSING_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9">' +
      '<rect width="16" height="9" fill="%23eceff1"/></svg>'
  )

/** True when this asset can only come from the remote host — used by the
 *  Imagery foundation page to say so rather than showing a silent gap. */
export function isRemote(name: string): boolean {
  return !imagery[name] && Boolean(REMOTE_IMAGERY[name])
}

/** All names, for the Imagery foundation story. Union of what is on disk and
 *  what the host carries, so the page lists the same set in dev and deployed. */
export const imageryNames = [
  ...new Set([...Object.keys(imagery), ...Object.keys(REMOTE_IMAGERY)]),
].sort()
