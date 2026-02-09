/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";
import {
  cx,
  flex,
  flexCol,
  py4,
  sticky,
  top0,
  z50,
  px8,
  justifyBetween,
  itemsCenter,
  textXl,
  fontBold,
  gap8,
  p8,
  textCenter,
  flex1,
  wFull,
  bg,
  textColor,
  extractCss,
} from "semajsx/tailwind";

// Collect all tokens used in this file for CSS extraction
const usedTokens = [
  flex,
  flexCol,
  py4,
  sticky,
  top0,
  z50,
  px8,
  justifyBetween,
  itemsCenter,
  textXl,
  fontBold,
  gap8,
  p8,
  textCenter,
  flex1,
  wFull,
  bg.gray100,
  bg.gray50,
  textColor.blue500,
  textColor.gray500,
];

// Export CSS for build-time extraction
export const layoutCss = extractCss(...usedTokens);

interface LayoutProps {
  children: VNode | VNode[];
}

/**
 * Main layout component for documentation pages
 *
 * Mixed approach: using @semajsx/tailwind where possible,
 * falling back to custom CSS classes for unsupported features.
 *
 * Now available in tailwind: mxAuto, borderB, borderT
 * Still using custom CSS: min-h-screen, max-width container
 */
export function Layout({ children }: LayoutProps): VNode {
  return (
    <div class={cx(flex, flexCol, "min-h-screen")}>
      {/* Navbar - using mix of tailwind and custom CSS */}
      <nav class={cx(bg.gray100, py4, sticky, top0, z50, "navbar-border")}>
        <div class={cx(flex, justifyBetween, itemsCenter, px8, "max-w-container mx-auto")}>
          <a href="/" class={cx(textXl, fontBold, textColor.blue500, "no-underline")}>
            <strong>SemaJSX</strong>
          </a>
          <ul class={cx(flex, gap8, "list-none")}>
            <li>
              <a href="/docs" class="nav-link">
                Docs
              </a>
            </li>
            <li>
              <a href="/guides" class="nav-link">
                Guides
              </a>
            </li>
            <li>
              <a href="https://github.com/semajsx/semajsx" target="_blank" class="nav-link">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main class={cx(flex1, wFull, p8, "max-w-container mx-auto")}>{children}</main>

      <footer class={cx(bg.gray100, p8, textCenter, textColor.gray500, "footer-border")}>
        <p>
          Built with{" "}
          <a
            href="https://github.com/semajsx/semajsx"
            class={cx(textColor.blue500, "no-underline")}
          >
            SemaJSX
          </a>{" "}
          | MIT License | © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
