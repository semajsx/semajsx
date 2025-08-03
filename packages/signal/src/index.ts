// Signal types
export interface Signal<T = any> {
  value: T;
  subscribe(fn: (value: T) => void): () => void;
  peek(): T;
}

export interface ComputedSignal<T = any> extends Signal<T> {
  readonly value: T;
}

export interface WritableSignal<T = any> extends Signal<T> {
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

// Effect tracking
let currentEffect: (() => void) | null = null;
const signalSubscribers = new WeakMap<Signal<any>, Set<() => void>>();

// Create a reactive signal
export function signal<T>(initialValue: T): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<() => void>();
  
  const signalObj: WritableSignal<T> = {
    get value() {
      // Track dependencies
      if (currentEffect) {
        subscribers.add(currentEffect);
      }
      return value;
    },
    
    set value(newValue: T) {
      if (value !== newValue) {
        value = newValue;
        // Notify subscribers
        subscribers.forEach(fn => fn());
      }
    },
    
    subscribe(fn: (value: T) => void) {
      const wrapper = () => fn(value);
      subscribers.add(wrapper);
      return () => {
        subscribers.delete(wrapper);
      };
    },
    
    peek() {
      return value;
    },
    
    set(newValue: T) {
      this.value = newValue;
    },
    
    update(fn: (value: T) => T) {
      this.value = fn(value);
    }
  };
  
  signalSubscribers.set(signalObj, subscribers);
  
  return signalObj;
}

// Create a computed signal
export function computed<T>(fn: () => T): ComputedSignal<T> {
  let value: T;
  let dirty = true;
  const subscribers = new Set<() => void>();
  
  const compute = () => {
    const prevEffect = currentEffect;
    currentEffect = compute;
    try {
      value = fn();
      dirty = false;
    } finally {
      currentEffect = prevEffect;
    }
  };
  
  const computedSignal: ComputedSignal<T> = {
    get value() {
      if (dirty) {
        compute();
      }
      if (currentEffect) {
        subscribers.add(currentEffect);
      }
      return value;
    },
    
    subscribe(fn: (value: T) => void) {
      const wrapper = () => {
        dirty = true;
        compute();
        fn(value);
      };
      subscribers.add(wrapper);
      return () => {
        subscribers.delete(wrapper);
      };
    },
    
    peek() {
      if (dirty) {
        compute();
      }
      return value;
    }
  };
  
  signalSubscribers.set(computedSignal, subscribers);
  
  // Initial computation
  compute();
  
  return computedSignal;
}

// Create an effect that runs when dependencies change
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | void;
  
  const execute = () => {
    // Clean up previous effect
    if (cleanup) {
      cleanup();
    }
    
    const prevEffect = currentEffect;
    currentEffect = execute;
    try {
      cleanup = fn();
    } finally {
      currentEffect = prevEffect;
    }
  };
  
  // Run the effect immediately
  execute();
  
  // Return cleanup function
  return () => {
    if (cleanup) {
      cleanup();
    }
  };
}

// Batch multiple signal updates
export function batch(fn: () => void): void {
  const updates = new Set<() => void>();
  const originalNotify = notifySubscribers;
  
  // Override notify to collect updates
  notifySubscribers = (subscribers: Set<() => void>) => {
    subscribers.forEach(sub => updates.add(sub));
  };
  
  try {
    fn();
  } finally {
    // Restore original notify
    notifySubscribers = originalNotify;
    // Execute all collected updates
    updates.forEach(update => update());
  }
}

let notifySubscribers = (subscribers: Set<() => void>) => {
  subscribers.forEach(fn => fn());
};

// Create a readonly signal
export function readonly<T>(source: Signal<T>): Signal<T> {
  return {
    get value() {
      return source.value;
    },
    subscribe: source.subscribe,
    peek: source.peek
  };
}

// Check if a value is a signal
export function isSignal(value: any): value is Signal {
  return value && typeof value === 'object' && 'value' in value && 'subscribe' in value;
}

// Untrack dependencies
export function untrack<T>(fn: () => T): T {
  const prevEffect = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prevEffect;
  }
}

// Create a memo (alias for computed)
export const memo = computed;

// Create a writable signal with custom equality check
export function signalWithEquals<T>(
  initialValue: T,
  equals: (a: T, b: T) => boolean = Object.is
): WritableSignal<T> {
  let value = initialValue;
  const subscribers = new Set<() => void>();
  
  const signalObj: WritableSignal<T> = {
    get value() {
      if (currentEffect) {
        subscribers.add(currentEffect);
      }
      return value;
    },
    
    set value(newValue: T) {
      if (!equals(value, newValue)) {
        value = newValue;
        subscribers.forEach(fn => fn());
      }
    },
    
    subscribe(fn: (value: T) => void) {
      const wrapper = () => fn(value);
      subscribers.add(wrapper);
      return () => {
        subscribers.delete(wrapper);
      };
    },
    
    peek() {
      return value;
    },
    
    set(newValue: T) {
      this.value = newValue;
    },
    
    update(fn: (value: T) => T) {
      this.value = fn(value);
    }
  };
  
  signalSubscribers.set(signalObj, subscribers);
  
  return signalObj;
}

// Export utility types
export type SignalValue<S> = S extends Signal<infer T> ? T : never;
export type MaybeSignal<T> = T | Signal<T>;

// Helper to get value from signal or regular value
export function unwrap<T>(value: MaybeSignal<T>): T {
  return isSignal(value) ? value.value : value;
}

// Helper to convert value to signal
export function toSignal<T>(value: MaybeSignal<T>): Signal<T> {
  return isSignal(value) ? value : signal(value);
}