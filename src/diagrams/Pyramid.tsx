import { useId } from 'react'
import { DiagramText, Legend, role, snap, withAlpha, type LegendItem } from './primitives'

/**
 * Diagram — Pyramid / funnel. A stack whose width carries the quantity.
 *
 * Ported from the diagram-design skill's `type-pyramid.md`. One type, two
 * orientations, and upstream is explicit that they must never be mixed on one
 * drawing because they mean opposite things:
 *
 *  - `pyramid` (point up) — a HIERARCHY. The apex is the rarest / most valuable
 *    tier and the base is foundational. Widths are structural, so they step
 *    linearly and no values are needed.
 *  - `funnel` (point down) — a CONVERSION. The top is the whole audience and the
 *    narrow end is what converted. Widths MUST be proportional to the counts, or
 *    the drawing lies about the drop-off, which is the only thing a funnel is
 *    for.
 *
 * WIDTHS ARE HONEST AND THERE IS NO FLOOR. A stage at 8% of the top gets 8% of
 * the width even when that is too narrow for a comfortable label. The temptation
 * is to clamp it to a legible minimum; that turns a 12× funnel into a 3× funnel
 * and is upstream's dishonest-widths anti-pattern. Pick stages that survive the
 * arithmetic instead, and if the last one genuinely cannot, the subject wants
 * two diagrams.
 *
 * THE LAYERS ARE THE FIGURE. Each band is a `<polygon>` — a trapezoid with four
 * points — so the sloped edges are geometry, not connectors, and the geometry
 * gate has nothing to misread. There are no connectors in this type at all: the
 * side annotations are tied to their band by a horizontal hairline tick, which
 * is axis-aligned by construction.
 *
 * LAYOUT IS DERIVED. The well is divided into an optional axis strip, the stack,
 * and an optional annotation column; the stack's base width is whatever is left,
 * capped so a five-layer funnel never spreads into a letterbox. The three blocks
 * are then centred together, so a stack with annotations and one without both
 * sit on the well's optical middle.
 */

export interface PyramidLayer {
  name: string
  /** Metadata line under the name. */
  sublabel?: string
  /** Funnel only: the count or percentage at this stage. Drives the width. */
  value?: number
  /** Right-column annotation — a drop-off, a rate, a count. */
  note?: string
  /** ONE layer: the apex of a pyramid, or a funnel's conversion / bottleneck.
   *  Never the base of a pyramid — that dilutes the "apex is rare" signal. */
  focal?: boolean
}

export interface PyramidProps {
  width: number
  height: number
  orientation?: 'pyramid' | 'funnel'
  /** Four to six, in drawing order top → bottom. */
  layers: PyramidLayer[]
  /** Left-margin axis word, e.g. `rarer` or `drop-off`. Reads bottom-to-top. */
  axisLabel?: string
  /** Pyramid only. `point` is the classic apex; `flat` truncates it one step
   *  short so the top tier is wide enough to hold its own name. A pyramid's
   *  widths carry no quantity, so truncating costs nothing — a funnel's do, which
   *  is why this does not apply there. */
  apex?: 'point' | 'flat'
  /** `flat` is paper-2 with hairline dividers; `graded` steps the ink tint.
   *  Upstream: pick one, never both. */
  fill?: 'flat' | 'graded'
  legend?: LegendItem[]
}

