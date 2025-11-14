import type { Signal } from '../signal';
import { effect } from '../signal/effect';
import type { TerminalNode, TerminalElement, TerminalStyle } from './types';
import { applyStyle } from './operations';

/**
 * Set a property on a terminal node
 */
export function setProperty(node: TerminalNode, key: string, value: any): void {
  if (node.type !== 'element') return;

  const element = node as TerminalElement;

  // Handle style properties
  if (isStyleProperty(key)) {
    applyStyle(element, { [key]: value } as TerminalStyle);
    return;
  }

  // Store other props
  element.props[key] = value;
}

/**
 * Set a signal property on a terminal node
 */
export function setSignalProperty(
  node: TerminalNode,
  key: string,
  signal: Signal<any>
): () => void {
  // Create an effect that updates the property when signal changes
  return effect(() => {
    const value = signal.value;
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
