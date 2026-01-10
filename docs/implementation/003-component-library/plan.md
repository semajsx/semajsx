# Implementation Plan: Example Component Library

**Timeline**: Phase 1, Weeks 10-12 (3 weeks)
**Priority**: P1
**Status**: 📝 Planned

---

## 🎯 Goal

Create a production-quality example component library (`@semajsx/ui`) that:

- Demonstrates SemaJSX + Style System capabilities
- Provides 5 essential UI components
- Shows best practices for component development
- Works in both pure SemaJSX and React (via adapters)
- Serves as reference implementation for community

---

## 📋 Components to Build

1. **Button** - Primary UI interaction
2. **Card** - Content container with header/body/footer
3. **Input** - Form input with validation states
4. **Select** - Dropdown selection
5. **Modal** - Overlay dialog with focus management

---

## 📋 Week-by-Week Breakdown

### Week 10-11: Component Implementation

#### Day 1: Project Setup

**Tasks**:

- [ ] Create `packages/ui/` directory
  ```
  packages/ui/
  ├── src/
  │   ├── Button/
  │   │   ├── Button.tsx
  │   │   ├── Button.style.ts
  │   │   ├── Button.test.tsx
  │   │   └── index.ts
  │   ├── Card/
  │   ├── Input/
  │   ├── Select/
  │   ├── Modal/
  │   └── index.ts
  ├── react/
  │   └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── README.md
  ```
- [ ] Configure `package.json`
  - Name: `@semajsx/ui`
  - Dependencies: `@semajsx/core`, `@semajsx/dom`, `@semajsx/style`, `@semajsx/signal`
  - Peer dependencies: `react@^18` (optional)
  - Exports: Main, React subpath
- [ ] Configure build
  - Separate bundles for SemaJSX and React
  - Tree-shakeable exports
- [ ] Setup Storybook (optional, for visual testing)

**Acceptance Criteria**:

- ✅ Package structure created
- ✅ Build configuration works
- ✅ Ready for component development

---

#### Day 2-3: Button Component

**Features**:

- Variants: primary, secondary, outline, ghost
- Sizes: small, medium, large
- States: default, hover, active, disabled, loading
- Icon support (left/right)
- Full accessibility (ARIA)

**API Design**:

```typescript
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: VNode;
  iconPosition?: "left" | "right";
  onClick?: (e: MouseEvent) => void;
  children: Children;
}

export function Button(props: ButtonProps): VNode;
```

**Implementation** (`Button.tsx`):

```typescript
/** @jsxImportSource @semajsx/dom */
import { signal } from '@semajsx/signal';
import * as styles from './Button.style';

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  children
}: ButtonProps) {
  const isPressed = signal(false);

  const handleClick = (e: MouseEvent) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  const classNames = [
    styles.root,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    loading && styles.loading
  ].filter(Boolean);

  return (
    <button
      class={classNames}
      disabled={disabled || loading}
      onClick={handleClick}
      onPointerDown={() => (isPressed.value = true)}
      onPointerUp={() => (isPressed.value = false)}
      aria-disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && (
        <span class={styles.icon}>{icon}</span>
      )}
      <span class={styles.label}>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span class={styles.icon}>{icon}</span>
      )}
    </button>
  );
}
```

**Styles** (`Button.style.ts`):

```typescript
import { classes, rule, rules } from "@semajsx/style";

const c = classes([
  "root",
  "label",
  "icon",
  "primary",
  "secondary",
  "outline",
  "ghost",
  "sm",
  "md",
  "lg",
  "disabled",
  "loading",
]);

export const root = rule`${c.root} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-family: system-ui, sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
  }
}`;

export const primary = rule`${c.primary} {
  background: #3b82f6;
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:active:not(:disabled) {
    background: #1d4ed8;
  }
}`;

export const secondary = rule`${c.secondary} {
  background: #6b7280;
  color: white;

  &:hover:not(:disabled) {
    background: #4b5563;
  }
}`;

export const outline = rule`${c.outline} {
  background: transparent;
  color: #3b82f6;
  border: 2px solid #3b82f6;

  &:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.1);
  }
}`;

export const ghost = rule`${c.ghost} {
  background: transparent;
  color: #374151;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
  }
}`;

export const sm = rule`${c.sm} {
  padding: 4px 12px;
  font-size: 14px;
}`;

export const md = rule`${c.md} {
  padding: 8px 16px;
  font-size: 16px;
}`;

export const lg = rule`${c.lg} {
  padding: 12px 24px;
  font-size: 18px;
}`;

export const disabled = rule`${c.disabled} {
  opacity: 0.5;
  cursor: not-allowed;
}`;

export const loading = rule`${c.loading} {
  cursor: wait;
}`;

export const label = rule`${c.label} {
  flex: 1;
}`;

export const icon = rule`${c.icon} {
  display: flex;
  align-items: center;
}`;
```

