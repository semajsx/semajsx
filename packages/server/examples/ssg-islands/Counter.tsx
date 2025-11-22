/** @jsxImportSource @semajsx/dom */

import { signal } from "@semajsx/signal";
import { island } from "@semajsx/server/client";

/**
 * Counter island - interactive component that hydrates on client
 */
export const Counter = island(
  function Counter({
    initial = 0,
    label = "Count",
  }: {
    initial?: number;
    label?: string;
  }) {
    const count = signal(initial);

    return (
      <div
        style={{
          padding: "20px",
          border: "2px solid #8b5cf6",
          borderRadius: "8px",
          margin: "10px 0",
          background: "#faf5ff",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0", color: "#6d28d9" }}>
          {label} (Island)
        </h4>
        <p style={{ fontSize: "1.5rem", margin: "0 0 15px 0" }}>
          Value: <strong>{count}</strong>
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => count.value++}
            style={{
              padding: "8px 16px",
              background: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            +1
          </button>
          <button
            onClick={() => count.value--}
            style={{
              padding: "8px 16px",
              background: "#a78bfa",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            -1
          </button>
          <button
            onClick={() => (count.value = initial)}
            style={{
              padding: "8px 16px",
              background: "#ddd6fe",
              color: "#6d28d9",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>
      </div>
    );
  },
  import.meta.url,
);
