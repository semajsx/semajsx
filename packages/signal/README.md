# @semajsx/signal

Fine-grained reactive signal system for SemaJSX. Provides reactive primitives for building efficient, reactive user interfaces without virtual DOM diffing.

## Installation

```bash
pnpm add @semajsx/signal
```

## Features

- **Signals** - Reactive state containers
- **Computed Signals** - Derived reactive values
- **Effects** - Automatic dependency tracking and execution
- **Batching** - Batch multiple updates for performance
- **Fine-grained Reactivity** - Updates only what changed

## Usage

### Basic Signal

```typescript
import { signal } from "@semajsx/signal";

const count = signal(0);

// Read value
console.log(count.value); // 0

// Update value
count.value = 1;

// Subscribe to changes
const unsubscribe = count.subscribe((newValue) => {
  console.log("Count changed:", newValue);
});
```

### Computed Signal

```typescript
import { signal, computed } from "@semajsx/signal";

const firstName = signal("John");
const lastName = signal("Doe");

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`;
});

console.log(fullName.value); // "John Doe"

firstName.value = "Jane";
console.log(fullName.value); // "Jane Doe"
```

### Effects

```typescript
import { signal, effect } from "@semajsx/signal";

const count = signal(0);

// Effect runs automatically when dependencies change
const dispose = effect(() => {
  console.log("Count is:", count.value);
});

count.value = 1; // Logs: "Count is: 1"
count.value = 2; // Logs: "Count is: 2"

// Clean up
dispose();
```

### Batching Updates

```typescript
import { signal, batch } from "@semajsx/signal";

const count = signal(0);
const doubled = computed(() => count.value * 2);

// Batch multiple updates
batch(() => {
  count.value = 1;
  count.value = 2;
  count.value = 3;
});

// doubled only updates once, with final value
console.log(doubled.value); // 6
```

### Utility Functions

```typescript
import { signal, isSignal, unwrap, peek } from "@semajsx/signal";

const count = signal(5);

// Check if value is a signal
isSignal(count); // true
isSignal(5); // false

// Unwrap a signal or return value as-is
unwrap(count); // 5
unwrap(5); // 5

// Peek at signal value without tracking
peek(count); // 5
```

## API

### `signal<T>(initialValue: T): Signal<T>`

Create a writable signal.

### `computed<T>(fn: () => T): ReadonlySignal<T>`

Create a computed signal that automatically updates when dependencies change.

### `effect(fn: () => void | (() => void)): () => void`

Run a function that automatically re-runs when its signal dependencies change.

### `batch(fn: () => void): void`

Batch multiple signal updates to trigger effects only once.

### `isSignal<T>(value: unknown): value is Signal<T>`

Check if a value is a signal.

### `unwrap<T>(value: MaybeSignal<T>): T`

Unwrap a signal or return the value as-is.

### `peek<T>(value: MaybeSignal<T>): T`

Get the value of a signal without tracking (useful inside effects).

## License

MIT
