import type { ReactNode } from 'react'
import { GRID, diagramType, nodeStyle, role, snap, snapDown, withAlpha, type NodeKind } from './roles'

/**
 * Shared SVG primitives for every diagram type.
 *
 * These encode the six connector rules from the diagram-design skill, which are
 * the difference between an editorial diagram and Mermaid output. They are
 * primitives rather than conventions BECAUSE they are easy to get wrong by hand:
 *
 *  - Arrows are drawn before boxes, so lines sit behind nodes. Callers get this
 *    for free by rendering <Connectors> before <Nodes>.
 *  - Every bend is a quarter-arc, r=8. A diagonal line between nodes that share
 *    neither x nor y is an automatic fail upstream, so `elbow()` never emits one.
 *  - Every arrow label carries an opaque mask AND a 6–10px visible gap to its
 *    connector. A label sitting on its own line hides the thing it annotates.
 *  - A node box paints an opaque paper mask first, so an arrow cannot bleed
 *    through a translucent fill.
 *
 * Everything takes coordinates in SVG user units, which are slide px, which are
 * 1/96in — the same space the rest of the deck is laid out in. A diagram at
 * viewBox 0 0 1280 720 therefore maps 1:1 onto the artboard with no scaling.
 */

/* ------------------------------------------------------------------ markers */

/** Arrowheads. Rendered once per <svg>; all three always defined, so a caller
 *  can switch an arrow's tone without remembering to add a marker. */
export function ArrowMarkers({ idPrefix }: { idPrefix: string }) {
  const heads: [string, string][] = [
    ['arrow', role.muted],
    ['arrow-accent', role.accent],
    ['arrow-link', role.link],
    ['arrow-soft', role.soft],
  ]
  return (
    <defs>
      {heads.map(([id, fill]) => (
        <marker
          key={id}
          id={`${idPrefix}-${id}`}
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={fill} />
        </marker>
      ))}
    </defs>
  )
}

export type ArrowTone = 'default' | 'accent' | 'link' | 'soft'

const TONE: Record<ArrowTone, { stroke: string; marker: string }> = {
  default: { stroke: role.muted, marker: 'arrow' },
  accent: { stroke: role.accent, marker: 'arrow-accent' },
  link: { stroke: role.link, marker: 'arrow-link' },
  soft: { stroke: role.soft, marker: 'arrow-soft' },
}

/* ------------------------------------------------------------------- elbows */

export interface Point {
  x: number
  y: number
}

/**
 * Orthogonal path between two points, with rounded corners.
 *
 * `bias` decides which axis moves first: 'h' goes across then down, 'v' goes
 * down then across. A caller picks the one whose corner lands in open canvas.
 *
 * Returns a plain `d` string, so a connector is one <path> and nothing has to
 * reason about segment lists. If the points already share an axis it emits a
 * straight line — the one case where a straight segment is correct.
 */
