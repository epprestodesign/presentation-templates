import { DiagramText, diagramType, role, snap, withAlpha } from './primitives'

/**
 * Diagram — Access Matrix. Who can read or write what, per role.
 *
 * Ported from the diagram-design skill's `dp-security-matrix` type. Rows are
 * resources, columns are roles, and every intersection carries a permission
 * value with a treatment that matches its level. One cell may be focal — the one
 * access rule that distinguishes this posture from a generic permissions table.
 *
 * A MATRIX HAS NO CONNECTORS. That is upstream's §3 and it is worth restating
 * because it is tempting to draw one: the information lives entirely in the cell
 * contents and their fills, and an arrow pointing into a cell is a different
 * diagram type. So this is the one ported type with no `ArrowMarkers`, no
 * `Connector` and no `ArrowLabel` — nothing here can violate a connector rule
 * because nothing here is a connector.
 *
 * THE LEVELS ARE THE DECK'S DIRECTION SEMANTICS, NOT A NEW VOCABULARY.
 * Upstream's closed set is `full | rw | read | none`, styled with ink at four
 * opacities — a matrix in one colour, where the reader has to consult the legend
 * to learn that a slightly darker grey means write access. EventPipe already has
 * `positive` / `warning` / `negative` for exactly this, so allow / conditional /
 * deny map straight onto them and the grid becomes scannable without the legend:
 * green is allowed, amber needs a condition, red is refused. `full` and `write`
 * are the same green at different strengths, because they are the same answer at
 * different scope.
 *
 * LAYOUT IS DERIVED. Column widths come from the well's width and the row stride
 * from its height, so a 4-role × 6-resource matrix and a 5 × 8 both fill the well
 * instead of one overflowing and the other floating. Cells use `rx=4`, which is
 * also what keeps the geometry gate from reading a cell as an arrow-label mask —
 * that detector keys on `rx=2` plus an opaque fill.
 */

/** Grid-aligned floor. See the note in the layout block for why a divided
 *  dimension floors rather than rounds. */
const floor4 = (n: number) => Math.max(4, Math.floor(n / 4) * 4)

/** Closed vocabulary. `value` carries the domain wording ("R/W", "Own rows
 *  only"); `level` decides what it looks like. Adding a level is a design
 *  decision, which is why this is a union and not a string. */
export type AccessLevel = 'full' | 'write' | 'read' | 'conditional' | 'none'

export interface AccessCell {
  row: number
  col: number
  /** Displayed text. Free-form — the level does the styling. */
  value: string
  level?: AccessLevel
  /** Second line. Reserved for the focal cell in practice. */
  sub?: string
  /** Exactly one per diagram, or none. */
  focal?: boolean
}

export interface AccessMatrixProps {
  width: number
  height: number
  roles: { name: string; code?: string }[]
  resources: { name: string; hint?: string }[]
  cells: AccessCell[]
  /** Text for an intersection no cell was declared for. */
  noneLabel?: string
  /** Header for the top-left corner cell. */
  cornerLabel?: [string, string]
  legend?: boolean
}

/** Fill / stroke / text per level. Kept as one table so a component never
 *  invents a treatment, and so the legend below reads from the same source the
 *  cells do — a legend that restates the styles by hand goes stale. */
function levelStyle(level: AccessLevel) {
  switch (level) {
    case 'full':
      return { fill: withAlpha(role.positive, 0.18), stroke: withAlpha(role.positive, 0.55), text: role.ink, weight: 600 }
    case 'write':
      return { fill: withAlpha(role.positive, 0.09), stroke: withAlpha(role.positive, 0.4), text: role.ink, weight: 500 }
    case 'read':
      return { fill: withAlpha(role.ink, 0.03), stroke: withAlpha(role.ink, 0.14), text: role.muted, weight: 400 }
    case 'conditional':
      return { fill: withAlpha(role.warning, 0.16), stroke: withAlpha(role.warning, 0.6), text: role.ink, weight: 500 }
    case 'none':
    default:
      return {
        fill: withAlpha(role.negative, 0.045),
        stroke: withAlpha(role.negative, 0.24),
        text: withAlpha(role.negative, 0.85),
        weight: 400,
      }
  }
}

