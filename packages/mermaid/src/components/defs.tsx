/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead } from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
      <marker
        id="mmd-arrow"
        viewBox="0 0 10 10"
        refX={9}
        refY={5}
        markerWidth={8}
        markerHeight={8}
        orient="auto"
      >
        <polyline class={arrowHead} points="1,1 9,5 1,9" />
      </marker>
      <marker id="mmd-dot" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6}>
        <circle class={arrowHead} cx={5} cy={5} r={4} />
      </marker>
    </defs>
  );
}
