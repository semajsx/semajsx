import type { SyntheticEvent, EventCleanup } from './types.js';

// Event handling utilities
const eventListeners = new WeakMap<Element, EventCleanup[]>();

export function createSyntheticEvent<T extends Event>(nativeEvent: T): SyntheticEvent<T> {
  return {
    nativeEvent,
    type: nativeEvent.type,
    target: nativeEvent.target,
    currentTarget: nativeEvent.currentTarget,
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => nativeEvent.stopPropagation(),
    stopImmediatePropagation: () => nativeEvent.stopImmediatePropagation()
  };
}

export function bindEvent(
  element: Element, 
  eventType: string, 
  handler: (event: SyntheticEvent) => void
): () => void {
  const wrappedHandler = (event: Event) => {
    const syntheticEvent = createSyntheticEvent(event);
    handler(syntheticEvent);
  };

  element.addEventListener(eventType, wrappedHandler);

  const cleanup: EventCleanup = {
    unsubscribe: () => element.removeEventListener(eventType, wrappedHandler),
    element,
    eventType
  };

  // Store cleanup for element
  const elementCleanups = eventListeners.get(element) || [];
  elementCleanups.push(cleanup);
  eventListeners.set(element, elementCleanups);

  return cleanup.unsubscribe;
}

export function cleanupElementEvents(element: Element): void {
  const cleanups = eventListeners.get(element);
  if (cleanups) {
    cleanups.forEach(cleanup => cleanup.unsubscribe());
    eventListeners.delete(element);
  }
}

// Event delegation system
const delegatedEvents = new Map<string, Set<Element>>();
const delegationContainers = new WeakMap<Element, Set<string>>();

export function delegateEvent(
  container: Element,
  selector: string,
  eventType: string,
  handler: (event: SyntheticEvent, matchedElement: Element) => void
): () => void {
  const delegationKey = `${eventType}:${selector}`;
  
  // Check if we already have delegation for this event type on this container
  const containerEvents = delegationContainers.get(container) || new Set();
  
  if (!containerEvents.has(eventType)) {
    // Set up delegation for this event type
    const delegationHandler = (event: Event) => {
      const target = event.target as Element;
      const matchedElement = target.closest(selector);
      
      if (matchedElement && container.contains(matchedElement)) {
        const syntheticEvent = createSyntheticEvent(event);
        handler(syntheticEvent, matchedElement);
      }
    };

    container.addEventListener(eventType, delegationHandler);
    containerEvents.add(eventType);
    delegationContainers.set(container, containerEvents);
  }

  // Track delegated events
  const eventSet = delegatedEvents.get(delegationKey) || new Set();
  eventSet.add(container);
  delegatedEvents.set(delegationKey, eventSet);

  return () => {
    const eventSet = delegatedEvents.get(delegationKey);
    if (eventSet) {
      eventSet.delete(container);
      if (eventSet.size === 0) {
        delegatedEvents.delete(delegationKey);
      }
    }
  };
}

// Common event handlers
export function onClick(handler: (event: SyntheticEvent) => void) {
  return (element: Element) => bindEvent(element, 'click', handler);
}

export function onChange(handler: (event: SyntheticEvent) => void) {
  return (element: Element) => bindEvent(element, 'change', handler);
}

export function onInput(handler: (event: SyntheticEvent) => void) {
  return (element: Element) => bindEvent(element, 'input', handler);
}

// Event type normalization
const eventNameMap: Record<string, string> = {
  onClick: 'click',
  onChange: 'change',
  onInput: 'input',
  onSubmit: 'submit',
  onFocus: 'focus',
  onBlur: 'blur',
  onKeyDown: 'keydown',
  onKeyUp: 'keyup',
  onMouseDown: 'mousedown',
  onMouseUp: 'mouseup',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseOver: 'mouseover',
  onMouseOut: 'mouseout'
};

export function normalizeEventName(propName: string): string | null {
  return eventNameMap[propName] || null;
}