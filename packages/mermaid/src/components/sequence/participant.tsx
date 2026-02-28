/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { c, participantBox, participantLabel } from "../../sequence.style";
import type { ParticipantRenderProps } from "../../types";

export function Participant(props: ParticipantRenderProps): JSXNode {
  const { participant, x, y, width, height } = props;
  return (
    <g class={[c.participantBox, props.class]} transform={`translate(${x}, ${y})`}>
      <rect
        class={participantBox}
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={10}
      />
      <text class={participantLabel}>{participant.label}</text>
    </g>
  );
}
