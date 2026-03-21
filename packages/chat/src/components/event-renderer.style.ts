import { classes, rule } from "@semajsx/style";
import { chatTokens as t } from "../theme/tokens.ts";

const c = classes(["wrapper"] as const);

export const wrapper = rule`${c.wrapper} {
  width: 100%;
  color: ${t.chat.assistantText};
}`;
