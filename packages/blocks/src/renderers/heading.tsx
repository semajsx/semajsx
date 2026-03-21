/** @jsxImportSource @semajsx/dom */

import { classes, rule } from "@semajsx/style";
import type { ClassValue } from "../types";

const c = classes(["root"] as const);

export const headingStyles = {
  root: rule`${c.root} {
    margin: 16px 0 8px;
    line-height: 1.3;
    font-weight: 600;
  }`,
};

export interface HeadingBlockData {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Heading renderer (h1-h6 based on level). */
export function HeadingRenderer(props: {
  data: HeadingBlockData;
  class?: ClassValue;
}): JSX.Element {
  const { text, level = 2 } = props.data;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag class={[headingStyles.root, props.class]}>{text}</Tag>;
}
