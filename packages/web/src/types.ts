import type { Signal, RenderStrategies } from '@semajsx/core';

// Web-specific types
export interface CSSStyleObject {
  [property: string]: string | number | Signal<string | number>;
}

export interface SyntheticEvent<T = Event> {
  nativeEvent: T;
  type: string;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

export interface WebRenderStrategies extends RenderStrategies<Node, Element> {
  batchUpdates(fn: () => void): void;
  scheduleUpdate(element: Element, update: () => void): void;
}

// Event handling types
export interface EventCleanup {
  unsubscribe: () => void;
  element: Element;
  eventType: string;
}

export interface ElementCleanup {
  subscriptions: (() => void)[];
  eventListeners: EventCleanup[];
  observers: ResizeObserver[];
  timers: number[];
}

// Browser feature detection
export interface BrowserFeatures {
  requestAnimationFrame: boolean;
  customElements: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  cssCustomProperties: boolean;
  shadowDOM: boolean;
}

// Performance monitoring
export interface PerformanceMetrics {
  renderTime: number;
  updateCount: number;
  signalSubscriptions: number;
  domOperations: number;
}

// Plugin configurations
export interface WebDevPluginConfig {
  showComponentStack: boolean;
  trackPerformance: boolean;
  validateCleanup: boolean;
}

export interface WebThemePluginConfig {
  mode: 'light' | 'dark' | 'auto';
  customProperties: Record<string, string>;
  mediaQueries: Record<string, string>;
  transitions: boolean;
}

export interface RouteConfig {
  path: string;
  component: any; // Component type
  lazy?: boolean;
  guards?: RouteGuard[];
}

export interface RouteGuard {
  canActivate: (route: RouteConfig) => boolean | Promise<boolean>;
}

// HTML element props with signal support
export type HTMLElementProps<T extends keyof HTMLElementTagNameMap> = {
  [K in keyof HTMLElementTagNameMap[T]]?: HTMLElementTagNameMap[T][K] | Signal<HTMLElementTagNameMap[T][K]>;
} & {
  className?: string | Signal<string>;
  style?: CSSStyleObject | string | Signal<string>;
  children?: any;
};