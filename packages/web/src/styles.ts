import type { Signal } from '@semajsx/core';
import { isSignal } from '@semajsx/core';
import type { CSSStyleObject, ElementCleanup } from './types.js';

// Element cleanup tracking
const cleanupMap = new WeakMap<Element, ElementCleanup>();

export function scheduleCleanup(element: Element, cleanup: () => void): void {
  const elementCleanup = cleanupMap.get(element) || {
    subscriptions: [],
    eventListeners: [],
    observers: [],
    timers: []
  };
  
  elementCleanup.subscriptions.push(cleanup);
  cleanupMap.set(element, elementCleanup);
}

export function performCleanup(element: Element): void {
  const cleanup = cleanupMap.get(element);
  if (cleanup) {
    cleanup.subscriptions.forEach(fn => fn());
    cleanup.eventListeners.forEach(listener => listener.unsubscribe());
    cleanup.observers.forEach(observer => observer.disconnect());
    cleanup.timers.forEach(timer => clearTimeout(timer));
    cleanupMap.delete(element);
  }
}

// CSS style handling
export function handleStyleProperty(element: HTMLElement, value: CSSStyleObject | string | Signal<string>): void {
  if (isSignal(value)) {
    // Initial style application
    applyStyle(element, value.value);
    
    // Subscribe to changes
    const unsubscribe = value.subscribe((newValue) => {
      applyStyle(element, newValue);
    });
    
    scheduleCleanup(element, unsubscribe);
  } else {
    applyStyle(element, value);
  }
}

function applyStyle(element: HTMLElement, value: CSSStyleObject | string): void {
  if (typeof value === 'string') {
    element.style.cssText = value;
  } else if (value && typeof value === 'object') {
    updateStyleObject(element, value);
  } else {
    element.style.cssText = '';
  }
}

function updateStyleObject(element: HTMLElement, styles: CSSStyleObject): void {
  // Clear existing styles
  element.style.cssText = '';
  
  for (const [property, value] of Object.entries(styles)) {
    if (isSignal(value)) {
      // Set initial value
      element.style.setProperty(property, String(value.value));
      
      // Subscribe to changes
      const unsubscribe = value.subscribe((newValue) => {
        element.style.setProperty(property, String(newValue));
      });
      
      scheduleCleanup(element, unsubscribe);
    } else if (value != null) {
      element.style.setProperty(property, String(value));
    }
  }
}

// CSS custom properties
export function setCSSCustomProperty(name: string, value: string | Signal<string>): () => void {
  const root = document.documentElement;
  
  if (isSignal(value)) {
    // Set initial value
    root.style.setProperty(name, value.value);
    
    // Subscribe to changes
    return value.subscribe((newValue) => {
      root.style.setProperty(name, newValue);
    });
  } else {
    root.style.setProperty(name, value);
    return () => {};
  }
}

export function getCSSCustomProperty(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// CSS class utilities
export function applyClassName(element: Element, className: string | Signal<string>): void {
  if (isSignal(className)) {
    // Set initial className
    element.className = className.value;
    
    // Subscribe to changes
    const unsubscribe = className.subscribe((newClassName) => {
      element.className = newClassName;
    });
    
    scheduleCleanup(element, unsubscribe);
  } else {
    element.className = className || '';
  }
}

// CSS-in-JS utilities
export function css(template: TemplateStringsArray, ...values: (string | number | Signal<string | number>)[]): string {
  let result = '';
  
  for (let i = 0; i < template.length; i++) {
    result += template[i];
    
    if (i < values.length) {
      const value = values[i];
      if (isSignal(value)) {
        result += value.value;
      } else {
        result += value;
      }
    }
  }
  
  return result;
}

// Responsive utilities
export function createMediaQuery(query: string, styles: CSSStyleObject): CSSStyleObject {
  const mediaQuery = window.matchMedia(query);
  
  return new Proxy(styles, {
    get(target, prop) {
      const value = target[prop as string];
      
      if (mediaQuery.matches) {
        return value;
      }
      
      // Return empty/default value when media query doesn't match
      return '';
    }
  });
}

// Animation utilities
export function animate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options?: KeyframeAnimationOptions
): Animation {
  return element.animate(keyframes, options);
}

export function transition(
  element: HTMLElement,
  property: string,
  duration: number = 300,
  easing: string = 'ease-in-out'
): void {
  element.style.transition = `${property} ${duration}ms ${easing}`;
  
  // Clean up transition after completion
  const cleanup = () => {
    element.style.transition = '';
  };
  
  const timer = setTimeout(cleanup, duration);
  scheduleCleanup(element, () => {
    clearTimeout(timer);
    cleanup();
  });
}

// Theme utilities
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export function applyTheme(theme: ThemeColors): void {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}

export function createThemeSignal(initialTheme: ThemeColors): Signal<ThemeColors> {
  // This would typically be implemented by the signal library
  // Placeholder for theme signal creation
  return {
    value: initialTheme,
    subscribe: () => () => {},
    dispose: () => {}
  };
}