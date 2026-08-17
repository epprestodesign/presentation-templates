import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  TypeTag,
  diagramType,
  elbow,
  fanPoints,
  nodeStyle,
  role,
  snap,
  withAlpha,
  type ArrowTone,
  type LegendItem,
  type NodeKind,
} from './primitives'

/**
 * Diagram — ER / Data Model. Entities, their fields, and the cardinality between.
 *
 * The type for a schema, an API resource graph or a domain model: the reader's
 * question is "what is stored where, and how many of each". If the question is
 * "what calls what", that is Architecture; if it is "what contains what", Nested.
 *
 * THREE THINGS THIS PORT HAD TO DECIDE, none of them free:
 *
 *  1. NO MONO, SO KEYS ARE LETTERED. Upstream prefixes a primary key with `#` and
 *     a foreign key with `→`, both in Geist Mono. The deck has no mono, and — the
 *     harder constraint — it loads only Poppins' latin subset, which has no
 *     U+2192. A `→` would silently fall back to the system face and put a second
 *     typeface on the slide. So keys are marked `PK` and `FK` in the eyebrow
 *     register, and the FK marker takes `role.link`, the colour the library
 *     already uses for "this crosses to something else". The notation changes;
 *     what it encodes does not.
 *
 *  2. THE TAG SITS RIGHT, THE NAME SITS LEFT. Upstream's header order is tag then
 *     name. Kept literally, a 4-character tag and a 6-character tag push their
 *     names to different x — and a column of entities with ragged names looks
 *     accidental. Names are therefore flush left at a fixed inset and the tag is
 *     flush right in the header band, so every entity name in a column aligns.
 *
 *  3. RELATIONSHIPS ARE STRAIGHTENED, NOT ELBOWED BY DEFAULT. Upstream: "lay out
 *     so most relationships are straight lines, not tangles." That is normally
 *     the author's job, and it is the first thing to rot. Here it is the
 *     component's: an edge with no explicit source field takes its source y FROM
 *     ITS TARGET, clamped into the source box — so the line comes out straight
 *     whenever the two boxes overlap vertically at all, and only falls back to a
 *     routed elbow when they genuinely do not. Adding a field to an entity moves
 *     the connectors that land on it and the diagram stays straight.
 *
 * Height is by content, never padded to a common box — upstream's rule, and the
 * reason a 3-field lookup does not pretend to be as substantial as the root.
 *
 * The focal rule: ONE entity carries `kind: 'focal'`, and it is the aggregate
 * root — the record the rest of the model hangs off.
 */

/* ------------------------------------------------------------------- shapes */

export interface Field {
  name: string
  /** Type or unit, set flush right in the metadata register. */
  type?: string
  /** Marked `PK` / `FK` — see note 1 above for why not `#` / `→`. */
  key?: 'pk' | 'fk'
}

export interface Entity {
  id: string
  name: string
  /** Header tag — ROOT, ENTITY, LOOKUP. Rectangular, never a pill. */
  tag?: string
  kind?: NodeKind
  fields: Field[]
}

export interface Relationship {
  from: string
  to: string
  /** Cardinality at the source end — `1`, `N`, `0..1`, `1..*`. */
  fromCard?: string
  /** Cardinality at the target end. Use the same notation at both ends. */
  toCard?: string
  /** `has`, `holds`, `booked by`. Centred in the gutter, under the line. */
  label?: string
  tone?: ArrowTone
  dashed?: boolean
  /** Leave from this field's row rather than a fanned edge point. */
  fromField?: string
  /** Land on this field's row — normally the foreign key. */
  toField?: string
}

export interface DataModelProps {
  width: number
  height: number
  /** Left to right. Each column stacks its entities and centres the stack. */
  columns: Entity[][]
  relationships?: Relationship[]
  legend?: LegendItem[]
  /** Cap on an entity's width. The columns then spread across the well. */
  entityWidth?: number
  /** Cap on the gutter between columns. Cardinality and relationship labels all
   *  live in it, so it is never allowed to close up. */
  columnGap?: number
  /** Vertical gap between two entities stacked in one column. 48 rather than the
   *  40 this started at, because a same-column relationship has to fit TWO
   *  cardinality masks in it end to end and 40 left them 3px apart. */
  rowGap?: number
}

/* ---------------------------------------------------------------- geometry */

