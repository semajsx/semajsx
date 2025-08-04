// Core types
export type {
  Component,
  ErrorBoundaryProps,
  JSXNode,
  Plugin,
  PluginFactory,
  PluginManager,
  RenderContext,
  RenderedNode,
  RendererConfig,
  RenderStrategies,
  Signal,
  SignalProps,
  SuspenseProps,
  VNode,
} from "./types";

// Built-in components
export { ErrorBoundary, Fragment, Suspense } from "./types";

// VNode creation
export { createFragment, createTextVNode, h, isVNode } from "./vnode";

// Signal utilities
export { applyProps, createSafeSignal, isSignal } from "./signal-utils";

// Renderer
export { createRenderer } from "./renderer";
export type { Renderer } from "./renderer";

// Plugin Manager class (not the interface)
export { PluginManager as PluginManagerImpl } from "./plugin-manager";

// Render functions (for advanced usage)
export { renderNode, unmountNode } from "./render";