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

  // Phase 2: Build adjacency + reverse edges for cycle removal
  const adj = new Map<string, string[]>();
  const safeEdges: FlowEdge[] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  for (const node of nodes) adj.set(node.id, []);
  for (const edge of edges) {
    const targets = adj.get(edge.source);
    if (targets) targets.push(edge.target);
  }

  // DFS cycle removal
  function dfs(node: string): void {
    visited.add(node);
    inStack.add(node);
    for (const neighbor of adj.get(node) ?? []) {
      if (inStack.has(neighbor)) {
        // Back edge — reverse it
        const edge = edges.find((e) => e.source === node && e.target === neighbor);
        if (edge) safeEdges.push({ ...edge, source: neighbor, target: node });
      } else if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    inStack.delete(node);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) dfs(node.id);
  }

  // Add non-back edges
  for (const edge of edges) {
    if (!safeEdges.some((e) => e.source === edge.target && e.target === edge.source)) {
      safeEdges.push(edge);
    }
  }

  // Phase 3: Layer assignment (longest path from sources)
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

  // BFS topological order
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

  // Handle disconnected nodes
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

  // Phase 5: Subgraph-aware barycenter ordering
  // Build nodeId → immediate subgraph mapping so same-group nodes stay adjacent
  const nodeSubgraph = new Map<string, string>();
  for (const sg of subgraphs) {
    mapNodesToSubgraph(sg, nodeSubgraph);
  }

  for (let pass = 0; pass < 2; pass++) {
    for (let l = 1; l <= maxLayer; l++) {
      const layer = layerGroups[l]!;
      const barycenters = new Map<string, number>();

      for (const nodeId of layer) {
        // Find positions of connected nodes in previous layer
        const prevLayer = layerGroups[l - 1]!;
        let sum = 0;
        let count = 0;
        for (const edge of safeEdges) {
          if (edge.target === nodeId && prevLayer.includes(edge.source)) {
            sum += prevLayer.indexOf(edge.source);
            count++;
          }
        }
        barycenters.set(nodeId, count > 0 ? sum / count : prevLayer.length / 2);
      }

      // Sort: primary key = subgraph group barycenter, secondary = individual barycenter.
      // This keeps same-subgraph nodes clustered together.
      const groupBarycenter = new Map<string, number>();
      for (const nodeId of layer) {
        const sgId = nodeSubgraph.get(nodeId) ?? "";
        if (!groupBarycenter.has(sgId)) {
          // Average barycenter of all nodes in this subgraph within this layer
          const members = layer.filter((n) => (nodeSubgraph.get(n) ?? "") === sgId);
          const avg = members.reduce((s, n) => s + (barycenters.get(n) ?? 0), 0) / members.length;
          groupBarycenter.set(sgId, avg);
        }
      }

      layer.sort((a, b) => {
        const sgA = nodeSubgraph.get(a) ?? "";
        const sgB = nodeSubgraph.get(b) ?? "";
        if (sgA !== sgB) {
          return (groupBarycenter.get(sgA) ?? 0) - (groupBarycenter.get(sgB) ?? 0);
        }
        return (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0);
      });
    }
  }

  // Phase 6: Coordinate assignment
  const isVertical = direction === "TB" || direction === "TD" || direction === "BT";
  const positions = new Map<string, { x: number; y: number }>();

  for (let l = 0; l <= maxLayer; l++) {
    const layer = layerGroups[l]!;
    const layerWidth = layer.reduce((sum, id) => {
      const size = nodeSizes.get(id)!;
      return sum + (isVertical ? size.width : size.height) + opts.nodeSpacing;
    }, -opts.nodeSpacing);

    let offset = -layerWidth / 2;

    for (const nodeId of layer) {
      const size = nodeSizes.get(nodeId)!;
      const primaryDim = isVertical ? size.width : size.height;

      if (isVertical) {
        positions.set(nodeId, {
          x: offset + primaryDim / 2,
          y: l * (opts.nodeHeight + opts.rankSpacing),
        });
      } else {
        positions.set(nodeId, {
          x: l * (opts.nodeWidth + opts.rankSpacing),
          y: offset + primaryDim / 2,
        });
      }

      offset += primaryDim + opts.nodeSpacing;
    }
  }

  // Center and apply padding
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [id, pos] of positions) {
    const size = nodeSizes.get(id)!;
    minX = Math.min(minX, pos.x - size.width / 2);
    minY = Math.min(minY, pos.y - size.height / 2);
    maxX = Math.max(maxX, pos.x + size.width / 2);
    maxY = Math.max(maxY, pos.y + size.height / 2);
  }

  // Shift positions so diagram starts at (padding, padding)
  const offsetX = opts.diagramPadding - minX;
  const offsetY = opts.diagramPadding - minY;
  for (const [, pos] of positions) {
    pos.x += offsetX;
    pos.y += offsetY;
  }

  if (direction === "BT") {
    // Flip vertically
    const totalHeight = maxY - minY;
    for (const [, pos] of positions) {
      pos.y = totalHeight - (pos.y - opts.diagramPadding) + opts.diagramPadding;
    }
  }
  if (direction === "RL") {
    // Flip horizontally
    const totalWidth = maxX - minX;
    for (const [, pos] of positions) {
      pos.x = totalWidth - (pos.x - opts.diagramPadding) + opts.diagramPadding;
    }
  }

  // Build positioned nodes
  const positionedNodes: PositionedNode[] = nodes.map((node) => {
    const pos = positions.get(node.id)!;
    const size = nodeSizes.get(node.id)!;
    return { node, x: pos.x, y: pos.y, width: size.width, height: size.height };
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

    // Label position from bezier midpoint formula
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
  const sgBounds = new Map<string, { x: number; y: number; width: number; height: number }>();

  function layoutSubgraph(sg: Subgraph): PositionedSubgraph {
    // Layout children first so their bounds are available
    const childPositioned: PositionedSubgraph[] = [];
    for (const child of sg.subgraphs ?? []) {
      childPositioned.push(layoutSubgraph(child));
    }

    // Compute bounding box from direct nodes
    let sgMinX = Infinity,
      sgMinY = Infinity,
      sgMaxX = -Infinity,
      sgMaxY = -Infinity;

    for (const nodeId of sg.nodes) {
      const pos = positions.get(nodeId);
      const size = nodeSizes.get(nodeId);
      if (pos && size) {
        sgMinX = Math.min(sgMinX, pos.x - size.width / 2);
        sgMinY = Math.min(sgMinY, pos.y - size.height / 2);
        sgMaxX = Math.max(sgMaxX, pos.x + size.width / 2);
        sgMaxY = Math.max(sgMaxY, pos.y + size.height / 2);
      }
    }

    // Expand to include child subgraph boxes
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
      y: sgMinY - padding - 20, // Extra for title
      width: sgMaxX - sgMinX + padding * 2,
      height: sgMaxY - sgMinY + padding * 2 + 20,
    };

    sgBounds.set(sg.id, {
      x: positioned.x,
      y: positioned.y,
      width: positioned.width,
      height: positioned.height,
    });
    positionedSubgraphs.push(positioned);
    return positioned;
  }

  for (const sg of subgraphs) {
    layoutSubgraph(sg);
  }

  // Final dimensions — expand to include subgraph boxes
  let finalMinX = minX;
  let finalMinY = minY;
  let finalMaxX = maxX;
  let finalMaxY = maxY;

  for (const psg of positionedSubgraphs) {
    finalMinX = Math.min(finalMinX, psg.x - opts.diagramPadding);
    finalMinY = Math.min(finalMinY, psg.y - opts.diagramPadding);
    finalMaxX = Math.max(finalMaxX, psg.x + psg.width + opts.diagramPadding);
    finalMaxY = Math.max(finalMaxY, psg.y + psg.height + opts.diagramPadding);
  }

  const diagramWidth = Math.max(maxX - minX + opts.diagramPadding * 2, finalMaxX - finalMinX);
  const diagramHeight = Math.max(maxY - minY + opts.diagramPadding * 2, finalMaxY - finalMinY);

  return {
    width: diagramWidth,
    height: diagramHeight,
    viewBox: `0 0 ${diagramWidth} ${diagramHeight}`,
    nodes: positionedNodes,
    edges: positionedEdges,
    subgraphs: positionedSubgraphs,
  };
}

/** Map each node to its most immediate (deepest) containing subgraph. */
function mapNodesToSubgraph(sg: Subgraph, out: Map<string, string>): void {
  for (const nodeId of sg.nodes) {
    // Deeper subgraphs override shallower ones
    out.set(nodeId, sg.id);
  }
  for (const child of sg.subgraphs ?? []) {
    mapNodesToSubgraph(child, out);
  }
}

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
  // Cubic bezier at t=0.5: B(0.5) = (1/8)P0 + (3/8)P1 + (3/8)P2 + (1/8)P3
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
  // Connection points at node geometric boundary (no stroke offset, following xyflow)
  let sx: number, sy: number, tx: number, ty: number;

  if (isVertical) {
    sx = source.x;
    sy = source.y + sourceSize.height / 2;
    tx = target.x;
    ty = target.y - targetSize.height / 2;

    // If target is above source, flip
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

  // Polyline fallback
  return {
    path: `M ${sx} ${sy} L ${tx} ${ty}`,
    labelMid: { x: (sx + tx) / 2, y: (sy + ty) / 2 },
  };
}
