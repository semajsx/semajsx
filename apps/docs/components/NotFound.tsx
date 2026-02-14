/** @jsxImportSource semajsx/dom */

import type { VNode } from "semajsx";
import { DocTemplate } from "./Document";
import {
  cx,
  flex,
  flexCol,
  itemsCenter,
  justifyCenter,
  minHScreen,
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

export interface NotFoundProps {
  title?: string;
}

export function NotFound({ title = "404 - Page Not Found | SemaJSX" }: NotFoundProps): VNode {
  return (
    <DocTemplate title={title}>
      <div className={cx(flex, flexCol, itemsCenter, justifyCenter, minHScreen, textCenter)}>
        <h1 className={cx(text6xl, fontBold, textColor.gray800, mb4)}>404</h1>
        <p className={cx(text2xl, textColor.gray600, mb8)}>Page Not Found</p>
        <p className={cx(textColor.gray500, mb8)}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className={cx(px6, py3, bg.blue500, textColor.white, roundedMd, noUnderline, fontBold)}
        >
          Go Back Home
        </a>
      </div>
    </DocTemplate>
  );
}
