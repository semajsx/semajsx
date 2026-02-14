/** @jsxImportSource semajsx/dom */

import type { DocumentProps } from "semajsx/ssg";
import type { VNode } from "semajsx";

/**
 * Custom document template for the documentation site
 * Apple-style with Inter font fallback and proper meta tags
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
          content="SemaJSX - A lightweight, signal-based reactive JSX runtime for building modern web applications"
        />
        <meta name="theme-color" content="#fbfbfd" />
        <meta name="color-scheme" content="light" />
        <title>{title}</title>
        {/* Inter font as fallback for non-Apple systems */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
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
