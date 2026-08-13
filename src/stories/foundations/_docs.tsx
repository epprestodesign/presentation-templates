import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared layout primitives for the Foundations pages.
 *
 * These are documentation, not slides, so nothing here is fixed-width or
 * 16:9 — every grid is `auto-fill` against a minimum track size, so the page
 * reflows with the browser and shows more per row on a wide window. A slide is
 * the only thing in this system with a fixed aspect ratio, and it should stay
 * that way; boxing reference material into 1280x720 just wastes the viewport.
 *
 * Kept in one file so all Foundations pages look like one document, and so adding a
 * page is writing content rather than re-deriving a layout.
 */

const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace'
const sans = 'Poppins, system-ui, sans-serif'

/** A titled section with optional explanatory copy. */
export function Section({
  title,
  intro,
  children,
}: {
  title: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h3 style={{ font: `600 16px/1.3 ${sans}`, margin: '0 0 6px', color: '#000' }}>{title}</h3>
      {intro && (
        <p
          style={{
            font: `400 13.5px/1.6 ${sans}`,
            color: '#546e7a',
            margin: '0 0 18px',
            // Copy still gets a comfortable measure even though the grids below
            // run full width — long lines are hard to read regardless of medium.
            maxWidth: '68ch',
          }}
        >
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

/** Fluid grid. `min` is the smallest a track may get before the count drops. */
export function Grid({
  min = 180,
  gap = 16,
  children,
}: {
  min?: number
  gap?: number
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap,
      }}
    >
      {children}
    </div>
  )
}

/** A colour chip with its name, value and optional role note. */
export function Swatch({
  label,
  value,
  note,
  height = 76,
}: {
  label: string
  value: string
  note?: string
  height?: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      <div
        style={{
          height,
          borderRadius: 8,
          background: value,
          /* A definite light-grey edge rather than an 8% hint. On a white page
             the pale end of a ramp — #ffffff, #fafafa, #f5f5f5 — otherwise has
             no visible boundary and reads as empty space. */
          border: '1px solid #d4d4d4',
        }}
      />
      <div style={{ font: `600 12px/1.3 ${sans}` }}>{label}</div>
      <Code>{value}</Code>
      {note && <div style={{ font: `400 11.5px/1.45 ${sans}`, color: '#546e7a' }}>{note}</div>}
    </div>
  )
}

/** A whole ramp as one continuous strip.
 *
 *  Distinct from `Grid` + `Swatch`, which the Palette page uses to give each
 *  step its own tile: at 11 steps that fills a screen, which is right when the
 *  ramps ARE the subject and wrong on the Colors page, where they are context
 *  for the semantic tokens below them. A strip also shows the thing a grid of
 *  separated tiles hides — whether the ramp steps evenly.
 *
 *  Step labels flip to dark text on the pale end. The threshold is luminance,
 *  not step number, because the ramps do not all cross mid-grey at the same
 *  step — fountain-blue is still bright at 500 where orient has gone deep. */
export function Ramp({
  name,
  steps,
  note,
}: {
  name: string
  steps: Record<string | number, string>
  note?: ReactNode
}) {
  const entries = Object.entries(steps)
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ font: `600 12.5px/1.4 ${sans}`, marginBottom: 6 }}>{name}</div>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #d4d4d4' }}>
        {entries.map(([step, hex]) => (
          <div
            key={step}
            title={`${name}-${step} · ${hex}`}
            style={{
              flex: 1,
              height: 58,
              background: hex,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: 5,
              font: `600 10px/1 ${sans}`,
              color: luminance(hex) > 0.62 ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.92)',
            }}
          >
            {step}
          </div>
        ))}
      </div>
      {note && (
        <div style={{ font: `400 11.5px/1.5 ${sans}`, color: '#546e7a', marginTop: 6, maxWidth: '72ch' }}>
          {note}
        </div>
      )}
    </div>
  )
}

/** Relative luminance of a #rrggbb string, 0..1. Used only to pick a readable
 *  label colour on top of a swatch. */
function luminance(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Monospaced token value. */
export function Code({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        font: `400 11.5px/1.4 ${mono}`,
        color: '#7b7b7b',
        // Long token names must not force the grid track wider than its share.
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </span>
  )
}

/** A specimen tile: a rendered example over its label. Used by Typography,
 *  Icons, Shape and Elevation, which all show "a thing, then its name". */
export function Specimen({
  label,
  meta,
  children,
  align = 'center',
  minHeight = 96,
  style,
}: {
  label: string
  meta?: string
  children: ReactNode
  align?: CSSProperties['alignItems']
  minHeight?: number
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div
        style={{
          minHeight,
          display: 'flex',
          alignItems: align,
          justifyContent: 'center',
          padding: 16,
          borderRadius: 10,
          background: '#fafafa',
          border: '1px solid #e5e5e5',
          overflow: 'hidden',
          ...style,
        }}
      >
        {children}
      </div>
      <div style={{ font: `600 12px/1.3 ${sans}` }}>{label}</div>
      {meta && <Code>{meta}</Code>}
    </div>
  )
}

/** Page wrapper. Full width by design — see the note at the top of this file. */
export function Page({ children }: { children: ReactNode }) {
  return <div style={{ font: `400 14px/1.6 ${sans}`, color: '#000' }}>{children}</div>
}
