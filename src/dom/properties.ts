import type { Signal } from '../signal';

/**
 * Set a property on an element
 */
export function setProperty(element: Element, key: string, value: unknown): void {
  // Skip internal props
  if (key === 'key' || key === 'ref' || key === 'children') {
    return;
  }

  // Handle events
  if (key.startsWith('on') && typeof value === 'function') {
    // Set event handler as property on element
    const elementWithEvents = element as unknown as Record<string, unknown>;
    elementWithEvents[key.toLowerCase()] = value;
    return;
  }

  // Handle className
  if (key === 'className' || key === 'class') {
    if (value == null) {
      element.removeAttribute('class');
    } else {
      element.setAttribute('class', String(value));
    }
    return;
  }

  // Handle style
  if (key === 'style' && element instanceof HTMLElement) {
    if (typeof value === 'string') {
      element.style.cssText = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(element.style, value);
    }
    return;
  }

  // Handle special boolean attributes
  if (typeof value === 'boolean') {
    if (value) {
      element.setAttribute(key, '');
    } else {
      element.removeAttribute(key);
    }
    return;
  }

  // Handle value for form elements
  if (key === 'value') {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      element.value = String(value ?? '');
      return;
    }
  }

  // Handle checked for checkboxes
  if (key === 'checked' && element instanceof HTMLInputElement) {
    element.checked = Boolean(value);
    return;
  }

  // Default: set as attribute
  if (value == null) {
    element.removeAttribute(key);
  } else {
    element.setAttribute(key, String(value));
  }
}

/**
 * Set a signal property on an element
 */
export function setSignalProperty<T = unknown>(
  element: Element,
  key: string,
  signal: Signal<T>
): () => void {
  // Set initial value
  setProperty(element, key, signal.peek());

  // Subscribe to changes
  return signal.subscribe((value: T) => {
    setProperty(element, key, value);
  });
}
