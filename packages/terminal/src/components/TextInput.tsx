/** @jsxImportSource @semajsx/terminal */
import { signal, computed, type ReadableSignal } from "@semajsx/signal";
import type { JSXNode } from "@semajsx/core";
import { onKeypress } from "../keyboard";
import { onCleanup } from "../lifecycle";

export interface TextInputProps {
  /**
   * Current value of the input.
   */
  value: string;
  /**
   * Callback when value changes.
   */
  onChange: (value: string) => void;
  /**
   * Callback when Enter is pressed.
   */
  onSubmit?: (value: string) => void;
  /**
   * Text to display when value is empty.
   */
  placeholder?: string;
  /**
   * Whether the input is focused and accepts keyboard events.
   * @default true
   */
  focus?: boolean;
  /**
   * Whether to show cursor and allow navigation with arrow keys.
   * @default true
   */
  showCursor?: boolean;
  /**
   * Replace each character with the mask string. Useful for passwords.
   */
  mask?: string;
  /**
   * Color of the input text.
   */
  color?: string;
  /**
   * Color of the placeholder text.
   * @default "gray"
   */
  placeholderColor?: string;
}

const SPECIAL_KEYS = new Set([
  "up",
  "down",
  "pageup",
  "pagedown",
  "tab",
  "escape",
  "delete",
  "insert",
  "home",
  "end",
]);

/**
 * TextInput component — a single-line text input for terminal UIs.
 *
 * Controlled component: pass `value` and `onChange` to manage state externally.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * <TextInput value={query} onChange={setQuery} onSubmit={handleSearch} />
 * ```
 *
 * @example
 * ```tsx
 * // Password input
 * <TextInput value={password} onChange={setPassword} mask="*" />
 * ```
 *
 * @example
 * ```tsx
 * // With placeholder
 * <TextInput value="" onChange={setValue} placeholder="Type something..." />
 * ```
 */
export function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  focus = true,
  showCursor = true,
  mask,
  color,
  placeholderColor = "gray",
}: TextInputProps): JSXNode {
  const cursorOffset = signal(value.length);

  // Clamp cursor when value changes externally
  if (cursorOffset.value > value.length) {
    cursorOffset.value = value.length;
  }

  const unsub = onKeypress((event) => {
    if (!focus) return;

    if (event.key === "return") {
      onSubmit?.(value);
      return;
    }

    if (event.key === "left" && showCursor) {
      cursorOffset.value = Math.max(0, cursorOffset.value - 1);
      return;
    }

    if (event.key === "right" && showCursor) {
      cursorOffset.value = Math.min(value.length, cursorOffset.value + 1);
      return;
    }

    if (event.key === "home" && showCursor) {
      cursorOffset.value = 0;
      return;
    }

    if (event.key === "end" && showCursor) {
      cursorOffset.value = value.length;
      return;
    }

    if (event.key === "backspace") {
      if (cursorOffset.value > 0) {
        const before = value.slice(0, cursorOffset.value - 1);
        const after = value.slice(cursorOffset.value);
        cursorOffset.value = Math.max(0, cursorOffset.value - 1);
        onChange(before + after);
      }
      return;
    }

    if (event.key === "delete") {
      if (cursorOffset.value < value.length) {
        const before = value.slice(0, cursorOffset.value);
        const after = value.slice(cursorOffset.value + 1);
        onChange(before + after);
      }
      return;
    }

    // Ctrl+U: clear line before cursor
    if (event.ctrl && event.key === "u") {
      const after = value.slice(cursorOffset.value);
      cursorOffset.value = 0;
      onChange(after);
      return;
    }

    // Ctrl+K: clear line after cursor
    if (event.ctrl && event.key === "k") {
      onChange(value.slice(0, cursorOffset.value));
      return;
    }

    // Ctrl+A: move to start
    if (event.ctrl && event.key === "a" && showCursor) {
      cursorOffset.value = 0;
      return;
    }

    // Ctrl+E: move to end
    if (event.ctrl && event.key === "e" && showCursor) {
      cursorOffset.value = value.length;
      return;
    }

    // Skip special keys and ctrl/meta combos
    if (event.ctrl || event.meta) return;
    if (SPECIAL_KEYS.has(event.key)) return;

    // Insert printable characters (single char, IME multi-char, space)
    const char = event.key === "space" ? " " : event.key;
    if (char) {
      const before = value.slice(0, cursorOffset.value);
      const after = value.slice(cursorOffset.value);
      cursorOffset.value += char.length;
      onChange(before + char + after);
    }
  });

  onCleanup(unsub);

  // Build the display string with cursor
  const display = computed(cursorOffset, (offset) => {
    // Empty: show placeholder
    if (!value && !focus) {
      return placeholder
        ? `\x1b[${placeholderColorCode(placeholderColor)}m${placeholder}\x1b[0m`
        : "";
    }

    if (!value && placeholder && focus) {
      if (!showCursor) {
        return `\x1b[${placeholderColorCode(placeholderColor)}m${placeholder}\x1b[0m`;
      }
      // Show cursor on first placeholder character
      const first = placeholder[0] ?? " ";
      const rest = placeholder.slice(1);
      return `\x1b[7m${first}\x1b[0m\x1b[${placeholderColorCode(placeholderColor)}m${rest}\x1b[0m`;
    }

    const displayValue = mask ? mask.repeat(value.length) : value;

    if (!showCursor || !focus) {
      return displayValue;
    }

    // Render with cursor (inverse char at cursor position)
    const before = displayValue.slice(0, offset);
    const cursorChar = offset < displayValue.length ? displayValue[offset] : " ";
    const after = displayValue.slice(offset + 1);
    return `${before}\x1b[7m${cursorChar}\x1b[0m${after}`;
  });

  return <text color={color}>{display as ReadableSignal<string>}</text>;
}

function placeholderColorCode(color: string): string {
  const codes: Record<string, string> = {
    black: "30",
    red: "31",
    green: "32",
    yellow: "33",
    blue: "34",
    magenta: "35",
    cyan: "36",
    white: "37",
    gray: "90",
    grey: "90",
  };
  return codes[color] ?? "90";
}
