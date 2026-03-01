/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead, arrowHeadClosed, dotMarker } from "../edge.style";
import { tokens } from "../tokens";

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

      {/* Open arrow — outline triangle with rounded corners */}
      <marker
        id="mmd-arrow"
        viewBox="-10 -10 20 20"
        refX={0}
        refY={0}
        markerWidth={12.5}
        markerHeight={12.5}
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path class={arrowHead} d="M -5 -4 L 0 0 L -5 4 Z" />
      </marker>

      {/* Filled arrow — solid triangle with rounded corners */}
      <marker
        id="mmd-arrow-filled"
        viewBox="-10 -10 20 20"
        refX={0}
        refY={0}
        markerWidth={12.5}
        markerHeight={12.5}
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path class={arrowHeadClosed} d="M -5 -4 L 0 0 L -5 4 Z" />
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
