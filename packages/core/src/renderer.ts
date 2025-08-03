import { RenderedNode, RendererConfig, RenderStrategies, VNode } from "./types";
import { PluginManager } from "./plugin-manager";
import { renderNode, unmountNode } from "./render";

export interface Renderer {
  render(
    vnode: VNode,
    container: any,
  ): RenderedNode;
  unmount(node: RenderedNode): void;
  plugins: PluginManager;
}

export function createRenderer<TNode, TContainer>(
  strategies: RenderStrategies<TNode, TContainer>,
  config: RendererConfig,
): Renderer {
  const pluginManager = new PluginManager(config.platform);

  // Register plugins
  config.plugins?.forEach((plugin) => pluginManager.use(plugin));

  function render(
    vnode: VNode,
    container: TContainer,
  ): RenderedNode {
    const result = renderNode(vnode, container, strategies, pluginManager);
    if (result instanceof Promise) {
      throw result;
    } else if (result === null) {
      throw new Error("Rendered node is null");
    }
    return result as RenderedNode;
  }

  return {
    render,
    plugins: pluginManager,
    unmount: (node: RenderedNode) => unmountNode(node, strategies),
  };
}
