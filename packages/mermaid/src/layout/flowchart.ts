import type {
  FlowchartDiagram,
  FlowchartLayout,
  FlowEdge,
  Subgraph,
  PositionedNode,
  PositionedEdge,
  PositionedSubgraph,
  LayoutOptions,
  Size,
} from "../types";
import { measureNode, measureLabel } from "./measure";

const DEFAULT_OPTIONS: LayoutOptions = {
  nodeSpacing: 60,
  rankSpacing: 80,
  nodeWidth: 150,
  nodeHeight: 50,
  nodePadding: 16,
  diagramPadding: 20,
  edgeRouting: "bezier",
};

export function flowchartLayout(
  diagram: FlowchartDiagram,
  options?: Partial<LayoutOptions>,
): FlowchartLayout {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { nodes, edges, subgraphs, direction } = diagram;

  if (nodes.length === 0) {
    return { width: 0, height: 0, viewBox: "0 0 0 0", nodes: [], edges: [], subgraphs: [] };
  }

  // Phase 1: Measure node sizes
  const nodeSizes = new Map<string, Size>();
  for (const node of nodes) {
    nodeSizes.set(node.id, measureNode(node.label, opts));
  }

  // Phase 2: Cycle removal via DFS — mark back edges, then reverse them
  const backEdgeSet = new Set<FlowEdge>();
  const adj = new Map<string, string[]>();
  const visited = new Set<string>();
  const inStack = new Set<string>();

  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) {
    adj.get(edge.source)?.push(edge.target);
  }

  function dfs(node: string): void {
    visited.add(node);
    inStack.add(node);
    for (const neighbor of adj.get(node) ?? []) {
      if (inStack.has(neighbor)) {
        const edge = edges.find((e) => e.source === node && e.target === neighbor);
        if (edge) backEdgeSet.add(edge);
      } else if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    inStack.delete(node);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) dfs(node.id);
  }

  // Every edge is either kept or reversed — no edges are lost
  const safeEdges: FlowEdge[] = edges.map((edge) =>
    backEdgeSet.has(edge) ? { ...edge, source: edge.target, target: edge.source } : edge,
  );

  // Phase 3: Layer assignment (longest path from sources via topological BFS)
  const layers = new Map<string, number>();
  const safeAdj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    safeAdj.set(node.id, []);
    inDegree.set(node.id, 0);
  }
  for (const edge of safeEdges) {
    safeAdj.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const node of nodes) {
    if ((inDegree.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
      layers.set(node.id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layers.get(current) ?? 0;
    for (const neighbor of safeAdj.get(current) ?? []) {
      const existingLayer = layers.get(neighbor) ?? -1;
      layers.set(neighbor, Math.max(existingLayer, currentLayer + 1));
      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 1) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  for (const node of nodes) {
    if (!layers.has(node.id)) layers.set(node.id, 0);
  }

  // Phase 4: Group nodes by layer
  const maxLayer = Math.max(...Array.from(layers.values()), 0);
  const layerGroups: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
  for (const node of nodes) {
    const layer = layers.get(node.id) ?? 0;
    layerGroups[layer]!.push(node.id);
  }

  // Phase 5: Subgraph-aware barycenter ordering — 4-pass bidirectional
  const nodeSubgraph = new Map<string, string>();
  for (const sg of subgraphs) {
    mapNodesToSubgraph(sg, nodeSubgraph);
  }

  // Build parent/child adjacency from safe edges
  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const node of nodes) {
    parents.set(node.id, []);
    children.set(node.id, []);
  }
  for (const edge of safeEdges) {
    children.get(edge.source)?.push(edge.target);
    parents.get(edge.target)?.push(edge.source);
  }

  for (let pass = 0; pass < 4; pass++) {
    if (pass % 2 === 0) {
      // Top-down sweep
      for (let l = 1; l <= maxLayer; l++) {
        orderLayerByBarycenter(layerGroups[l]!, layerGroups[l - 1]!, parents, nodeSubgraph);
      }
    } else {
      // Bottom-up sweep
      for (let l = maxLayer - 1; l >= 0; l--) {
        orderLayerByBarycenter(layerGroups[l]!, layerGroups[l + 1]!, children, nodeSubgraph);
      }
    }
  }

  // Phase 5.5: Variable rank positions with subgraph-aware spacing
  const isVertical = direction === "TB" || direction === "TD" || direction === "BT";
  const sgLayerRanges = computeSubgraphLayerRanges(subgraphs, layers);
  const allSubgraphs = flattenSubgraphs(subgraphs);
  const rankNodeDim = isVertical ? opts.nodeHeight : opts.nodeWidth;
  const sgTitleHeight = 20;
  const rankPos: number[] = [0];
  for (let l = 0; l < maxLayer; l++) {
    let overhead = 0;
    for (const sg of allSubgraphs) {
      const range = sgLayerRanges.get(sg.id);
      if (!range || range.minLayer > range.maxLayer) continue;
      if (range.maxLayer === l) overhead += opts.nodePadding;
      if (range.minLayer === l + 1) overhead += opts.nodePadding + sgTitleHeight;
    }
    const extra = overhead > 0 ? Math.max(0, overhead - opts.rankSpacing + opts.nodePadding) : 0;
    rankPos.push(rankPos[l]! + rankNodeDim + opts.rankSpacing + extra);
  }

  // Phase 6: Coordinate assignment with cross-layer median alignment

  // Primary-axis dimension of a node
  const dim = (id: string): number => {
    const size = nodeSizes.get(id)!;
    return isVertical ? size.width : size.height;
  };

  // Spacing between adjacent nodes — extra gap at subgraph boundaries
  const gap = (a: string, b: string): number => {
    const sgA = nodeSubgraph.get(a);
    const sgB = nodeSubgraph.get(b);
    if (sgA !== sgB) {
      return opts.nodeSpacing + opts.nodePadding * 2;
    }
    return opts.nodeSpacing;
  };

  // Initial placement: pack each layer centered at 0
  const pos = new Map<string, number>();
  for (let l = 0; l <= maxLayer; l++) {
    packLayerCentered(layerGroups[l]!, pos, dim, gap);
  }

  // Median alignment passes — 4 alternating top-down/bottom-up sweeps
  for (let pass = 0; pass < 4; pass++) {
    if (pass % 2 === 0) {
      for (let l = 1; l <= maxLayer; l++) {
        alignLayerToMedian(layerGroups[l]!, parents, pos, dim, gap);
      }
    } else {
      for (let l = maxLayer - 1; l >= 0; l--) {
        alignLayerToMedian(layerGroups[l]!, children, pos, dim, gap);
      }
    }
  }

  // Convert 1D primary-axis positions to 2D coordinates
  const nodeLayer = new Map<string, number>();
  for (let l = 0; l <= maxLayer; l++) {
    for (const id of layerGroups[l]!) nodeLayer.set(id, l);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const p = pos.get(node.id) ?? 0;
    const l = nodeLayer.get(node.id) ?? 0;
    if (isVertical) {
      positions.set(node.id, { x: p, y: rankPos[l]! });
    } else {
      positions.set(node.id, { x: rankPos[l]!, y: p });
    }
  }

  // Center and apply padding
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [id, p] of positions) {
    const size = nodeSizes.get(id)!;
    minX = Math.min(minX, p.x - size.width / 2);
    minY = Math.min(minY, p.y - size.height / 2);
    maxX = Math.max(maxX, p.x + size.width / 2);
    maxY = Math.max(maxY, p.y + size.height / 2);
  }

  const offsetX = opts.diagramPadding - minX;
  const offsetY = opts.diagramPadding - minY;
  for (const [, p] of positions) {
    p.x += offsetX;
    p.y += offsetY;
  }

  if (direction === "BT") {
    const totalHeight = maxY - minY;
    for (const [, p] of positions) {
      p.y = totalHeight - (p.y - opts.diagramPadding) + opts.diagramPadding;
    }
  }
  if (direction === "RL") {
    const totalWidth = maxX - minX;
    for (const [, p] of positions) {
      p.x = totalWidth - (p.x - opts.diagramPadding) + opts.diagramPadding;
    }
  }

  // Ensure subgraph bounds stay within positive coordinates
  if (subgraphs.length > 0) {
    let extraShiftX = 0;
    let extraShiftY = 0;
    for (const sg of subgraphs) {
      const sgMin = precomputeSgMin(sg, positions, nodeSizes, opts);
      extraShiftX = Math.max(extraShiftX, opts.diagramPadding - sgMin.minX);
      extraShiftY = Math.max(extraShiftY, opts.diagramPadding - sgMin.minY);
    }
    if (extraShiftX > 0 || extraShiftY > 0) {
      for (const [, p] of positions) {
        p.x += extraShiftX;
        p.y += extraShiftY;
      }
    }
  }

  // Build positioned nodes
  const positionedNodes: PositionedNode[] = nodes.map((node) => {
    const p = positions.get(node.id)!;
    const size = nodeSizes.get(node.id)!;
    return { node, x: p.x, y: p.y, width: size.width, height: size.height };
  });

  // Phase 7: Edge routing
  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const sourcePos = positions.get(edge.source);
    const targetPos = positions.get(edge.target);
    if (!sourcePos || !targetPos) {
      return { edge, path: "M 0 0" };
    }

    const sourceSize = nodeSizes.get(edge.source)!;
    const targetSize = nodeSizes.get(edge.target)!;

    const result = buildEdgePath(sourcePos, targetPos, sourceSize, targetSize, isVertical, opts);

    let labelPosition;
    let labelSize;
    if (edge.label) {
      labelPosition = result.labelMid;
      labelSize = measureLabel(edge.label, opts);
    }

    return { edge, path: result.path, labelPosition, labelSize };
  });

  // Phase 8: Subgraph bounding boxes (recursive — children first, parents expand)
  const positionedSubgraphs: PositionedSubgraph[] = [];

  function layoutSubgraph(sg: Subgraph): PositionedSubgraph {
    const childPositioned: PositionedSubgraph[] = [];
    for (const child of sg.subgraphs ?? []) {
      childPositioned.push(layoutSubgraph(child));
    }

    let sgMinX = Infinity,
      sgMinY = Infinity,
      sgMaxX = -Infinity,
      sgMaxY = -Infinity;

    for (const nodeId of sg.nodes) {
      const p = positions.get(nodeId);
      const size = nodeSizes.get(nodeId);
      if (p && size) {
        sgMinX = Math.min(sgMinX, p.x - size.width / 2);
        sgMinY = Math.min(sgMinY, p.y - size.height / 2);
        sgMaxX = Math.max(sgMaxX, p.x + size.width / 2);
        sgMaxY = Math.max(sgMaxY, p.y + size.height / 2);
      }
    }

    for (const child of childPositioned) {
      sgMinX = Math.min(sgMinX, child.x);
      sgMinY = Math.min(sgMinY, child.y);
      sgMaxX = Math.max(sgMaxX, child.x + child.width);
      sgMaxY = Math.max(sgMaxY, child.y + child.height);
    }

    const padding = opts.nodePadding;
    const positioned: PositionedSubgraph = {
      subgraph: sg,
      x: sgMinX - padding,
      y: sgMinY - padding - 20,
      width: sgMaxX - sgMinX + padding * 2,
      height: sgMaxY - sgMinY + padding * 2 + 20,
    };

    positionedSubgraphs.push(positioned);
    return positioned;
  }

  for (const sg of subgraphs) {
    layoutSubgraph(sg);
  }

  // Final dimensions — compute from actual element extents
  let extMaxX = -Infinity;
  let extMaxY = -Infinity;
  for (const pn of positionedNodes) {
    extMaxX = Math.max(extMaxX, pn.x + pn.width / 2);
    extMaxY = Math.max(extMaxY, pn.y + pn.height / 2);
  }
  for (const psg of positionedSubgraphs) {
    extMaxX = Math.max(extMaxX, psg.x + psg.width);
    extMaxY = Math.max(extMaxY, psg.y + psg.height);
  }

  const diagramWidth = extMaxX + opts.diagramPadding;
  const diagramHeight = extMaxY + opts.diagramPadding;

  return {
    width: diagramWidth,
    height: diagramHeight,
    viewBox: `0 0 ${diagramWidth} ${diagramHeight}`,
    nodes: positionedNodes,
    edges: positionedEdges,
    subgraphs: positionedSubgraphs,
  };
}

