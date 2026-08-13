import type { CSSProperties } from 'react'
import { radius } from '../tokens/tokens.js'
import type { RichText, SlideChromeSpec } from '../types'
import { SlideFrame } from '../elements/layout/SlideFrame'
import { SlideHeading } from '../elements/layout/SlideHeading'
import { AccentText } from '../elements/text/AccentText'
import { EpLogo } from '../elements/brand/EpLogo'
import { Icon } from '../elements/brand/Icon'
import styles from './Diagram.module.css'

/**
 * Template — Diagram.
 *
 * Two arrangements of the same thing: a set of labelled, icon-led nodes.
 *
 *   'orbit' — references/09.png. Four muted quadrant cells with a ring-outlined
 *             hub floating over their shared centre. Each cell's label and icon
 *             are pushed to the corner FURTHEST from the hub, which is what
 *             keeps the middle clear for it.
 *   'flow'  — references/Slide.png. Nodes as brand-gradient cards in a row with
 *             arrows in the gaps between them.
 *
 * Kept as one template with a `variant` rather than split in two, because the
 * node is genuinely the same spec in both — `label`, `icon`, `caption` — and so
 * is the ink, the icon weight and the radius. Two components would have
 * duplicated all of that and then drifted, which is exactly what happened to
 * the logo files before EpLogo was consolidated. What differs is only where the
 * nodes are placed and whether the hub or the arrows appear, and each of those
 * is a handful of lines.
 *
 * They are not, however, interchangeable: 'orbit' says "everything meets in the
 * middle" and 'flow' says "value passes left to right". Picking the wrong one
 * misstates the argument, so neither is the default — `variant` is required.
 */

export interface DiagramNode {
  label: RichText
  /** Material Symbols glyph name. */
  icon?: string
  /** Renders the EventPipe glyph instead of an icon — the first flow card. */
  logo?: boolean
  /** Supporting line under the icon. Flow cards only; orbit cells have no room
   *  for one without crowding the hub. */
  caption?: RichText
}

/** The floating centre of an 'orbit' diagram. */
export interface DiagramHub {
  /** Show the EventPipe lockup at the top of the hub. */
  logo?: boolean
  logoSize?: number
  /** Bold line under the lockup. */
  title?: RichText
  /** Teal supporting lines under the title. */
  detail?: RichText
  /** Outer diameter. 336 measured — a 163px inner radius plus a 5px ring. */
  size?: number
  /** Ring thickness. */
  ring?: number
  /** Width of the hub's copy column, so the detail wraps where it should
   *  rather than running to the circle's chord. */
  copyWidth?: number
}

export interface DiagramProps extends SlideChromeSpec {
  fit?: 'contain' | 'none'
  variant: 'orbit' | 'flow'

  title?: RichText
  lead?: RichText
  /** A second paragraph. Renders one step down from `lead`; see the note in the
   *  story for the one place that costs fidelity. */
  body?: RichText
  titleWidth?: number

  nodes?: DiagramNode[]
  /** Nodes per row. 2 for the orbit quadrants, 3 for the flow row. */
  columns?: number

  /** The node well. Defaults differ per variant, so these are resolved below. */
  left?: number
  top?: number
  width?: number
  height?: number
  gap?: number
  /** Padding inside a node. */
  padding?: number
  /** Rendered icon size. 72 in the orbit cells, 150 on the flow cards. */
  iconSize?: number

  hub?: DiagramHub
  /** Glyph drawn in each flow gap. */
  arrow?: string
  arrowSize?: number
}

/* Per-variant well geometry, measured off the two references.
 *
 * 'orbit': the 2x2 block sits in the right two-thirds beside a copy column —
 * probed edges are x 538→1170, y 116→604, with a 6px gap between cells.
 * 'flow': full width, x 47→1195 (the reference runs 4px further, to 1199, which
 * is inside the watermark gutter), y 232, 360 tall, 54px gaps. */
const WELL = {
  orbit: { left: 538, top: 116, width: 632, height: 488, gap: 6, padding: 28, iconSize: 72 },
  flow: { left: 47, top: 232, width: 1148, height: 360, gap: 54, padding: 40, iconSize: 150 },
} as const

