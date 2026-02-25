import type { VNode } from "@semajsx/core";
import type { MDXConfig } from "../../mdx/types";
import { Icon } from "./component";

export type { IconProps } from "./component";
export { Icon };

export interface LucidePluginOptions {
  /** Additional remark plugins to include */
  remarkPlugins?: unknown[];
  /** Additional rehype plugins to include */
  rehypePlugins?: unknown[];
  /** Additional MDX components to include alongside Icon */
  components?: Record<string, (props: Record<string, unknown>) => VNode>;
}

/**
 * Lucide icon plugin for SSG.
 *
 * Returns an MDXConfig with the Icon component registered and any
 * additional remark/rehype plugins or components merged in.
 *
 * @example
 * ```tsx
 * import { createSSG } from "@semajsx/ssg";
 * import { lucide } from "@semajsx/ssg/plugins/lucide";
 * import remarkGfm from "remark-gfm";
 *
 * const ssg = createSSG({
 *   mdx: lucide({
 *     remarkPlugins: [remarkGfm],
 *   }),
 * });
 * ```
 *
 * @example
 * ```mdx
 * <Icon name="rocket" />
 * <Icon name="arrow-right" size={20} color="#007aff" />
 * ```
 */
export function lucide(options: LucidePluginOptions = {}): MDXConfig {
  return {
    remarkPlugins: options.remarkPlugins ?? [],
    rehypePlugins: options.rehypePlugins ?? [],
    components: {
      Icon,
      ...options.components,
    },
  };
}
