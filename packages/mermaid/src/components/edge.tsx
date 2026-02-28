/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { c, edgeLine, edgeLabel, edgeLabelBg } from "../edge.style";
import type { EdgeRenderProps } from "../types";

export function Edge(props: EdgeRenderProps): JSXNode {
  const { edge, path, labelPosition, labelSize } = props.positioned;

  const edgeTypeClass = {
    arrow: c.edgeArrow,
    dotted: c.edgeDotted,
    thick: c.edgeThick,
    animated: c.edgeAnimated,
    open: undefined,
    invisible: undefined,
  }[edge.type];

  const markerId =
    edge.type === "open" || edge.type === "invisible" ? undefined : "url(#mmd-arrow)";

  return (
    <g class={[edgeTypeClass, props.class]}>
      <path class={edgeLine} d={path} marker-end={markerId} />
      {edge.label && labelPosition && labelSize ? (
        <g>
          <rect
            class={edgeLabelBg}
            x={labelPosition.x - labelSize.width / 2 - 6}
            y={labelPosition.y - labelSize.height / 2 - 3}
            width={labelSize.width + 12}
            height={labelSize.height + 6}
            rx={6}
          />
          <text class={edgeLabel} x={labelPosition.x} y={labelPosition.y}>
            {edge.label}
          </text>
        </g>
      ) : null}
    </g>
  );
}
