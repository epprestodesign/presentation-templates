/* Entry — "Design production" (42 slides), served at the deck root.
 *
 * `mount` FIRST. It carries the globals.css import, and ESM evaluates an entry's
 * imports in source order, so putting `./slides` above it would inject the
 * component module CSS ahead of globals and bring back the black-on-black table
 * header. See src/deck/mount.tsx. */
import { mountDeck } from './mount'
import { meta, slides } from './slides'

mountDeck(meta, slides)
