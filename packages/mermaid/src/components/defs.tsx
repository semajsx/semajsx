/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHeadClosed, dotMarker } from "../edge.style";
import { tokens } from "../tokens";

/**
 * Triangle arrow: tip at (4,0), base at (-2,+/-4), centroid at (0,0).
 * refX=4 (tip) so the arrow tip touches the node border.
 * The filled triangle covers the line behind it, so visually the edge
 * ends at the centroid. Tip angle: 2*atan(4/6) = 67 deg.
 */
const ARROW_PATH = "M 4 0 L -2 -4 L -2 4 Z";

export function Defs(): JSXNode {
  return (
    <defs>
      {/* Grid dot background pattern */}
      <pattern
        id="mmd-grid"
        x={0}
        y={0}
        width={tokens.gridDotGap}
        height={tokens.gridDotGap}
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx={tokens.gridDotGap}
          cy={tokens.gridDotGap}
          r={tokens.gridDotRadius}
          fill={tokens.gridDotColor}
        />
      </pattern>

      {/* Arrow — filled triangle with rounded corners */}
      <marker
        id="mmd-arrow"
        viewBox="-10 -10 20 20"
        refX={4}
        refY={0}
        markerWidth={12.5}
        markerHeight={12.5}
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path class={arrowHeadClosed} d={ARROW_PATH} />
      </marker>

      {/* Arrow filled — identical, kept for edge-type mapping */}
      <marker
        id="mmd-arrow-filled"
        viewBox="-10 -10 20 20"
        refX={4}
        refY={0}
        markerWidth={12.5}
        markerHeight={12.5}
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path class={arrowHeadClosed} d={ARROW_PATH} />
      </marker>

      {/* Dot endpoint — hollow circle */}
      <marker
        id="mmd-dot"
        viewBox="-10 -10 20 20"
        refX={0}
        refY={0}
        markerWidth={8}
        markerHeight={8}
        markerUnits="strokeWidth"
        orient="auto"
      >
        <circle class={dotMarker} cx={0} cy={0} r={4} />
      </marker>
    </defs>
  );
}
