/**
 * Batch multiple signal updates to run effects only once
 */

let batchDepth = 0;
const pendingEffects = new Set<() => void>();

export function batch<T>(fn: () => T): T {
  batchDepth++;

  try {
    return fn();
  } finally {
    batchDepth--;

    if (batchDepth === 0) {
      flushEffects();
    }
  }
}

export function scheduleBatchedEffect(effect: () => void): void {
  if (batchDepth > 0) {
    pendingEffects.add(effect);
  } else {
    effect();
  }
}

function flushEffects(): void {
  const effects = Array.from(pendingEffects);
  pendingEffects.clear();

  for (const effect of effects) {
    effect();
  }
}
