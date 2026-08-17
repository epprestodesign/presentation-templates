import { DiagramText, Legend, diagramType, role, snap, withAlpha, type LegendItem } from './primitives'

/**
 * Diagram — Nested Containment. Hierarchy expressed as rings inside rings.
 *
 * Reach for it when the relationship is "A CONTAINS B", not "A calls B": scope
 * cascades, blast radius, trust zones, and the case this deck needs most — an
 * event contains blocks contains reservations contains room nights. Outer means
 * broader; inner means more specific; the innermost ring is the atom.
 *
 * LAYOUT IS DERIVED. Every ring is the previous one inset by (padX, padY), so
 * adding a level re-flows the whole figure instead of needing five new
 * rectangles. Ring geometry snaps to the 4px grid.
 *
 * TWO DEPARTURES FROM UPSTREAM, both forced by the slide well:
 *
 *  1. padX > padY BY DEFAULT (48 / 28, against upstream's 24–32 / 32–36). The
 *     well is 1155x380 — roughly 3:1 — so equal insets would drive the
 *     innermost ring to 5:1 and the figure would read as stacked bands rather
 *     than containment. Taking more off the sides than the top pulls each ring
 *     back toward the aspect of the one outside it, which is what makes the
 *     nesting legible.
 *
 *  2. AN OPTIONAL ASIDE COLUMN. A ring block that fills 1155px of width has to
 *     be 4 levels deep before it looks composed. `notes` puts up to two short
 *     annotations in a reserved right-hand column — outside the rings, because
 *     upstream is explicit that content inside a ring which is not part of the
 *     hierarchy belongs in a sibling diagram.
 *
 * The focal rule: exactly one level carries `focal`, and it should be the
 * innermost. Accent on two rings collapses the hierarchy it is meant to rank.
 */

export interface NestedLevel {
  /** Eyebrow sitting on this ring's top border, over a paper mask. */
  label: string
  /** What the level contains — shown at the ring's top-right, opposite `label`. */
  note?: string
  /** Centre block. Only the innermost ring has room for one. */
  name?: string
  sublabel?: string
  figure?: string
  /** THE accent. One level, and it should be the last one. */
  focal?: boolean
}

export interface NestedProps {
  width: number
  height: number
  /** Outermost first. 3–5 reads; upstream's ceiling is 6. */
  levels: NestedLevel[]
  /** Up to two annotations in a reserved right-hand column. */
  notes?: { label: string; text: string }[]
  legend?: LegendItem[]
  /** Horizontal inset per level. Wider than `padY` on purpose — see above. */
  padX?: number
  /** Vertical inset per level. Must clear the 14px label band. */
  padY?: number
}

