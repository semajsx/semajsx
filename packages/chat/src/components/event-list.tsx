/** @jsxImportSource @semajsx/dom */

import type { ReadableSignal } from "@semajsx/signal";
import { computed } from "@semajsx/signal";
import type { ChatEvent } from "../types.ts";
import { EventRenderer } from "./event-renderer.tsx";
import * as styles from "./event-list.style.ts";

export function EventList(props: { events: ReadableSignal<ChatEvent[]>; class?: string }) {
  let scrollRef: HTMLDivElement | null = null;
  let userScrolledUp = false;

  function handleScroll() {
    if (!scrollRef) return;
    const { scrollTop, clientHeight, scrollHeight } = scrollRef;
    userScrolledUp = scrollTop + clientHeight < scrollHeight - 50;
  }

  function scrollToBottom() {
    if (scrollRef && !userScrolledUp) {
      scrollRef.scrollTo({ top: scrollRef.scrollHeight });
    }
  }

  // Subscribe to events signal for auto-scroll
  let unsub: (() => void) | null = null;

  function setupSubscription() {
    unsub = props.events.subscribe(() => {
      queueMicrotask(scrollToBottom);
    });
  }

  function teardown() {
    unsub?.();
    unsub = null;
  }

  setupSubscription();

  return (
    <div
      class={props.class ? `${styles.container} ${props.class}` : styles.container}
      ref={(el: HTMLDivElement) => {
        scrollRef = el;
        el.addEventListener("scroll", handleScroll, { passive: true });
        const observer = new MutationObserver(() => {
          if (!el.isConnected) {
            teardown();
            observer.disconnect();
          }
        });
        observer.observe(document.body, { subtree: true, childList: true });
      }}
    >
      {computed(props.events, (list) => {
        if (list.length === 0) {
          return <div class={styles.empty}>No messages yet</div>;
        }
        return list.map((event) => <EventRenderer event={event} />);
      })}
    </div>
  );
}
