import type { CSSProperties } from 'react'
import { IMAGERY_HOST, REMOTE_DEVICES } from '../../assets/imagery/manifest'
import styles from './DeviceFrame.module.css'

/**
 * DeviceFrame — one of the supplied device mockups, placed at an exact size.
 *
 * The 17 PNGs in src/assets/devices are finished compositions: each already
 * contains its own screenshot behind the bezel. So this element does not build
 * a device around a screen image — there is no screen hole to fill, and
 * inventing a CSS bezel would mean a second, differently-shaped laptop in the
 * same deck.
 *
 * What it does solve is that the mockups are Figma exports on a fixed canvas
 * with a large transparent margin that differs per file — a MacBook occupies
 * 86% of its canvas width starting 7% in, an iPhone 16 only 39% starting 25%
 * in. Placed naively, `width: 400` would mean four different device sizes
 * across four assets and none of them 400. So `width` here is the width of the
 * *device*, and the component scales and offsets the asset behind a box of
 * exactly that size.
 *
 * TRIM is the measured alpha bounding box of every asset, as fractions of its
 * own canvas, plus the aspect ratio of that box. Measured, not estimated —
 * eyeballing these would put every device a few px off its intended edge, and
 * the error would differ per slide.
 */
interface Trim {
  /** Left edge of the device inside its canvas, as a fraction of canvas width. */
  x: number
  /** Top edge, as a fraction of canvas height. */
  y: number
  /** Device width as a fraction of canvas width. */
  w: number
  /** Device height as a fraction of canvas height. */
  h: number
  /** Aspect ratio of the device itself, so a width gives the right height. */
  ar: number
}

const TRIM: Record<string, Trim> = {
  'MacBook Pro 17': { x: 0.0673, y: 0.1511, w: 0.8647, h: 0.6978, ar: 1.6522 },
  'MacBook Pro 17-1': { x: 0.0673, y: 0.1511, w: 0.8647, h: 0.6978, ar: 1.6522 },
  'MacBook Pro 18': { x: 0.0673, y: 0.1511, w: 0.8647, h: 0.6978, ar: 1.6522 },
  'MacBook Pro 19': { x: 0.0673, y: 0.1511, w: 0.8647, h: 0.6978, ar: 1.6522 },
  'MacBook Pro 28': { x: 0.0673, y: 0.1511, w: 0.8647, h: 0.6978, ar: 1.6522 },
  'iPhone 15 Pro': { x: 0.168, y: 0.0969, w: 0.69, h: 0.8062, ar: 1.1411 },
  'iPhone 16': { x: 0.2513, y: 0.1111, w: 0.392, h: 0.7778, ar: 0.672 },
  'iPhone 16 Pro': { x: 0.2107, y: 0.0702, w: 0.4413, h: 0.84, ar: 0.7005 },
  'iPhone 17': { x: 0.2147, y: 0.0978, w: 0.5713, h: 0.824, ar: 0.9245 },
  'iPhone 18': { x: 0.2513, y: 0.1111, w: 0.392, h: 0.7778, ar: 0.672 },
  /* The 'Group NNNN' exports are the browser-window and multi-device
     compositions; the numbers are Figma's, kept verbatim so the asset can be
     found again. */
  'Group 2962': { x: 0.006, y: 0.1508, w: 0.9347, h: 0.7368, ar: 1.9258 },
  'Group 2966': { x: 0.116, y: 0.1508, w: 0.8307, h: 0.7188, ar: 1.9653 },
  'Group 2967': { x: 0.1151, y: 0.1511, w: 0.8295, h: 0.7031, ar: 1.9317 },
  'Group 2968': { x: 0.0887, y: 0.0666, w: 0.588, h: 0.8513, ar: 0.9453 },
  'Group 2969': { x: 0.138, y: 0.1508, w: 0.8087, h: 0.7041, ar: 1.9533 },
  'Group 2970': { x: 0.116, y: 0.1508, w: 0.8307, h: 0.7188, ar: 1.9653 },
  'Group 2971': { x: 0.116, y: 0.1508, w: 0.8307, h: 0.7188, ar: 1.9653 },
}

/** Same glob style as the Imagery foundation story: dropping a new mockup into
 *  the directory is all it takes to make it nameable. */
const modules = import.meta.glob<string>('../../assets/devices/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

/** 'MacBook Pro 17' → resolved URL. */
export const devices: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.replace(/^.*\//, '').replace(/\.png$/, ''),
    url,
  ])
)

/** All mockup names, for the DeviceShowcase docs. */
export const deviceNames = Object.keys(devices).sort()

export interface DeviceFrameProps {
  /** Mockup file name without the extension, e.g. 'MacBook Pro 17'. */
  device: string
  /** Width of the device itself in slide px. Height follows its aspect. */
  width: number
  alt?: string
  className?: string
  style?: CSSProperties
}

export function DeviceFrame({ device, width, alt = '', className, style }: DeviceFrameProps) {
  /* Local first, then the host, then nothing. Throwing here took the whole
     slide down in a deployed build, where the mockups are gitignored — a device
     showcase missing its mockup is still a readable slide; a red error panel is
     not. Dev still throws, so a misspelt device stops you immediately. */
  const src =
    devices[device] ??
    (REMOTE_DEVICES[device] ? `${IMAGERY_HOST}/${REMOTE_DEVICES[device]}` : undefined)
  if (!src) {
    if (import.meta.env.DEV) {
      throw new Error(`Unknown device "${device}". Available:\n  ${deviceNames.join('\n  ')}`)
    }
    return null
  }
  /** An unmeasured asset falls back to its whole canvas, so a newly dropped-in
   *  mockup renders — just with its own margin included — rather than throwing. */
  const trim = TRIM[device] ?? { x: 0, y: 0, w: 1, h: 1, ar: 4 / 3 }

  const height = width / trim.ar

  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')} style={{ width, height, ...style }}>
      <img
        src={src}
        alt={alt}
        className={styles.mockup}
        style={{
          // Scale the whole canvas up until the device inside it is `width`
          // wide, then pull the canvas' own margin back off the box.
          width: width / trim.w,
          height: height / trim.h,
          left: -(trim.x / trim.w) * width,
          top: -(trim.y / trim.h) * height,
          // Has to be inline. globals.css sets `.ds-slide img { max-width: 100% }`
          // and that selector outranks a module class, so the asset was being
          // clamped to the box width while its height was honoured — a device
          // stretched vertically by exactly 1/trim.w.
          maxWidth: 'none',
        }}
      />
    </div>
  )
}
