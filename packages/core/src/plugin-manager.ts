import { Plugin, VNode, PluginManager as IPluginManager } from './types';

export class PluginManager implements IPluginManager {
  private plugins: Plugin[] = [];
  private platform: string;
  
  constructor(platform: string) {
    this.platform = platform;
  }
  
  use(plugin: Plugin): void {
    // Check platform compatibility
    if (plugin.apply) {
      if (typeof plugin.apply === 'function') {
        if (!plugin.apply(this.platform)) return;
      } else {
        const platforms = Array.isArray(plugin.apply) ? plugin.apply : [plugin.apply];
        if (!platforms.includes(this.platform)) return;
      }
    }
    
    this.plugins.push(plugin);
    this.sortPlugins();
  }
  
  private sortPlugins(): void {
    this.plugins.sort((a, b) => {
      const orderA = a.enforce === 'pre' ? 0 : a.enforce === 'post' ? 2 : 1;
      const orderB = b.enforce === 'pre' ? 0 : b.enforce === 'post' ? 2 : 1;
      return orderA - orderB;
    });
  }
  
  // Transform hook execution
  transform(vnode: VNode, parent?: VNode): VNode | null {
    for (const plugin of this.plugins) {
      if (plugin.transform) {
        const result = plugin.transform(vnode, parent);
        if (result === null) return null; // Skip this vnode
        if (result) vnode = result; // Update vnode for next plugin
      }
    }
    return vnode;
  }
  
  // Props hook execution
  props(props: Record<string, any>, vnode: VNode): Record<string, any> {
    for (const plugin of this.plugins) {
      if (plugin.props) {
        const result = plugin.props(props, vnode);
        if (result) props = result;
      }
    }
    return props;
  }
  
  // Fallback providers
  getLoading(): VNode | null {
    // First plugin that provides loading wins
    for (const plugin of this.plugins) {
      if (plugin.loading) {
        return plugin.loading();
      }
    }
    return null;
  }
  
  getError(error: Error, retry: () => void): VNode | null {
    // First plugin that provides error handling wins
    for (const plugin of this.plugins) {
      if (plugin.error) {
        return plugin.error(error, retry);
      }
    }
    return null;
  }
  
  // Lifecycle hooks
  create(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.create?.(element, vnode);
    }
  }
  
  mount(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.mount?.(element, vnode);
    }
  }
  
  unmount(element: any, vnode: VNode): void {
    for (const plugin of this.plugins) {
      plugin.unmount?.(element, vnode);
    }
  }
}