// ── Helpers ────────────────────────────────────────────────

/** Map each node to its most immediate (deepest) containing subgraph. */
function mapNodesToSubgraph(sg: Subgraph, out: Map<string, string>): void {
  for (const nodeId of sg.nodes) {
    out.set(nodeId, sg.id);
  }
  for (const child of sg.subgraphs ?? []) {
    mapNodesToSubgraph(child, out);
  }
}

/**
 * Order a layer using barycenter heuristic with subgraph clustering.
 * `neighbors` maps each node to its connected nodes in the reference layer.
 * Nodes in the same subgraph are kept adjacent.
 */
function orderLayerByBarycenter(
  layer: string[],
  refLayer: string[],
  neighborMap: Map<string, string[]>,
  nodeSubgraph: Map<string, string>,
): void {
  const barycenters = new Map<string, number>();

  for (const nodeId of layer) {
    const nbrs = (neighborMap.get(nodeId) ?? []).filter((n) => refLayer.includes(n));
    if (nbrs.length > 0) {
      const sum = nbrs.reduce((s, n) => s + refLayer.indexOf(n), 0);
      barycenters.set(nodeId, sum / nbrs.length);
    }
  }

  // Compute group barycenters for subgraph clustering
  const groupBary = new Map<string, number>();
  for (const nodeId of layer) {
    const sgId = nodeSubgraph.get(nodeId) ?? "";
    if (!groupBary.has(sgId)) {
      const members = layer.filter((n) => (nodeSubgraph.get(n) ?? "") === sgId);
      const connected = members.filter((n) => barycenters.has(n));
      if (connected.length > 0) {
        const avg = connected.reduce((s, n) => s + barycenters.get(n)!, 0) / connected.length;
        groupBary.set(sgId, avg);
      }
    }
  }

  // Stable sort: group barycenter → individual barycenter → original order
  const original = [...layer];
  layer.sort((a, b) => {
    const sgA = nodeSubgraph.get(a) ?? "";
    const sgB = nodeSubgraph.get(b) ?? "";
    if (sgA !== sgB) {
      const ga = groupBary.get(sgA);
      const gb = groupBary.get(sgB);
      if (ga !== undefined && gb !== undefined && ga !== gb) return ga - gb;
      if (ga !== undefined && gb === undefined) return -1;
      if (ga === undefined && gb !== undefined) return 1;
    }
    const ba = barycenters.get(a);
    const bb = barycenters.get(b);
    if (ba !== undefined && bb !== undefined && ba !== bb) return ba - bb;
    if (ba !== undefined && bb === undefined) return -1;
    if (ba === undefined && bb !== undefined) return 1;
    return original.indexOf(a) - original.indexOf(b);
  });
}

