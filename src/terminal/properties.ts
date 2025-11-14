import type { Signal } from '../signal';
import type { TerminalNode, TerminalElement, TerminalStyle } from './types';
import { applyStyle } from './operations';

/**
 * Set a property on a terminal node
 */
export function setProperty(node: TerminalNode, key: string, value: unknown): void {
  if (node.type !== 'element') return;

  // Handle style properties
  if (isStyleProperty(key)) {
    const styleUpdate: Partial<TerminalStyle> = { [key]: value };
    applyStyle(node, styleUpdate);
    return;
  }

  // Store other props
  node.props[key] = value;
}

/**
 * Set a signal property on a terminal node
 */
export function setSignalProperty<T = unknown>(
  node: TerminalNode,
  key: string,
  signal: Signal<T>
): () => void {
  // Set initial value
  setProperty(node, key, signal.peek());

  // Subscribe to changes
  return signal.subscribe((value: T) => {
    setProperty(node, key, value);
  });
}

/**
 * Check if a property is a style property
 */
function isStyleProperty(key: string): boolean {
  const styleProps = new Set([
    'flexDirection',
    'justifyContent',
    'alignItems',
    'flexGrow',
    'flexShrink',
    'flexBasis',
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    'margin',
    'marginLeft',
    'marginRight',
    'marginTop',
    'marginBottom',
    'padding',
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'border',
    'borderColor',
    'color',
    'backgroundColor',
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'dim',
  ]);

  return styleProps.has(key);
}