**Tests** (`Button.test.tsx`):

```typescript
/** @jsxImportSource @semajsx/dom */
import { describe, test, expect, vi } from 'vitest';
import { render } from '@semajsx/dom';
import { Button } from './Button';

describe('Button', () => {
  test('renders with text', () => {
    const container = document.createElement('div');
    render(<Button>Click me</Button>, container);

    const button = container.querySelector('button');
    expect(button?.textContent).toContain('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const container = document.createElement('div');
    render(<Button onClick={handleClick}>Click</Button>, container);

    const button = container.querySelector('button')!;
    button.click();

    expect(handleClick).toHaveBeenCalledOnce();
  });

  test('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    const container = document.createElement('div');
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>,
      container
    );

    const button = container.querySelector('button')!;
    button.click();

    expect(handleClick).not.toHaveBeenCalled();
  });

  test('renders with icon', () => {
    const icon = <span>🔥</span>;
    const container = document.createElement('div');
    render(<Button icon={icon}>Click</Button>, container);

    expect(container.textContent).toContain('🔥');
  });

  test('shows loading state', () => {
    const container = document.createElement('div');
    render(<Button loading>Loading</Button>, container);

    const button = container.querySelector('button')!;
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  test('applies size variants', () => {
    const container = document.createElement('div');
    render(<Button size="lg">Large</Button>, container);

    const button = container.querySelector('button')!;
    expect(button.className).toContain('lg-');
  });
});
```

**Acceptance Criteria**:

- ✅ All variants render correctly
- ✅ All sizes apply proper styling
- ✅ Click handler works
- ✅ Disabled state prevents clicks
- ✅ Loading state shows spinner
- ✅ Icon positioning works
- ✅ Accessibility attributes present
- ✅ Tests pass (≥90% coverage)

---

#### Day 4-5: Card Component

**Features**:

- Composable: CardHeader, CardBody, CardFooter
- Variants: elevated, outlined, flat
- Optional image header
- Hover effects

**API Design**:

```typescript
export interface CardProps {
  variant?: "elevated" | "outlined" | "flat";
  hoverable?: boolean;
  children: Children;
}

export function Card(props: CardProps): VNode;
export function CardHeader(props: { children: Children }): VNode;
export function CardBody(props: { children: Children }): VNode;
export function CardFooter(props: { children: Children }): VNode;
```

**Implementation** (similar structure to Button)

**Acceptance Criteria**:

- ✅ Composable structure works
- ✅ Variants styled correctly
- ✅ Hover effects optional
- ✅ Tests pass

---

#### Day 6-7: Input Component

**Features**:

- Types: text, password, email, number
- Validation states: default, error, success
- Label and helper text
- Clear button
- Disabled state

**API Design**:

```typescript
export interface InputProps {
  type?: "text" | "password" | "email" | "number";
  label?: string;
  placeholder?: string;
  value?: string | Signal<string>;
  error?: string;
  success?: string;
  disabled?: boolean;
  clearable?: boolean;
  onChange?: (value: string) => void;
}

export function Input(props: InputProps): VNode;
```

**Key Features**:

- Support Signal for `value` prop (two-way binding)
- Show/hide password toggle
- Auto-clear icon when clearable
- Error/success messaging

**Acceptance Criteria**:

- ✅ All input types work
- ✅ Signal binding works
- ✅ Validation states styled
- ✅ Clear button works
- ✅ Accessibility (labels, ARIA)
- ✅ Tests pass

---

#### Day 8-9: Select Component

**Features**:

- Single and multi-select
- Search/filter
- Custom option rendering
- Keyboard navigation
- Disabled options

**API Design**:

```typescript
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[] | Signal<string | string[]>;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | string[]) => void;
}

export function Select(props: SelectProps): VNode;
```

