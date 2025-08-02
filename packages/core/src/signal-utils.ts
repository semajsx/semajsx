import { Signal } from './types';

// Check if a value is a Signal
export function isSignal(value: any): value is Signal {
  return value != null && 
         typeof value === 'object' && 
         'value' in value && 
         'subscribe' in value &&
         typeof value.subscribe === 'function';
}

// Apply props to element, handling Signals
export function applyProps(
  element: any,
  props: Record<string, any>,
  strategies: any
): (() => void)[] {
  const subscriptions: (() => void)[] = [];
  
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') continue;
    
    if (isSignal(value)) {
      const unsubscribe = strategies.setSignalProperty(element, key, value);
      subscriptions.push(unsubscribe);
    } else {
      strategies.setProperty(element, key, value);
    }
  }
  
  return subscriptions;
}

// Create a safe signal wrapper with error handling
export function createSafeSignal<T>(signal: Signal<T>, fallbackValue: T): Signal<T> {
  return {
    get value() {
      try {
        return signal.value;
      } catch (error) {
        console.error('Signal evaluation error:', error);
        return fallbackValue;
      }
    },
    
    subscribe(listener) {
      return signal.subscribe((value, prev) => {
        try {
          listener(value, prev);
        } catch (error) {
          console.error('Signal listener error:', error);
        }
      });
    },
    
    dispose() {
      signal.dispose?.();
    }
  };
}