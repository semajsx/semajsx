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
import { extractThemeCss } from "../styles/extract";

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

// Extract all Apple theme CSS once for embedding in Layout
const themeCss = extractThemeCss(theme.appleTheme);

interface LayoutProps {
  children: VNode | VNode[];
}

/**
 * Main layout component with Apple-inspired frosted glass navigation
 */
export function Layout({ children }: LayoutProps): VNode {
  return (
    <div class={cx(flex, flexCol, "min-h-screen")} style="background: #fbfbfd;">
      {/* Inject Apple theme CSS on every page */}
      <style>{themeCss}</style>

      {/* Apple-style Frosted Glass Navigation */}
      <nav class={cx(theme.glassNav._, sticky, top0, z50)}>
        <div
          class={cx(flex, justifyBetween, itemsCenter, "max-w-container mx-auto nav-inner")}
          style="padding: 14px 2rem; height: 52px;"
        >
          <a
            href="/"
            class="no-underline nav-logo"
            style="color: #1d1d1f; font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em;"
          >
            SemaJSX
          </a>
          <ul class={cx(flex, "list-none nav-links")} style="margin: 0; gap: 2rem;">
            <li>
              <a
                href="/docs"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-size: 0.875rem; font-weight: 400; letter-spacing: -0.005em; transition: color 0.2s ease;"
              >
                Docs
              </a>
            </li>
            <li>
              <a
                href="/guides"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-size: 0.875rem; font-weight: 400; letter-spacing: -0.005em; transition: color 0.2s ease;"
              >
                Guides
              </a>
            </li>
            <li>
              <a
                href="https://github.com/semajsx/semajsx"
                target="_blank"
                class="nav-link"
                style="color: #1d1d1f; text-decoration: none; font-size: 0.875rem; font-weight: 400; letter-spacing: -0.005em; transition: color 0.2s ease;"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main
        class={cx(flex1, wFull, "max-w-container mx-auto main-content")}
        style="padding: 2rem 2rem 4rem;"
      >
        {children}
      </main>

      {/* Apple-style Footer */}
      <footer style="border-top: 0.5px solid rgba(0, 0, 0, 0.08); background: #f5f5f7;">
        <div
          class="max-w-container mx-auto footer-inner"
          style="padding: 2rem 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"
        >
          <div class="footer-links" style="display: flex; gap: 2rem; align-items: center;">
            <a
              href="/docs"
              style="color: #6e6e73; text-decoration: none; font-size: 0.8125rem; transition: color 0.2s;"
            >
              Documentation
            </a>
            <a
              href="/guides"
              style="color: #6e6e73; text-decoration: none; font-size: 0.8125rem; transition: color 0.2s;"
            >
              Guides
            </a>
            <a
              href="https://github.com/semajsx/semajsx"
              style="color: #6e6e73; text-decoration: none; font-size: 0.8125rem; transition: color 0.2s;"
            >
              GitHub
            </a>
          </div>
          <p style="color: #86868b; font-size: 0.8125rem; margin: 0;">
            {`\u00A9 ${new Date().getFullYear()} SemaJSX`}. MIT License.
          </p>
        </div>
      </footer>
    </div>
  );
}
