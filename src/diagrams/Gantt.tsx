import {
  ArrowLabel,
  DiagramText,
  Legend,
  Zone,
  diagramType,
  role,
  snap,
  withAlpha,
  type LegendItem,
} from './primitives'

/**
 * Diagram — Gantt. Tasks with a start and an end, grouped into phases.
 *
 * Reach for it when the reader needs to see OVERLAP: what runs in parallel, what
 * blocks what, and where the plan is thickest. A list of dated tasks does not
 * show that; bars on a shared time axis do.
 *
 * LAYOUT IS DERIVED. The label column is a share of the width (capped, so a wide
 * slide does not spend 400px on task names), the plot is what remains, and the
 * pitch is `plotW / units`. Row height falls out of the height actually
 * available divided by the rows actually present, clamped so a three-task plan
 * does not draw 90px bars and a twelve-task plan stays legible. Add a task and
 * its phase re-flows; nothing downstream needs new coordinates.
 *
 * NO DEPENDENCY ARROWS. Upstream lists them as a v1 anti-pattern and it is the
 * right call: arrows between bars on a dense grid are unreadable, and the bar
 * positions already carry the sequencing. So this type emits no <path> at all —
 * bars, tracks, gridlines and the today marker are all shapes and rules.
 *
 * Two deliberate departures from the upstream spec:
 *
 *  1. TASK NAMES LIVE IN THE LEFT COLUMN ONLY. Upstream also prints the name
 *     inside the bar. At EventPipe's task-name lengths a two-week bar is 90px
 *     wide and the name is clipped, so the column carries the name and the bar
 *     carries an optional short `meta` set outside its right edge instead.
 *  2. A MILESTONE IS A ROTATED SQUARE, NOT A PATH. A diamond drawn as a <path>
 *     is four diagonal segments, which the geometry gate reads — correctly — as
 *     diagonal connectors. A <rect> with a rotate transform is the same mark
 *     with none of the ambiguity.
 */

export interface GanttTask {
  name: string
  /** Unit index the bar starts on, 0-based and inclusive. */
  start: number
  /** Unit index the bar ends on, exclusive. Ignored for a milestone. */
  end: number
  /** Short note set outside the bar's right edge — owner, duration, gate. */
  meta?: string
  /** `focal` is the accent. One, at most two, per plan. `milestone` draws a mark
   *  at `start` instead of a bar. */
  kind?: 'task' | 'focal' | 'milestone'
}

export interface GanttPhase {
  /** Uppercase, ≤14 characters. Rendered in the phase band's header. */
  label?: string
  tasks: GanttTask[]
}

export interface GanttProps {
  width: number
  height: number
  phases: GanttPhase[]
  /** One label per unit column — weeks, sprints, months. Centred in its column,
   *  which is honest for a bar that occupies whole units. */
  units: string[]
  /** Eyebrow over the label column, naming the unit. */
  unitLabel?: string
  /** Dashed vertical rule with a masked label, e.g. today or a go-live gate. */
  marker?: { at: number; label: string }
  legend?: LegendItem[]
}

/* Every constant below is a multiple of 4, so the whole vertical stack lands on
   the grid without a single snap() call having to correct it. */

/** Unit labels plus the hairline that closes the axis header. */
const HEADER_H = 32
/** Phase band header, sized for the Zone label's eyebrow. */
const PHASE_HEAD = 24
/** Padding below the last row inside a phase band. */
const PHASE_FOOT = 8
const PHASE_GAP = 12
const ROW_MIN = 24
const ROW_MAX = 44
const BAR_MAX = 24
/** Band the marker's label sits in, below every phase. */
const MARKER_BAND = 24

/** Row height rounds DOWN to the grid, never up.
 *
 *  snap() rounds to nearest, and rounding a row up multiplies by the row count:
 *  a 30.3px fair share became 32, and seven rows then ran 12px past the well's
 *  floor. Anything derived by dividing available space has to floor. */
const floorGrid = (n: number) => Math.floor(n / 4) * 4

