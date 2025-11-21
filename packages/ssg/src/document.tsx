/** @jsxImportSource @semajsx/dom */

import type { DocumentTemplate } from "./types";

/**
 * Default HTML document template for SSG
 */
export const DefaultDocument: DocumentTemplate = ({
  children,
  title = "SSG Page",
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
    </head>
    <body>{children}</body>
  </html>
);