export function Diagram({
  fit = 'contain',
  variant,
  title,
  lead,
  body,
  titleWidth,
  nodes = [],
  columns,
  left,
  top,
  width,
  height,
  gap,
  padding,
  iconSize,
  hub,
  arrow = 'arrow_forward',
  arrowSize = 30,
  ...chrome
}: DiagramProps) {
  const base = WELL[variant]
  const cols = columns ?? (variant === 'orbit' ? 2 : nodes.length || 1)

  const well = {
    left: left ?? base.left,
    top: top ?? base.top,
    width: width ?? base.width,
    height: height ?? base.height,
    gap: gap ?? base.gap,
    padding: padding ?? base.padding,
    iconSize: iconSize ?? base.iconSize,
  }

  const wellStyle: CSSProperties = {
    left: well.left,
    top: well.top,
    width: well.width,
    height: well.height,
  }

  return (
    <SlideFrame fit={fit} {...chrome}>
      {(title || lead || body) && (
        <SlideHeading
          title={title}
          lead={lead}
          body={body}
          // The orbit slide's copy shares the slide with the diagram, so its
          // column is narrow; the flow slide's headline has the full width.
          width={titleWidth ?? (variant === 'orbit' ? 470 : 1120)}
        />
      )}

      <div className={styles.well} style={wellStyle}>
        {variant === 'orbit' ? (
          <div
            className={styles.quadrants}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: well.gap }}
          >
            {nodes.map((node, i) => {
              /* Each cell's content is pushed to the corner furthest from the
               * hub, which is what keeps the centre clear. Derived from the
               * index rather than declared per node, so reordering the four
               * participants cannot leave a label pointing the wrong way. */
              const atBottom = Math.floor(i / cols) > 0
              const atRight = i % cols === cols - 1

              return (
                <div
                  key={i}
                  className={[
                    styles.cell,
                    atBottom ? styles.cellBottom : '',
                    atRight ? styles.cellRight : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ padding: well.padding, borderRadius: radius.panel }}
                >
                  <AccentText
                    as="h3"
                    content={node.label}
                    className={`${styles.cellLabel} ds-text-h3 ds-text-accent`}
                  />
                  {node.icon && (
                    <Icon
                      name={node.icon}
                      size={well.iconSize}
                      weight={200}
                      color="var(--slide-color-accent)"
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.flow}>
            {nodes.map((node, i) => (
              <div key={i} className={styles.flowItem}>
                {/* Arrow first so it sits in the gap BEFORE its card — the gap
                    after the last card would hang off the well's right edge. */}
                {i > 0 && (
                  <div className={styles.arrow} style={{ width: well.gap }}>
                    <Icon name={arrow} size={arrowSize} weight={200} />
                  </div>
                )}
                <div
                  className={styles.card}
                  style={{ padding: well.padding, borderRadius: radius.panel }}
                >
                  <AccentText
                    as="h3"
                    content={node.label}
                    className={`${styles.cardTitle} ds-text-h2 ds-text-on-brand`}
                  />
                  <div className={styles.cardArt}>
                    {node.logo ? (
                      <EpLogo variant="glyph" tone="white" size={well.iconSize} />
                    ) : (
                      node.icon && (
                        <Icon
                          name={node.icon}
                          size={well.iconSize}
                          weight={200}
                          color="var(--slide-color-text-on-brand)"
                        />
                      )
                    )}
                  </div>
                  {node.caption && (
                    <AccentText
                      as="p"
                      content={node.caption}
                      className={`${styles.cardCaption} ds-text-body ds-text-on-brand`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {variant === 'orbit' && hub && <Hub {...hub} />}
      </div>
    </SlideFrame>
  )
}

/** The floating centre. Absolutely centred on the node well rather than placed
 *  at slide coordinates, so moving or resizing the well takes it along. */
function Hub({
  logo = true,
  logoSize = 138,
  title,
  detail,
  size = 336,
  ring = 5,
  copyWidth = 230,
}: DiagramHub) {
  return (
    <div
      className={styles.hub}
      style={{ width: size, height: size, borderWidth: ring, padding: ring * 2 }}
    >
      {logo && <EpLogo variant="full" orientation="horizontal" size={logoSize} />}
      <div className={styles.hubCopy} style={{ width: copyWidth }}>
        {title && (
          <AccentText as="p" content={title} className={`${styles.hubTitle} ds-text-body`} />
        )}
        {detail && (
          <AccentText as="p" content={detail} className="ds-text-body ds-text-accent" />
        )}
      </div>
    </div>
  )
}