**Key Features**:

- Dropdown with Portal (render outside DOM tree)
- Keyboard navigation (Arrow keys, Enter, Escape)
- Search filter
- Multi-select with chips

**Acceptance Criteria**:

- ✅ Single select works
- ✅ Multi-select works
- ✅ Search filtering works
- ✅ Keyboard navigation works
- ✅ Accessibility (ARIA roles)
- ✅ Tests pass

---

#### Day 10-11: Modal Component

**Features**:

- Overlay with backdrop
- Focus trap (tab stays within modal)
- ESC to close
- Click outside to close (optional)
- Animations (fade in/out)
- Accessibility

**API Design**:

```typescript
export interface ModalProps {
  open: boolean | Signal<boolean>;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  children: Children;
}

export function Modal(props: ModalProps): VNode;
export function ModalHeader(props: { children: Children }): VNode;
export function ModalBody(props: { children: Children }): VNode;
export function ModalFooter(props: { children: Children }): VNode;
```

**Key Features**:

- Portal rendering (to body)
- Focus trap using `focus-trap` library
- ESC key listener
- Backdrop click detection
- CSS animations (fade, slide)

**Implementation Highlights**:

```typescript
export function Modal({ open, onClose, closeOnEscape = true, closeOnBackdrop = true, children }: ModalProps) {
  const isOpen = isSignal(open) ? open : signal(open);

  useEffect(() => {
    if (!isOpen.value) return;

    // Focus trap
    const trap = createFocusTrap(modalElement);
    trap.activate();

    // ESC key listener
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      trap.deactivate();
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isOpen.value) return null;

  return createPortal(
    <div class={styles.overlay} onClick={() => closeOnBackdrop && onClose?.()}>
      <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

**Acceptance Criteria**:

- ✅ Opens/closes correctly
- ✅ Focus trap works
- ✅ ESC closes modal
- ✅ Backdrop click closes (if enabled)
- ✅ Animations smooth
- ✅ Accessibility (ARIA, focus management)
- ✅ Tests pass

---

#### Day 12-14: React Wrappers

**Tasks**:

- [ ] Create `packages/ui/react/index.ts`
- [ ] Wrap all 5 components with `toReact()`
- [ ] Test React integration
- [ ] Add TypeScript types
- [ ] Document usage

**Implementation**:

```typescript
// packages/ui/react/index.ts
import { toReact } from "@semajsx/adapter-react";
import * as SemaUI from "../src";

export const Button = toReact(SemaUI.Button);
export const Card = toReact(SemaUI.Card);
export const CardHeader = toReact(SemaUI.CardHeader);
export const CardBody = toReact(SemaUI.CardBody);
export const CardFooter = toReact(SemaUI.CardFooter);
export const Input = toReact(SemaUI.Input);
export const Select = toReact(SemaUI.Select);
export const Modal = toReact(SemaUI.Modal);
export const ModalHeader = toReact(SemaUI.ModalHeader);
export const ModalBody = toReact(SemaUI.ModalBody);
export const ModalFooter = toReact(SemaUI.ModalFooter);

// Re-export types
export type * from "../src";
```

**Testing**:

```typescript
// Test Button in React
import { Button } from '@semajsx/ui/react';

