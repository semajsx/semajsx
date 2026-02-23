/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";
import { Layout } from "./Layout";
import { cx, flex, gap4, justifyCenter } from "semajsx/tailwind";
import * as theme from "../styles/theme.style";

export interface NotFoundProps {
  title?: string;
}

export function NotFound(_props: NotFoundProps): VNode {
  return (
    <Layout>
      <div
        class={cx(theme.heroBg, "not-found-section")}
        style="padding: 100px 24px 80px; position: relative;"
      >
        <div style="max-width: 680px; margin: 0 auto; position: relative; z-index: 1; text-align: center;">
          <h1
            class={cx("not-found-title", theme.animSlideUp)}
            style="font-size: clamp(4rem, 12vw, 8rem); font-weight: 700; line-height: 1; letter-spacing: -0.04em; background: linear-gradient(135deg, #1d1d1f 30%, #6e6e73 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 1.25rem;"
          >
            404
          </h1>
          <p
            class={cx(theme.heroSubtitle, theme.animSlideUp, theme.stagger1)}
            style="margin-bottom: 0.75rem;"
          >
            Page Not Found
          </p>
          <p
            class={cx(theme.animSlideUp, theme.stagger2)}
            style="color: #86868b; font-size: 1rem; margin-bottom: 2.5rem; max-width: 28rem; margin-left: auto; margin-right: auto; line-height: 1.6;"
          >
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div
            class={cx(
              flex,
              gap4,
              justifyCenter,
              theme.animSlideUp,
              theme.stagger3,
              "not-found-cta",
            )}
          >
            <a href="/" class={cx(theme.primaryButton)}>
              Go Back Home
            </a>
            <a href="/docs" class={cx(theme.secondaryButton)}>
              View Docs
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
