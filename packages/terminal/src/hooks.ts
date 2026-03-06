/**
 * Terminal hooks for interactive CLI applications
 */

/**
 * Exit callback type
 */
type ExitCallback = () => void;

/**
 * Global exit callback, set by render()
 */
let globalExitCallback: ExitCallback | null = null;

/**
 * Register the exit callback (called internally by render())
 */
export function setExitCallback(callback: ExitCallback | null): void {
  globalExitCallback = callback;
}

/**
 * Programmatic exit hook - allows components to trigger unmount.
 *
 * Returns a function that, when called, unmounts the terminal app
 * (equivalent to pressing Ctrl+C).
 *
 * @example
 * ```tsx
 * function App() {
 *   const exit = useExit();
 *
 *   onKeypress((event) => {
 *     if (event.key === "q") exit();
 *   });
 *
 *   return <text>Press q to quit</text>;
 * }
 * ```
 */
export function useExit(): () => void {
  return () => {
    if (globalExitCallback) {
      globalExitCallback();
    }
  };
}

/**
 * Check whether stdin raw mode is supported and/or active.
 *
 * Useful for graceful degradation in non-TTY environments (CI, pipes).
 *
 * @example
 * ```tsx
 * const { supported, active } = isRawModeSupported();
 * if (!supported) {
 *   print(<text>Interactive mode not available</text>);
 * }
 * ```
 */
export function isRawModeSupported(): { supported: boolean; active: boolean } {
  const supported = Boolean(process.stdin.isTTY && process.stdin.setRawMode);
  const active = supported && Boolean(process.stdin.isRaw);
  return { supported, active };
}
