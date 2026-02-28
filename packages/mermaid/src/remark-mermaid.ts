/**
 * Remark plugin that transforms ```mermaid code blocks into <Mermaid> JSX components.
 *
 * Usage in MDX config:
 * ```ts
 * import { remarkMermaid } from "@semajsx/mermaid/remark";
 *
 * mdx: {
 *   remarkPlugins: [remarkMermaid],
 *   components: { Mermaid },
 * }
 * ```
 */

interface MdastNode {
  type: string;
  lang?: string;
  value?: string;
  children?: MdastNode[];
}

interface MdxJsxAttribute {
  type: "mdxJsxAttribute";
  name: string;
  value: string;
}

interface MdxJsxFlowElement {
  type: "mdxJsxFlowElement";
  name: string;
  attributes: MdxJsxAttribute[];
  children: never[];
  data: { _mdxExplicitJsx: true };
}

function walk(node: MdastNode): void {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]!;
    if (child.type === "code" && child.lang === "mermaid") {
      (node.children as unknown[])[i] = {
        type: "mdxJsxFlowElement",
        name: "Mermaid",
        attributes: [{ type: "mdxJsxAttribute", name: "code", value: child.value ?? "" }],
        children: [],
        data: { _mdxExplicitJsx: true },
      } satisfies MdxJsxFlowElement;
    } else {
      walk(child);
    }
  }
}

export function remarkMermaid(): (tree: MdastNode) => void {
  return (tree: MdastNode) => walk(tree);
}
