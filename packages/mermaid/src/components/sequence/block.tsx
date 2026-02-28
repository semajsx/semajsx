/** @jsxImportSource @semajsx/dom */
import type { JSXNode } from "@semajsx/core";
import { blockBg, blockLabel, blockLabelText } from "../../sequence.style";
import type { BlockRenderProps } from "../../types";

export function Block(props: BlockRenderProps): JSXNode {
  const { block, x, y, width, height } = props;
  return (
    <g class={props.class}>
      <rect class={blockBg} x={x} y={y} width={width} height={height} rx={8} />
      <rect class={blockLabel} x={x} y={y} width={50} height={20} rx={6} />
      <text class={blockLabelText} x={x + 5} y={y + 14}>
        {block.type}
      </text>
    </g>
  );
}
