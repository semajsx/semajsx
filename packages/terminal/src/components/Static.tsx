/** @jsxImportSource @semajsx/terminal */
import { signal, computed, type ReadableSignal } from "@semajsx/signal";
import type { VNode, JSXNode } from "@semajsx/core";
import { onCleanup } from "../lifecycle";
import { getActiveSession } from "../context";
import { print } from "../render";

export interface StaticProps<T> {
  /**
   * Array of items to render. Only new items (appended to the end)
   * will be rendered. Previously rendered items are never updated.
   */
  items: T[];
  /**
   * Render function for each item. Must return a JSX element.
   * Called only once per item when it first appears.
   */
  children: (item: T, index: number) => JSXNode;
}

/**
 * Static component — renders items permanently above dynamic content.
 *
 * Each item is rendered once and committed to the terminal output.
 * It will not be erased or re-rendered on subsequent updates.
 * Only new items appended to the `items` array trigger rendering.
 *
 * This is useful for:
 * - Test runners showing completed tests
 * - Build logs showing completed steps
 * - Chat messages that shouldn't flicker on re-render
 *
 * @example
 * ```tsx
 * const [logs, setLogs] = signal([]);
 *
 * <Static items={logs.value}>
 *   {(log, i) => <text key={i} color="green">✔ {log}</text>}
 * </Static>
 * <text dim>Processing...</text>
 * ```
 */
export function Static<T>({ items, children }: StaticProps<T>): JSXNode {
  let renderedCount = 0;

  const flushNew = () => {
    const session = getActiveSession();
    if (!session?.renderer) return;

    const newItems = items.slice(renderedCount);
    if (newItems.length === 0) return;

    // Render each new item using print() to capture its output,
    // then commit via the renderer so it stays above dynamic content.
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i]!;
      const globalIndex = renderedCount + i;
      const element = children(item, globalIndex);

      // Use the renderer's stream to capture print output
      const stream = session.renderer.getRoot().stream;

      // Capture the rendered text by temporarily redirecting print
      const lines: string[] = [];
      const origWrite = stream.write;
      stream.write = ((chunk: any) => {
        const str = typeof chunk === "string" ? chunk : chunk.toString();
        // Filter out cursor hide/show sequences from print()
        const cleaned = str.replace(/\x1b\[\?25[lh]/g, "").replace(/\n$/, "");
        if (cleaned) lines.push(cleaned);
        return true;
      }) as any;

      print(element as VNode, { stream });

      stream.write = origWrite;

      if (lines.length > 0) {
        session.renderer.commitStaticOutput(lines.join("\n"));
      }
    }

    renderedCount = items.length;
  };

  // Flush on first render
  flushNew();

  // Set up a timer to check for new items (signals trigger re-render at 60fps,
  // but Static needs to flush before the dynamic re-render)
  const timer = setInterval(flushNew, 16);
  onCleanup(() => clearInterval(timer));

  // Return nothing — static items are committed directly to the terminal
  return null;
}
