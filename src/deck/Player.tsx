import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { canvas } from '../tokens/tokens.js'
import type { DeckMeta, DeckSlide } from './types'
import styles from './Player.module.css'

/**
 * Deck player — the presentation view.
 *
 * SCALES, NEVER RE-FLOWS. A slide is a fixed 1280x720 artboard, so the player
 * transforms it to fit the window instead of letting it reflow. That is the
 * whole point of the artboard: what you rehearse is what projects, and what
 * projects is what the PNG and PPTX exports produce. A responsive deck would be
 * a different deck at every window size.
 *
 * The URL carries BOTH the number and the id — `#08-three-layers`.
 *
 * The number is what a person says out loud ("go to eight") and what a reviewer
 * writes in feedback; the slug is what survives inserting a slide. Carrying only
 * the number breaks every shared link the moment the deck is re-ordered, and
 * carrying only the slug means nobody can tell where they are in the talk from
 * the URL. Resolution prefers the SLUG, so an old link keeps working even after
 * its number changes.
 *
 * Three accepted forms, all resolving: `#08-three-layers`, `#three-layers`, `#8`.
 */
export interface PlayerProps {
  meta: DeckMeta
  slides: DeckSlide[]
}

type Mode = 'slide' | 'overview'

export function Player({ meta, slides }: PlayerProps) {
  const [index, setIndex] = useState(() => initialIndex(slides))
  const [mode, setMode] = useState<Mode>('slide')
  const [showNotes, setShowNotes] = useState(false)
  const [scale, setScale] = useState(1)
  const stage = useRef<HTMLDivElement>(null)

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(slides.length - 1, n)),
    [slides.length]
  )

  /* Fit the artboard to whatever space the stage has, in BOTH axes — a deck is
     as often shown on a tall laptop as on a 16:9 projector, and scaling on width
     alone crops the bottom of every slide on the former.
     
     MEASURE THE CONTENT BOX, not the border box. getBoundingClientRect includes
     the stage's own padding, so dividing by it produced a scale that consumed the
     padding too: at 1440x900 the slide came out 1440 wide inside a 1440 stage,
     flush to both edges with nothing to separate it from the chrome. */
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const measure = () => {
      const cs = getComputedStyle(el)
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      const width = el.getBoundingClientRect().width - padX
      const height = el.getBoundingClientRect().height - padY
      if (width > 0 && height > 0) {
        setScale(Math.min(width / canvas.width, height / canvas.height))
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  /* Keep the URL and the title in step with the slide, so a browser tab is
     self-describing and a link is shareable. `replaceState` rather than a hash
     assignment: pushing 40 history entries makes Back useless. */
  useEffect(() => {
    const slide = slides[index]
    if (!slide) return
    window.history.replaceState(null, '', `#${slideHash(index, slide.id)}`)
    document.title = `${index + 1} · ${slide.title} · ${meta.title}`
  }, [index, slides, meta.title])

  const go = useCallback((delta: number) => setIndex((i) => clamp(i + delta)), [clamp])

  /* Follow the hash when it changes, not only on mount.
   *
   * A hash-only URL change is a SAME-DOCUMENT navigation: React never remounts,
   * so resolving the deep link in an initialiser alone meant pasting
   * `#08-three-layers` into an already-open deck did nothing at all. That is the
   * exact motion someone makes when a colleague sends them a slide link and the
   * deck is already open in a tab. */
  useEffect(() => {
    const onHash = () => {
      const next = initialIndex(slides)
      setIndex(next)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [slides])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Never swallow a browser shortcut.
      if (e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          mode === 'overview' ? setIndex((i) => clamp(i + 1)) : go(1)
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          go(-1)
          break
        case 'ArrowDown':
          e.preventDefault()
          go(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          go(-1)
          break
        case 'Home':
          setIndex(0)
          break
        case 'End':
          setIndex(slides.length - 1)
          break
        case 'g':
        case 'Escape':
          setMode((m) => (m === 'overview' ? 'slide' : 'overview'))
          break
        case 'n':
          setShowNotes((s) => !s)
          break
        case 'f':
          if (document.fullscreenElement) document.exitFullscreen()
          else document.documentElement.requestFullscreen?.()
          break
        default:
          // Number keys jump, which is what a rehearsing presenter reaches for.
          if (/^[1-9]$/.test(e.key)) setIndex(clamp(Number(e.key) - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, clamp, mode, slides.length])

  const current = slides[index]

  const artboard = useMemo(
    () => ({
      width: canvas.width,
      height: canvas.height,
      /* Translate-then-scale, against `left/top: 50%` in the CSS. This centres on
         the element's own midpoint, which is the only formulation that holds when
         the unscaled 1280x720 box is larger than the stage — see the note on
         `.stage`. Scaling from `top left` spilled the slide 80px past the stage;
         `transform-origin: center` fixed that but still inherited grid's
         overflow-clamped position. */
      transform: `translate(-50%, -50%) scale(${scale})`,
    }),
    [scale]
  )

  if (!slides.length) {
    return (
      <div className={styles.empty}>
        <h1>{meta.title}</h1>
        <p>No slides yet. Add them to <code>src/deck/slides.tsx</code>.</p>
      </div>
    )
  }

  if (mode === 'overview') {
    return (
      <div className={styles.overview}>
        <header className={styles.overviewHead}>
          <span className={styles.deckTitle}>{meta.title}</span>
          <span className={styles.hint}>
            {slides.length} slides · click one, or press G to go back
          </span>
        </header>
        <div className={styles.grid}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              className={[styles.thumb, i === index ? styles.thumbCurrent : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                setIndex(i)
                setMode('slide')
              }}
            >
              {/* Thumbnails render the real slide, scaled. A picture of the
                  actual thing beats a title list for finding a slide mid-talk. */}
              <span className={styles.thumbStage}>
                <span className={styles.thumbInner}>{s.render()}</span>
              </span>
              <span className={styles.thumbLabel}>
                <span className={styles.thumbNum}>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.player}>
      <div className={styles.stage} ref={stage}>
        <div className={styles.artboard} style={artboard}>
          {current.render()}
        </div>
      </div>

      {current.links?.length ? (
        <nav className={styles.links} aria-label="Links on this slide">
          {current.links.map((l) => (
            <a key={l.href} className={styles.link} href={l.href} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}

      <footer className={styles.bar}>
        <button className={styles.navBtn} onClick={() => go(-1)} disabled={index === 0}>
          ‹
        </button>
        <span className={styles.counter}>
          {index + 1} / {slides.length}
        </span>
        <button
          className={styles.navBtn}
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
        >
          ›
        </button>
        <span className={styles.barTitle}>{current.title}</span>
        <span className={styles.keys}>
          <kbd>←</kbd>
          <kbd>→</kbd> move · <kbd>G</kbd> grid · <kbd>N</kbd> notes · <kbd>F</kbd> full
        </span>
      </footer>

      {showNotes && (
        <aside className={styles.notes}>
          <div className={styles.notesHead}>Speaker notes</div>
          <p>{current.notes || 'No notes for this slide.'}</p>
        </aside>
      )}
    </div>
  )
}

/** `#08-three-layers` — zero-padded so links sort, and so `#8-x` and `#08-x`
 *  both look deliberate rather than one being a typo. */
function slideHash(index: number, id: string): string {
  return `${String(index + 1).padStart(2, '0')}-${id}`
}

/** Resolve the opening slide from the URL.
 *
 *  SLUG WINS over the number. A link written when a slide was eighth should
 *  still land on that slide after two are inserted before it — the number in the
 *  URL is for humans reading it, not for lookup. Only if no slug matches does the
 *  leading number get used, which is what makes a hand-typed `#8` work. */
function initialIndex(slides: DeckSlide[]): number {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
  if (!hash) return 0

  // Strip a leading `NN-` and try the slug first.
  const slug = hash.replace(/^\d+-/, '')
  const bySlug = slides.findIndex((s) => s.id === slug)
  if (bySlug !== -1) return bySlug

  const n = Number(hash.match(/^\d+/)?.[0])
  return Number.isInteger(n) && n >= 1 && n <= slides.length ? n - 1 : 0
}
