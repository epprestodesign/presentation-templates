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

/** Resolve an imagery name to a URL, failing loudly if it is not there. */
export function img(name: string): string {
  const url = imagery[name]
  if (!url) {
    throw new Error(
      `Unknown image "${name}". Available:\n  ${Object.keys(imagery).sort().join('\n  ')}`
    )
  }
  return url
}

/** All names, for the Imagery foundation story. */
export const imageryNames = Object.keys(imagery).sort()