/** Pack a layer centered at x=0 with minimum spacing. */
function packLayerCentered(
  layer: string[],
  pos: Map<string, number>,
  dim: (id: string) => number,
  gap: (a: string, b: string) => number,
): void {
  if (layer.length === 0) return;

  let totalWidth = dim(layer[0]!);
  for (let i = 1; i < layer.length; i++) {
    totalWidth += gap(layer[i - 1]!, layer[i]!) + dim(layer[i]!);
  }

  let offset = -totalWidth / 2;
  for (let i = 0; i < layer.length; i++) {
    const id = layer[i]!;
    const d = dim(id);
    if (i > 0) offset += gap(layer[i - 1]!, id);
    pos.set(id, offset + d / 2);
    offset += d;
  }
}

/**
 * Align a layer toward median positions of connected nodes in the reference layer.
 *
 * Conservative approach: each node shifts toward its ideal only within the
 * available slack between its current left and right neighbors. This avoids
 * cascading pushes that break symmetric centering.
 */
function alignLayerToMedian(
  layer: string[],
  neighborMap: Map<string, string[]>,
  pos: Map<string, number>,
  dim: (id: string) => number,
  gap: (a: string, b: string) => number,
): void {
  if (layer.length === 0) return;

  // Compute ideal positions (median of neighbor positions)
  const ideal = new Map<string, number>();
  for (const id of layer) {
    const nbrs = neighborMap.get(id) ?? [];
    if (nbrs.length > 0) {
      const xs = nbrs.map((n) => pos.get(n)!).sort((a, b) => a - b);
      const mid = Math.floor(xs.length / 2);
      ideal.set(id, xs.length % 2 === 1 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2);
    }
  }

  if (ideal.size === 0) return;

  // Shift each node toward its ideal within the slack between neighbors
  for (let i = 0; i < layer.length; i++) {
    const id = layer[i]!;
    const target = ideal.get(id);
    if (target === undefined) continue;

    const halfDim = dim(id) / 2;

    // Left boundary (don't overlap left neighbor)
    let minPos = -Infinity;
    if (i > 0) {
      const leftId = layer[i - 1]!;
      minPos = pos.get(leftId)! + dim(leftId) / 2 + gap(leftId, id) + halfDim;
    }

    // Right boundary (don't overlap right neighbor)
    let maxPos = Infinity;
    if (i < layer.length - 1) {
      const rightId = layer[i + 1]!;
      maxPos = pos.get(rightId)! - dim(rightId) / 2 - gap(id, rightId) - halfDim;
    }

    pos.set(id, Math.max(minPos, Math.min(maxPos, target)));
  }
}

