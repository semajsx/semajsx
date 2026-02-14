/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";
import { resource } from "semajsx/ssr";
import { Layout } from "./Layout";
import {
  cx,
  flex,
  flexCol,
  itemsCenter,
  justifyCenter,
  text6xl,
  text2xl,
  textColor,
  mb4,
  mb8,
  px6,
  py3,
  bg,
  roundedMd,
  noUnderline,
  fontBold,
  textCenter,
} from "semajsx/tailwind";

const { Style } = resource(import.meta.url);

export interface NotFoundProps {
  title?: string;
}

export function NotFound({ title = "404 - Page Not Found | SemaJSX" }: NotFoundProps): VNode {
  return (
    <Layout>
      <Style href="./styles.css" />
      <div
        class={cx(flex, flexCol, itemsCenter, justifyCenter, textCenter)}
        style="min-height: 60vh;"
      >
        <h1 class={cx(text6xl, fontBold, mb4)} style="color: #1d1d1f;">
          404
        </h1>
        <p class={cx(text2xl, mb8)} style="color: #6e6e73;">
          Page Not Found
        </p>
        <p class={cx(mb8)} style="color: #86868b;">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          class={cx(px6, py3, roundedMd, noUnderline, fontBold)}
          style="background: #0071e3; color: white; border-radius: 980px;"
        >
          Go Back Home
        </a>
      </div>
    </Layout>
  );
}
