# Implementation Plan: React Adapter

**Timeline**: Phase 1, Weeks 7-9 (3 weeks)
**Priority**: P1
**Status**: 📝 Planned

---

## 🎯 Goal

Enable bidirectional component integration between SemaJSX and React:

- **SemaJSX → React**: Wrap SemaJSX components for use in React apps (`toReact()`)
- **React → SemaJSX**: Wrap React components for use in SemaJSX apps (`fromReact()`)
- **Style Integration**: React hooks for using SemaJSX style system

---

## 📋 Week-by-Week Breakdown

### Week 7-8: Core Adapters

**Objective**: Implement `toReact()` and `fromReact()` adapters

#### Day 1-2: Package Setup

**Tasks**:

- [ ] Create `packages/adapter-react/` directory
  ```
  packages/adapter-react/
  ├── src/
  │   ├── toReact.tsx
  │   ├── fromReact.tsx
  │   ├── propsMapping.ts
  │   ├── types.ts
  │   └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── README.md
  ```
- [ ] Configure `package.json`
  - Name: `@semajsx/adapter-react`
  - Peer dependencies: `react@^18`, `react-dom@^18`
  - Dependencies: `@semajsx/core`, `@semajsx/dom`
- [ ] Configure TypeScript
  - Enable JSX: `"jsx": "react-jsx"`
  - Strict mode
- [ ] Setup testing
  - Use Vitest with React Testing Library
  - Browser mode for React rendering
- [ ] Write basic README.md

**Acceptance Criteria**:

- ✅ Package builds without errors
- ✅ TypeScript types resolve correctly
- ✅ Test environment configured

---

#### Day 3-6: Implement `toReact()`

**API Signature**:

```typescript
export function toReact<P extends object>(SemaComponent: Component<P>): React.ComponentType<P>;
```

**Purpose**: Wrap a SemaJSX component so it can be used in React

**Implementation Tasks**:

1. **Create React Wrapper Component**:

```typescript
import { useRef, useEffect } from "react";
import { render } from "@semajsx/dom";
import type { Component } from "@semajsx/core";

export function toReact<P extends object>(SemaComponent: Component<P>): React.ComponentType<P> {
  return function ReactWrapper(props: P) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      // Convert React props to SemaJSX props
      const semaProps = convertPropsToSema(props);

      // Create SemaJSX VNode
      const vnode = createElement(SemaComponent, semaProps);

      // Render to container
      const cleanup = render(vnode, containerRef.current);
      cleanupRef.current = cleanup;

      // Cleanup on unmount or props change
      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }, [props]); // Re-render when props change

    return createElement("div", {
      ref: containerRef,
      style: { display: "contents" }, // Don't affect layout
    });
  };
}
```

2. **Props Conversion** (`convertPropsToSema()`):

```typescript
function convertPropsToSema(reactProps: any): any {
  const semaProps: any = {};

  for (const [key, value] of Object.entries(reactProps)) {
    // Convert className -> class
    if (key === "className") {
      semaProps.class = value;
    }
    // Convert style object (already compatible)
    else if (key === "style") {
      semaProps.style = value;
    }
    // Convert event handlers (React: onClick, SemaJSX: onClick - same!)
    else if (key.startsWith("on") && typeof value === "function") {
      semaProps[key] = value;
    }
    // Pass through other props
    else {
      semaProps[key] = value;
    }
  }

  return semaProps;
}
```

3. **Children Handling**:

- React children need special handling
- Use `React.Children` utilities if needed
- Map React elements to SemaJSX VNodes

4. **Type Safety**:

- Preserve prop types from SemaComponent
- Ensure TypeScript inference works
- Add JSDoc comments

**Testing**:

