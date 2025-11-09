/**
 * Core Signal types
 */

export interface Signal<T = any> {
  readonly value: T;
  subscribe(listener: (value: T) => void): () => void;
  peek(): T;
}

export interface WritableSignal<T = any> extends Signal<T> {
  value: T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
}

export interface ComputedSignal<T = any> extends Signal<T> {
  readonly value: T;
}

export type MaybeSignal<T> = T | Signal<T>;
export type SignalValue<S> = S extends Signal<infer T> ? T : never;