export function Gantt({
  width,
  height,
  phases,
  units,
  unitLabel,
  marker,
  legend,
}: GanttProps) {
  const legendH = legend?.length ? 52 : 0
  const markerH = marker ? MARKER_BAND : 0
  const drawH = height - legendH

  /* --- columns -----------------------------------------------------------
     PLOT_INSET is not decoration. Without it a task running to the end of the
     plan ends exactly on the phase band's right border, its stroke merges with
     the band's rounded corner, and the bar reads as running off the slide —
     which is the opposite of "this finishes in the last week". 8px of air is
     enough for the bar to visibly stop. */
  const PLOT_INSET = 8
  const labelW = snap(Math.min(232, Math.max(140, width * 0.2)))
  const plotX = labelW
  const plotW = width - labelW - PLOT_INSET
  const pitch = plotW / Math.max(units.length, 1)
  /** Left edge of unit column `i`; also its boundary gridline. */
  const unitX = (i: number) => plotX + i * pitch

  /* --- rows -------------------------------------------------------------- */
  const rowCount = phases.reduce((n, p) => n + p.tasks.length, 0)
  const headers = phases.filter((p) => p.label).length
  const chrome =
    HEADER_H + markerH + headers * PHASE_HEAD + phases.length * (PHASE_FOOT + PHASE_GAP) - PHASE_GAP
  const rowH = floorGrid(
    Math.max(ROW_MIN, Math.min(ROW_MAX, (drawH - chrome) / Math.max(rowCount, 1)))
  )
  const barH = Math.min(BAR_MAX, rowH - 10)

  /* Walk the phases once, banding as we go. Every y below comes out of this
     pass, which is what keeps a re-ordered plan from needing new numbers. */
  interface Band {
    label?: string
    y: number
    h: number
    rows: { task: GanttTask; y: number }[]
  }
  let cursorY = HEADER_H
  const bands: Band[] = phases.map((p) => {
    const head = p.label ? PHASE_HEAD : 0
    const h = head + p.tasks.length * rowH + PHASE_FOOT
    const band: Band = {
      label: p.label,
      y: snap(cursorY),
      h: snap(h),
      rows: p.tasks.map((task, i) => ({ task, y: snap(cursorY + head + i * rowH) })),
    }
    cursorY += h + PHASE_GAP
    return band
  })
  const plotBottom = snap(cursorY - PHASE_GAP)

  const rows = bands.flatMap((b) => b.rows)

  /* --- centre the whole chart in the well --------------------------------
     Row height is capped, so a four-row roadmap cannot grow to fill 380px of
     well and would otherwise sit hard against the top with 120px of dead space
     under it — top-heavy, and it reads as a chart that got cut off. The offset
     goes on a wrapper <g> so the axis header, the bands and the marker all move
     together; the legend stays put, because it belongs to the bottom edge. */
  const topOffset = floorGrid(Math.max(0, (drawH - markerH - plotBottom) / 2))

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Gantt chart"
      data-diagram="gantt"
    >
      <g transform={`translate(0, ${topOffset})`}>
      {/* --- axis header ------------------------------------------------- */}
      {unitLabel && (
        <DiagramText x={0} y={HEADER_H - 18} variant="eyebrow" tone="soft" uppercase>
          {unitLabel}
        </DiagramText>
      )}
      {units.map((u, i) => (
        <text
          key={`${u}-${i}`}
          x={unitX(i) + pitch / 2}
          y={HEADER_H - 18}
          fill={role.soft}
          fontFamily={diagramType.family}
          fontSize={diagramType.eyebrow.size}
          fontWeight={diagramType.eyebrow.weight}
          letterSpacing={`${diagramType.eyebrow.tracking}em`}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {u.toUpperCase()}
        </text>
      ))}
      <line
        x1={0}
        y1={HEADER_H - 6}
        x2={width}
        y2={HEADER_H - 6}
        stroke={role.ruleSolid}
        strokeWidth={1}
      />

      {/* --- phase bands, painted first so everything else lands on top --- */}
      {bands.map((b, i) => (
        <Zone key={i} x={0} y={b.y} w={width} h={b.h} label={b.label} />
      ))}

      {/* --- the time grid -----------------------------------------------
          `units.length + 1` lines, not `units.length`: a boundary per column
          edge INCLUDING the far one. Without the closing rule the last column
          has no right-hand edge and the axis reads as open-ended. */}
      {Array.from({ length: units.length + 1 }, (_, i) => (
        <line
          key={`grid-${i}`}
          x1={unitX(i)}
          y1={HEADER_H - 6}
          x2={unitX(i)}
          y2={plotBottom}
          stroke={role.rule}
          strokeWidth={0.8}
        />
      ))}
      {/* The label column's edge is the one rule that has to hold against the
          phase fills, so it is ruleSolid rather than a gridline. */}
      <line
        x1={plotX}
        y1={HEADER_H - 6}
        x2={plotX}
        y2={plotBottom}
        stroke={role.ruleSolid}
        strokeWidth={1}
      />

      {/* --- rows: name, then bar or milestone ---------------------------- */}
      {rows.map(({ task, y }, i) => {
        const focal = task.kind === 'focal'
        const milestone = task.kind === 'milestone'
        const cy = y + rowH / 2
        const bx = snap(unitX(task.start))
        const bw = snap(Math.max((task.end - task.start) * pitch, pitch * 0.4))
        const by = snap(cy - barH / 2)
        const metaX = milestone ? bx + 14 : bx + bw + 10

        return (
          /* ONE rect per row group, at rx=4. Both facts matter to the geometry
             gate: two rects in a group is how it recognises a NODE box, and a
             single rx=2 rect beside a single text is how it recognises a LABEL
             MASK. A bar is neither, so it must not present as either — which is
             why it is never given a paper mask rect of its own. It does not need
             one: nothing is drawn behind a bar but the phase fill and the
             gridlines, and both are meant to show through a 15% fill. */
          <g key={`${task.name}-${i}`}>
            <text
              x={12}
              y={cy}
              fill={focal ? role.accentDeep : role.ink}
              fontFamily={diagramType.family}
              fontSize={diagramType.nodeName.size}
              fontWeight={diagramType.nodeName.weight}
              dominantBaseline="central"
            >
              {task.name}
            </text>

            {milestone ? (
              <rect
                x={bx - 6}
                y={cy - 6}
                width={12}
                height={12}
                rx={1}
                transform={`rotate(45 ${bx} ${cy})`}
                fill={role.accent}
                stroke={role.accentDeep}
                strokeWidth={1}
              />
            ) : (
              <rect
                x={bx}
                y={by}
                width={bw}
                height={barH}
                rx={4}
                fill={focal ? role.accentTint : withAlpha(role.muted, 0.15)}
                stroke={focal ? role.accent : role.muted}
                strokeWidth={1}
              />
            )}

            {task.meta && (
              <text
                x={metaX}
                y={cy}
                fill={focal ? role.accent : role.soft}
                fontFamily={diagramType.family}
                fontSize={diagramType.sublabel.size}
                fontWeight={diagramType.sublabel.weight}
                letterSpacing={`${diagramType.sublabel.tracking}em`}
                dominantBaseline="central"
              >
                {task.meta.toUpperCase()}
              </text>
            )}
          </g>
        )
      })}

      {/* --- marker ------------------------------------------------------ */}
      {marker && (
        <>
          <line
            x1={snap(unitX(marker.at))}
            y1={HEADER_H - 6}
            x2={snap(unitX(marker.at))}
            y2={plotBottom + 8}
            stroke={role.accent}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          {/* Below every band, which is the only guaranteed open canvas on a
              full grid. Flipped to the left half when the marker sits near the
              right edge, so the mask cannot run off the artboard. */}
          <ArrowLabel
            x={snap(unitX(marker.at))}
            y={plotBottom + 8 + MARKER_BAND / 2}
            text={marker.label}
            side={unitX(marker.at) > width * 0.72 ? 'left' : 'right'}
            tone="accent"
          />
        </>
      )}
      </g>

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

export { role }
