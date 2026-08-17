import { useId } from 'react'
import {
  ArrowLabel,
  Connector,
  Legend,
  NodeBox,
  snap,
  type LegendItem,
  type NodeKind,
} from './primitives'

/**
 * Diagram — Tree / Hierarchy. Root at the top, children fanning out below.
 *
 * The type for taxonomy, dependency and decision breakdowns — "what is a kind of
 * what", not "what talks to what". If the nodes are people or accountable owners
 * it is an ORG CHART instead (OrgChart.tsx, which imports the layout below): a
 * tree shows structure, an org chart shows responsibility.
 *
 * THE LAYOUT MEASURES ITSELF. `measure()` returns a subtree's width as
 * `max(nodeWidth, Σ children + gaps)`, and `place()` centres each parent over the
 * block its children occupy. That recursion is the whole reason this is a
 * component and not an SVG: adding a leaf widens its parent's subtree, which
 * re-flows every sibling to its right and re-centres every ancestor above it. No
 * story contains a coordinate.
 *
 * CONNECTORS ARE A BUS, NOT N ELBOWS. Upstream's tree spec is explicit — the
 * parent drops one short vertical, a horizontal bus spans the siblings, and each
 * child takes a vertical drop into its top edge. `treeRouting()` draws that as
 * one trunk, one arch with r=8 quarter-arcs at both corners, and one straight
 * drop per interior child. Three pieces rather than one path per child, because a
 * path per child would redraw the shared trunk N times — two connectors on one
 * stroke is upstream rule 3. Every segment is axis-aligned, so this cannot emit a
 * diagonal.
 *
 * CONNECTORS ARE HEADLESS. Direction in a tree is carried by position: the root
 * is at the top and the hierarchy runs down. An arrowhead on a bus would also
 * have to land on one arm of the arch and not the other, which reads worse than
 * none at all.
 */

/* ---------------------------------------------------------- shared layout */

/** The minimum a node must be for `layoutTree` to place it: an id and children.
 *  Both Tree and OrgChart widen this with their own content fields. */
export interface TreeLayoutNode {
  id: string
  children?: TreeLayoutNode[]
}

export interface TreeLayoutOptions {
  width: number
  /** Height of the drawing area — legend and footer strips already subtracted. */
  height: number
  /** Horizontal gap between siblings. */
  nodeGap?: number
  nodeHeight?: number
  /** Cap on a node's width, so a 2-leaf tree does not draw two banners. */
  maxNodeWidth?: number
  /** Root width as a multiple of the node width. Upstream allows two widths in
   *  one tree and no more; this is the second. */
  rootScale?: number
}

export interface TreePlacement<T> {
  node: T
  depth: number
  x: number
  y: number
  w: number
  h: number
  /** Centre of the node's bottom edge, where its trunk leaves. */
  cx: number
}

/**
 * Places a hierarchy in a box. Returns every node with grid-snapped geometry.
 *
 * Node width is derived from the LEAF COUNT, because the widest level of a tree
 * is always its leaves: `(width − gaps) / leaves`, clamped. Row pitch is derived
 * from the depth. So the same tree fills a 380px well and a 460px well without a
 * story changing anything.
 */
export function layoutTree<T extends TreeLayoutNode>(
  root: T,
  {
    width,
    height,
    nodeGap = 24,
    nodeHeight = 56,
    maxNodeWidth = 184,
    rootScale = 1.3,
  }: TreeLayoutOptions
): { placed: TreePlacement<T>[]; nodeW: number; depth: number } {
  const leaves = countLeaves(root)
  const depth = maxDepth(root)

  const nodeW = snap(
    Math.max(88, Math.min(maxNodeWidth, (width - nodeGap * (leaves - 1)) / Math.max(leaves, 1)))
  )
  const rootW = snap(Math.min(nodeW * rootScale, 288))
  const ownWidth = (d: number) => (d === 0 ? rootW : nodeW)

  const rowGap = depth > 1 ? (height - depth * nodeHeight) / (depth - 1) : 0
  const rowY = (d: number) => snap(d * (nodeHeight + rowGap))

  const measure = (n: TreeLayoutNode, d: number): number => {
    const kids = n.children ?? []
    if (!kids.length) return ownWidth(d)
    const inner = kids.reduce((sum, k) => sum + measure(k, d + 1), 0) + nodeGap * (kids.length - 1)
    return Math.max(ownWidth(d), inner)
  }

  const placed: TreePlacement<T>[] = []
  const place = (n: T, left: number, d: number) => {
    const block = measure(n, d)
    const w = ownWidth(d)
    const x = snap(left + (block - w) / 2)
    placed.push({ node: n, depth: d, x, y: rowY(d), w, h: nodeHeight, cx: snap(x + w / 2) })
    let cursor = left
    for (const kid of (n.children ?? []) as T[]) {
      place(kid, cursor, d + 1)
      cursor += measure(kid, d + 1) + nodeGap
    }
  }

  /* Centre the whole block, so a lopsided tree is not left-heavy on the slide. */
  place(root, Math.max(0, (width - measure(root, 0)) / 2), 0)
  return { placed, nodeW, depth }
}

/**
 * The bus for every parent in a placement.
 *
 * `drops` gives the midpoint of each child's own vertical drop, which is the only
 * place a branch label may go: it is inside the row gap, so by construction no
 * node box can cover the label's mask (upstream rule 6).
 */
