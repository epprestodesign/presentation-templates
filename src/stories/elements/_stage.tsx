import type { CSSProperties, ReactNode } from 'react'

/**
 * Shared framing for the Elements pages.
 *
 * An element is a piece OF a slide, so showing it on a bare Storybook canvas is
 * misleading twice over: its type steps are sized for a 1280x720 artboard, and
 * several of them only make sense against the surface they are designed for
 * (reversed ink on the brand gradient, hairline borders that vanish on white).
 *
 * `Stage` gives each specimen a surface and a fixed width in SLIDE px, so what
 * you see is the size it will actually be. Elements pages otherwise keep the
 * responsive documentation layout — only Templates use the fixed artboard.
 */

const sans = 'Poppins, system-ui, sans-serif'

export function Stage({
  label,
  note,
  surface = 'light',
  width,
  height,
  children,
  style,
}: {
  label?: string
  note?: string
  /** 'light' white · 'muted' the card fill · 'brand' the gradient · 'stage' review grey */
  surface?: 'light' | 'muted' | 'brand' | 'stage'
  /** Width in slide px. Elements are sized for the artboard, so this is not CSS px-agnostic. */
  width?: number
  height?: number
  children: ReactNode
  style?: CSSProperties
}) {
  const backgrounds: Record<string, string> = {
    light: 'var(--slide-color-surface)',
    muted: 'var(--slide-color-surface-muted)',
    brand: 'var(--slide-gradient-brand-bleed)',
    stage: '#e8eaed',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div
        style={{
          background: backgrounds[surface],
          border: surface === 'light' ? '1px solid #e5e5e5' : 'none',
          borderRadius: 10,
          padding: 20,
          width: width ? width + 40 : undefined,
          minHeight: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          overflow: 'hidden',
          ...style,
        }}
      >
        <div style={{ width: width ?? '100%' }}>{children}</div>
      </div>
      {label && <div style={{ font: `600 12px/1.3 ${sans}` }}>{label}</div>}
      {note && (
        <div style={{ font: `400 11.5px/1.5 ${sans}`, color: '#546e7a', maxWidth: 560 }}>{note}</div>
      )}
    </div>
  )
}

/** A row of stages that wraps with the viewport. */
export function Row({ children, gap = 24 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap, alignItems: 'flex-start' }}>{children}</div>
}

/** A titled section with explanatory copy. */
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
      <h3 style={{ font: `600 16px/1.3 ${sans}`, margin: '0 0 6px' }}>{title}</h3>
      {intro && (
        <p style={{ font: `400 13.5px/1.6 ${sans}`, color: '#546e7a', margin: '0 0 18px', maxWidth: '68ch' }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  )
}

export function Page({ children }: { children: ReactNode }) {
  return <div style={{ font: `400 14px/1.6 ${sans}`, color: '#000' }}>{children}</div>
}
