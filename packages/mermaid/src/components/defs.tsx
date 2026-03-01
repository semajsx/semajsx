/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead, arrowHeadClosed } from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
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
        <polyline class={arrowHead} points="-5,-4 0,0 -5,4" />
      </marker>
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
        <polyline class={arrowHeadClosed} points="-5,-4 0,0 -5,4 -5,-4" />
      </marker>
      <marker
        id="mmd-dot"
        viewBox="-10 -10 20 20"
        refX={4}
        refY={0}
        markerWidth={8}
        markerHeight={8}
        markerUnits="strokeWidth"
        orient="auto"
      >
        <circle class={arrowHeadClosed} cx={0} cy={0} r={4} />
      </marker>
    </defs>
  );
}