export function treeRouting<T extends TreeLayoutNode>(
  placed: TreePlacement<T>[]
): { strokes: string[]; drops: Map<string, { x: number; y: number }> } {
  const byId = new Map(placed.map((p) => [p.node.id, p]))
  const strokes: string[] = []
  const drops = new Map<string, { x: number; y: number }>()

  for (const p of placed) {
    const kids = ((p.node.children ?? []) as T[])
      .map((k) => byId.get(k.id))
      .filter((k): k is TreePlacement<T> => Boolean(k))
    if (!kids.length) continue

    const top = p.y + p.h
    const childTop = kids[0].y
    /* Halfway down the row gap: where a reader expects the bus, and far enough
       from both rows for an r=8 arc at each end. */
    const busY = snap(top + (childTop - top) / 2)
    strokes.push(...busPaths(p.cx, top, busY, kids.map((k) => k.cx), childTop))
    for (const k of kids) drops.set(k.node.id, { x: k.cx, y: (busY + childTop) / 2 })
  }

  return { strokes, drops }
}

/* -------------------------------------------------------------- component */

export interface TreeNode extends TreeLayoutNode {
  id: string
  name: string
  sublabel?: string
  kind?: NodeKind
  /** Annotation on the connector from the parent — YES / NO / OVERFLOW. */
  edgeLabel?: string
  children?: TreeNode[]
}

export interface TreeProps extends Omit<TreeLayoutOptions, 'height'> {
  height: number
  root: TreeNode
  legend?: LegendItem[]
}

export function Tree({ width, height, root, legend, ...layout }: TreeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const legendH = legend?.length ? 52 : 0
  const drawH = height - legendH

  const { placed } = layoutTree(root, { nodeHeight: 56, ...layout, width, height: drawH })
  const { strokes, drops } = treeRouting(placed)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label="Tree diagram"
      /* Required on every ported type — see the note in Architecture.tsx. */
      data-diagram="tree"
    >
      {/* Connectors BEFORE nodes, so every stroke sits behind a box. */}
      {strokes.map((d, i) => (
        <Connector key={i} d={d} headless idPrefix={uid} />
      ))}

      {placed.map((p) => (
        <NodeBox
          key={p.node.id}
          x={p.x}
          y={p.y}
          w={p.w}
          h={p.h}
          kind={p.node.kind}
          name={p.node.name}
          sublabel={p.node.sublabel}
        />
      ))}

      {/* Labels last: the mask must interrupt the stroke but lose to the nodes,
          which is why it is only ever placed in a row gap. */}
      {placed.map((p) => {
        const at = drops.get(p.node.id)
        if (!p.node.edgeLabel || !at) return null
        return (
          <ArrowLabel key={`l-${p.node.id}`} x={at.x} y={at.y} text={p.node.edgeLabel} side="right" />
        )
      })}

      {legend?.length ? <Legend x={0} y={drawH + 8} width={width} items={legend} /> : null}
    </svg>
  )
}

/* --------------------------------------------------------------- geometry */

function countLeaves(n: TreeLayoutNode): number {
  const kids = n.children ?? []
  if (!kids.length) return 1
  return kids.reduce((sum, k) => sum + countLeaves(k), 0)
}

function maxDepth(n: TreeLayoutNode): number {
  const kids = n.children ?? []
  if (!kids.length) return 1
  return 1 + Math.max(...kids.map(maxDepth))
}

/**
 * The three-piece bus: trunk, arch, interior drops.
 *
 * Returns `d` strings rather than elements so the caller keeps z-order in one
 * place. Every segment is axis-aligned and every corner is a quarter-arc, which
 * is what makes the geometry gate's diagonal test pass by construction rather
 * than by inspection.
 */
function busPaths(
  px: number,
  parentBottom: number,
  busY: number,
  xs: number[],
  childTop: number,
  r = 8
): string[] {
  /* One child, straight below: a single vertical line — the one case where a
     straight segment is the correct answer. */
  if (xs.length === 1 && Math.abs(xs[0] - px) < 0.5) {
    return [`M ${px} ${parentBottom} L ${px} ${childTop}`]
  }

  /* One child, offset: one path, two arcs — down, across, down. */
  if (xs.length === 1) {
    const cx = xs[0]
    const s = Math.sign(cx - px)
    const rr = Math.min(r, Math.abs(cx - px) / 2, (busY - parentBottom) / 2, (childTop - busY) / 2)
    return [
      [
        `M ${px} ${parentBottom}`,
        `L ${px} ${busY - rr}`,
        `Q ${px} ${busY} ${px + s * rr} ${busY}`,
        `L ${cx - s * rr} ${busY}`,
        `Q ${cx} ${busY} ${cx} ${busY + rr}`,
        `L ${cx} ${childTop}`,
      ].join(' '),
    ]
  }

  const left = Math.min(...xs)
  const right = Math.max(...xs)
  const rr = Math.min(r, (right - left) / 2, (childTop - busY) / 2)

  const out = [
    /* Trunk: the parent's bottom edge down to the bus. A T-join, so no arc. */
    `M ${px} ${parentBottom} L ${px} ${busY}`,
    /* Arch: up from the leftmost child, across the bus, down to the rightmost.
       ONE path, so both outer corners round without any segment drawn twice. */
    [
      `M ${left} ${childTop}`,
      `L ${left} ${busY + rr}`,
      `Q ${left} ${busY} ${left + rr} ${busY}`,
      `L ${right - rr} ${busY}`,
      `Q ${right} ${busY} ${right} ${busY + rr}`,
      `L ${right} ${childTop}`,
    ].join(' '),
  ]

  /* Interior children: a straight drop off the bus. */
  for (const x of xs) {
    if (x === left || x === right) continue
    out.push(`M ${x} ${busY} L ${x} ${childTop}`)
  }

  return out
}
