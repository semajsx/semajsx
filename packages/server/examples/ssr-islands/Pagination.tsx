/** @jsxImportSource @semajsx/dom */

import { signal } from "@semajsx/signal";
import { island } from "@semajsx/server/client";

/**
 * Pagination component - returns a Fragment (no wrapper element)
 * This tests fragment island hydration with comment markers
 */
export const Pagination = island(
  function Pagination({ total = 5 }: { total?: number }) {
    const current = signal(1);

    const buttonStyle = {
      padding: "8px 16px",
      fontSize: "14px",
      cursor: "pointer",
      border: "1px solid #d1d5db",
      borderRadius: "4px",
      background: "white",
    };

    const activeStyle = {
      ...buttonStyle,
      background: "#3b82f6",
      color: "white",
      border: "1px solid #3b82f6",
    };

    // Return a fragment - multiple elements without a wrapper
    return (
      <>
        <button
          onClick={() => current.value > 1 && current.value--}
          style={buttonStyle}
          disabled={current.value === 1}
        >
          ← Prev
        </button>
        <span
          style={{
            padding: "8px 16px",
            fontWeight: "bold",
          }}
        >
          Page {current} of {total}
        </span>
        <button
          onClick={() => current.value < total && current.value++}
          style={buttonStyle}
          disabled={current.value === total}
        >
          Next →
        </button>
      </>
    );
  },
  import.meta.url,
);