export function Nested({
  width,
  height,
  levels,
  notes,
  legend,
  padX = 48,
  padY = 28,
}: NestedProps) {
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  /* The aside is a reserved column, not an overlay: the ring block never learns
     about it beyond being handed a narrower box. */
  const asideW = notes?.length ? snap(Math.min(300, width * 0.26)) : 0
  const asideGap = asideW ? 48 : 0
  const blockW = snap(width - asideW - asideGap)

  /* 8px of headroom so the OUTERMOST ring's label mask — which straddles its top
     border — has somewhere to sit. Without it the first label is half-clipped by
     the SVG edge, which is the one place this pattern breaks. */
  const TOP = 8

  const n = levels.length
  const rings = levels.map((lv, i) => {
    const x = snap(i * padX)
    const y = snap(TOP + i * padY)
    const w = snap(blockW - 2 * i * padX)
    const h = snap(drawH - TOP * 2 - 2 * i * padY)
    /* Stroke and fill ramp inward. Depth alone decides them, so a 3-level and a
       5-level figure both run faint → ink without per-story tuning. */
    const t = n > 1 ? i / (n - 1) : 1
    const stroke = lv.focal ? role.accent : withAlpha(role.ink, 0.26 + 0.36 * t)
    const fill = lv.focal ? role.accentTint : withAlpha(role.ink, 0.012 + 0.013 * i)
    return { ...lv, x, y, w, h, stroke, fill }
  })

  const asideX = snap(blockW + asideGap)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Nested containment diagram"
      /* Required on every ported type — scripts/check-diagram.mjs scopes its
         geometry checks to svg[data-diagram]. */
      data-diagram="nested"
    >
      {/* Rings, outermost first, each in its own group with nothing else in it —
          so an inner ring always paints over the outer ring's fill. */}
      {rings.map((r, i) => (
        <g key={`ring-${i}`}>
          <rect
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={8}
            fill={r.fill}
            stroke={r.stroke}
            strokeWidth={1}
          />
        </g>
      ))}

      {/* Labels, drawn after every ring so the mask that breaks a border cannot
          be painted over by the next ring inward. */}
      {rings.map((r, i) => {
        const t = diagramType.eyebrow
        const maskW = r.label.length * t.size * 0.78 + 20
        return (
          <g key={`label-${i}`}>
            <rect x={r.x + 16} y={r.y - 7} width={maskW} height={14} rx={2} fill={role.paper} />
            <DiagramText
              x={r.x + 26}
              y={r.y}
              variant="eyebrow"
              tone={r.focal ? 'accent' : 'soft'}
              uppercase
            >
              {r.label}
            </DiagramText>
          </g>
        )
      })}

      {/* The note opposite each label. Inside the ring rather than on its border:
          a second masked break in the same hairline reads as damage. */}
      {rings.map((r, i) =>
        r.note ? (
          <DiagramText
            key={`note-${i}`}
            x={r.x + r.w - 16}
            y={r.y + 18}
            variant="sublabel"
            tone="muted"
            anchor="end"
          >
            {r.note}
          </DiagramText>
        ) : null
      )}

      {/* Centre block — figure, name, sublabel — for whichever level asked for
          one. Only the innermost ring has the clear canvas for it. */}
      {rings.map((r, i) => {
        if (!r.name && !r.figure) return null
        const cx = r.x + r.w / 2
        const cy = r.y + r.h / 2 + 4
        return (
          <g key={`centre-${i}`}>
            {r.figure && (
              <text
                x={cx}
                y={r.name ? cy - 16 : cy}
                fill={r.focal ? role.accentDeep : role.ink}
                fontFamily={diagramType.family}
                fontSize={diagramType.figure.size}
                fontWeight={diagramType.figure.weight}
                letterSpacing={`${diagramType.figure.tracking}em`}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {r.figure}
              </text>
            )}
            {r.name && (
              <DiagramText
                x={cx}
                y={r.figure ? cy + 12 : cy - 10}
                variant="nodeName"
                tone="ink"
                anchor="middle"
              >
                {r.name}
              </DiagramText>
            )}
            {r.sublabel && (
              <DiagramText
                x={cx}
                y={r.figure ? cy + 32 : cy + 10}
                variant="sublabel"
                tone="muted"
                anchor="middle"
              >
                {r.sublabel}
              </DiagramText>
            )}
          </g>
        )
      })}

      {/* Aside column: a hairline, then up to two annotations stacked from the
          top of the ring block. */}
      {notes?.length ? (
        <g>
          <line
            x1={asideX}
            y1={TOP + 4}
            x2={asideX}
            y2={drawH - TOP}
            stroke={role.rule}
            strokeWidth={0.8}
          />
          {notes.slice(0, 2).map((note, i) => {
            const y = snap(TOP + 24 + i * ((drawH - TOP * 2) / 2))
            return (
              <g key={`aside-${i}`}>
                <DiagramText x={asideX + 20} y={y} variant="eyebrow" tone="soft" uppercase>
                  {note.label}
                </DiagramText>
                {wrapNote(note.text, asideW - 40).map((line, j) => (
                  <DiagramText
                    key={j}
                    x={asideX + 20}
                    y={y + 20 + j * 16}
                    variant="sublabel"
                    tone="muted"
                  >
                    {line}
                  </DiagramText>
                ))}
              </g>
            )
          })}
        </g>
      ) : null}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/**
 * Greedy wrap for aside copy.
 *
 * SVG `<text>` does not wrap, and `foreignObject` does not survive the PPTX
 * export, so the only options are one long line that overflows or measuring
 * here.
 *
 * 0.62em per character, NOT 0.5em. 0.5 is roughly the advance of Poppins 500
 * lowercase, and it is what this started at — but the aside also carries capitals,
 * digits and 0.04em of tracking, and a 50-character line measured 285px against a
 * predicted 250. The line then ran past the well and out under the watermark, which
 * the geometry gate does not catch because it bounds against the artboard rather
 * than the well. 0.62 is the same constant `ArrowLabel` uses to size its mask, and
 * it over-estimates rather than under — the failure mode is one line more than
 * strictly needed, which is invisible, instead of an overrun, which is not.
 */
function wrapNote(text: string, maxWidth: number): string[] {
  const perChar = diagramType.sublabel.size * 0.62
  const max = Math.max(1, Math.floor(maxWidth / perChar))
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (next.length > max && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}
