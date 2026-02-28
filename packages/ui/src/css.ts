/**
 * Pre-collected CSS for SSG/SSR usage
 *
 * @deprecated The SSR renderer now automatically collects CSS from StyleTokens
 * during rendering. Manual collection via this module is no longer needed.
 * StyleToken CSS is included in SSRResult.styles and rendered into `<style>`
 * tags by the document template.
 *
 * @example
 * ```tsx
 * // No longer needed — SSR handles this automatically.
 * // If you still need the raw CSS string for other purposes:
 * import { componentCSS } from "@semajsx/ui/css";
 * ```
 */

import { isStyleToken } from "@semajsx/style";
import type { StyleToken } from "@semajsx/style";
import { lightTheme } from "./theme/themes";
import * as buttonStyles from "./components/button/button.style";
import * as cardStyles from "./components/card/card.style";
import * as calloutStyles from "./components/callout/callout.style";
import * as badgeStyles from "./components/badge/badge.style";
import * as codeBlockStyles from "./components/code-block/code-block.style";
import * as tabsStyles from "./components/tabs/tabs.style";
import * as stepsStyles from "./components/steps/steps.style";
import * as separatorStyles from "./components/separator/separator.style";
import * as inputStyles from "./components/input/input.style";
import * as avatarStyles from "./components/avatar/avatar.style";
import * as kbdStyles from "./components/kbd/kbd.style";
import * as switchStyles from "./components/switch/switch.style";

function collectCSS(styles: Record<string, unknown>): string {
  return Object.values(styles)
    .filter((v): v is StyleToken => isStyleToken(v))
    .map((t) => t.__cssTemplate)
    .join("\n");
}

/** All @semajsx/ui component CSS (theme variables + component rules) */
export const componentCSS: string = [
  lightTheme.__cssTemplate,
  collectCSS(buttonStyles),
  collectCSS(cardStyles),
  collectCSS(calloutStyles),
  collectCSS(badgeStyles),
  collectCSS(codeBlockStyles),
  collectCSS(tabsStyles),
  collectCSS(stepsStyles),
  collectCSS(separatorStyles),
  collectCSS(inputStyles),
  collectCSS(avatarStyles),
  collectCSS(kbdStyles),
  collectCSS(switchStyles),
].join("\n");