export function Pyramid({
  width,
  height,
  orientation = 'pyramid',
  layers,
  axisLabel,
  apex = 'point',
  fill = 'flat',
  legend,
}: PyramidProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH
  const n = layers.length

  const AXIS_W = 44
  const AXIS_GAP = 24
  const ANNO_GAP = 28
  /* Reserved for the annotation column. Kept close to what a drop-off or a count
     actually measures: reserving 200px for a 60px number leaves the block's
     visible content sitting left of the well's optical centre. */
  const ANNO_W = 140
  const hasAxis = Boolean(axisLabel)
  const hasAnno = layers.some((l) => l.note)

  const leftStrip = hasAxis ? AXIS_W + AXIS_GAP : 0
  const rightStrip = hasAnno ? ANNO_GAP + ANNO_W : 0
  /* Cap the base width against the stack's own height: a stack wider than about
     twice its height stops reading as a pyramid and starts reading as a bar
     chart lying on its side. */
  const baseW = snap(Math.min(width - leftStrip - rightStrip, drawH * 1.9))
  const blockW = leftStrip + baseW + rightStrip
  const left = snap((width - blockW) / 2)
  const axisX = snap(left + 34)
  const axisLabelX = snap(left + 14)
  const stackLeft = snap(left + leftStrip)
  const cxF = snap(stackLeft + baseW / 2)
  const annoX = snap(stackLeft + baseW + ANNO_GAP)

  const PAD = 16
  const bandH = snap((drawH - PAD * 2) / n)
  const totalH = bandH * n
  const y0 = snap((drawH - totalH) / 2)

  /* Width at the top of each band, plus one extra entry for the bottom edge of
     the last band.

     PYRAMID: `(k + a) / (n + a)` of the base. With `a = 0` band 0's top width is
     zero and the first band draws as a triangle — the apex, for free, with no
     special case. With `a = 1` the stack is truncated one step short, which is
     what makes the top tier wide enough for its own label.
     FUNNEL: proportional to `value`. The final band is drawn as a rectangle (top
     and bottom the same) because its width already IS the converted count; a
     further taper would invent a stage that the data does not contain. */
  const edges: number[] = []
  if (orientation === 'pyramid') {
    const a = apex === 'flat' ? 1 : 0
    for (let k = 0; k <= n; k++) edges.push((baseW * (k + a)) / (n + a))
  } else {
    const vmax = Math.max(...layers.map((l) => l.value ?? 1))
    for (let k = 0; k < n; k++) edges.push((baseW * (layers[k].value ?? 1)) / vmax)
    edges.push(edges[n - 1])
  }

  const bands = layers.map((l, k) => {
    const yTop = y0 + k * bandH
    const yBot = yTop + bandH
    const wt = edges[k]
    const wb = edges[k + 1]
    return { l, k, yTop, yBot, wt, wb, mid: yTop + bandH / 2, wMid: (wt + wb) / 2 }
  })

  /* Outer silhouette, traced down the right edge and back up the left. Drawn
     over the bands so the stack reads as one solid whose internal hairlines
     divide it, rather than as n separate shapes that happen to touch. */
  const silhouette = [
    ...bands.map((b) => `${snap(cxF + b.wt / 2)},${b.yTop} ${snap(cxF + b.wb / 2)},${b.yBot}`),
    ...[...bands].reverse().map((b) => `${snap(cxF - b.wb / 2)},${b.yBot} ${snap(cxF - b.wt / 2)},${b.yTop}`),
  ].join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`${orientation} diagram`}
      data-diagram="pyramid"
    >
      {/* 1. Bands. Trapezoids as polygons, so the sloped edges are shape. */}
      {bands.map((b) => (
        <polygon
          key={b.k}
          points={[
            `${snap(cxF - b.wt / 2)},${b.yTop}`,
            `${snap(cxF + b.wt / 2)},${b.yTop}`,
            `${snap(cxF + b.wb / 2)},${b.yBot}`,
            `${snap(cxF - b.wb / 2)},${b.yBot}`,
          ].join(' ')}
          fill={
            b.l.focal
              ? withAlpha(role.accent, 0.12)
              : fill === 'graded'
                ? withAlpha(role.ink, 0.02 + 0.02 * b.k)
                : role.paper2
          }
          stroke={b.l.focal ? role.accent : role.rule}
          strokeWidth={b.l.focal ? 1.2 : 1}
        />
      ))}
      <polygon points={silhouette} fill="none" stroke={role.muted} strokeWidth={1} />

      {/* 2. Names inside the band, sublabel under. A band narrower than its name
             is the honesty tax described at the top of this file — fix the data
             or the stage list, not the geometry. */}
      {bands.map((b) => (
        <g key={`t${b.k}`}>
          <DiagramText
            x={cxF}
            y={snap(b.l.sublabel ? b.mid - 8 : b.mid)}
            variant="nodeName"
            tone={b.l.focal ? 'accentDeep' : 'ink'}
            anchor="middle"
          >
            {b.l.name}
          </DiagramText>
          {b.l.sublabel && (
            <DiagramText
              x={cxF}
              y={snap(b.mid + 9)}
              variant="sublabel"
              tone="muted"
              anchor="middle"
            >
              {b.l.sublabel}
            </DiagramText>
          )}
        </g>
      ))}

      {/* 3. Side annotations, tied to their band by a horizontal hairline. The
             tick is axis-aligned by construction, which is why it can be a rule
             rather than a connector. */}
      {hasAnno &&
        bands.map(
          (b) =>
            b.l.note && (
              <g key={`a${b.k}`}>
                <line
                  x1={snap(cxF + b.wMid / 2 + 10)}
                  y1={snap(b.mid)}
                  x2={annoX - 10}
                  y2={snap(b.mid)}
                  stroke={role.rule}
                  strokeWidth={0.8}
                />
                <DiagramText
                  x={annoX}
                  y={snap(b.mid)}
                  variant="sublabel"
                  tone={b.l.focal ? 'accent' : 'muted'}
                >
                  {b.l.note}
                </DiagramText>
              </g>
            )
        )}

      {/* 4. Optional axis. A pyramid's arrow points UP (rarer toward the apex); a
             funnel's points DOWN (loss accumulates). The word reads
             bottom-to-top in both, rotated about its own anchor so the rotation
             cannot drag it off the strip. */}
      {hasAxis && (
        <g>
          <ArrowDefs uid={uid} />
          <line
            x1={axisX}
            y1={orientation === 'pyramid' ? y0 + totalH : y0}
            x2={axisX}
            y2={orientation === 'pyramid' ? y0 : y0 + totalH}
            stroke={role.rule}
            strokeWidth={1}
            markerEnd={`url(#${uid}-axis)`}
          />
          <g transform={`rotate(-90 ${axisLabelX} ${snap(y0 + totalH / 2)})`}>
            <DiagramText
              x={axisLabelX}
              y={snap(y0 + totalH / 2)}
              variant="eyebrow"
              tone="soft"
              anchor="middle"
              uppercase
            >
              {axisLabel!}
            </DiagramText>
          </g>
        </g>
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/** The axis arrowhead. `ArrowMarkers` is for connectors and paints in connector
 *  tones; the pyramid's axis is a hairline rule, so it gets a `soft` head at the
 *  same weight rather than a muted connector head that would out-shout the
 *  band strokes it sits beside. */
function ArrowDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <marker id={`${uid}-axis`} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
        <polygon points="0 0, 7 2.5, 0 5" fill={role.soft} />
      </marker>
    </defs>
  )
}
