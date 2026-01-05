/** @jsxImportSource @semajsx/dom */

import type { VNode } from "@semajsx/core";

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

/**
 * Code block component for syntax highlighting in MDX
 */
export function CodeBlock({ children, className, language }: CodeBlockProps): VNode {
  // Extract language from className (format: language-xxx)
  const lang = language || (className?.replace(/^language-/, "") ?? "text");

  return (
    <div class="code-block">
      {lang && lang !== "text" && (
        <div class="code-header">
          <span class="code-lang">{lang}</span>
        </div>
      )}
      <pre class={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