function ReactApp() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </Button>
  );
}
```

**Acceptance Criteria**:

- ✅ All components available in React
- ✅ Props work correctly
- ✅ Events work correctly
- ✅ TypeScript types preserved
- ✅ Tests pass

---

### Week 12: Documentation & Polish

#### Day 1-2: Documentation

**Tasks**:

- [ ] Write package README.md
  - Installation
  - Quick start
  - Component overview
- [ ] Component documentation
  - Props tables
  - Usage examples
  - Best practices
- [ ] Storybook stories (if set up)
  - All variants showcased
  - Interactive controls

**Acceptance Criteria**:

- ✅ README complete and clear
- ✅ Each component documented
- ✅ Code examples provided

---

#### Day 3-5: Example Applications

**Apps to Build**:

1. **Todo App** (Pure SemaJSX):

```typescript
function TodoApp() {
  const todos = signal<Todo[]>([]);
  const newTodo = signal('');

  return (
    <div>
      <Card>
        <CardHeader>
          <h2>Todo List</h2>
        </CardHeader>
        <CardBody>
          <Input
            value={newTodo}
            placeholder="What needs to be done?"
            onChange={(v) => (newTodo.value = v)}
          />
          <Button onClick={addTodo}>Add</Button>

          <ul>
            {todos.value.map((todo) => (
              <li>
                <Button size="sm" onClick={() => deleteTodo(todo.id)}>
                  ✓
                </Button>
                {todo.text}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
```

2. **Dashboard** (SemaJSX + React mixed):

- Use SemaJSX Card components
- Embed React Chart.js component
- Show cross-framework composition

3. **Form Builder**:

- Use all 5 components
- Form validation
- Submit handling

**Acceptance Criteria**:

- ✅ 3 working example apps
- ✅ Apps demonstrate best practices
- ✅ Code is clean and well-commented

---

#### Day 6-7: Performance Benchmarks

**Metrics to Measure**:

1. **Bundle Size**:

```bash
# Full library
bun run build
du -h dist/index.js

# Individual components (tree-shaking)
import { Button } from '@semajsx/ui';
# Measure final bundle
```

2. **Component Rendering**:

```typescript
test('Button renders in < 5ms', () => {
  const start = performance.now();

  render(<Button>Test</Button>, container);

  const end = performance.now();
  expect(end - start).toBeLessThan(5);
});
```

3. **Style Injection**:

```typescript
test("Style injection < 2ms", () => {
  const start = performance.now();

  const cx = registry.processToken(buttonStyles.root);

  const end = performance.now();
  expect(end - start).toBeLessThan(2);
});
```

4. **Memory Usage**:

```typescript
test('1000 mount/unmount cycles - no memory leak', () => {
  for (let i = 0; i < 1000; i++) {
    const cleanup = render(<Button>Test</Button>, container);
    cleanup();
  }

  // Check memory growth
});
```

**Benchmark Report**:

```markdown
## Performance Benchmarks

| Metric                | Target | Actual | Status |
| --------------------- | ------ | ------ | ------ |
| Runtime Bundle (gzip) | ≤15KB  | 12KB   | ✅     |
| Button Render Time    | <5ms   | 2.3ms  | ✅     |
| Style Injection       | <2ms   | 1.1ms  | ✅     |
| Memory (1000 cycles)  | <1MB   | 0.4MB  | ✅     |
```

**Acceptance Criteria**:

- ✅ All benchmarks meet targets
- ✅ Report generated
- ✅ Comparisons with competitors (optional)

---

## 📦 Deliverables

By the end of Week 12:

### Code

- ✅ `@semajsx/ui` package
  - 5 production-quality components
  - Full TypeScript support
  - Accessibility compliant
- ✅ `@semajsx/ui/react` subpath
  - React wrappers for all components

### Tests

- ✅ Test coverage ≥80% per component
- ✅ All edge cases covered
- ✅ Accessibility tests pass

### Documentation

- ✅ Package README
- ✅ Component API docs
- ✅ 3+ example applications

### Performance

- ✅ Bundle ≤15KB (gzipped)
- ✅ Render performance <5ms
- ✅ No memory leaks

---

## ⚠️ Risks & Mitigation

### Risk 1: Component Design Takes Longer

**Likelihood**: High
**Impact**: Medium
**Mitigation**:

- Use existing design systems as reference (Radix UI, Headless UI)
- Focus on functionality first, polish later
- Cut non-essential features

### Risk 2: Accessibility Compliance

**Likelihood**: Medium
**Impact**: High
**Mitigation**:

- Use ARIA attributes from start
- Test with screen readers
- Reference WCAG 2.1 guidelines
- Use automated testing (axe-core)

### Risk 3: Performance Not Meeting Targets

**Likelihood**: Low
**Impact**: High
**Mitigation**:

- Benchmark early and often
- Profile rendering paths
- Optimize style system usage

---

## 🔗 Dependencies

**Upstream** (must be complete first):

- ✅ Style system (Week 1-6)
- ✅ React adapter (Week 7-9)

**Downstream** (blocked by this):

- ⏳ Phase 2 component expansion

---

## 📚 Reference Materials

- **Radix UI**: https://www.radix-ui.com/ (headless components)
- **Headless UI**: https://headlessui.com/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

---

**Last Updated**: 2026-01-10
**Status**: Ready to start (after Week 9)
