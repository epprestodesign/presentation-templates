import { useId } from 'react'
import {
  Connector,
  DiagramText,
  Legend,
  diagramType,
  role,
  snap,
  snapDown,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Layer Stack. Abstraction levels as contiguous horizontal bands.
 *
 * Reach for it when every level sits ON TOP OF the one below and speaks only to
 * its neighbours: the OSI model, a cascade, a tech stack — or the case this deck
 * needs, the platform's own abstraction levels from a booking site down to a
 * single reservation record. If the levels are not genuinely stacked, this is the
 * wrong type: parallel things are Architecture, and containment is Nested.
 *
 * ONE SILHOUETTE, NOT N BOXES. Upstream is specific and it matters: the stack is
 * a single rounded rectangle with hairline dividers, not five separate cards with
 * gaps between them. Gaps would say "these are peers"; a shared outline says
 * "these are strata of one thing". The bands are therefore clipped to the
 * silhouette rather than rounded individually — a per-band `rx` would round the
 * interior corners too, and the stack would come apart at the seams.
 *
 * FILLS: ALL PAPER, HAIRLINE DIVIDERS. Upstream offers two treatments —
 * alternating paper / paper-2, or all paper with dividers — and says to pick one
 * and hold it. This holds the second. An opacity ramp down the stack was tried
 * and rejected: it reads as a value scale, which invites the reader to think the
 * bottom layer is heavier or hotter, when the only thing the stack claims is
 * order.
 *
 * DIRECTION LIVES OUTSIDE. The arrow that says which way abstraction runs is in
 * the left margin, never inside a band. It is drawn as a line with an arrowhead
 * rather than typeset as an arrow glyph, because the deck loads only Poppins'
 * latin subset and a U+2192 would silently fall back to the system face — a
 * second typeface in a system that deliberately has one.
 *
 * The focal rule: ONE band carries `focal`. It should be the layer under
 * discussion — the bottleneck, or the one the slide is arguing about.
 */

/* ------------------------------------------------------------------- shapes */

export interface Layer {
  /** Index tag on the far left — `L4`, `07`, `CORE`. Uppercase, tracked. */
  index?: string
  /** The layer's name. */
  name: string
  /** One line under the name: what the layer actually is. */
  sublabel?: string
  /** Far-right annotation — an example, an owner, a unit. */
  note?: string
  /** THE accent. One band per stack. */
  focal?: boolean
}

export interface LayerStackProps {
  width: number
  height: number
  /** Top layer first. 4–6 bands reads; more and the type has nowhere to go. */
  layers: Layer[]
  /** Arrow and label in the left margin, OUTSIDE the stack. */
  direction?: { label: string; dir: 'up' | 'down' }
  legend?: LegendItem[]
  /** Width of the index column inside a band, measured from the stack's left
   *  edge to the name. Wide enough that `APPLICATION` and `L4` both align. */
  indexColumn?: number
}

/* ---------------------------------------------------------------- component */

export function LayerStack({
  width,
  height,
  layers,
  direction,
  legend,
  indexColumn = 96,
}: LayerStackProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  /* The direction margin is a reserved column, so the stack never learns about
     it beyond starting further right. */
  const dirW = direction ? 52 : 0
  const stackX = snap(dirW)
  /* snapDown, not snap, and 2px of room for the stroke.
     
     `snap` rounds to NEAREST: at width 1155 with a 52px direction column it
     returned 1104, so the stack ended at x=1156 — one pixel past the viewBox.
     The SVG clips, so every band's right border was sliced off and the whole
     stack looked cut off on the right. Flooring keeps it inside, and the extra
     2px is because a 1px stroke is centred on the path, so a band ending exactly
     on the edge still loses half its border. */
  const stackW = snapDown(width - stackX - 2)

  /* Band edges are derived from the count, then snapped — so the boundaries land
     on the grid and the last band still ends exactly on the stack's floor.
     Deriving each band's HEIGHT from its own snapped edges (rather than snapping
     a shared height) is what stops a 5-band stack accumulating 3px of drift and
     leaving a sliver under the bottom divider. */
  const n = layers.length
  const edges = Array.from({ length: n + 1 }, (_, i) => (i === n ? drawH : snap((i * drawH) / n)))

  const bands = layers.map((l, i) => ({
    ...l,
    y: edges[i],
    h: edges[i + 1] - edges[i],
  }))

  const focalIndex = layers.findIndex((l) => l.focal)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Layer stack diagram"
      /* Required on every ported type — see the note in Architecture.tsx. */
      data-diagram="layer-stack"
    >
      <ArrowHeads uid={uid} />

      <defs>
        {/* The silhouette, as a clip. Every band is drawn square and cropped to
            it, which is how the stack keeps rounded outer corners and dead
            straight interior seams at the same time. */}
        <clipPath id={`${uid}-stack`}>
          <rect x={stackX} y={0} width={stackW} height={drawH} rx={8} />
        </clipPath>
      </defs>

      {/* Paper under everything, so a band's tint has something opaque behind it
          and the rounded corners are filled rather than knocked out. */}
      <rect x={stackX} y={0} width={stackW} height={drawH} rx={8} fill={role.paper} />

      <g clipPath={`url(#${uid}-stack)`}>
        {bands.map((b, i) => (
          <g key={`band-${i}`}>
            {/* Mask then styled fill, the same two-rect order every node in the
                library uses — which is also what lets the geometry gate treat a
                band as a box and check that the derived stack never overlaps. */}
            <rect x={stackX} y={b.y} width={stackW} height={b.h} fill={role.paper} />
            <rect
              x={stackX}
              y={b.y}
              width={stackW}
              height={b.h}
              fill={b.focal ? role.accentTint : role.paper}
              {...(b.focal ? { stroke: role.accent, strokeWidth: 1 } : {})}
            />

            {b.index && (
              <DiagramText
                x={stackX + 20}
                y={b.y + b.h / 2}
                variant="eyebrow"
                tone={b.focal ? 'accent' : 'soft'}
                uppercase
              >
                {b.index}
              </DiagramText>
            )}

            <DiagramText
              x={stackX + indexColumn}
              y={b.y + b.h / 2 - (b.sublabel ? 9 : 0)}
              variant="nodeName"
              tone="ink"
            >
              {b.name}
            </DiagramText>
            {b.sublabel && (
              <DiagramText
                x={stackX + indexColumn}
                y={b.y + b.h / 2 + 10}
                variant="sublabel"
                tone="muted"
              >
                {b.sublabel}
              </DiagramText>
            )}

            {b.note && (
              <DiagramText
                x={stackX + stackW - 20}
                y={b.y + b.h / 2}
                variant="sublabel"
                tone={b.focal ? 'accentDeep' : 'soft'}
                anchor="end"
              >
                {b.note}
              </DiagramText>
            )}
          </g>
        ))}
      </g>

      {/* Dividers after the bands, so they sit on top of the fills. The two
          seams that bound the focal band are SKIPPED: its accent stroke already
          draws them, and a grey hairline over it would cut the accent in half. */}
      {bands.slice(1).map((b, i) => {
        const above = i
        const below = i + 1
        if (above === focalIndex || below === focalIndex) return null
        return (
          <line
            key={`div-${i}`}
            x1={stackX}
            y1={b.y}
            x2={stackX + stackW}
            y2={b.y}
            stroke={withAlpha(role.ink, 0.12)}
            strokeWidth={1}
          />
        )
      })}

      {/* The silhouette's own outline, last, so no band edge crosses it. */}
      <rect
        x={stackX}
        y={0}
        width={stackW}
        height={drawH}
        rx={8}
        fill="none"
        stroke={withAlpha(role.ink, 0.5)}
        strokeWidth={1}
      />

      {direction && (
        <DirectionMargin
          x={16}
          labelX={38}
          top={12}
          bottom={drawH - 12}
          dir={direction.dir}
          label={direction.label}
          uid={uid}
        />
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/* --------------------------------------------------------------- direction */

/** Arrowheads for the direction indicator only. `ArrowMarkers` would define four
 *  heads for a diagram that draws exactly one line, so this defines the one. */
function ArrowHeads({ uid }: { uid: string }) {
  return (
    <defs>
      <marker
        id={`${uid}-arrow-soft`}
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 8 3, 0 6" fill={role.soft} />
      </marker>
    </defs>
  )
}

/**
 * The left margin: one vertical line with a head at the leading end, and the
 * label set along it.
 *
 * The label is rotated rather than stacked one character per line — a vertical
 * column of letters is a different typographic register and would read as a
 * decorative device rather than an axis annotation.
 */
function DirectionMargin({
  x,
  labelX,
  top,
  bottom,
  dir,
  label,
  uid,
}: {
  x: number
  labelX: number
  top: number
  bottom: number
  dir: 'up' | 'down'
  label: string
  uid: string
}) {
  /* Straight vertical, so `elbow()`'s same-axis branch and this agree: one axis
     constant is the only shape the geometry gate accepts. */
  const d = dir === 'up' ? `M ${x} ${bottom} L ${x} ${top}` : `M ${x} ${top} L ${x} ${bottom}`
  const cy = (top + bottom) / 2
  const t = diagramType.eyebrow
  return (
    <g>
      <Connector d={d} tone="soft" idPrefix={uid} />
      <text
        x={labelX}
        y={cy}
        transform={`rotate(-90 ${labelX} ${cy})`}
        fill={role.soft}
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
