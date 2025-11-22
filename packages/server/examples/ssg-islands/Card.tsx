/** @jsxImportSource @semajsx/dom */

import type { VNode } from "@semajsx/core";

interface CardProps {
  title: string;
  children: VNode | VNode[];
  variant?: "default" | "highlight" | "info";
}

/**
 * Reusable static Card component
 */
export function Card({ title, children, variant = "default" }: CardProps) {
  const borderColors = {
    default: "#e5e7eb",
    highlight: "#3b82f6",
    info: "#10b981",
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        margin: "20px 0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderLeft: `4px solid ${borderColors[variant]}`,
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", color: "#374151" }}>{title}</h3>
      <div style={{ color: "#6b7280" }}>{children}</div>
    </div>
  );
}