// ── Edge routing ──────────────────────────────────────────

/** Default curvature factor (matches xyflow) */
const DEFAULT_CURVATURE = 0.25;

/**
 * Calculate control-point offset along the primary axis.
 * When distance >= 0 (normal flow), the offset is half the distance.
 * When distance < 0 (backward edge), use a wider curve via sqrt scaling.
 */
function controlOffset(distance: number, curvature: number): number {
  if (distance >= 0) {
    return 0.5 * distance;
  }
  return curvature * 25 * Math.sqrt(-distance);
}

/**
 * Compute the label position on a cubic bezier at t=0.5.
 * Uses the exact bezier midpoint formula instead of a simple linear midpoint.
 */
export function bezierMidpoint(
  sx: number,
  sy: number,
  cx1: number,
  cy1: number,
  cx2: number,
  cy2: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  return {
    x: sx * 0.125 + cx1 * 0.375 + cx2 * 0.375 + tx * 0.125,
    y: sy * 0.125 + cy1 * 0.375 + cy2 * 0.375 + ty * 0.125,
  };
}

function buildEdgePath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  sourceSize: Size,
  targetSize: Size,
  isVertical: boolean,
  opts: LayoutOptions,
): { path: string; labelMid: { x: number; y: number } } {
  let sx: number, sy: number, tx: number, ty: number;

  if (isVertical) {
    sx = source.x;
    sy = source.y + sourceSize.height / 2;
    tx = target.x;
    ty = target.y - targetSize.height / 2;

    if (source.y > target.y) {
      sy = source.y - sourceSize.height / 2;
      ty = target.y + targetSize.height / 2;
    }
  } else {
    sx = source.x + sourceSize.width / 2;
    sy = source.y;
    tx = target.x - targetSize.width / 2;
    ty = target.y;

    if (source.x > target.x) {
      sx = source.x - sourceSize.width / 2;
      tx = target.x + targetSize.width / 2;
    }
  }

  if (opts.edgeRouting === "bezier") {
    if (isVertical) {
      const dist = ty - sy;
      const offset = controlOffset(dist, DEFAULT_CURVATURE);
      const cy1 = sy + offset;
      const cy2 = ty - offset;
      const mid = bezierMidpoint(sx, sy, sx, cy1, tx, cy2, tx, ty);
      return {
        path: `M ${sx} ${sy} C ${sx} ${cy1} ${tx} ${cy2} ${tx} ${ty}`,
        labelMid: mid,
      };
    } else {
      const dist = tx - sx;
      const offset = controlOffset(dist, DEFAULT_CURVATURE);
      const cx1 = sx + offset;
      const cx2 = tx - offset;
      const mid = bezierMidpoint(sx, sy, cx1, sy, cx2, ty, tx, ty);
      return {
        path: `M ${sx} ${sy} C ${cx1} ${sy} ${cx2} ${ty} ${tx} ${ty}`,
        labelMid: mid,
      };
    }
  }

  if (opts.edgeRouting === "orthogonal") {
    // Manhattan-style routing: horizontal and vertical segments only
    if (isVertical) {
      const midY = (sy + ty) / 2;
      return {
        path: `M ${sx} ${sy} L ${sx} ${midY} L ${tx} ${midY} L ${tx} ${ty}`,
        labelMid: { x: (sx + tx) / 2, y: midY },
      };
    } else {
      const midX = (sx + tx) / 2;
      return {
        path: `M ${sx} ${sy} L ${midX} ${sy} L ${midX} ${ty} L ${tx} ${ty}`,
        labelMid: { x: midX, y: (sy + ty) / 2 },
      };
    }
  }

  // Polyline fallback
  return {
    path: `M ${sx} ${sy} L ${tx} ${ty}`,
    labelMid: { x: (sx + tx) / 2, y: (sy + ty) / 2 },
  };
}

