import type { VNode } from "../runtime/types";
import { setProperty, setSignalProperty } from "./properties";
import {
  appendChild,
  createElement,
  createTextNode,
  removeChild,
  replaceNode,
} from "./operations";
import { TerminalRenderer } from "./renderer";
import type { TerminalNode } from "./types";
import { getExitingSignal, resetExitingSignal } from "./components/ExitHint";
import { type ContextMap } from "../runtime/context";
import { createRenderer, type RenderStrategy } from "../runtime/render-core";

/**
 * Terminal-specific render strategy (no reuse optimization needed)
 */
const terminalStrategy: RenderStrategy<TerminalNode> = {
  createTextNode,
  createElement,
  appendChild,
  removeChild,
  replaceNode,
  setProperty,
  setSignalProperty,
  // Terminal doesn't need tryReuseNode optimization
};

// Create terminal renderer
const { renderNode, cleanupSubscriptions } = createRenderer(terminalStrategy);

/**
 * Options for terminal rendering
 */
export interface RenderOptions {
  /**
   * Custom renderer instance. If not provided, one will be created automatically.
   */
  renderer?: TerminalRenderer;
  /**
   * Whether to automatically re-render on signal changes.
   * @default true
   */
  autoRender?: boolean;
  /**
   * Target frames per second for auto-rendering.
   * @default 60
   */
  fps?: number;
  /**
   * Output stream to render to. Only used if renderer is not provided.
   * @default process.stdout
   */
  stream?: NodeJS.WriteStream;
}

/**
 * Return type for render function
 */
export interface RenderResult {
  /**
   * Re-render the tree (useful for manual updates)
   */
  rerender: () => void;
  /**
   * Unmount and cleanup
   */
  unmount: () => void;
  /**
   * Wait for all pending async operations
   */
  waitUntilExit: () => Promise<void>;
}

/**
 * Options for print function
 */
export interface PrintOptions {
  /**
   * Output stream to print to.
   * @default process.stdout
   */
  stream?: NodeJS.WriteStream;
}

/**
 * Render a VNode tree to the terminal
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 *
 * @example
 * // Simple usage (ink-style)
 * const { unmount } = render(<App />);
 *
 * @example
 * // With custom stream
 * render(<App />, { stream: process.stderr });
 *
 * @example
 * // Disable auto-rendering
 * const { rerender } = render(<App />, { autoRender: false });
 * setInterval(rerender, 100);
 *
 * @example
 * // With custom renderer
 * const renderer = new TerminalRenderer(process.stderr);
 * render(<App />, { renderer });
 *
 * @example
 * // Custom FPS
 * render(<App />, { fps: 30 });
 */
