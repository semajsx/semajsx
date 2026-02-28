/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { messageLine, messageDotted, messageText } from "../../sequence.style";
import type { MessageRenderProps } from "../../types";

export function Message(props: MessageRenderProps): JSXNode {
  const { message, fromX, toX, y } = props;
  const isDotted =
    message.arrow === "dotted" || message.arrow === "dottedCross" || message.arrow === "dottedOpen";
  const midX = (fromX + toX) / 2;

  return (
    <g class={props.class}>
      <line
        class={[messageLine, isDotted ? messageDotted : undefined]}
        x1={fromX}
        y1={y}
        x2={toX}
        y2={y}
        marker-end="url(#mmd-arrow)"
      />
      <text class={messageText} x={midX} y={y - 8}>
        {message.text}
      </text>
    </g>
  );
}
