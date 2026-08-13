import type { CSSProperties } from 'react'
import { grid } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import { DeviceFrame } from '../elements/media/DeviceFrame'
import { Icon } from '../elements/brand/Icon'
import styles from './DeviceShowcase.module.css'

/**
 * Template — Device Showcase.
 *
 * A product shot in one of the supplied device mockups, with a copy column
 * beside it: headline, supporting line, and optionally a short list of points.
 *
 * There is no reference slide for this one — it exists because the deck has 17
 * device mockups and nothing that placed them. The copy column is therefore
 * built on the same anchors every other content slide uses (`grid.titleY` for
 * the headline, the page margin on the left) so it reads as part of the deck
 * rather than as a new layout.
 *
 * The device is positioned by its own edge, not by its asset's canvas — see
 * DeviceFrame, which carries the measured trim for every mockup. `deviceWidth`
 * is the width of the visible device; the height follows from its aspect, so a
 * laptop and a phone can both be centred with the same numbers.
 */
export interface ShowcasePoint {
  title: RichText
  detail?: RichText
  /** Material Symbols glyph. Defaults to the deck's outward arrow. */
  icon?: string
}

export interface DeviceShowcaseProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'

  title?: RichText
  lead?: RichText
  /** Width of the copy column. Narrow it when the device runs wide. */
  copyWidth?: number
  points?: ShowcasePoint[]
  /** Top of the points list. Defaults to the deck's body-well anchor. */
  pointsTop?: number

  /** Mockup name, e.g. 'MacBook Pro 17' or 'iPhone 16'. */
  device: string
  alt?: string
  /** Width of the device itself in slide px. */
  deviceWidth?: number
  /** Where the device sits.
   *
   *  'left' was removed deliberately. The copy column has to step past the
   *  device to clear it, which puts the headline off the page margin every
   *  other slide — so a deck that alternated sides no longer had a left edge,
   *  and that is the one alignment a reader tracks from slide to slide.
   *  'center' is the variation that does not cost that. */
  align?: 'right' | 'center'
  /** Top edge of the device. */
  deviceTop?: number
  /** Distance from the device to the slide edge it sits against. Defaults to
   *  the watermark gutter on the right, the page margin on the left. */
  deviceInset?: number
  /** Caption under the device, e.g. what the screen is showing. */
  caption?: string
  /** Gap between the device and the copy column when the device is on the
   *  left and the copy has to move out of its way. */
  columnGap?: number
}

export function DeviceShowcase({
  fit = 'contain',
  title,
  lead,
  copyWidth = 520,
  points = [],
  pointsTop = grid.bodyY,
  device,
  alt = '',
  deviceWidth = 660,
  align = 'right',
  deviceTop = 210,
  deviceInset,
  caption,
  columnGap = 40,
  ...chrome
}: DeviceShowcaseProps) {
  const inset =
    deviceInset ??
    (chrome.watermark === false ? grid.marginX : grid.watermarkGutter)

  /* Centred means centred in the SAFE width, not in the slide. The watermark
     occupies the right gutter, so centring on 640 pushes the device visibly
     right of the optical middle on any slide that shows the wordmark. */
  const safeRight = chrome.watermark === false ? grid.marginX : grid.watermarkGutter
  const centreLeft = grid.marginX + (1280 - grid.marginX - safeRight - deviceWidth) / 2

  const deviceStyle: CSSProperties = {
    top: deviceTop,
    ...(align === 'center' ? { left: centreLeft } : { right: inset }),
  }

  // The copy keeps the page margin in both alignments now. Centred, it runs the
  // full safe width above the device rather than beside it.
  const copyLeft = grid.marginX

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && (
        <SlideHeading
          title={title}
          lead={lead}
          width={align === 'center' ? 1280 - grid.marginX - safeRight : copyWidth}
          left={copyLeft}
        />
      )}

      {points.length > 0 && (
        <ul className={styles.points} style={{ left: copyLeft, top: pointsTop, width: copyWidth }}>
          {points.map((point, i) => (
            <li key={i} className={styles.point}>
              <Icon
                name={point.icon ?? 'arrow_outward'}
                size={22}
                className={styles.icon}
                color="var(--slide-color-accent)"
              />
              <div className={styles.pointCopy}>
                <AccentText as="h4" content={point.title} className="ds-text-h4" />
                {point.detail && (
                  <AccentText as="p" content={point.detail} className="ds-text-body ds-text-cool" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.device} style={deviceStyle}>
        <DeviceFrame device={device} width={deviceWidth} alt={alt} />
        {caption && <div className={`${styles.caption} ds-text-caption ds-text-subtle`}>{caption}</div>}
      </div>
    </SlideFrame>
  )
}
