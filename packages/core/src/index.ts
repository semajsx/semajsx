// Core types
export type {
  Signal,
  SignalProps,
  VNode,
  RenderedNode,
  Component,
  JSXNode,
  ErrorBoundaryProps,
  SuspenseProps,
  RenderStrategies,
  Plugin,
  PluginFactory,
  RendererConfig,
  RenderContext,
  PluginManager
} from './types';

// Built-in components
export { Fragment, ErrorBoundary, Suspense } from './types';

// VNode creation
export { h, createFragment, createTextVNode, isVNode } from './vnode';

// Signal utilities
export { isSignal, applyProps, createSafeSignal } from './signal-utils';

// Renderer
export { createRenderer } from './renderer';
export type { Renderer } from './renderer';

// Plugin Manager class (not the interface)
export { PluginManager as PluginManagerImpl } from './plugin-manager';

// Render functions (for advanced usage)
export { renderNode, unmountNode } from './render';