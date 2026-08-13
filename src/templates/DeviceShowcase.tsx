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
  /** Which side the device sits on. */
  align?: 'right' | 'left'
  /** Top edge of the device. */
  deviceTop?: number
  /** Distance from the device to the slide edge it sits against. Defaults to
   *  the watermark gutter on the right, the page margin on the left. */
  deviceInset?: number
  /** Caption under the device, e.g. what the screen is showing. */
  caption?: string
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
  ...chrome
}: DeviceShowcaseProps) {
  const inset =
    deviceInset ??
    (align === 'right'
      ? chrome.watermark === false
        ? grid.marginX
        : grid.watermarkGutter
      : grid.marginX)

  const deviceStyle: CSSProperties = {
    top: deviceTop,
    ...(align === 'right' ? { right: inset } : { left: inset }),
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead) && <SlideHeading title={title} lead={lead} width={copyWidth} />}

      {points.length > 0 && (
        <ul className={styles.points} style={{ left: grid.marginX, top: pointsTop, width: copyWidth }}>
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