export function AccessMatrix({
  width,
  height,
  roles,
  resources,
  cells,
  noneLabel = 'No access',
  cornerLabel = ['Resource', 'vs. platform role'],
  legend = true,
}: AccessMatrixProps) {
  const nRoles = roles.length
  const nRes = resources.length

  const legendH = legend ? 40 : 0
  const headerH = snap(Math.min(52, Math.max(40, height * 0.13)))
  const headGap = 8
  const colGap = 8

  /* Rows fill whatever is left, so the grid always meets the bottom of the well.
     The 4px gap inside the stride is what keeps the rows legible as rows rather
     than as one ruled block. */
  const gridTop = headerH + headGap
  const gridH = height - legendH - gridTop
  const rowStride = floor4(gridH / nRes)
  const rowH = rowStride - 4

  /* FLOOR to the grid rather than round, for the two dimensions that are divided
     by a count. `snap()` rounds, and rounding up 4 columns by 2px each put the
     right-hand banner 1px past the well and the artboard check flagged it. A
     column grid must never round outward — it can only give the remainder back
     as slack at the end. */
  const resColW = snap(Math.max(180, Math.min(300, width * 0.24)))
  const roleColW = floor4((width - resColW - nRoles * colGap) / nRoles)
  const roleColX = (j: number) => snap(resColW + colGap + j * (roleColW + colGap))
  const rowY = (k: number) => snap(gridTop + k * rowStride)

  const byKey = new Map(cells.map((c) => [`${c.row}:${c.col}`, c]))
  const usedLevels = new Set<AccessLevel>()
  for (let k = 0; k < nRes; k++) {
    for (let j = 0; j < nRoles; j++) {
      const c = byKey.get(`${k}:${j}`)
      if (!c?.focal) usedLevels.add(c?.level ?? 'none')
    }
  }
  const hasFocal = cells.some((c) => c.focal)

  const LEVEL_LABEL: Record<AccessLevel, string> = {
    full: 'Full control',
    write: 'Read + write',
    read: 'Read only',
    conditional: 'Conditional',
    none: 'Denied',
  }
  const legendItems = (['full', 'write', 'read', 'conditional', 'none'] as AccessLevel[])
    .filter((l) => usedLevels.has(l))
    .map((l) => ({ label: LEVEL_LABEL[l], ...levelStyle(l) }))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Access matrix"
      data-diagram="access-matrix"
    >
      {/* 1. Corner cell — names the two axes, so the grid needs no caption. */}
      <rect
        x={0}
        y={0}
        width={resColW}
        height={headerH}
        rx={6}
        fill={role.paper}
        stroke={withAlpha(role.ink, 0.12)}
        strokeWidth={0.8}
      />
      <DiagramText x={12} y={headerH / 2 - 7} variant="nodeName" tone="ink">
        {cornerLabel[0]}
      </DiagramText>
      <DiagramText x={12} y={headerH / 2 + 9} variant="sublabel" tone="muted">
        {cornerLabel[1]}
      </DiagramText>

      {/* 2. Role banners. Ink-filled, so the columns read as headings at a
             glance and the coloured cells below them stay the only chroma. */}
      {roles.map((r, j) => (
        <g key={r.name}>
          <rect x={roleColX(j)} y={0} width={roleColW} height={headerH} rx={6} fill={role.ink} />
          <text
            x={roleColX(j) + roleColW / 2}
            y={headerH / 2 - (r.code ? 7 : 0)}
            fill={role.paper}
            fontFamily={diagramType.family}
            fontSize={diagramType.nodeName.size}
            fontWeight={diagramType.nodeName.weight}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {r.name}
          </text>
          {r.code && (
            <text
              x={roleColX(j) + roleColW / 2}
              y={headerH / 2 + 9}
              fill={withAlpha(role.paper, 0.8)}
              fontFamily={diagramType.family}
              fontSize={diagramType.sublabel.size}
              fontWeight={diagramType.sublabel.weight}
              letterSpacing={`${diagramType.sublabel.tracking}em`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {r.code}
            </text>
          )}
        </g>
      ))}

      {/* 3. Resource label cells. Name left, hint right — the hint is the
             qualifier ("guest PII", "S3 prefix") and belongs at the far edge so
             the names stay a scannable column. */}
      {resources.map((res, k) => (
        <g key={res.name}>
          <rect
            x={0}
            y={rowY(k)}
            width={resColW}
            height={rowH}
            rx={4}
            fill={role.paper}
            stroke={withAlpha(role.ink, 0.12)}
            strokeWidth={0.8}
          />
          <DiagramText x={12} y={rowY(k) + rowH / 2} variant="nodeName" tone="ink">
            {res.name}
          </DiagramText>
          {res.hint && (
            <DiagramText
              x={resColW - 12}
              y={rowY(k) + rowH / 2}
              variant="sublabel"
              tone="soft"
              anchor="end"
              uppercase
            >
              {res.hint}
            </DiagramText>
          )}
        </g>
      ))}

      {/* 4. Value cells. `rx=4` deliberately: the geometry gate reads an opaque
             `rx=2` rect paired with one text as an arrow-label mask, and 96 of
             those would have every cell reporting itself as a rule-6 violation. */}
      {resources.map((_, k) =>
        roles.map((_r, j) => {
          const c = byKey.get(`${k}:${j}`)
          const focal = Boolean(c?.focal)
          const s = focal
            ? { fill: role.accentTint, stroke: role.accent, text: role.accentDeep, weight: 600 }
            : levelStyle(c?.level ?? 'none')
          const cx = roleColX(j) + roleColW / 2
          const cy = rowY(k) + rowH / 2
          return (
            <g key={`${k}-${j}`}>
              <rect
                x={roleColX(j)}
                y={rowY(k)}
                width={roleColW}
                height={rowH}
                rx={4}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={focal ? 1.4 : 0.6}
              />
              <text
                x={cx}
                y={c?.sub ? cy - 7 : cy}
                fill={s.text}
                fontFamily={diagramType.family}
                fontSize={11}
                fontWeight={s.weight}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {c?.value ?? noneLabel}
              </text>
              {c?.sub && (
                <text
                  x={cx}
                  y={cy + 8}
                  fill={withAlpha(focal ? role.accent : role.muted, 0.9)}
                  fontFamily={diagramType.family}
                  fontSize={diagramType.sublabel.size}
                  fontWeight={diagramType.sublabel.weight}
                  letterSpacing={`${diagramType.sublabel.tracking}em`}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {c.sub}
                </text>
              )}
            </g>
          )
        })
      )}

      {/* 5. Legend — only the levels actually used, plus the focal rule if there
             is one. Swatches are the CELL styles, not saturated blocks: a legend
             whose chips do not match the grid is a second colour system. */}
      {legend && (
        <g>
          <line
            x1={0}
            y1={height - legendH + 6}
            x2={width}
            y2={height - legendH + 6}
            stroke={role.rule}
            strokeWidth={0.8}
          />
          {[...legendItems, ...(hasFocal ? [{ label: 'The rule under review', fill: role.accentTint, stroke: role.accent }] : [])].map(
            (it, i) => {
              const step = Math.min(200, width / Math.max(legendItems.length + (hasFocal ? 1 : 0), 1))
              const x = snap(i * step)
              const y = height - legendH + 22
              return (
                <g key={it.label}>
                  <rect x={x} y={y - 6} width={14} height={12} rx={3} fill={it.fill} stroke={it.stroke} strokeWidth={1} />
                  <DiagramText x={x + 22} y={y} variant="legend" tone="muted" uppercase>
                    {it.label}
                  </DiagramText>
                </g>
              )
            }
          )}
        </g>
      )}
    </svg>
  )
}
