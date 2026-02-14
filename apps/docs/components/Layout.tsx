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
import * as theme from "../styles/theme.style";
import type { StyleToken } from "semajsx/style";

// Helper function to extract CSS from StyleTokens
function extractThemeCss(themeObj: Record<string, unknown>): string {
  const cssStrings: string[] = [];
  for (const value of Object.values(themeObj)) {
    if (value && typeof value === "object" && "__cssTemplate" in value) {
      const token = value as StyleToken;
      cssStrings.push(token.__cssTemplate);
    }
  }
  return cssStrings.join("\n");
}

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
export const layoutThemeCss = extractThemeCss({ glassNav: theme.glassNav });

interface LayoutProps {
  children: VNode | VNode[];
}

/**
 * Main layout component for documentation pages with Apple-inspired frosted glass design
 */
export function Layout({ children }: LayoutProps): VNode {
  return (
    <div class={cx(flex, flexCol, "min-h-screen")}>
      {/* Frosted Glass Navigation - Apple Style */}
      <nav class={cx(theme.glassNav._, sticky, top0, z50)} style="padding: 16px 0;">
        <div class={cx(flex, justifyBetween, itemsCenter, px8, "max-w-container mx-auto")}>
          <a href="/" class={cx(textXl, fontBold, "no-underline")} style="color: #1d1d1f;">
            <strong>SemaJSX</strong>
          </a>
          <ul class={cx(flex, gap8, "list-none")}>
            <li>
              <a
                href="/docs"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-weight: 500; transition: all 0.2s;"
              >
                Docs
              </a>
            </li>
            <li>
              <a
                href="/guides"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-weight: 500; transition: all 0.2s;"
              >
                Guides
              </a>
            </li>
            <li>
              <a
                href="https://github.com/semajsx/semajsx"
                target="_blank"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-weight: 500; transition: all 0.2s;"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main class={cx(flex1, wFull, p8, "max-w-container mx-auto")}>{children}</main>

      {/* Minimal Footer - Apple Style */}
      <footer style="background: #f5f5f7; padding: 40px 20px; text-align: center; border-top: 1px solid rgba(0, 0, 0, 0.1);">
        <p style="color: #6e6e73; font-size: 14px; margin: 0;">
          Built with{" "}
          <a
            href="https://github.com/semajsx/semajsx"
            style="color: #0071e3; text-decoration: none; font-weight: 500;"
          >
            SemaJSX
          </a>{" "}
          | MIT License | © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
