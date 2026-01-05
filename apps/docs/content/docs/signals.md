---
title: Signals
description: Learn about SemaJSX's reactive signal system
order: 2
category: Core Concepts
---

# Signals

Signals are the foundation of SemaJSX's reactivity system. They provide fine-grained reactivity that automatically tracks dependencies and updates only what changed.

## What are Signals?

A signal is a reactive primitive that holds a value and notifies subscribers when that value changes.

```tsx
import { signal } from "semajsx/signal";

const count = signal(0);

console.log(count.value); // 0
count.value = 5;
console.log(count.value); // 5
```

## Creating Signals

Use the `signal()` function to create a new signal:

```tsx
import { signal } from "semajsx/signal";

// Primitive values
const name = signal("Alice");
const age = signal(25);
const isActive = signal(true);

// Objects and arrays
const user = signal({ name: "Bob", age: 30 });
const items = signal([1, 2, 3]);
```

<Callout type="warning" title="Object mutations">
For objects and arrays, you must replace the entire value to trigger updates. Mutating nested properties won't trigger reactivity.
</Callout>

## Using Signals in JSX

Signals automatically subscribe when used in JSX:

```tsx
/** @jsxImportSource @semajsx/dom */

import { signal } from "semajsx/signal";

function App() {
  const count = signal(0);

  return (
    <div>
      {/* Signal value is automatically tracked */}
      <p>Count: {count}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

## Computed Signals

Create derived values with `computed()`:

```tsx
import { signal, computed } from "semajsx/signal";

const firstName = signal("John");
const lastName = signal("Doe");

// Automatically updates when firstName or lastName changes
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

firstName.value = "Jane";
console.log(fullName.value); // "Jane Doe"
```

## Effects

Run side effects when signals change using `effect()`:

```tsx
import { signal, effect } from "semajsx/signal";

const count = signal(0);

// Run whenever count changes
effect(() => {
  console.log(`Count is now: ${count.value}`);
});

count.value = 1; // Logs: "Count is now: 1"
count.value = 2; // Logs: "Count is now: 2"
```

## Batching Updates

Use `batch()` to group multiple signal updates:

```tsx
import { signal, batch } from "semajsx/signal";

const x = signal(0);
const y = signal(0);

// Without batching - triggers 2 updates
x.value = 10;
y.value = 20;

// With batching - triggers 1 update
batch(() => {
  x.value = 10;
  y.value = 20;
});
```

<Callout type="tip" title="Performance optimization">
Use batching when updating multiple signals at once to minimize re-renders.
</Callout>

## Best Practices

1. **Keep signals simple** - Store primitive values or immutable data
2. **Use computed for derived values** - Don't manually sync related signals
3. **Batch related updates** - Group multiple signal changes together
4. **Cleanup effects** - Return cleanup functions from effects when needed

## Next Steps

- Learn about [Components](/docs/components)
- Explore [DOM Rendering](/docs/dom-rendering)
- Check out [Advanced Patterns](/guides/advanced-reactivity)