```typescript
// Test basic rendering
test('toReact() renders SemaJSX component in React', () => {
  const SemaButton = (props: { label: string; onClick: () => void }) => (
    <button onClick={props.onClick}>{props.label}</button>
  );

  const ReactButton = toReact(SemaButton);

  const handleClick = vi.fn();
  const { getByText } = render(
    <ReactButton label="Click me" onClick={handleClick} />
  );

  const button = getByText('Click me');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledOnce();
});

// Test props reactivity
test('toReact() updates when props change', () => {
  const SemaCounter = (props: { count: number }) => (
    <div>Count: {props.count}</div>
  );

  const ReactCounter = toReact(SemaCounter);

  const { getByText, rerender } = render(<ReactCounter count={0} />);
  expect(getByText('Count: 0')).toBeInTheDocument();

  rerender(<ReactCounter count={5} />);
  expect(getByText('Count: 5')).toBeInTheDocument();
});

// Test cleanup
test('toReact() cleans up on unmount', () => {
  const cleanup = vi.fn();
  const SemaComponent = () => {
    useEffect(() => cleanup, []);
    return <div>Test</div>;
  };

  const ReactComponent = toReact(SemaComponent);
  const { unmount } = render(<ReactComponent />);

  unmount();
  expect(cleanup).toHaveBeenCalled();
});
```

**Acceptance Criteria**:

- ✅ SemaJSX components render in React
- ✅ Props convert correctly (className → class)
- ✅ Props updates trigger re-render
- ✅ Cleanup works on unmount
- ✅ Type inference preserved
- ✅ Tests pass

---

#### Day 7-10: Implement `fromReact()`

**API Signature**:

```typescript
export function fromReact<P extends object>(ReactComponent: React.ComponentType<P>): Component<P>;
```

**Purpose**: Wrap a React component so it can be used in SemaJSX

**Implementation Tasks**:

1. **Create SemaJSX Wrapper Component**:

```typescript
import { createRoot, type Root } from "react-dom/client";
import { createElement as h } from "@semajsx/dom";

export function fromReact<P extends object>(ReactComponent: React.ComponentType<P>): Component<P> {
  return function SemaWrapper(props: P) {
    const containerRef = { current: null as HTMLDivElement | null };
    const rootRef = { current: null as Root | null };

    return h("div", {
      ref: (el: HTMLDivElement | null) => {
        if (el && !rootRef.current) {
          // Create React root
          containerRef.current = el;
          rootRef.current = createRoot(el);

          // Convert props
          const reactProps = convertPropsToReact(props);

          // Render React component
          rootRef.current.render(createElement(ReactComponent, reactProps));
        } else if (!el && rootRef.current) {
          // Cleanup
          rootRef.current.unmount();
          rootRef.current = null;
          containerRef.current = null;
        }
      },
      style: { display: "contents" },
    });
  };
}
```

2. **Props Conversion** (`convertPropsToReact()`):

```typescript
function convertPropsToReact(semaProps: any): any {
  const reactProps: any = {};

  for (const [key, value] of Object.entries(semaProps)) {
    // Convert class -> className
    if (key === "class") {
      reactProps.className = value;
    }
    // Pass through other props
    else {
      reactProps[key] = value;
    }
  }

  return reactProps;
}
```

3. **Props Updates**:

- Watch for prop changes in SemaJSX
- Re-render React component when props change
- Use signals or effects

4. **Context Handling**:

- React Context won't automatically work
- Need manual bridging if required (Phase 2)

**Testing**:

```typescript
// Test basic rendering
test('fromReact() renders React component in SemaJSX', () => {
  const ReactButton: React.FC<{ label: string }> = ({ label }) => (
    <button>{label}</button>
  );

  const SemaButton = fromReact(ReactButton);

  const container = document.createElement('div');
  render(<SemaButton label="Click me" />, container);

  expect(container.querySelector('button')?.textContent).toBe('Click me');
});

// Test props conversion
test('fromReact() converts class to className', () => {
  const ReactDiv: React.FC<{ className?: string }> = ({ className }) => (
    <div className={className}>Test</div>
  );

  const SemaDiv = fromReact(ReactDiv);

  const container = document.createElement('div');
  render(<SemaDiv class="my-class" />, container);

  expect(container.querySelector('div')?.className).toBe('my-class');
});

// Test cleanup
test('fromReact() unmounts React component', () => {
  const ReactComponent = () => <div>Test</div>;
  const SemaComponent = fromReact(ReactComponent);

  const container = document.createElement('div');
  const cleanup = render(<SemaComponent />, container);

  expect(container.querySelector('div')).toBeInTheDocument();

  cleanup();

  // React root should be unmounted
  expect(container.innerHTML).toBe('');
});
```