export function elbow(from: Point, to: Point, bias: 'h' | 'v' = 'h', r = 8): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.abs(dx) < 0.5 || Math.abs(dy) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`

  // Radius cannot exceed half of either leg, or the arc overshoots the corner.
  const rr = Math.min(r, Math.abs(dx) / 2, Math.abs(dy) / 2)
  const sx = Math.sign(dx)
  const sy = Math.sign(dy)

  if (bias === 'h') {
    const cx = to.x
    return [
      `M ${from.x} ${from.y}`,
      `L ${cx - sx * rr} ${from.y}`,
      `Q ${cx} ${from.y} ${cx} ${from.y + sy * rr}`,
      `L ${to.x} ${to.y}`,
    ].join(' ')
  }
  const cy = to.y
  return [
    `M ${from.x} ${from.y}`,
    `L ${from.x} ${cy - sy * rr}`,
    `Q ${from.x} ${cy} ${from.x + sx * rr} ${cy}`,
    `L ${to.x} ${to.y}`,
  ].join(' ')
}

/**
 * Orthogonal path with TWO bends, through a chosen corridor.
 *
 * `elbow()` turns once, which is right when the two points can be joined by an
 * L. This turns twice — out of `from`, along `mid`, into `to` — which is the only
 * route available when both endpoints face the same direction, or when the
 * direct L would cross a box that is neither endpoint.
 *
 * `mid` is the corridor: an x for a vertical corridor (the caller picks a gutter
 * between columns), or a y for a horizontal one. Both bends are quarter-arcs, so
 * the result satisfies the same no-diagonals rule as everything else here.
 *
 * PROMOTED from CurrentState.tsx, where it was written for zone-gutter routing.
 * Two independent diagrams now needed it — a lane-boundary crossing being the
 * second — and two callers was the threshold the authors of both agreed on for
 * moving it into the shared vocabulary.
 */
export function corridor(
  from: Point,
  to: Point,
  mid: number,
  axis: 'vertical' | 'horizontal' = 'vertical',
  r = 8
): string {
  if (axis === 'horizontal') {
    // `mid` is a y: down out of `from`, across at `mid`, into `to`.
    const dx = to.x - from.x
    if (Math.abs(dx) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
    const sx = Math.sign(dx)
    const sy1 = Math.sign(mid - from.y) || 1
    const sy2 = Math.sign(to.y - mid) || 1
    const rr = Math.min(
      r,
      Math.abs(dx) / 2,
      Math.max(Math.abs(mid - from.y), 1),
      Math.max(Math.abs(to.y - mid), 1)
    )
    return [
      `M ${from.x} ${from.y}`,
      `L ${from.x} ${mid - sy1 * rr}`,
      `Q ${from.x} ${mid} ${from.x + sx * rr} ${mid}`,
      `L ${to.x - sx * rr} ${mid}`,
      `Q ${to.x} ${mid} ${to.x} ${mid + sy2 * rr}`,
      `L ${to.x} ${to.y}`,
    ].join(' ')
  }

  // `mid` is an x: across out of `from`, down the corridor, into `to`.
  const dy = to.y - from.y
  if (Math.abs(dy) < 0.5) return `M ${from.x} ${from.y} L ${to.x} ${to.y}`
  const sy = Math.sign(dy)
  const sx1 = Math.sign(mid - from.x) || 1
  const sx2 = Math.sign(to.x - mid) || 1
  const rr = Math.min(
    r,
    Math.abs(dy) / 2,
    Math.max(Math.abs(mid - from.x), 1),
    Math.max(Math.abs(to.x - mid), 1)
  )
  return [
    `M ${from.x} ${from.y}`,
    `L ${mid - sx1 * rr} ${from.y}`,
    `Q ${mid} ${from.y} ${mid} ${from.y + sy * rr}`,
    `L ${mid} ${to.y - sy * rr}`,
    `Q ${mid} ${to.y} ${mid + sx2 * rr} ${to.y}`,
    `L ${to.x} ${to.y}`,
  ].join(' ')
}

/**
 * Attach points fanned along one edge.
 *
 * Rule 4 upstream: no two connectors may share a point on a box. For N
 * connectors on an edge of length L, point k sits at `L * k / (N + 1)` — evenly
 * spread, symmetric, and never on a corner.
 */
export function fanPoints(start: number, length: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + (length * (i + 1)) / (count + 1))
}

/* --------------------------------------------------------------- connectors */

export interface ConnectorProps {
  d: string
  tone?: ArrowTone
  /** Dashed, for optional / async / return paths. */
  dashed?: boolean
  /** Omit the arrowhead, for an undirected association. */
  headless?: boolean
  idPrefix: string
}

export function Connector({
  d,
  tone = 'default',
  dashed = false,
  headless = false,
  idPrefix,
}: ConnectorProps) {
  const t = TONE[tone]
  return (
    <path
      d={d}
      fill="none"
      stroke={t.stroke}
      strokeWidth={1.25}
      {...(dashed ? { strokeDasharray: '5,4' } : {})}
      {...(headless ? {} : { markerEnd: `url(#${idPrefix}-${t.marker})` })}
    />
  )
}

/**
 * Label on a connector — masked, and held off the stroke.
 *
 * `gap` is the VISIBLE distance between the mask and the line, and 6 is the
 * floor upstream allows. The mask exists so the stroke cannot show through the
 * text; the gap exists so the reader can still trace the line past its label.
 * Both are required — a mask with no gap hides the connector it annotates.
 */
