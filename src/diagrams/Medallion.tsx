import { useId } from 'react'
import { ArrowLabel, ArrowMarkers, Connector, DiagramText, role, snap, withAlpha, type ArrowTone } from './primitives'

/**
 * Diagram — Medallion. Tiers of the SAME dataset at rising quality.
 *
 * Ported from the diagram-design skill's `medallion` type. Each column is one
 * tier — what it holds, who writes it, with what tool — and the arrows over the
 * top are promotions between adjacent tiers. Reach for Architecture instead when
 * the subject is which components talk to which; reach for this one when the
 * subject is that bronze, silver and gold are three states of one thing.
 *
 * TWO DEPARTURES FROM UPSTREAM, BOTH FORCED BY RULES THIS DECK KEEPS.
 *
 *  1. PROMOTIONS ARE ORTHOGONAL STAPLES, NOT CUBIC ARCS. Upstream draws each
 *     promotion as a cubic Bézier over the top of the tier strip. A curve is a
 *     lovely solution to the label problem — the label floats in the space the
 *     arc encloses — but this deck's connector rule is orthogonal-only, and a
 *     Bézier connector is exactly what that rule exists to prevent. The staple
 *     keeps the property that made the arc work (the label sits in open canvas
 *     inside the connector, not on it) with axis-aligned segments and the same
 *     quarter-arc corners `elbow()` uses.
 *
 *     The staple ALSO fixes something the arc got wrong. Upstream chains its arcs
 *     at a shared joint: promotion k ends where promotion k+1 begins, both at the
 *     tier's top-centre. Two staples meeting at one x would run their vertical
 *     legs on top of each other, which is the "no overlapping connectors" rule.
 *     So the legs are inset from centre — out of the right of one tier, into the
 *     left of the next — which also reads better: it has a direction.
 *
 *  2. FIELD VALUES WRAP BY DECLARATION, NOT BY `<foreignObject>`. Upstream wraps
 *     long values in an HTML div inside a foreignObject. That renders in Chromium
 *     but is the first thing to break in an SVG export path, and this deck has
 *     one. A value that needs two lines is declared as two strings.
 *
 * LAYOUT IS DERIVED. Tier width comes from the well's width and the whole card's
 * internal stack from its height, so three tiers and five tiers both fill it.
 */

/** Grid-aligned floor — a divided dimension must never round outward, or four
 *  columns each 2px too wide push the last one past the artboard. */
const floor4 = (n: number) => Math.max(4, Math.floor(n / 4) * 4)

/**
 * Orthogonal "staple" over the tier strip: up out of one tier, across the band,
 * down into the next. Quarter-arc corners, radius `r`.
 *
 * Local to this file because `elbow()` expresses a two-segment route and this is
 * a three-segment one; the geometry is otherwise identical. It is a candidate to
 * move into `primitives.tsx` if a second type needs the same route — see the
 * note in the port report.
 */
function staple(x1: number, x2: number, yTop: number, yBand: number, r = 8): string {
  const sx = Math.sign(x2 - x1) || 1
  const rr = Math.min(r, Math.abs(x2 - x1) / 2, Math.abs(yTop - yBand) / 2)
  return [
    `M ${x1} ${yTop}`,
    `L ${x1} ${yBand + rr}`,
    `Q ${x1} ${yBand} ${x1 + sx * rr} ${yBand}`,
    `L ${x2 - sx * rr} ${yBand}`,
    `Q ${x2} ${yBand} ${x2} ${yBand + rr}`,
    `L ${x2} ${yTop}`,
  ].join(' ')
}

export type TierStyle = 'outer' | 'default' | 'focal' | 'cold'

export interface MedallionField {
  label: string
  /** One string, or explicit lines. See the note above on wrapping. */
  value: string | string[]
}

export interface MedallionTier {
  name: string
  /** Where it physically lives — a bucket, a schema, a table prefix. */
  store: string
  /** Defaults: first tier `outer`, last `cold`, focal `focal`, rest `default`. */
  style?: TierStyle
  /** Exactly one tier. Promotes the arrow INTO it to accent automatically. */
  focal?: boolean
  fields: MedallionField[]
  /** The worked example at the foot of the card — what one row actually is at
   *  this tier. It is the field that makes the diagram concrete. */
  example?: { label: string; lines: string[] }
}