/** Header band: tag + entity name. */
const HEADER = 34
/** One field row. */
const ROW = 18
/** Body padding above the first field and below the last. */
const PAD = 8

/** Natural height — by content, never padded to a common box. */
const entityHeight = (e: Entity) => HEADER + PAD * 2 + e.fields.length * ROW

/**
 * Clearance from an entity's edge to a cardinality label's CENTRE.
 *
 * Upstream places cardinality 10–12px from the edge, which is a distance to the
 * label's near side — but `ArrowLabel` is centred on the point it is given, so a
 * flat 16px offset put a 32px-wide `0..1` mask exactly on the box's outline. The
 * offset therefore has to know the mask's width: 12px of visible gap, plus half
 * the mask. The geometry gate never caught it because a mask that only touches a
 * box overlaps it by 0px, and the gate needs 3.
 */
const CARD_GAP = 12
const cardOffset = (text: string) =>
  CARD_GAP + Math.max(text.length * diagramType.arrowLabel.size * 0.62 + 10, 22) / 2

/**
 * The same clearance for a VERTICAL run, where the constraint is the row gap
 * rather than the gutter.
 *
 * A flat offset does not work here: on a 40px gap, `CARD_GAP + maskH/2` puts both
 * cards within 3px of each other in the middle of the run. The two masks have to
 * SHARE the span, so the offset is a quarter of it — which places them at 25% and
 * 75% with equal air above, between and below — capped at the horizontal figure so
 * a long run does not fling them apart, and floored at 10 so the pair stays clear
 * of both boxes.
 */
const MASK_H = diagramType.arrowLabel.size + 4
const vCardOffset = (span: number) =>
  Math.max(10, Math.min(span / 4, CARD_GAP + MASK_H / 2))

interface Placed extends Entity {
  x: number
  y: number
  w: number
  h: number
  column: number
}

/** Centre of a named field's row, or undefined if the entity has no such field. */
function fieldY(e: Placed, name?: string): number | undefined {
  if (!name) return undefined
  const i = e.fields.findIndex((f) => f.name === name)
  return i < 0 ? undefined : e.y + HEADER + PAD + ROW / 2 + i * ROW
}

/* ---------------------------------------------------------------- component */

