/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  children: VNode | VNode[];
}

const styles = {
  info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ" },
  warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠" },
  success: { bg: "#f0fdf4", border: "#22c55e", icon: "✓" },
  error: { bg: "#fef2f2", border: "#ef4444", icon: "✕" },
  tip: { bg: "#faf5ff", border: "#a855f7", icon: "💡" },
};

/**
 * Callout component for highlighting important information in MDX
 */
export function Callout({ type = "info", title, children }: CalloutProps): VNode {
  const style = styles[type];

  return (
    <div
      class={`callout callout-${type}`}
      style={{
        background: style.bg,
        borderLeft: `4px solid ${style.border}`,
        padding: "16px",
        margin: "16px 0",
        borderRadius: "4px",
      }}
    >
      {title && (
        <div
          class="callout-title"
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            class="callout-icon"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: style.border,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            {style.icon}
          </span>
          {title}
        </div>
      )}
      <div class="callout-content">{children}</div>
    </div>
  );
}