/** Compute the layer range (min, max) for each subgraph including nested children. */
function computeSubgraphLayerRanges(
  subgraphs: Subgraph[],
  layers: Map<string, number>,
): Map<string, { minLayer: number; maxLayer: number }> {
  const ranges = new Map<string, { minLayer: number; maxLayer: number }>();

  function compute(sg: Subgraph): { minLayer: number; maxLayer: number } {
    let minL = Infinity;
    let maxL = -Infinity;
    for (const nodeId of sg.nodes) {
      const l = layers.get(nodeId);
      if (l !== undefined) {
        minL = Math.min(minL, l);
        maxL = Math.max(maxL, l);
      }
    }
    for (const child of sg.subgraphs ?? []) {
      const childRange = compute(child);
      minL = Math.min(minL, childRange.minLayer);
      maxL = Math.max(maxL, childRange.maxLayer);
    }
    const range = { minLayer: minL, maxLayer: maxL };
    ranges.set(sg.id, range);
    return range;
  }

  for (const sg of subgraphs) compute(sg);
  return ranges;
}

/** Flatten a subgraph tree into a flat array of all subgraphs. */
function flattenSubgraphs(subgraphs: Subgraph[]): Subgraph[] {
  const result: Subgraph[] = [];
  function collect(sg: Subgraph): void {
    result.push(sg);
    for (const child of sg.subgraphs ?? []) collect(child);
  }
  for (const sg of subgraphs) collect(sg);
  return result;
}

/** Pre-compute the minimum x/y bounds of a subgraph (including nested children). */
function precomputeSgMin(
  sg: Subgraph,
  positions: Map<string, { x: number; y: number }>,
  nodeSizes: Map<string, Size>,
  opts: LayoutOptions,
): { minX: number; minY: number } {
  const titleHeight = 20;
  let minX = Infinity;
  let minY = Infinity;
  for (const nodeId of sg.nodes) {
    const p = positions.get(nodeId);
    const size = nodeSizes.get(nodeId);
    if (p && size) {
      minX = Math.min(minX, p.x - size.width / 2);
      minY = Math.min(minY, p.y - size.height / 2);
    }
  }
  for (const child of sg.subgraphs ?? []) {
    const childMin = precomputeSgMin(child, positions, nodeSizes, opts);
    minX = Math.min(minX, childMin.minX);
    minY = Math.min(minY, childMin.minY);
  }
  return {
    minX: minX - opts.nodePadding,
    minY: minY - opts.nodePadding - titleHeight,
  };
}
