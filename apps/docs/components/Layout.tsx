/** @jsxImportSource @semajsx/dom */

import type { VNode } from "@semajsx/core";

interface LayoutProps {
  children: VNode | VNode[];
}

/**
 * Main layout component for documentation pages
 */
export function Layout({ children }: LayoutProps): VNode {
  return (
    <div class="layout">
      <nav class="navbar">
        <div class="nav-container">
          <a href="/" class="logo">
            <strong>SemaJSX</strong>
          </a>
          <ul class="nav-links">
            <li>
              <a href="/docs">Docs</a>
            </li>
            <li>
              <a href="/guides">Guides</a>
            </li>
            <li>
              <a href="https://github.com/semajsx/semajsx" target="_blank">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main class="main-content">{children}</main>

      <footer class="footer">
        <p>
          Built with <a href="https://github.com/semajsx/semajsx">SemaJSX</a> | MIT License | ©{" "}
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