**Acceptance Criteria**:

- ✅ React components render in SemaJSX
- ✅ Props convert correctly (class → className)
- ✅ Cleanup/unmount works
- ✅ Type inference preserved
- ✅ Tests pass

---

#### Day 11-14: Props & Events Mapping

**Tasks**:

1. **Comprehensive Props Mapping**:

```typescript
const PROP_MAPPINGS: Record<string, string> = {
  // React -> SemaJSX
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",

  // SemaJSX -> React (reverse mapping)
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
};

function mapProps(props: any, direction: "toReact" | "toSema"): any {
  const result: any = {};
  const mappings = direction === "toReact" ? PROP_MAPPINGS : reverseMap(PROP_MAPPINGS);

  for (const [key, value] of Object.entries(props)) {
    const mappedKey = mappings[key] || key;
    result[mappedKey] = value;
  }

  return result;
}
```

2. **Event Handler Mapping**:

- React: `onClick`, `onChange`, `onSubmit`
- SemaJSX: `onClick`, `onChange`, `onSubmit` (same!)
- No conversion needed for most events
- Special cases: `onDoubleClick` vs `ondblclick` (use lowercase in SemaJSX)

3. **Style Object Handling**:

```typescript
// React style: { backgroundColor: 'red' }
// SemaJSX style: { 'background-color': 'red' } or { backgroundColor: 'red' }
// Both work in SemaJSX, so pass through
```

4. **Children Handling**:

```typescript
function convertChildren(reactChildren: React.ReactNode): any {
  if (Array.isArray(reactChildren)) {
    return reactChildren.map(convertChildren);
  }

  if (React.isValidElement(reactChildren)) {
    // Convert React element to SemaJSX VNode
    // This is complex - may need recursion
    return convertReactElement(reactChildren);
  }

  // Primitives (string, number) pass through
  return reactChildren;
}
```

5. **Ref Handling**:

```typescript
// React refs need forwarding
export const toReact = React.forwardRef((props, ref) => {
  // ...
});
```

**Testing**:

```typescript
// Test all prop mappings
const testCases = [
  { react: { className: "test" }, sema: { class: "test" } },
  { react: { htmlFor: "input" }, sema: { for: "input" } },
  { react: { tabIndex: 0 }, sema: { tabindex: 0 } },
];

for (const { react, sema } of testCases) {
  test(`maps ${Object.keys(react)[0]} correctly`, () => {
    // Test toReact direction
    expect(convertPropsToReact(sema)).toEqual(react);

    // Test toSema direction
    expect(convertPropsToSema(react)).toEqual(sema);
  });
}
```

**Acceptance Criteria**:

- ✅ All common props map correctly
- ✅ Event handlers work bidirectionally
- ✅ Style objects pass through
- ✅ Children handled properly
- ✅ Refs forwarded (if applicable)
- ✅ Edge cases covered

---

### Week 9: React Style Integration

**Objective**: Enable React components to use SemaJSX style system

#### Day 1-2: Implement `<StyleAnchor>` Component

**API**:

```typescript
export function StyleAnchor({
  target,
  children,
}: {
  target?: ShadowRoot;
  children: React.ReactNode;
}): JSX.Element;
```

**Implementation**:

