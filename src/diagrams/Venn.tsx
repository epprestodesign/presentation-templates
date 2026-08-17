import { useId } from 'react'
import {
  ArrowLabel,
  ArrowMarkers,
  Connector,
  DiagramText,
  Legend,
  elbow,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Venn / set overlap. Where two or three domains meet.
 *
 * Ported from the diagram-design skill's `type-venn.md`. Two or three circles,
 * never four — a four-set Venn has fifteen regions and is a matrix pretending to
 * be a drawing.
 *
 * THE CIRCLES ARE THE FIGURE, NOT CONNECTORS. They are `<circle>` elements, so
 * the orthogonal-connector rule does not apply to them and the geometry gate
 * does not read them as slanted paths. The ONE connector in this type is the
 * optional leader that pulls a cramped intersection label out to open canvas,
 * and that leader is orthogonal like every other connector in the library —
 * here it is horizontal, which `elbow()` emits as a straight line because the
 * endpoints share a y.
 *
 * LAYOUT IS DERIVED. Radii come from the well's height, centres sit on a ring of
 * radius `d = 0.95R` (three sets) or `0.6R` (two sets), and the whole figure is
 * then placed — centred when it stands alone, pushed left when a callout claims
 * the right-hand canvas. Nothing is hand-placed, so a two-set story and a
 * three-set story agree on their optical weight.
 *
 * HONEST RADII. `size` scales each radius by `sqrt(size)`, so it is AREA that is
 * proportional, not radius. Equal-sized circles for obviously unequal sets is
 * upstream's dishonesty anti-pattern, and faking it with radius makes a 2×
 * difference look like 4×.
 */

export interface VennSet {
  name: string
  /** Metadata line under the name. */
  sublabel?: string
  /** Relative magnitude. Radius scales by `sqrt(size)`, so AREA is honest.
   *  Leave undefined on every set when the sets are genuinely comparable. */
  size?: number
}

export interface VennRegion {
  /** Indices of the sets forming the region: `[0]` exclusive, `[0,1]` a lens,
   *  `[0,1,2]` the centre. */
  sets: number[]
  label: string
  sublabel?: string
  /** THE sweet spot. One per diagram — accent on two overlaps kills the signal. */
  focal?: boolean
}

/** A region whose label is too cramped to sit in its own overlap, pulled out to
 *  open canvas on an orthogonal leader. Upstream's remedy for small regions. */
export interface VennCallout {
  sets: number[]
  name: string
  sublabel?: string
  /** ≤14 characters, uppercase. Sits on the leader, on open canvas. */
  label?: string
}

export interface VennProps {
  width: number
  height: number
  /** Two or three. Three is the ceiling upstream and it is a hard one. */
  sets: VennSet[]
  regions?: VennRegion[]
  callout?: VennCallout
  legend?: LegendItem[]
}

/** Per-set stroke, in upstream's order: ink, then muted, then soft. Deliberately
 *  NOT `role.series` — a Venn's sets are not a categorical series, and giving
 *  them three hues would put three colours in competition with the one accent
 *  that marks the sweet spot. */
const SET_INK = [role.ink, role.muted, role.soft]
const SET_TINT = [0.04, 0.05, 0.05]

const key = (s: number[]) => [...s].sort((a, b) => a - b).join('-')

export function Venn({ width, height, sets, regions = [], callout, legend }: VennProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH
  const n = Math.min(sets.length, 3)

  /* Ring angles. Three sets sit on a triangle with the apex at the top; two sit
     side by side, which is the same formula at 180°/0°. */
  const angles = n === 3 ? [-90, 30, 150] : [180, 0]
  /* THE RING RATIO DECIDES WHETHER THERE IS A TRIPLE REGION AT ALL.

     Three centres on a ring of radius `d` sit `d√3` apart. At `d = 0.95R` that
     spacing is 1.65R, the circles meet almost at a point, and the centre region
     collapses to a sliver — which is fatal for the one type whose whole argument
     is usually what sits in the middle. `d = R/√3 ≈ 0.58R` puts the centres
     exactly R apart, which is the classic three-set figure and gives the middle a
     proper Reuleaux triangle to hold a label. */
  const ringRatio = n === 3 ? 0.58 : 0.6

  /* Vertical budget. A three-set triangle is `1.5d + 2R` tall; two circles side
     by side are just `2R`. PAD_TOP carries the top set's name and sublabel,
     which are the only labels that sit above the figure. */
  /* The only labels that sit ABOVE a three-set figure are the top set's name and
     its sublabel, so the top band is reserved for exactly what is there — a
     figure with no sublabel would otherwise sit visibly low in the well. */
  const PAD_TOP = n === 3 ? (sets[0].sublabel ? 52 : 36) : 12
  const PAD_BOTTOM = 12
  const denom = n === 3 ? 1.5 * ringRatio + 2 : 2
  const R = snap((drawH - PAD_TOP - PAD_BOTTOM) / denom)
  const d = snap(R * ringRatio)

  const maxSize = Math.max(...sets.slice(0, n).map((s) => s.size ?? 1))
  const radii = sets.slice(0, n).map((s) => snap(R * Math.sqrt((s.size ?? 1) / maxSize)))

  /* Figure centre. A callout claims the right third of the well, so the figure
     moves left rather than the leader doubling back over the circles. */
  const figureW = n === 3 ? 2 * d * Math.cos(Math.PI / 6) + 2 * R : 2 * d + 2 * R
  const fx = callout ? snap(Math.max(figureW / 2 + 120, width * 0.3)) : snap(width / 2)
  const fy = n === 3 ? snap(PAD_TOP + d + R) : snap(PAD_TOP + R)

  const unit = angles.map((a) => ({
    x: Math.cos((a * Math.PI) / 180),
    y: Math.sin((a * Math.PI) / 180),
  }))
  const centres = unit.map((u, i) => ({
    x: snap(fx + d * u.x),
    y: snap(fy + d * u.y),
    r: radii[i],
  }))

  /* Region centroids.

     A LENS IS NOT CENTRED ON THE MIDPOINT OF THE TWO CENTRES. That shortcut only
     works when the radii are equal; with a 4:1 size ratio the midpoint falls
     outside the smaller circle entirely and the label lands in the wrong region.
     So the lens is measured along the line joining the centres — circle A covers
     `[-ra, ra]` from A and circle B covers `[D-rb, D+rb]`, and the label goes at
     the middle of the intersection of those two intervals.

     In a three-set figure that point still sits close to the triple region, so a
     lens label is nudged outward from the figure centre by 0.35R. It stays inside
     its own exclusive slice, which is narrow — keep three-set lens labels to a
     single short word or use the callout instead. */
  const centroid = (s: number[]) => {
    if (s.length >= 3) return { x: fx, y: fy }
    if (s.length === 2) {
      const a = centres[s[0]]
      const b = centres[s[1]]
      const D = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const ex = (b.x - a.x) / D
      const ey = (b.y - a.y) / D
      const t = (Math.max(-a.r, D - b.r) + Math.min(a.r, D + b.r)) / 2
      let px = a.x + ex * t
      let py = a.y + ey * t
      if (n === 3) {
        const vx = px - fx
        const vy = py - fy
        const len = Math.hypot(vx, vy) || 1
        px += (vx / len) * R * 0.35
        py += (vy / len) * R * 0.35
      }
      return { x: px, y: py }
    }
    const c = centres[s[0]]
    return { x: c.x + unit[s[0]].x * c.r * 0.5, y: c.y + unit[s[0]].y * c.r * 0.5 }
  }

  /* The tinted focal region, built by INTERSECTING clip paths — each clipPath
     clipped by the previous one, so N chained circles leave exactly the region
     where all N overlap. Painting a lens by hand would need arc maths and would
     drift the moment a radius changed. */
  const focalSets = callout?.sets ?? regions.find((r) => r.focal)?.sets
  const calloutKey = callout ? key(callout.sets) : null

  /* Leader geometry. The label lands in open canvas to the right of the figure
     and the arrow points back INTO the region, so the reader's eye goes from the
     words to the place. The visible stretch between the union's right edge and
     the label is where the arrow label sits — the only open canvas on the run. */
  const unionRight = Math.max(...centres.map((c) => c.x + c.r))
  const leaderX = snap(Math.min(unionRight + 148, width - 300))
  const target = focalSets ? centroid(focalSets) : { x: fx, y: fy }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Venn diagram"
      data-diagram="venn"
    >
      <ArrowMarkers idPrefix={uid} />
      {focalSets && (
        <defs>
          {[...focalSets].sort((a, b) => a - b).map((si, k) => (
            <clipPath
              key={si}
              id={`${uid}-clip-${k}`}
              {...(k > 0 ? { clipPath: `url(#${uid}-clip-${k - 1})` } : {})}
            >
              <circle cx={centres[si].x} cy={centres[si].y} r={centres[si].r} />
            </clipPath>
          ))}
        </defs>
      )}

      {/* 1. Set circles. Hairline stroke, tint at 4–5% so the tints COMPOUND in
             the overlaps and the reader gets the region depth for free. */}
      {centres.map((c, i) => (
        <circle
          key={`c${i}`}
          cx={c.x}
          cy={c.y}
          r={c.r}
          fill={withAlpha(SET_INK[i], SET_TINT[i])}
          stroke={SET_INK[i]}
          strokeWidth={1}
        />
      ))}

      {/* 2. The one focal region, tinted accent through the chained clip. */}
      {focalSets && (
        <rect
          x={0}
          y={0}
          width={width}
          height={drawH}
          fill={withAlpha(role.accent, 0.1)}
          clipPath={`url(#${uid}-clip-${focalSets.length - 1})`}
        />
      )}

      {/* 3. Set names — OUTSIDE the circle, never crossing the stroke. The
             direction is the set's own ring vector, so a name always leaves the
             figure rather than cutting back across it. */}
      {centres.map((c, i) => {
        const u = unit[i]
        const off = c.r + 24
        const lx = snap(c.x + u.x * off)
        const ly = snap(c.y + u.y * off)
        const anchor = u.x > 0.2 ? 'start' : u.x < -0.2 ? 'end' : 'middle'
        return (
          <g key={`n${i}`}>
            <DiagramText x={lx} y={ly} variant="nodeName" tone="ink" anchor={anchor}>
              {sets[i].name}
            </DiagramText>
            {sets[i].sublabel && (
              <DiagramText x={lx} y={ly + 16} variant="sublabel" tone="muted" anchor={anchor}>
                {sets[i].sublabel!}
              </DiagramText>
            )}
          </g>
        )
      })}

      {/* 4. Region labels, inside their own overlap. The region promoted to a
             callout is skipped here — it is drawn once, at the end of its
             leader, not twice. */}
      {regions.map((rg) => {
        if (calloutKey && key(rg.sets) === calloutKey) return null
        const p = centroid(rg.sets)
        return (
          <g key={key(rg.sets)}>
            <DiagramText
              x={snap(p.x)}
              y={snap(rg.sublabel ? p.y - 8 : p.y)}
              variant="nodeName"
              tone={rg.focal ? 'accentDeep' : 'ink'}
              anchor="middle"
            >
              {rg.label}
            </DiagramText>
            {rg.sublabel && (
              <DiagramText
                x={snap(p.x)}
                y={snap(p.y + 8)}
                variant="sublabel"
                tone="muted"
                anchor="middle"
              >
                {rg.sublabel}
              </DiagramText>
            )}
          </g>
        )
      })}

      {/* 5. The callout. Orthogonal leader — the endpoints share a y, so this is
             the one legitimate straight case — pointing back at the region, with
             its label on the open stretch between the union and the words. */}
      {callout && (
        <>
          <Connector
            d={elbow({ x: leaderX, y: snap(target.y) }, { x: snap(target.x), y: snap(target.y) })}
            tone="accent"
            idPrefix={uid}
          />
          {callout.label && (
            <ArrowLabel
              x={snap((unionRight + leaderX) / 2)}
              y={snap(target.y)}
              text={callout.label}
              side="above"
              tone="accent"
            />
          )}
          <DiagramText x={leaderX + 16} y={snap(target.y - 10)} variant="nodeName" tone="accentDeep">
            {callout.name}
          </DiagramText>
          {callout.sublabel && (
            <DiagramText x={leaderX + 16} y={snap(target.y + 10)} variant="sublabel" tone="muted">
              {callout.sublabel}
            </DiagramText>
          )}
        </>
      )}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}
