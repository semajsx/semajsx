/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { arrowHead } from "../edge.style";

export function Defs(): JSXNode {
  return (
    <defs>
      <marker
        id="mmd-arrow"
        viewBox="0 0 12 10"
        refX={11}
        refY={5}
        markerWidth={7}
        markerHeight={7}
        orient="auto-start-reverse"
      >
        <path class={arrowHead} d="M 1 1.5 L 11 5 L 1 8.5 Q 3 5 1 1.5 z" />
      </marker>
      <marker id="mmd-dot" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={5} markerHeight={5}>
        <circle class={arrowHead} cx={5} cy={5} r={4} />
      </marker>
    </defs>
  );
}
