import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { canvas } from '../../tokens/tokens.js'
import type { SlideChromeSpec, SlideSurface } from '../../types'
import { SlideChrome } from './SlideChrome'
import styles from './SlideFrame.module.css'

/**
 * SlideFrame — the artboard every slide is built inside.
 *
 * Establishes the 1280x720 coordinate space the whole system depends on.
 * Children position themselves absolutely in px against it, which is what
 * makes the PowerPoint / Google Slides export a divide-by-96 rather than a
 * layout re-flow.
 *
 * Two fit modes:
 *   'contain' (default) scales the artboard down to whatever container it is
 *      in, for Storybook and the deck player. The transform is visual only —
 *      the coordinate space never changes.
 *   'none' renders at exactly 1280x720. The export scripts use this so
 *      headless Chromium rasterises pixel-for-pixel with no resampling.
 */
export interface SlideFrameProps extends SlideChromeSpec {
  surface?: SlideSurface
  /** Full-bleed background image URL, used when `surface` is 'image'. */
  image?: string
  /** Scrim over a background image so text stays legible. 0–1. */
  scrim?: number
  /** 'contain' scales to fit the container; 'none' renders at exact size. */
  fit?: 'contain' | 'none'
  children?: ReactNode
}

export function SlideFrame({
  surface = 'light',
  image,
  scrim = 0,
  fit = 'contain',
  children,
  ...chrome
}: SlideFrameProps) {
  const host = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Measure before paint so the slide never flashes at the wrong size.
  useLayoutEffect(() => {
    if (fit === 'none' || !host.current) return
    const el = host.current
    const measure = () => {
      const { width } = el.getBoundingClientRect()
      if (width > 0) setScale(width / canvas.width)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [fit])

  // Nothing to observe at exact size, but keep the hook order stable.
  useEffect(() => {
    if (fit === 'none') setScale(1)
  }, [fit])

  const exact = fit === 'none'

  // The host reserves the scaled height so the slide occupies real layout
  // space; the artboard itself is transformed inside it.
  const hostStyle: CSSProperties = exact
    ? { width: canvas.width, height: canvas.height }
    : { width: '100%', height: canvas.height * scale }

  const artboardStyle: CSSProperties = {
    width: canvas.width,
    height: canvas.height,
    ...(exact ? {} : { transform: `scale(${scale})`, transformOrigin: 'top left' }),
    ...(surface === 'image' && image ? { backgroundImage: `url("${image}")` } : {}),
  }

  /** Chrome ink flips to white on any dark surface. */
  const onDark = surface === 'brand' || surface === 'image' || surface === 'navy'

  return (
    <div ref={host} className={styles.host} style={hostStyle}>
      <div
        className={['ds-slide', styles.slide, styles[surface]].filter(Boolean).join(' ')}
        style={artboardStyle}
      >
        {/* Scrim sits above the photo but below every layer of content. */}
        {scrim > 0 && <div className={styles.scrim} style={{ opacity: scrim }} />}

        <SlideChrome {...chrome} onDark={onDark} />

        {children}
      </div>
    </div>
  )
}
