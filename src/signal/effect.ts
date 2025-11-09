import { getCurrentEffect, setCurrentEffect } from './signal';

/**
 * Create an effect that automatically tracks signal dependencies
 * Returns a cleanup function
 */
export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: void | (() => void);
  let isRunning = false;

  const execute = () => {
    if (isRunning) {
      console.warn('Circular dependency detected in effect');
      return;
    }

    // Run cleanup from previous execution
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }

    const prevEffect = getCurrentEffect();
    isRunning = true;
    setCurrentEffect(execute);

    try {
      cleanup = fn();
    } finally {
      setCurrentEffect(prevEffect);
      isRunning = false;
    }
  };

  // Run immediately
  execute();

  // Return dispose function
  return () => {
    if (cleanup && typeof cleanup === 'function') {
      cleanup();
    }
  };
}