```typescript
import React, { useRef, useEffect, createContext } from 'react';
import { StyleRegistry } from '@semajsx/style';

export const StyleContext = createContext<StyleRegistry | null>(null);

export function StyleAnchor({ target, children }: StyleAnchorProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const registryRef = useRef<StyleRegistry | null>(null);

  useEffect(() => {
    if (!anchorRef.current) return;

    // Create registry
    const registry = new StyleRegistry();
    registry.setAnchorElement(target || anchorRef.current);
    registryRef.current = registry;

    // Cleanup
    return () => {
      registry.dispose();
      registryRef.current = null;
    };
  }, [target]);

  return (
    <StyleContext.Provider value={registryRef.current}>
      <div ref={anchorRef} style={{ display: 'contents' }}>
        {children}
      </div>
    </StyleContext.Provider>
  );
}
```

**Testing**:

```typescript
test('StyleAnchor provides registry to children', () => {
  const TestChild = () => {
    const registry = useContext(StyleContext);
    return <div>{registry ? 'has registry' : 'no registry'}</div>;
  };

  const { getByText } = render(
    <StyleAnchor>
      <TestChild />
    </StyleAnchor>
  );

  expect(getByText('has registry')).toBeInTheDocument();
});
```

**Acceptance Criteria**:

- ✅ Registry created on mount
- ✅ Registry provided via Context
- ✅ Cleanup on unmount
- ✅ Tests pass

---

#### Day 3-4: Implement `useStyle()` Hook

**API**:

```typescript
export function useStyle(): (...tokens: Array<StyleToken | string | undefined | false>) => string;
```

**Implementation**:

```typescript
import { useContext, useCallback } from "react";
import type { StyleToken } from "@semajsx/style";

export function useStyle() {
  const registry = useContext(StyleContext);

  if (!registry) {
    throw new Error("useStyle() must be used within <StyleAnchor>");
  }

  return useCallback(
    (...tokens: Array<StyleToken | string | undefined | false>) => {
      const classNames: string[] = [];

      for (const token of tokens) {
        if (!token) continue; // Skip undefined/false

        if (typeof token === "string") {
          classNames.push(token);
        } else {
          // Process StyleToken
          const className = registry.processToken(token);
          classNames.push(className);
        }
      }

      return classNames.join(" ");
    },
    [registry],
  );
}
```

**Usage Example**:

```typescript
import { StyleAnchor, useStyle } from '@semajsx/style/react';
import * as btn from './button.style';

function Button({ primary, children }: ButtonProps) {
  const cx = useStyle();

  return (
    <button className={cx(btn.root, primary && btn.primary)}>
      {children}
    </button>
  );
}

function App() {
  return (
    <StyleAnchor>
      <Button primary>Click me</Button>
    </StyleAnchor>
  );
}
```

**Testing**:

```typescript
test('useStyle() processes StyleTokens', () => {
  const token = rule`${c.test} { color: red; }`;

  const TestComponent = () => {
    const cx = useStyle();
    return <div className={cx(token)}>Test</div>;
  };

  const { container } = render(
    <StyleAnchor>
      <TestComponent />
    </StyleAnchor>
  );

  const div = container.querySelector('div');
  expect(div?.className).toContain('test-');
});

test('useStyle() handles conditional tokens', () => {
  const token1 = rule`${c.a} { color: red; }`;
  const token2 = rule`${c.b} { color: blue; }`;

  const TestComponent = ({ show }: { show: boolean }) => {
    const cx = useStyle();
    return <div className={cx(token1, show && token2)}>Test</div>;
  };

  const { container, rerender } = render(
    <StyleAnchor>
      <TestComponent show={false} />
    </StyleAnchor>
  );

  let div = container.querySelector('div');
  expect(div?.className).not.toContain('b-');

  rerender(
    <StyleAnchor>
      <TestComponent show={true} />
    </StyleAnchor>
  );

  div = container.querySelector('div');
  expect(div?.className).toContain('b-');
});
```

**Acceptance Criteria**:

- ✅ Hook processes StyleTokens
- ✅ Returns className string
- ✅ Handles conditional tokens
- ✅ Works with string class names
- ✅ Tests pass

---

#### Day 5: Implement `useSignal()` Hook

**API**:

```typescript
export function useSignal<T>(initial: T): Signal<T>;
```

