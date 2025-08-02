import { RenderedNode, RendererConfig, RenderStrategies, VNode } from "./types";
import { PluginManager } from "./plugin-manager";
import { renderNode, unmountNode } from "./render";

export interface Renderer {
  render(
    vnode: VNode,
    container: any,
  ): RenderedNode | null | Promise<RenderedNode>;
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
  ): RenderedNode | null | Promise<RenderedNode> {
    return renderNode(vnode, container, strategies, pluginManager);
  }

  return {
    render,
    plugins: pluginManager,
    unmount: (node: RenderedNode) => unmountNode(node, strategies),
  };
}