export function ArrowLabel({
  x,
  y,
  text,
  side = 'above',
  gap = 7,
  tone = 'soft',
}: {
  x: number
  y: number
  text: string
  /** Which side of the stroke the label sits on. */
  side?: 'above' | 'below' | 'left' | 'right'
  gap?: number
  tone?: 'soft' | 'accent'
}) {
  const t = diagramType.arrowLabel
  const w = Math.max(text.length * t.size * 0.62 + 10, 22)
  const h = t.size + 4
  const fill = tone === 'accent' ? role.accent : role.soft

  const box =
    side === 'above'
      ? { x: x - w / 2, y: y - gap - h }
      : side === 'below'
        ? { x: x - w / 2, y: y + gap }
        : side === 'left'
          ? { x: x - gap - w, y: y - h / 2 }
          : { x: x + gap, y: y - h / 2 }

  return (
    <g>
      <rect x={box.x} y={box.y} width={w} height={h} rx={2} fill={role.paper} />
      <text
        x={box.x + w / 2}
        y={box.y + h / 2}
        fill={fill}
        fontFamily={diagramType.family}
        fontSize={t.size}
        fontWeight={t.weight}
        letterSpacing={`${t.tracking}em`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {text.toUpperCase()}
      </text>
    </g>
  )
}

/* -------------------------------------------------------------------- nodes */

export interface NodeBoxProps {
  x: number
  y: number
  w: number
  h: number
  kind?: NodeKind
  /** Human-readable name. */
  name?: string
  /** Metadata line under the name. */
  sublabel?: string
  /** Small rectangular tag in the top-left — NOT a pill (rx=2, upstream rule). */
  tag?: string
  /** A figure instead of a name, for count/percentage nodes. */
  figure?: string
  rx?: number
  children?: ReactNode
}

export function NodeBox({
  x,
  y,
  w,
  h,
  kind = 'step',
  name,
  sublabel,
  tag,
  figure,
  rx = 6,
  children,
}: NodeBoxProps) {
  const s = nodeStyle[kind]
  const dash = 'dash' in s ? (s.dash as string) : undefined
  const cx = x + w / 2

  /* Vertical stack of whatever this node carries, centred as a block. A node
     with a tag reserves its band so the name never rides up under it. */
  const hasTag = Boolean(tag)
  const bodyTop = hasTag ? y + 24 : y
  const bodyH = h - (hasTag ? 24 : 0)
  const bodyCy = bodyTop + bodyH / 2

  return (
    <g>
      {/* 1. Opaque paper mask, so an arrow behind a translucent fill cannot
             show through. Every node kind except `step` has alpha in its fill. */}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={role.paper} />

      {/* 2. The styled box. */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={1}
        {...(dash ? { strokeDasharray: dash } : {})}
      />

      {/* 3. Type tag — rectangular, hairline, never filled. */}
      {tag && <TypeTag x={x + 8} y={y + 7} label={tag} stroke={s.stroke} />}

      {/* 4/5. Name, figure, sublabel. */}
      {figure && (
        <text
          x={cx}
          y={sublabel || name ? bodyCy - 8 : bodyCy}
          fill={kind === 'focal' ? role.accentDeep : role.ink}
          fontFamily={diagramType.family}
          fontSize={diagramType.figure.size}
          fontWeight={diagramType.figure.weight}
          letterSpacing={`${diagramType.figure.tracking}em`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {figure}
        </text>
      )}
      {name && (
        <text
          x={cx}
          y={figure ? bodyCy + 16 : sublabel ? bodyCy - 7 : bodyCy}
          fill={role.ink}
          fontFamily={diagramType.family}
          fontSize={diagramType.nodeName.size}
          fontWeight={diagramType.nodeName.weight}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {name}
        </text>
      )}
      {sublabel && (
        <text
          x={cx}
          y={figure ? bodyCy + 32 : name ? bodyCy + 10 : bodyCy}
          fill={role.muted}
          fontFamily={diagramType.family}
          fontSize={diagramType.sublabel.size}
          fontWeight={diagramType.sublabel.weight}
          letterSpacing={`${diagramType.sublabel.tracking}em`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {sublabel}
        </text>
      )}

      {children}
    </g>
  )
}

/** The rectangular type tag. rx=2, hairline, transparent fill — a pill reads as
 *  a status chip, which is a different meaning. */
export function TypeTag({
  x,
  y,
  label,
  stroke = role.ink,
}: {
  x: number
  y: number
  label: string
  stroke?: string
}) {
  const t = diagramType.eyebrow
  const w = label.length * t.size * 0.78 + 12
  const h = 14
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2}
        fill="transparent"
        stroke={withAlpha(stroke.startsWith('#') ? stroke : role.ink, 0.4)}
        strokeWidth={0.8}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        fill={role.muted}
        fontFamily={diagramType.family}
        fontSize={t.size}
        fontWeight={t.weight}
        letterSpacing={`${t.tracking}em`}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {label.toUpperCase()}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------- zones */

/** A container grouping nodes. Painted BEFORE its children, so a label mask
 *  landing inside it is fine. */
export function Zone({
  x,
  y,
  w,
  h,
  label,
  tone = 'default',
}: {
  x: number
  y: number
  w: number
  h: number
  label?: string
  tone?: 'default' | 'boundary'
}) {
  const boundary = tone === 'boundary'
  const t = diagramType.eyebrow
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={boundary ? withAlpha(role.accent, 0.04) : role.paper2}
        stroke={boundary ? withAlpha(role.accent, 0.45) : role.rule}
        strokeWidth={1}
        {...(boundary ? { strokeDasharray: '4,4' } : {})}
      />
      {label && (
        <text
          x={x + 12}
          y={y + 14}
          fill={boundary ? role.accent : role.soft}
          fontFamily={diagramType.family}
          fontSize={t.size}
          fontWeight={t.weight}
          letterSpacing={`${t.tracking}em`}
          dominantBaseline="central"
        >
          {label.toUpperCase()}
        </text>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ legend */

export interface LegendItem {
  label: string
  /** A swatch, or a line sample for connector meanings. */
  swatch?: string
  kind?: NodeKind
  line?: ArrowTone
  dashed?: boolean
}

/**
 * Legend strip. BELOW the drawing, never inside it — a key competing for space
 * with the diagram is why so many diagrams look crowded. The caller reserves
 * ~52px of viewBox height for it.
 */
export function Legend({
  x,
  y,
  width,
  items,
  spacing,
}: {
  x: number
  y: number
  width: number
  items: LegendItem[]
  spacing?: number
}) {
  const t = diagramType.legend
  const step = spacing ?? Math.min(190, width / Math.max(items.length, 1))
  return (
    <g>
      <line x1={x} y1={y} x2={x + width} y2={y} stroke={role.rule} strokeWidth={0.8} />
      {items.map((it, i) => {
        const ix = x + i * step
        const swatch = it.swatch ?? (it.kind ? nodeStyle[it.kind].stroke : role.muted)
        return (
          <g key={it.label}>
            {it.line ? (
              <line
                x1={ix}
                y1={y + 18}
                x2={ix + 18}
                y2={y + 18}
                stroke={TONE[it.line].stroke}
                strokeWidth={1.25}
                {...(it.dashed ? { strokeDasharray: '5,4' } : {})}
              />
            ) : (
              <rect
                x={ix}
                y={y + 12}
                width={12}
                height={12}
                rx={2}
                fill={it.kind ? nodeStyle[it.kind].fill : swatch}
                stroke={swatch}
                strokeWidth={1}
              />
            )}
            <text
              x={ix + (it.line ? 26 : 20)}
              y={y + 18}
              fill={role.muted}
              fontFamily={diagramType.family}
              fontSize={t.size}
              fontWeight={t.weight}
              letterSpacing={`${t.tracking}em`}
              dominantBaseline="central"
            >
              {it.label.toUpperCase()}
            </text>
          </g>
        )
      })}
    </g>
  )
}

/* ------------------------------------------------------------------ labels */

/** Free-standing text in the deck's diagram register. */
export function DiagramText({
  x,
  y,
  children,
  variant = 'nodeName',
  tone = 'ink',
  anchor = 'start',
  uppercase = false,
}: {
  x: number
  y: number
  children: string
  variant?: keyof Omit<typeof diagramType, 'family'>
  tone?: 'ink' | 'muted' | 'soft' | 'accent' | 'accentDeep'
  anchor?: 'start' | 'middle' | 'end'
  uppercase?: boolean
}) {
  const t = diagramType[variant]
  const fill =
    tone === 'accent'
      ? role.accent
      : tone === 'accentDeep'
        ? role.accentDeep
        : tone === 'muted'
          ? role.muted
          : tone === 'soft'
            ? role.soft
            : role.ink
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontFamily={diagramType.family}
      fontSize={t.size}
      fontWeight={t.weight}
      letterSpacing={`${'tracking' in t ? t.tracking : 0}em`}
      textAnchor={anchor}
      dominantBaseline="central"
    >
      {uppercase ? children.toUpperCase() : children}
    </text>
  )
}

export { GRID, snap, snapDown, role, nodeStyle, diagramType, withAlpha }
export type { NodeKind }