export interface MedallionProps {
  width: number
  height: number
  tiers: MedallionTier[]
  /** One per adjacent pair, so `tiers.length - 1` of them. */
  promotions: { label: string; style?: 'normal' | 'focal' | 'lifecycle' }[]
  tierGap?: number
}

function tierPalette(style: TierStyle) {
  switch (style) {
    case 'outer':
      return { fill: role.paper, stroke: role.muted, band: withAlpha(role.muted, 0.1), store: role.muted, dash: undefined, sw: 1 }
    case 'focal':
      return { fill: role.accentTint, stroke: role.accent, band: withAlpha(role.accent, 0.14), store: role.accentDeep, dash: undefined, sw: 1.6 }
    case 'cold':
      return { fill: role.paper2, stroke: role.muted, band: withAlpha(role.muted, 0.18), store: role.soft, dash: '5,3', sw: 1 }
    case 'default':
    default:
      return { fill: role.paper, stroke: role.ink, band: withAlpha(role.ink, 0.06), store: role.muted, dash: undefined, sw: 1 }
  }
}

export function Medallion({ width, height, tiers, promotions, tierGap = 16 }: MedallionProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const n = tiers.length

  /* The band above the cards is where every promotion and every promotion label
     lives, so it is sized as a share of the well rather than fixed: a short well
     gets a shallow band and the cards keep their room. */
  const bandH = snap(Math.max(56, Math.min(80, height * 0.19)))
  const bandY = floor4(bandH * 0.42)
  const tierY = bandH
  const tierH = height - bandH

  const tierW = floor4((width - (n - 1) * tierGap) / n)
  const tierX = (i: number) => snap(i * (tierW + tierGap))
  const tierCx = (i: number) => snap(tierX(i) + tierW / 2)

  /* Card internals, derived once and shared by every card so the field rows line
     up ACROSS tiers — which is the property that lets the reader read one row
     sideways ("who writes each tier?") as well as one card downwards. */
  const HEAD_H = 40
  const storeY = tierY + HEAD_H + 16
  const exampleH = tiers.some((t) => t.example) ? 62 : 0
  const nFields = Math.max(...tiers.map((t) => t.fields.length))
  const fieldsAvail = tierH - (HEAD_H + 38) - exampleH - 12

  /* A field row has a NATURAL height, and spare space becomes margin rather than
     leading. Dividing the available height by the row count and using the result
     as the stride looks right at four tiers with a worked example and wrong at
     three without one: the rows spread to 72px apart, each holding 28px of type,
     and the card reads as a list of orphans. Capping the stride and centring the
     block keeps the row rhythm identical across shapes. */
  const rowStride = Math.min(56, floor4(fieldsAvail / Math.max(nFields, 1)))
  const fieldTop =
    tierY + HEAD_H + 38 + snap(Math.max(0, (fieldsAvail - rowStride * nFields) / 2))
  const exampleTop = tierY + tierH - exampleH

  /* Legs are inset from the tier centre so two adjacent staples never share an x
     — see the note at the top of the file. */
  const inset = snap(Math.min(32, tierW * 0.14))

  const TONE: Record<string, { tone: ArrowTone; dashed: boolean }> = {
    normal: { tone: 'default', dashed: false },
    focal: { tone: 'accent', dashed: false },
    lifecycle: { tone: 'default', dashed: true },
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Medallion tier diagram"
      data-diagram="medallion"
    >
      <ArrowMarkers idPrefix={uid} />

      {/* 1. Promotions BEFORE the cards, so a staple's ends sit behind the card
             edges rather than on top of them. */}
      {promotions.slice(0, n - 1).map((p, i) => {
        /* A promotion INTO the focal tier is accent whether or not the author
           said so — upstream's auto-style rule. The focal tier is the argument of
           the slide, so the arrow that produces it is part of that argument. */
        const auto = tiers[i + 1]?.focal ? 'focal' : (p.style ?? 'normal')
        const t = TONE[auto] ?? TONE.normal
        return (
          <Connector
            key={i}
            d={staple(tierCx(i) + inset, tierCx(i + 1) - inset, tierY, bandY)}
            tone={t.tone}
            dashed={t.dashed}
            idPrefix={uid}
          />
        )
      })}

      {/* 2. Cards. */}
      {tiers.map((t, i) => {
        const style = t.style ?? (t.focal ? 'focal' : i === 0 ? 'outer' : i === n - 1 ? 'cold' : 'default')
        const s = tierPalette(style)
        const x = tierX(i)
        const cx = tierCx(i)
        return (
          <g key={t.name}>
            {/* Opaque paper mask first: every non-`paper` card fill is a tint, and
                a staple end behind a tint would show through it. */}
            <rect x={x} y={tierY} width={tierW} height={tierH} rx={6} fill={role.paper} />
            <rect x={x} y={tierY} width={tierW} height={tierH} rx={6} fill={s.fill} />

            {/* Header band, then a squaring rect so the band's bottom corners are
                not rounded — a band with four round corners reads as a chip. */}
            <rect x={x} y={tierY} width={tierW} height={HEAD_H} rx={6} fill={s.band} />
            <rect x={x} y={tierY + HEAD_H - 6} width={tierW} height={6} fill={s.band} />

            {/* Border last of the rects, so it draws over both fills. */}
            <rect
              x={x}
              y={tierY}
              width={tierW}
              height={tierH}
              rx={6}
              fill="none"
              stroke={s.stroke}
              strokeWidth={s.sw}
              {...(s.dash ? { strokeDasharray: s.dash } : {})}
            />

            <DiagramText x={cx} y={tierY + HEAD_H / 2} variant="nodeName" tone="ink" anchor="middle">
              {t.name}
            </DiagramText>
            <DiagramText
              x={cx}
              y={storeY}
              variant="sublabel"
              tone={style === 'focal' ? 'accentDeep' : 'muted'}
              anchor="middle"
            >
              {t.store}
            </DiagramText>

            {t.fields.map((f, k) => {
              const y = fieldTop + k * rowStride
              const lines = Array.isArray(f.value) ? f.value : [f.value]
              return (
                <g key={f.label}>
                  <DiagramText x={x + 14} y={y} variant="eyebrow" tone="soft" uppercase>
                    {f.label}
                  </DiagramText>
                  {lines.map((l, li) => (
                    <DiagramText key={li} x={x + 14} y={y + 15 + li * 13} variant="sublabel" tone="muted">
                      {l}
                    </DiagramText>
                  ))}
                </g>
              )
            })}

            {t.example && (
              <g>
                <line
                  x1={x + 14}
                  y1={exampleTop}
                  x2={x + tierW - 14}
                  y2={exampleTop}
                  stroke={withAlpha(role.ink, 0.12)}
                  strokeWidth={0.8}
                />
                <DiagramText x={x + 14} y={exampleTop + 14} variant="eyebrow" tone="soft" uppercase>
                  {t.example.label}
                </DiagramText>
                {t.example.lines.map((l, li) => (
                  <DiagramText
                    key={li}
                    x={x + 14}
                    y={exampleTop + 32 + li * 14}
                    variant="sublabel"
                    tone={style === 'focal' ? 'accentDeep' : 'muted'}
                  >
                    {l}
                  </DiagramText>
                ))}
              </g>
            )}
          </g>
        )
      })}

      {/* 3. Promotion labels last, and INSIDE the space the staple encloses —
             `side: 'below'` puts the mask between the band run and the card tops,
             which is the only open canvas in that strip. */}
      {promotions.slice(0, n - 1).map((p, i) => (
        <ArrowLabel
          key={i}
          x={snap((tierCx(i) + tierCx(i + 1)) / 2)}
          y={bandY}
          text={p.label}
          side="below"
          tone={tiers[i + 1]?.focal || p.style === 'focal' ? 'accent' : 'soft'}
        />
      ))}
    </svg>
  )
}
