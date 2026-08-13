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
      <h3 style={{ font: `700 16px/1.3 ${sans}`, margin: '0 0 6px', color: '#000' }}>{title}</h3>
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
