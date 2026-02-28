/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead } from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
      <marker
        id="mmd-arrow"
        viewBox="-2 -2 16 14"
        refX={10}
        refY={5}
        markerWidth={16}
        markerHeight={16}
        markerUnits="userSpaceOnUse"
        orient="auto"
        overflow="visible"
      >
        <polyline class={arrowHead} points="0,0 10,5 0,10" />
      </marker>
      <marker id="mmd-dot" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6}>
        <circle class={arrowHead} cx={5} cy={5} r={4} />
      </marker>
    </defs>
  );
}
