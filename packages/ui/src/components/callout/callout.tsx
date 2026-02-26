/** @jsxImportSource @semajsx/dom */

/**
 * Callout component
 *
 * A styled box for highlighting important content with semantic variants.
 *
 * @example
 * ```tsx
 * import { Callout } from "@semajsx/ui/callout";
 *
 * <Callout type="info" title="Note">This is informational.</Callout>
 * <Callout type="warning">Be careful with this.</Callout>
 * <Callout type="tip" title="Pro tip">Use signals for reactivity.</Callout>
 * ```
 */

import type { JSXNode } from "@semajsx/core";
import type { StyleToken } from "@semajsx/style";
import * as styles from "./callout.style";

type ClassValue = string | StyleToken | ClassValue[] | false | null | undefined;

export type CalloutType = "info" | "warning" | "success" | "error" | "tip";

export interface CalloutProps {
  /** Semantic type controlling color and icon */
  type?: CalloutType;
  /** Optional title displayed above content */
  title?: string;
  /** Additional CSS class(es) */
  class?: ClassValue;
  /** Content */
  children?: JSXNode;
}

const calloutConfig: Record<CalloutType, { bg: string; accent: string; icon: string }> = {
  info: { bg: "rgba(0, 122, 255, 0.06)", accent: "#007aff", icon: "i" },
  warning: { bg: "rgba(255, 159, 10, 0.08)", accent: "#ff9f0a", icon: "!" },
  success: { bg: "rgba(52, 199, 89, 0.08)", accent: "#34c759", icon: "\u2713" },
  error: { bg: "rgba(255, 69, 58, 0.08)", accent: "#ff453a", icon: "\u2715" },
  tip: { bg: "rgba(175, 82, 222, 0.06)", accent: "#af52de", icon: "\u2731" },
};

export function Callout(props: CalloutProps): JSXNode {
  const type = props.type ?? "info";
  const config = calloutConfig[type];

  return (
    <div class={[styles.root, props.class]} style={`background: ${config.bg}`} role="note">
      {props.title && (
        <div class={styles.title} style={`color: ${config.accent}`}>
          <span class={styles.icon} style={`background: ${config.accent}`}>
            {config.icon}
          </span>
          {props.title}
        </div>
      )}
      <div class={styles.content}>{props.children}</div>
    </div>
  );
}
