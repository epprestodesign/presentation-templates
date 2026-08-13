import type { CSSProperties } from 'react'
import styles from './LogoGrid.module.css'

/**
 * LogoGrid — a field of third-party marks at even optical size.
 *
 * Two jobs in this deck, which is why it is one component rather than two:
 * the customer/event walls on slide 06 (six across, dozens of marks) and the
 * prior-employer strip under each headshot on the leadership slide (one
 * across, four marks). Only `columns` differs.
 *
 * Laid out with flex-wrap on fixed-width cells rather than CSS grid,
 * specifically so a partial last row CENTRES. Slide 06's customer wall ends on
 * a row of two, centred under the six above it; a grid pins them left.
 *
 * Marks arrive at wildly different aspect ratios and internal padding, so a
 * cell caps HEIGHT and lets width find itself. Capping width instead makes a
 * wide wordmark and a square badge read as two different sizes.
 */

/* Every file in src/assets/partners, keyed by basename.
 *
 * Not routed through `img()` because that helper globs src/assets/imagery
 * only — partner marks live in their own directory and are not photography.
 * Same glob pattern as Foundations/Logos uses. */
const modules = import.meta.glob<string>('../../assets/partners/*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
  query: '?url',
})

const byFile: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [path.split('/').pop()!, url])
)

/* Readable names for the marks, because 15 of the 19 files shipped as bare
 * UUIDs and `logo('1dcde4ac-24aa-42a2-9ac5-791d2b543ea8')` in a slide spec is
 * not content anybody can review. The real fix is renaming the files in
 * src/assets/partners — that directory is not this component's to change, so
 * the mapping lives here until it happens, and `logo()` still accepts a raw
 * basename so nothing is unreachable. */
const ALIASES: Record<string, string> = {
  '365': '365Logo_Horizontal.png',
  '288-travel': 'd9cf643b-683c-45eb-8bc4-21285efb2d87.png',
  '3up-sports': '82162d51-e081-4c7a-b824-7992c0a56cb6.png',
  '435-housing': 'cf2914a4-29bb-4abf-a0b9-8cf7ce3957b8.png',
  '804-travel': '22e77aac-1ddb-4a71-a338-b7240a84daad.png',
  'absolut-sport': 'c6319e1f-0f74-406e-aaa8-e0d56520317a.jpg',
  'academy-of-management': '1dcde4ac-24aa-42a2-9ac5-791d2b543ea8.png',
  'ah-travel': 'ad76dd0e-6f64-469b-8bfc-5d3fa5430a92.jpeg',
  asl: 'b0d43ad0-c620-4618-8705-e7d3c92c37a3.png',
  ausa: 'adbc3272-008c-4c5a-8704-20192d032101.png',
  'atlas-travel-stay': 'd43ca7fa-61c8-4dcb-8699-d7325ba87e3f.png',
  'balloon-fiesta': '58f278d0-7d3c-4abc-957a-7d933f00a8e6.jpg',
  'bearpaw-lacrosse': '55652c57-8829-41d0-b583-afbd54142867.png',
  'berkshire-choral': '953d1c1d-1d3e-4451-b814-e499b538f4da.png',
  'bismarck-mandan': 'b6f54a9d-060d-4ae3-8546-5ff826fa9657.png',
  'bounce-travel': 'e4f28ca7-ffcb-4944-9c97-df759966b2d2.png',
  'hockey-night-in-boston': '866c98dd-65da-4908-a7b7-85cd8bf38762.png',
  'team-travel-source': 'TTS-Logo-e1749152469615.png',
  traveloc: 'traveloc.png',
}

/** Resolve a partner mark by alias or by raw filename, failing loudly. */
export function logo(name: string): string {
  const file = ALIASES[name] ?? name
  const url = byFile[file] ?? byFile[`${file}.png`] ?? byFile[`${file}.jpg`]
  if (!url) {
    throw new Error(
      `Unknown logo "${name}". Aliases:\n  ${Object.keys(ALIASES).sort().join('\n  ')}\nFiles:\n  ${Object.keys(byFile).sort().join('\n  ')}`
    )
  }
  return url
}

/** Every alias, for documentation stories. */
export const logoNames = Object.keys(ALIASES).sort()

export interface LogoGridProps {
  /** Alias or filename per mark — see `logo()`. */
  logos: string[]
  /** Marks per row. 6 is the wall on slide 06; 1 is the prior-employer strip. */
  columns?: number
  /** Row height in slide px. The cell, not the mark. */
  rowHeight?: number
  /** Cap on the mark itself, so a tall badge and a wide wordmark match
   *  optically inside the same row. */
  maxHeight?: number
  /** Horizontal padding inside each cell — the visual gutter between marks. */
  cellPadding?: number
  /** 'center' for a wall, 'start' for the left-aligned prior-employer strip. */
  align?: 'center' | 'start'
  className?: string
}

export function LogoGrid({
  logos,
  columns = 6,
  rowHeight = 78,
  maxHeight = 46,
  cellPadding = 6,
  align = 'center',
  className,
}: LogoGridProps) {
  const cellStyle: CSSProperties = {
    // Percentage of the field, not slide px: the field's own width is already
    // in px, and dividing here is what keeps `columns` the only knob.
    width: `${100 / columns}%`,
    height: rowHeight,
    paddingLeft: cellPadding,
    paddingRight: cellPadding,
    justifyContent: align === 'start' ? 'flex-start' : 'center',
  }

  return (
    <div
      className={[styles.field, className].filter(Boolean).join(' ')}
      style={{ justifyContent: align === 'start' ? 'flex-start' : 'center' }}
    >
      {logos.map((name, i) => (
        <div key={`${name}-${i}`} className={styles.cell} style={cellStyle}>
          <img src={logo(name)} alt="" className={styles.mark} style={{ maxHeight }} />
        </div>
      ))}
    </div>
  )
}
