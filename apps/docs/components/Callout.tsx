/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";

interface CalloutProps {
  type?: "info" | "warning" | "success" | "error" | "tip";
  title?: string;
  children: VNode | VNode[];
}

/**
 * Apple-style callout card with subtle background tints and rounded corners
 */
const styles = {
  info: { bg: "rgba(0, 122, 255, 0.06)", accent: "#007aff", icon: "i" },
  warning: { bg: "rgba(255, 159, 10, 0.08)", accent: "#ff9f0a", icon: "!" },
  success: { bg: "rgba(52, 199, 89, 0.08)", accent: "#34c759", icon: "\u2713" },
  error: { bg: "rgba(255, 69, 58, 0.08)", accent: "#ff453a", icon: "\u2715" },
  tip: { bg: "rgba(175, 82, 222, 0.06)", accent: "#af52de", icon: "\u2731" },
};

export function Callout({ type = "info", title, children }: CalloutProps): VNode {
  const style = styles[type];

  return (
    <div
      class={`callout callout-${type}`}
      style={{
        background: style.bg,
        padding: "1.25rem 1.5rem",
        margin: "1.5rem 0",
        borderRadius: "14px",
        border: "0.5px solid rgba(0, 0, 0, 0.04)",
      }}
    >
      {title && (
        <div
          class="callout-title"
          style={{
            fontWeight: "600",
            fontSize: "0.9375rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: style.accent,
            letterSpacing: "-0.005em",
          }}
        >
          <span
            class="callout-icon"
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: style.accent,
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "700",
              flexShrink: "0",
            }}
          >
            {style.icon}
          </span>
          {title}
        </div>
      )}
      <div
        class="callout-content"
        style={{
          color: "#1d1d1f",
          fontSize: "0.9375rem",
          lineHeight: "1.6",
        }}
      >
        {children}
      </div>
    </div>
  );
}
