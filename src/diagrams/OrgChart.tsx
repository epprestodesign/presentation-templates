import { useId } from 'react'
import {
  Connector,
  DiagramText,
  Legend,
  diagramType,
  nodeStyle,
  role,
  type LegendItem,
  type NodeKind,
} from './primitives'
import { layoutTree, treeRouting, type TreeLayoutNode, type TreeLayoutOptions } from './Tree'

/**
 * Diagram — Org Chart / Responsibility Map. Who owns what, and how to reach them.
 *
 * The distinction from Tree.tsx is the whole reason this file exists, and it is
 * upstream's: a TREE shows generic hierarchy, an ORG CHART shows responsibility.
 * If the nodes are people, teams, queues or accountable owners, the reader's
 * question is not "what is a kind of what" but "who picks this up, and how do I
 * hand it to them" — so every node carries three things instead of one:
 *
 *   1. NAME    — the role or team.
 *   2. INVOKE  — the channel, queue or handle that reaches it.
 *   3. SCOPE   — 2–4 terse ownership words. Never a sentence.
 *
 * GEOMETRY IS BORROWED, NOT COPIED. `layoutTree` and `treeRouting` live in
 * Tree.tsx and are imported here, so the subtree measurement, the row pitch and
 * the parent-drop → bus → child-drop routing are literally the same code. An org
 * chart that re-implemented them would drift, and the two types would stop
 * looking like one library after the first fix landed in only one of them.
 *
 * THREE THINGS THIS ADDS OVER Tree:
 *
 *  1. A THREE-ROW NODE. `NodeBox` centres a name + sublabel pair, which is two
 *     rows; invoke and scope make three. Rather than widen the shared primitive
 *     for one caller, the node is composed here from the same `nodeStyle` fills
 *     and the same type scale — so it is a different arrangement of the system,
 *     not a second system.
 *  2. GAPS ARE DRAWN, NOT HIDDEN. An owner that is not yet staffed or not yet
 *     wired up gets `kind: 'optional'` — dashed, faint, still in position.
 *     Upstream is emphatic about this and it is right: a missing route is
 *     operationally the most important thing on the chart, and deleting the box
 *     makes the chart lie.
 *  3. AN ESCALATION STRIP. Escalation and approval rules are NOT org nodes —
 *     they are a rule about the chart, so they sit in a strip beneath it. Adding
 *     "if unresolved in 30 minutes" as a box would imply someone reports to it.
 *
 * The focal rule is upstream's hardest limit here: exactly ONE accent node, and
 * it is the front door — whoever receives work that has not been triaged yet.
 */

/* ------------------------------------------------------------------- shapes */

export interface OrgNode extends TreeLayoutNode {
  id: string
  /** Role, team or queue. Invented titles only — never a real person. */
  name: string
  /** How work reaches it: a channel, a queue, an issue prefix. */
  invoke?: string
  /** 2–4 terse ownership words. */
  scope?: string
  /** `focal` for the front door, `optional` for a gap. */
  kind?: NodeKind
  children?: OrgNode[]
}

export interface OrgChartProps extends Omit<TreeLayoutOptions, 'height'> {
  height: number
  root: OrgNode
  /** The rule about the chart — escalation, approval, out-of-hours. Never a node. */
  escalation?: { label: string; text: string }
  legend?: LegendItem[]
}

/* ---------------------------------------------------------------- component */

export function OrgChart({ width, height, root, escalation, legend, ...layout }: OrgChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  /* Both strips are reserved BEFORE layout, so the tree is placed in what is
     actually left rather than being drawn over them. */
  const legendH = legend?.length ? 52 : 0
  const escH = escalation ? 38 : 0
  const drawH = height - legendH - escH

  const { placed } = layoutTree(root, {
    nodeHeight: 72,
    maxNodeWidth: 200,
    ...layout,
    width,
    height: drawH,
  })
  const { strokes } = treeRouting(placed)

  const escY = drawH + 22
  const escLabelW = escalation ? escalation.label.length * diagramType.eyebrow.size * 0.78 + 22 : 0

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Organisation and responsibility chart"
      /* Required on every ported type — see the note in Architecture.tsx. */
      data-diagram="org-chart"
    >
      {/* Connectors BEFORE nodes, so every stroke sits behind a box. Headless,
          because a reporting line's direction is carried by position. */}
      {strokes.map((d, i) => (
        <Connector key={i} d={d} tone="soft" headless idPrefix={uid} />
      ))}

      {placed.map((p) => (
        <OrgNodeBox key={p.node.id} x={p.x} y={p.y} w={p.w} h={p.h} node={p.node} />
      ))}

      {/* The rule about the chart, on its own strip. Accent on the label only —
          the strip must not compete with the front door for the eye. */}
      {escalation && (
        <g>
          <line
            x1={0}
            y1={drawH + 8}
            x2={width}
            y2={drawH + 8}
            stroke={role.rule}
            strokeWidth={0.8}
          />
          <DiagramText x={0} y={escY} variant="eyebrow" tone="accent" uppercase>
            {escalation.label}
          </DiagramText>
          <DiagramText x={escLabelW} y={escY} variant="sublabel" tone="muted">
            {escalation.text}
          </DiagramText>
        </g>
      )}

      {legend?.length ? <Legend x={0} y={drawH + escH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/* --------------------------------------------------------------------- node */

/**
 * A three-row responsibility node.
 *
 * The rows are stacked on a single pitch and the block is centred, so a node
 * carrying only a name and a node carrying all three agree on their optical
 * middle — which is what stops a chart with mixed detail from looking ragged.
 * Nothing here invents a treatment: fills and strokes come from `nodeStyle`,
 * sizes from `diagramType`.
 */
function OrgNodeBox({
  x,
  y,
  w,
  h,
  node,
}: {
  x: number
  y: number
  w: number
  h: number
  node: OrgNode
}) {
  const kind = node.kind ?? 'step'
  const s = nodeStyle[kind]
  const dash = 'dash' in s ? (s.dash as string) : undefined
  const cx = x + w / 2
  const cy = y + h / 2

  const rows: { text: string; variant: 'nodeName' | 'sublabel'; tone: 'ink' | 'muted' | 'soft' | 'accentDeep' }[] = [
    { text: node.name, variant: 'nodeName', tone: kind === 'optional' ? 'muted' : 'ink' },
  ]
  if (node.invoke) {
    rows.push({
      text: node.invoke,
      variant: 'sublabel',
      /* The invocation path is the actionable line on a focal node, so it takes
         the deep accent — legible against the tint, unlike `accent` itself. */
      tone: kind === 'focal' ? 'accentDeep' : 'muted',
    })
  }
  if (node.scope) rows.push({ text: node.scope, variant: 'sublabel', tone: 'soft' })

  const PITCH = 17
  const top = cy - ((rows.length - 1) * PITCH) / 2

  return (
    <g>
      {/* 1. Opaque paper mask, so a reporting line behind a translucent fill
             cannot show through. Same order as NodeBox. */}
      <rect x={x} y={y} width={w} height={h} rx={6} fill={role.paper} />

      {/* 2. The styled box. */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={1}
        {...(dash ? { strokeDasharray: dash } : {})}
      />

      {/* 3. Name, invoke, scope. */}
      {rows.map((r, i) => (
        <DiagramText
          key={i}
          x={cx}
          y={top + i * PITCH}
          variant={r.variant}
          tone={r.tone}
          anchor="middle"
        >
          {r.text}
        </DiagramText>
      ))}

    </g>
  )
}
