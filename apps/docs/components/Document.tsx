/** @jsxImportSource @semajsx/dom */

import type { DocumentProps } from "@semajsx/ssg";
import type { VNode } from "@semajsx/core";

/**
 * Custom document template for the documentation site
 */
export function DocTemplate(props: DocumentProps): VNode {
  const { children, title = "SemaJSX Documentation", scripts, css } = props;

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="SemaJSX - A lightweight, signal-based reactive JSX runtime"
        />
        <title>{title}</title>
        {css?.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>
      <body>
        {children}
        {scripts}
      </body>
    </html>
  );
}