export function DataModel({
  width,
  height,
  columns,
  relationships = [],
  legend,
  entityWidth = 248,
  columnGap = 132,
  rowGap = 48,
}: DataModelProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  /* Column geometry, derived twice over: the entity width is capped but shrinks
     if the columns cannot fit, and the gutter is capped but grows to spread the
     block across the well. Then the whole block is centred, so a 3-column and a
     4-column model both sit on the slide's axis. */
  const n = columns.length
  const w = snap(Math.min(entityWidth, (width - 48 * (n - 1)) / Math.max(n, 1)))
  const gap = n > 1 ? Math.min(columnGap, (width - n * w) / (n - 1)) : 0
  const blockW = n * w + gap * (n - 1)
  const startX = Math.max(0, (width - blockW) / 2)

  const placed: Placed[] = []
  columns.forEach((col, c) => {
    const x = snap(startX + c * (w + gap))
    const heights = col.map(entityHeight)
    const stackH = heights.reduce((a, b) => a + b, 0) + rowGap * (col.length - 1)
    let y = snap(Math.max(0, (drawH - stackH) / 2))
    col.forEach((e, i) => {
      placed.push({ ...e, x, y, w, h: heights[i], column: c })
      y = snap(y + heights[i] + rowGap)
    })
  })

  const byId = new Map(placed.map((e) => [e.id, e]))

  /* Fan attach points, grouped by (entity, side) — upstream rule 4: no two
     connectors may share a point on a box. An edge that names a field opts out of
     its slot's y but still consumes one, which costs nothing and keeps the
     grouping honest. */
  const key = (id: string, side: string) => `${id}:${side}`
  const total = new Map<string, number>()
  const seen = new Map<string, number>()

  const sides = relationships.map((r) => {
    const a = byId.get(r.from)
    const b = byId.get(r.to)
    if (!a || !b) return null
    const vertical = a.column === b.column
    const down = b.y > a.y
    const fs = vertical ? (down ? 'bottom' : 'top') : b.column > a.column ? 'right' : 'left'
    const ts = vertical ? (down ? 'top' : 'bottom') : b.column > a.column ? 'left' : 'right'
    total.set(key(r.from, fs), (total.get(key(r.from, fs)) ?? 0) + 1)
    total.set(key(r.to, ts), (total.get(key(r.to, ts)) ?? 0) + 1)
    return { a, b, vertical, fs, ts }
  })

  const routed = relationships.map((r, i) => {
    const s = sides[i]
    if (!s) return null
    const { a, b, vertical, fs, ts } = s

    const fk = key(r.from, fs)
    const tk = key(r.to, ts)
    const fi = seen.get(fk) ?? 0
    const ti = seen.get(tk) ?? 0
    seen.set(fk, fi + 1)
    seen.set(tk, ti + 1)

    if (vertical) {
      const xs = fanPoints(a.x, a.w, total.get(fk) ?? 1)
      const p1 = { x: snap(xs[fi]), y: fs === 'bottom' ? a.y + a.h : a.y }
      const p2 = { x: p1.x, y: ts === 'top' ? b.y : b.y + b.h }
      const dir = Math.sign(p2.y - p1.y) || 1
      const off = vCardOffset(Math.abs(p2.y - p1.y))
      return {
        r,
        paths: [elbow(p1, p2)],
        vertical: true,
        /* Cardinality to the LEFT of the run, the relationship label to the
           RIGHT. Three masks on one side of a 48px row gap would collide; split
           across the line they cannot. */
        fromCardAt: { x: p1.x, y: p1.y + dir * off },
        toCardAt: { x: p2.x, y: p2.y - dir * off },
        labelAt: { x: p1.x, y: (p1.y + p2.y) / 2 },
      }
    }

    /* Target end first, because the source may follow it — see note 3. */
    const tYs = fanPoints(b.y, b.h, total.get(tk) ?? 1)
    const p2y = fieldY(b, r.toField) ?? tYs[ti]
    /* No explicit source field → take the target's y, clamped 14px inside the
       source box so the line still leaves the edge and not a corner. That single
       line is what makes most relationships straight without an author placing
       anything, and it is why adding a field to an entity re-aims the connectors
       that land on it instead of breaking them. */
    const p1y = fieldY(a, r.fromField) ?? Math.min(Math.max(p2y, a.y + 14), a.y + a.h - 14)

    const p1 = { x: fs === 'right' ? a.x + a.w : a.x, y: p1y }
    const p2 = { x: ts === 'left' ? b.x : b.x + b.w, y: p2y }

    const gutterFrom = p1.x
    const gutterTo = p2.x
    const gx = (gutterFrom + gutterTo) / 2
    const straight = Math.abs(p1.y - p2.y) < 0.6

    /* A straight run is one path. A stepped run is TWO elbows meeting on the
       gutter's vertical leg — which is the only routing that keeps both corners
       as quarter-arcs AND keeps the vertical leg off the target's border. A
       single elbow would turn at the target's edge x and draw its vertical leg
       down the box's own outline. */
    const ymid = (p1.y + p2.y) / 2
    const paths = straight
      ? [elbow(p1, p2)]
      : [elbow(p1, { x: gx, y: ymid }, 'h'), elbow({ x: gx, y: ymid }, p2, 'v')]

    const dir = fs === 'right' ? 1 : -1
    return {
      r,
      paths,
      vertical: false,
      fromCardAt: { x: p1.x + dir * cardOffset(r.fromCard ?? ''), y: p1.y },
      toCardAt: { x: p2.x - dir * cardOffset(r.toCard ?? ''), y: p2.y },
      /* The relationship label goes UNDER the source-side horizontal leg, which
         is open canvas in the gutter in both routings — the cardinality labels
         are above the same leg, so nothing stacks. */
      labelAt: { x: straight ? (gutterFrom + gutterTo) / 2 : (gutterFrom + gx) / 2, y: p1.y },
    }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Data model diagram"
      /* Required on every ported type — see the note in Architecture.tsx. */
      data-diagram="data-model"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* Connectors BEFORE entities, so strokes sit behind the boxes. On a
          stepped run only the second path carries the head. */}
      {routed.map(
        (x, i) =>
          x &&
          x.paths.map((d, j) => (
            <Connector
              key={`${i}-${j}`}
              d={d}
              tone={x.r.tone}
              dashed={x.r.dashed}
              headless={j < x.paths.length - 1}
              idPrefix={uid}
            />
          ))
      )}

      {placed.map((e) => (
        <EntityBox key={e.id} entity={e} />
      ))}

      {/* Labels last: their masks must interrupt the strokes but lose to the
          boxes, which is why every one of them is placed in the gutter or the row
          gap and never over an entity. */}
      {routed.map((x, i) => {
        if (!x) return null
        const tone = x.r.tone === 'accent' ? 'accent' : 'soft'
        const cardSide = x.vertical ? 'left' : 'above'
        return (
          <g key={`lab-${i}`}>
            {x.r.fromCard && (
              <ArrowLabel
                x={x.fromCardAt.x}
                y={x.fromCardAt.y}
                text={x.r.fromCard}
                side={cardSide}
                tone={tone}
              />
            )}
            {x.r.toCard && (
              <ArrowLabel
                x={x.toCardAt.x}
                y={x.toCardAt.y}
                text={x.r.toCard}
                side={cardSide}
                tone={tone}
              />
            )}
            {x.r.label && (
              <ArrowLabel
                x={x.labelAt.x}
                y={x.labelAt.y}
                text={x.r.label}
                side={x.vertical ? 'right' : 'below'}
                tone={tone}
              />
            )}
          </g>
        )
      })}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/* ------------------------------------------------------------------- entity */

/**
 * A two-section entity box: header band, then one row per field.
 *
 * The two rects are the library's standard order — opaque paper mask, then the
 * styled box — so a connector cannot bleed through a translucent fill and the
 * geometry gate can recognise this as a node.
 */
function EntityBox({ entity: e }: { entity: Placed }) {
  const s = nodeStyle[e.kind ?? 'step']
  const dash = 'dash' in s ? (s.dash as string) : undefined
  const focal = e.kind === 'focal'

  const tag = e.tag
  const tagW = tag ? tag.length * diagramType.eyebrow.size * 0.78 + 12 : 0

  return (
    <g>
      <rect x={e.x} y={e.y} width={e.w} height={e.h} rx={6} fill={role.paper} />
      <rect
        x={e.x}
        y={e.y}
        width={e.w}
        height={e.h}
        rx={6}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={1}
        {...(dash ? { strokeDasharray: dash } : {})}
      />

      {/* Header: name flush left, tag flush right — see note 2 in the header
          comment for why upstream's order is inverted here. */}
      <DiagramText
        x={e.x + 12}
        y={e.y + HEADER / 2}
        variant="nodeName"
        tone={focal ? 'accentDeep' : 'ink'}
      >
        {e.name}
      </DiagramText>
      {tag && <TypeTag x={e.x + e.w - 10 - tagW} y={e.y + HEADER / 2 - 7} label={tag} stroke={s.stroke} />}

      {/* The band rule, at the same weight as a divider elsewhere in the library
          and tinted to the box's own stroke so a focal entity's header reads as
          part of the accent rather than a grey seam across it. */}
      <line
        x1={e.x}
        y1={e.y + HEADER}
        x2={e.x + e.w}
        y2={e.y + HEADER}
        stroke={withAlpha(focal ? role.accent : role.ink, focal ? 0.5 : 0.14)}
        strokeWidth={1}
      />

      {/* Fields: key marker, name, type. Three columns, so the eye can run down
          any one of them. */}
      {e.fields.map((f, i) => {
        const cy = e.y + HEADER + PAD + ROW / 2 + i * ROW
        return (
          <g key={f.name}>
            {f.key && (
              <text
                x={e.x + 12}
                y={cy}
                fill={f.key === 'fk' ? role.link : role.muted}
                fontFamily={diagramType.family}
                fontSize={diagramType.eyebrow.size}
                fontWeight={diagramType.eyebrow.weight}
                letterSpacing={`${diagramType.eyebrow.tracking}em`}
                dominantBaseline="central"
              >
                {f.key.toUpperCase()}
              </text>
            )}
            <DiagramText x={e.x + 40} y={cy} variant="sublabel" tone="ink">
              {f.name}
            </DiagramText>
            {f.type && (
              <DiagramText x={e.x + e.w - 12} y={cy} variant="sublabel" tone="soft" anchor="end">
                {f.type}
              </DiagramText>
            )}
          </g>
        )
      })}
    </g>
  )
}
