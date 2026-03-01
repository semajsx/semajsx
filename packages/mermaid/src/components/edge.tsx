/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { c, edgeLine, edgeInteraction, edgeLabel, edgeLabelBg } from "../edge.style";
import type { EdgeRenderProps, EdgeMarker, EdgeLineStyle } from "../types";

const LINE_STYLE_CLASS: Record<EdgeLineStyle, string | undefined> = {
  solid: c.edgeArrow,
  dotted: c.edgeDotted,
  thick: c.edgeThick,
};

const MARKER_URL: Record<EdgeMarker, string | undefined> = {
  arrow: "url(#mmd-arrow)",
  dot: "url(#mmd-dot)",
  cross: "url(#mmd-cross)",
  none: undefined,
};

export function Edge(props: EdgeRenderProps): JSXNode {
  const { edge, path, labelPosition, labelSize } = props.positioned;

  const lineClass = LINE_STYLE_CLASS[edge.lineStyle];
  const markerEnd = MARKER_URL[edge.targetMarker];
  const markerStart = MARKER_URL[edge.sourceMarker];

  return (
    <g class={[lineClass, props.class]}>
      <path class={edgeLine} d={path} marker-start={markerStart} marker-end={markerEnd} />
      <path class={edgeInteraction} d={path} />
      {edge.label && labelPosition && labelSize ? (
        <g>
          <rect
            class={edgeLabelBg}
            x={labelPosition.x - labelSize.width / 2 - 4}
            y={labelPosition.y - labelSize.height / 2 - 2}
            width={labelSize.width + 8}
            height={labelSize.height + 4}
            rx={4}
          />
          <text class={edgeLabel} x={labelPosition.x} y={labelPosition.y}>
            {edge.label}
          </text>
        </g>
      ) : null}
    </g>
  );
}