export function render(
  element: VNode,
  options: RenderOptions = {},
): RenderResult {
  const {
    renderer,
    autoRender = true,
    fps = 60,
    stream: outputStream = process.stdout,
  } = options;

  // Reset exiting signal for new render
  resetExitingSignal();

  // Auto-create renderer if not provided (ink-style API)
  const autoCreated = !renderer;
  const actualRenderer = renderer || new TerminalRenderer(outputStream);

  const root = actualRenderer.getRoot();

  // Initialize empty context map for root render
  const initialContext: ContextMap = new Map();

  const rendered = renderNode(element, initialContext);

  if (rendered.node) {
    appendChild(root, rendered.node);
  } else if (rendered.children.length > 0) {
    // Fragment case - append all fragment children
    for (const child of rendered.children) {
      if (child.node) {
        appendChild(root, child.node);
      }
    }
  }

  // Initial render
  actualRenderer.render();

  // Rendering lock to prevent overlapping renders (race condition fix)
  let isRendering = false;
  const safeRender = () => {
    if (isRendering) return;
    isRendering = true;
    try {
      actualRenderer.render();
    } finally {
      isRendering = false;
    }
  };

  // Auto re-render on signal changes (like ink)
  let renderInterval: NodeJS.Timeout | null = null;
  if (autoRender) {
    const interval = Math.floor(1000 / fps);
    renderInterval = setInterval(() => {
      safeRender();
    }, interval);
  }

  // Promise that resolves on exit
  let exitResolver: (() => void) | null = null;
  const exitPromise = new Promise<void>((resolve) => {
    exitResolver = resolve;
  });

  // Track original terminal state for cleanup
  const originalRawMode = process.stdin.isTTY && process.stdin.isRaw;
  let handleExit: (() => void) | null = null;
  let handleKeypress: ((data: Buffer) => void) | null = null;

  // Cleanup function to restore terminal state
  const cleanup = () => {
    // Stop auto-rendering
    if (renderInterval) {
      clearInterval(renderInterval);
      renderInterval = null;
    }

    // Remove event listeners
    if (handleExit) {
      process.removeListener("SIGINT", handleExit);
      process.removeListener("SIGTERM", handleExit);
    }
    if (handleKeypress) {
      process.stdin.removeListener("data", handleKeypress);
    }

    // Restore original terminal state
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      try {
        process.stdin.setRawMode(originalRawMode || false);
      } catch (err) {
        // Terminal may already be closed, ignore error
      }
    }

    // Clean up subscriptions only (preserve output on exit)
    cleanupSubscriptions(rendered);
    actualRenderer.destroy();

    if (exitResolver) {
      exitResolver();
    }
  };

  // Unmount function
  const unmount = () => {
    // Mark as exiting to hide ExitHint components
    getExitingSignal().value = true;

    // Trigger one final render to apply ExitHint changes
    // This removes exit prompts from the final output
    actualRenderer.render();

    cleanup();
  };

  // Handle Ctrl+C if auto-created
  if (autoCreated) {
    handleExit = () => {
      unmount();
      process.exit(0);
    };

    // Install signal handlers with error recovery
    try {
      process.on("SIGINT", handleExit);
      process.on("SIGTERM", handleExit);

      // Enable stdin for keyboard input
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();

        handleKeypress = (data: Buffer) => {
          const key = data.toString();
          // Ctrl+C or ESC to exit
          if (key === "\u0003" || key === "\u001b") {
            if (handleExit) {
              handleExit();
            }
          }
        };

        process.stdin.on("data", handleKeypress);
      }
    } catch (err) {
      // If setup fails, clean up and rethrow
      cleanup();
      throw err;
    }
  }

  return {
    rerender: safeRender,
    unmount,
    waitUntilExit: () => exitPromise,
  };
}

/**
 * Print a VNode tree to the terminal once (no auto-rendering).
 * Supports sync VNodes, async VNodes (Promise), and streaming VNodes (AsyncIterableIterator)
 *
 * This is a convenience function for one-time rendering scenarios like:
 * - Server startup messages
 * - CLI output
 * - Static terminal displays
 *
 * Unlike `render()`, this function:
 * - Does not subscribe to signal changes
 * - Does not auto-render on updates
 * - Immediately outputs and cleans up
 * - Does not capture keyboard input
 *
 * @example
 * // Simple server output
 * print(
 *   <box border="round" borderColor="green" padding={1}>
 *     <text bold color="green">Server started!</text>
 *     <text>URL: http://localhost:3000</text>
 *   </box>
 * );
 *
 * @example
 * // Print to stderr
 * print(<text color="red">Error occurred</text>, { stream: process.stderr });
 */
export function print(element: VNode, options: PrintOptions = {}): void {
  const { stream: outputStream = process.stdout } = options;

  // Save raw mode state
  const wasRawMode = process.stdin.isTTY && process.stdin.isRaw;

  // Create renderer
  const renderer = new TerminalRenderer(outputStream);
  const root = renderer.getRoot();

  // Initialize empty context map for root render
  const initialContext: ContextMap = new Map();

  // Render the element
  const rendered = renderNode(element, initialContext);

  if (rendered.node) {
    appendChild(root, rendered.node);
  } else if (rendered.children.length > 0) {
    // Fragment case - append all fragment children
    for (const child of rendered.children) {
      if (child.node) {
        appendChild(root, child.node);
      }
    }
  }

  // Render once
  renderer.render();

  // Clean up subscriptions only (don't remove nodes from tree)
  // This keeps the output visible after destroy
  cleanupSubscriptions(rendered);

  // Destroy renderer (outputs final result and shows cursor)
  renderer.destroy();

  // Restore raw mode if it was enabled
  if (process.stdin.isTTY && process.stdin.setRawMode && wasRawMode) {
    process.stdin.setRawMode(true);
  }
}
