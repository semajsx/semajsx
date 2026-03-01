/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { messageLine, messageDotted, messageText } from "../../sequence.style";
import type { ArrowType, MessageRenderProps } from "../../types";

const MARKER: Record<ArrowType, string> = {
  solid: "url(#mmd-arrow)",
  dotted: "url(#mmd-arrow)",
  solidCross: "url(#mmd-cross)",
  dottedCross: "url(#mmd-cross)",
  solidOpen: "url(#mmd-arrow-open)",
  dottedOpen: "url(#mmd-arrow-open)",
};

export function Message(props: MessageRenderProps): JSXNode {
  const { message, fromX, toX, y } = props;
  const isDotted =
    message.arrow === "dotted" || message.arrow === "dottedCross" || message.arrow === "dottedOpen";
  const midX = (fromX + toX) / 2;
  const markerEnd = MARKER[message.arrow];

  return (
    <g class={props.class}>
      <line
        class={[messageLine, isDotted ? messageDotted : undefined]}
        x1={fromX}
        y1={y}
        x2={toX}
        y2={y}
        marker-end={markerEnd}
      />
      <text class={messageText} x={midX} y={y - 8}>
        {message.text}
      </text>
    </g>
  );
}