**Purpose**: Create signals in React without triggering React re-renders

**Implementation**:

```typescript
import { useRef } from "react";
import { signal, type Signal } from "@semajsx/signal";

export function useSignal<T>(initial: T): Signal<T> {
  const signalRef = useRef<Signal<T> | null>(null);

  // Only create once
  if (!signalRef.current) {
    signalRef.current = signal(initial);
  }

  return signalRef.current;
}
```

**Key Behavior**:

- Signal persists across re-renders (like `useRef`)
- Updating signal does NOT trigger React re-render
- Only triggers DOM updates via CSS variables (if used in styles)

**Usage Example**:

```typescript
function AnimatedBox() {
  const cx = useStyle();
  const height = useSignal(100);

  const boxStyle = rule`${c.box} {
    height: ${height}px;
    transition: height 0.3s;
  }`;

  return (
    <div>
      <div className={cx(boxStyle)}>Animated Box</div>
      <button onClick={() => (height.value += 10)}>Grow</button>
    </div>
  );
}
```

**Testing**:

```typescript
test('useSignal() creates persistent signal', () => {
  const TestComponent = ({ value }: { value: number }) => {
    const sig = useSignal(value);
    return <div>Signal: {sig.value}</div>;
  };

  const { getByText, rerender } = render(<TestComponent value={0} />);
  expect(getByText('Signal: 0')).toBeInTheDocument();

  // Re-render (signal should persist, not reset)
  rerender(<TestComponent value={999} />);
  expect(getByText('Signal: 0')).toBeInTheDocument(); // Still 0!
});

test('useSignal() updates do not trigger re-render', () => {
  let renderCount = 0;

  const TestComponent = () => {
    renderCount++;
    const sig = useSignal(0);

    useEffect(() => {
      sig.value = 100;
    }, []);

    return <div>Renders: {renderCount}</div>;
  };

  render(<TestComponent />);

  // Only 1 render (initial), signal update didn't trigger re-render
  expect(renderCount).toBe(1);
});
```

**Acceptance Criteria**:

- ✅ Signal persists across re-renders
- ✅ Signal updates don't trigger re-render
- ✅ Initial value only used once
- ✅ Tests pass

---

## 📦 Deliverables

By the end of Week 9:

### Packages

- ✅ `@semajsx/adapter-react` package
  - `toReact()` function
  - `fromReact()` function
  - Props/events mapping
- ✅ `@semajsx/style/react` subpath
  - `<StyleAnchor>` component
  - `useStyle()` hook
  - `useSignal()` hook

### Tests

- ✅ Test coverage ≥70%
- ✅ All integration scenarios pass
- ✅ Edge cases covered

### Documentation

- ✅ API reference for all exports
- ✅ Usage examples (10+ scenarios)
- ✅ Migration guide (React → SemaJSX, SemaJSX → React)

---

## ⚠️ Risks & Mitigation

### Risk 1: React 18 Concurrent Features

**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:

- Use `createRoot()` API (React 18+)
- Test with Suspense boundaries
- Handle transition updates

### Risk 2: Props Conversion Edge Cases

**Likelihood**: High
**Impact**: High
**Mitigation**:

- Comprehensive test suite
- Reference Preact compat implementation
- Community feedback via early examples

### Risk 3: Performance Overhead

**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:

- Benchmark adapter overhead
- Minimize re-renders
- Use memoization where needed

---

## 🔗 Dependencies

**Upstream** (must be complete first):

- ✅ Style system implementation (Week 1-6)

**Downstream** (blocked by this):

- ⏳ Example component library (Week 10-12)

---

## 📚 Reference Materials

- **RFC 008**: `/docs/rfcs/008-cross-framework-integration.md`
- **React 18 Docs**: https://react.dev/
- **React Testing Library**: https://testing-library.com/react
- **Preact Compat**: https://github.com/preactjs/preact/tree/main/compat

---

**Last Updated**: 2026-01-10
**Status**: Ready to start (after Week 6)
