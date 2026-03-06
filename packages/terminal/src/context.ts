import { signal, type WritableSignal } from "@semajsx/signal";
import type { KeyEvent, KeyHandler } from "./keyboard";

/**
 * Per-render context that holds all mutable state for a terminal render instance.
 *
 * This replaces the previous global mutable state in keyboard.ts, hooks.ts,
 * and lifecycle.ts, enabling multiple concurrent render instances and
 * proper test isolation.
 */
export interface RenderContext {
  /** Keyboard listener callbacks */
  keyboardListeners: KeyHandler[];
  /** Signal holding the last keypress event */
  lastKeySignal: WritableSignal<KeyEvent | null>;
  /** Whether the keyboard handler is installed on stdin */
  keyboardInstalled: boolean;
  /** The stdin data handler (if installed) */
  stdinHandler: ((data: Buffer) => void) | null;
  /** Exit callback for useExit() */
  exitCallback: (() => void) | null;
  /** Component cleanup callbacks for onCleanup() */
  cleanupCallbacks: (() => void)[];
  /** Signal for ExitHint component coordination */
  exitingSignal: WritableSignal<boolean>;
}

/**
 * The active render context. Set by render(), cleared on unmount.
 */
let activeContext: RenderContext | null = null;

/**
 * Create a fresh render context
 */
export function createRenderContext(): RenderContext {
  return {
    keyboardListeners: [],
    lastKeySignal: signal(null),
    keyboardInstalled: false,
    stdinHandler: null,
    exitCallback: null,
    cleanupCallbacks: [],
    exitingSignal: signal(false),
  };
}

/**
 * Set the active render context
 */
export function setActiveContext(ctx: RenderContext | null): void {
  activeContext = ctx;
}

/**
 * Get the active render context, or null if no render is active
 */
export function getActiveContext(): RenderContext | null {
  return activeContext;
}
