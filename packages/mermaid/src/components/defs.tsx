/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead } from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
      <marker
        id="mmd-arrow"
        viewBox="0 0 10 10"
        refX={10}
        refY={5}
        markerWidth={8}
        markerHeight={8}
        orient="auto-start-reverse"
      >
        <path class={arrowHead} d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker id="mmd-dot" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6}>
        <circle class={arrowHead} cx={5} cy={5} r={4} />
      </marker>
    </defs>
  );
}
