import type {
  FlowchartDiagram,
  FlowchartLayout,
  FlowNode,
  FlowEdge,
  PositionedNode,
  PositionedEdge,
  PositionedSubgraph,
  LayoutOptions,
  Size,
} from "../types";

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
    nodeSizes.set(node.id, measureNode(node, opts));
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

  // Phase 5: Barycenter ordering
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

      layer.sort((a, b) => (barycenters.get(a) ?? 0) - (barycenters.get(b) ?? 0));
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
  // Count edges per source/target to spread anchors when multiple edges share a node
  const sourceCount = new Map<string, number>();
  const targetCount = new Map<string, number>();
  for (const edge of edges) {
    sourceCount.set(edge.source, (sourceCount.get(edge.source) ?? 0) + 1);
    targetCount.set(edge.target, (targetCount.get(edge.target) ?? 0) + 1);
  }
  const sourceIndex = new Map<string, number>();
  const targetIndex = new Map<string, number>();

  const positionedEdges: PositionedEdge[] = edges.map((edge) => {
    const sourcePos = positions.get(edge.source);
    const targetPos = positions.get(edge.target);
    if (!sourcePos || !targetPos) {
      return { edge, path: "M 0 0" };
    }

    const sourceSize = nodeSizes.get(edge.source)!;
    const targetSize = nodeSizes.get(edge.target)!;

    // Compute anchor offsets for fan-out / fan-in
    const sTotal = sourceCount.get(edge.source) ?? 1;
    const sIdx = sourceIndex.get(edge.source) ?? 0;
    sourceIndex.set(edge.source, sIdx + 1);

    const tTotal = targetCount.get(edge.target) ?? 1;
    const tIdx = targetIndex.get(edge.target) ?? 0;
    targetIndex.set(edge.target, tIdx + 1);

    const path = buildEdgePath(
      sourcePos,
      targetPos,
      sourceSize,
      targetSize,
      isVertical,
      opts,
      sIdx,
      sTotal,
      tIdx,
      tTotal,
    );

    // Label position at midpoint
    let labelPosition;
    let labelSize;
    if (edge.label) {
      labelPosition = {
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2,
      };
      labelSize = measureLabel(edge.label, opts);
    }

    return { edge, path, labelPosition, labelSize };
  });

  // Phase 8: Subgraph bounding boxes
  const positionedSubgraphs: PositionedSubgraph[] = subgraphs.map((sg) => {
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

    const padding = opts.nodePadding;
    return {
      subgraph: sg,
      x: sgMinX - padding,
      y: sgMinY - padding - 20, // Extra for title
      width: sgMaxX - sgMinX + padding * 2,
      height: sgMaxY - sgMinY + padding * 2 + 20,
    };
  });

  // Final dimensions
  const diagramWidth = maxX - minX + opts.diagramPadding * 2;
  const diagramHeight = maxY - minY + opts.diagramPadding * 2;

  return {
    width: diagramWidth,
    height: diagramHeight,
    viewBox: `0 0 ${diagramWidth} ${diagramHeight}`,
    nodes: positionedNodes,
    edges: positionedEdges,
    subgraphs: positionedSubgraphs,
  };
}

/** Evenly spread `count` anchors across `span`, returning offset for index `i`. */
function anchorOffset(i: number, count: number, span: number): number {
  if (count <= 1) return 0;
  // Use at most 60% of the node width/height to keep anchors inside
  const usable = span * 0.6;
  const step = usable / (count - 1);
  return -usable / 2 + step * i;
}

function buildEdgePath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  sourceSize: Size,
  targetSize: Size,
  isVertical: boolean,
  opts: LayoutOptions,
  sIdx: number = 0,
  sTotal: number = 1,
  tIdx: number = 0,
  tTotal: number = 1,
): string {
  // Connection points at node edges
  let sx: number, sy: number, tx: number, ty: number;

  if (isVertical) {
    // Spread source anchors horizontally, target anchors horizontally
    const sOff = anchorOffset(sIdx, sTotal, sourceSize.width);
    const tOff = anchorOffset(tIdx, tTotal, targetSize.width);
    sx = source.x + sOff;
    sy = source.y + sourceSize.height / 2;
    tx = target.x + tOff;
    ty = target.y - targetSize.height / 2;

    if (source.y > target.y) {
      sy = source.y - sourceSize.height / 2;
      ty = target.y + targetSize.height / 2;
    }
  } else {
    // Spread source anchors vertically, target anchors vertically
    const sOff = anchorOffset(sIdx, sTotal, sourceSize.height);
    const tOff = anchorOffset(tIdx, tTotal, targetSize.height);
    sx = source.x + sourceSize.width / 2;
    sy = source.y + sOff;
    tx = target.x - targetSize.width / 2;
    ty = target.y + tOff;

    if (source.x > target.x) {
      sx = source.x - sourceSize.width / 2;
      tx = target.x + targetSize.width / 2;
    }
  }

  if (opts.edgeRouting === "bezier") {
    const dist = isVertical ? Math.abs(ty - sy) : Math.abs(tx - sx);
    const offset = dist * 0.4;
    // Straight tail length so the last segment enters the node perpendicularly
    const tail = Math.min(8, dist * 0.15);

    if (isVertical) {
      const dir = ty > sy ? 1 : -1;
      const endY = ty - dir * tail;
      return `M ${sx} ${sy} C ${sx} ${sy + offset * dir} ${tx} ${ty - offset * dir} ${tx} ${endY} L ${tx} ${ty}`;
    } else {
      const dir = tx > sx ? 1 : -1;
      const endX = tx - dir * tail;
      return `M ${sx} ${sy} C ${sx + offset * dir} ${sy} ${tx - offset * dir} ${ty} ${endX} ${ty} L ${tx} ${ty}`;
    }
  }

  // Polyline fallback
  return `M ${sx} ${sy} L ${tx} ${ty}`;
}

function measureNode(node: FlowNode, opts: LayoutOptions): Size {
  const measure = opts.measureText ?? estimateTextSize;
  const textSize = measure(node.label, 14);
  return {
    width: Math.max(textSize.width + opts.nodePadding * 2, opts.nodeWidth),
    height: Math.max(textSize.height + opts.nodePadding * 2, opts.nodeHeight),
  };
}

function measureLabel(text: string, opts: LayoutOptions): Size {
  const measure = opts.measureText ?? estimateTextSize;
  return measure(text, 12);
}

function estimateTextSize(text: string, fontSize: number): Size {
  const avgCharWidth = fontSize * 0.6;
  const width = text.length * avgCharWidth;
  const height = fontSize * 1.4;
  return { width, height };
}
