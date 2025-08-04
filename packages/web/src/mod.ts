// Core web rendering exports
export {
  batchRender,
  createPortal,
  createWebRenderer,
  defineWebComponent,
  getWebCapabilities,
  hydrate,
  isWebEnvironment,
  measureRender,
  render,
  unmountAll,
  WebErrorBoundary,
} from "./render";

// DOM strategies
export {
  browserFeatures,
  domStrategies,
  domStrategiesWithMetrics,
  getPerformanceMetrics,
  resetPerformanceMetrics,
} from "./dom-strategies";

// Event handling
export {
  bindEvent,
  cleanupElementEvents,
  createSyntheticEvent,
  delegateEvent,
  normalizeEventName,
  onChange,
  onClick,
  onInput,
} from "./events";

// Style utilities
export {
  animate,
  applyClassName,
  applyTheme,
  createMediaQuery,
  createThemeSignal,
  css,
  getCSSCustomProperty,
  handleStyleProperty,
  performCleanup,
  scheduleCleanup,
  setCSSCustomProperty,
  transition,
} from "./styles";

// Plugin system - temporarily disabled due to JSX compilation issues
// export * from './plugins/index.js';

// Type exports
export type {
  BrowserFeatures,
  CSSStyleObject,
  ElementCleanup,
  EventCleanup,
  HTMLElementProps,
  PerformanceMetrics,
  RouteConfig,
  RouteGuard,
  SyntheticEvent,
  WebDevPluginConfig,
  WebRenderStrategies,
  WebThemePluginConfig,
} from "./types";

// Re-export core types for convenience
export type {
  Component,
  ErrorBoundaryProps,
  JSXNode,
  Plugin,
  PluginFactory,
  RenderedNode,
  RendererConfig,
  RenderStrategies,
  Signal,
  SignalProps,
  SuspenseProps,
  VNode,
} from "@semajsx/core";