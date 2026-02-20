/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";
import { resource } from "semajsx/ssr";
import { Layout } from "./Layout";
import { cx, flex, flexCol, itemsCenter, justifyCenter, textCenter } from "semajsx/tailwind";
import * as theme from "../styles/theme.style";

const { Style } = resource(import.meta.url);

export interface NotFoundProps {
  title?: string;
}

export function NotFound(_props: NotFoundProps): VNode {
  return (
    <Layout>
      <Style href="./styles.css" />
      <div
        class={cx(flex, flexCol, itemsCenter, justifyCenter, textCenter)}
        style="min-height: 60vh;"
      >
        <h1
          class="not-found-title"
          style="font-size: 6rem; font-weight: 700; color: #1d1d1f; letter-spacing: -0.03em; margin-bottom: 0.5rem; line-height: 1;"
        >
          404
        </h1>
        <p style="font-size: 1.5rem; font-weight: 400; color: #6e6e73; margin-bottom: 0.75rem;">
          Page Not Found
        </p>
        <p style="color: #86868b; font-size: 1rem; margin-bottom: 2.5rem; max-width: 24rem; line-height: 1.5;">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" class={cx(theme.primaryButton)}>
          Go Back Home
        </a>
      </div>
    </Layout>
  );
}
