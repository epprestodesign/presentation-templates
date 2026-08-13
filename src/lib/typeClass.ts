import type { TypeStep } from '../types'

/** Maps a type-scale step to its utility class in app.css.
 *
 *  The scale keys are camelCase (`statSm`, `bodySm`, `pageNumber`) while the
 *  classes are kebab (`ds-text-stat-sm`). A plain `.toLowerCase()` silently
 *  produces `ds-text-statsm`, which matches nothing and leaves the element at
 *  inherited size — so the conversion lives here once rather than being
 *  re-typed at each call site.
 */
export function typeClass(step: TypeStep): string {
  return `ds-text-${step.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`
}
