/* Entry — "The design process" (12 slides), served at <deck>/process/.
 *
 * `mount` FIRST, for the reason documented in src/deck/mount.tsx: it carries the
 * globals.css import, and ESM evaluates an entry's imports in source order. */
import { mountDeck } from '../mount'
import { meta, slides } from './slides'

mountDeck(meta, slides)
