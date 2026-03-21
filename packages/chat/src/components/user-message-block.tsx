/** @jsxImportSource @semajsx/dom */

import type { ChatEvent } from "../types.ts";
import * as styles from "./user-message-block.style.ts";

export function UserMessageBlock(props: { event: ChatEvent }) {
  const text = (props.event.content as string) ?? (props.event.text as string) ?? "";

  return (
    <div class={styles.block}>
      <div class={styles.content}>{text}</div>
    </div>
  );
}
