# @semajsx/web

Web/DOM rendering strategies and plugins for semajsx - a signal-based JSX runtime with platform-agnostic core.

## Features

- 🚀 **Performance-First DOM Manipulation** - Optimized for minimal DOM operations with intelligent batching
- 🎯 **Signal-to-DOM Efficiency** - Direct property binding without virtual DOM overhead
- 🎨 **Advanced Theming** - CSS custom properties integration with light/dark/auto modes
- 🛠️ **Rich Development Experience** - Enhanced error boundaries and debugging tools
- 🔀 **Client-Side Routing** - Built-in SPA routing with lazy loading and guards
- 🌐 **Web Standards Integration** - Full support for modern web APIs and features
- 🧩 **Plugin Architecture** - Extensible system for adding platform-specific functionality

## Installation

```bash
npm install @semajsx/web @semajsx/core
# or
yarn add @semajsx/web @semajsx/core
# or
bun add @semajsx/web @semajsx/core
```

## Quick Start

```tsx
import { render } from '@semajsx/web';
import { signal } from '@semajsx/signals'; // Your signal implementation

const count = signal(0);

function Counter() {
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => count.value++}>
        Increment
      </button>
    </div>
  );
}

render(<Counter />, document.getElementById('root')!);
```

## Advanced Usage

### With Plugins

```tsx
import { createWebRenderer } from '@semajsx/web';
import { webDevPlugin, webThemePlugin, webRouterPlugin } from '@semajsx/web/plugins';

const renderer = createWebRenderer({
  plugins: [
    webDevPlugin({
      showComponentStack: true,
      trackPerformance: true
    }),
    webThemePlugin({
      mode: 'auto',
      customProperties: {
        '--primary-color': '#007bff',
        '--secondary-color': '#6c757d'
      },
      transitions: true
    }),
    webRouterPlugin([
      { path: '/', component: HomePage },
      { path: '/about', component: AboutPage },
      { path: '/user/:id', component: UserPage, lazy: true }
    ])
  ]
});

renderer.render(<App />, document.getElementById('root')!);
```

### Signal-Based Styling

```tsx
import { signal, computed } from '@semajsx/signals';

const theme = signal<'light' | 'dark'>('light');
const user = signal<User | null>(null);

const dynamicStyles = computed(() => ({
  padding: '1rem',
  backgroundColor: theme.value === 'dark' ? '#2d3748' : '#ffffff',
  color: theme.value === 'dark' ? '#ffffff' : '#000000',
  borderRadius: '8px'
}), [theme]);

function UserProfile() {
  return (
    <div style={dynamicStyles}>
      <h2>Welcome, {user.value?.name || 'Guest'}!</h2>
      <button onClick={() => theme.value = theme.value === 'light' ? 'dark' : 'light'}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Routing

```tsx
import { RouterOutlet, Link, navigate } from '@semajsx/web/plugins';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      
      <main>
        <RouterOutlet fallback={<div>Loading...</div>} />
      </main>
    </div>
  );
}

// Programmatic navigation
function LoginForm() {
  const handleLogin = async (credentials: LoginData) => {
    const success = await login(credentials);
    if (success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* form fields */}
    </form>
  );
}
```

## Core Concepts

### Signal Property Binding

semajsx/web provides direct signal-to-DOM property binding for optimal performance:

```tsx
const isVisible = signal(false);
const opacity = signal(0.5);
const className = signal('btn-primary');

function Component() {
  return (
    <div
      className={className}           // Signal binding
      style={{ opacity }}             // Signal in style object
      hidden={isVisible}              // Direct signal binding
    >
      Content
    </div>
  );
}
```

### Performance Optimization

The web renderer includes several performance optimizations:

- **Update Batching**: Multiple DOM updates are batched using `requestAnimationFrame`
- **Element Recycling**: DOM elements are pooled and reused for better memory efficiency
- **Event Delegation**: Efficient event handling through delegation
- **Memory Management**: Automatic cleanup of subscriptions and listeners

### Error Boundaries

Enhanced error boundaries provide detailed debugging information:

```tsx
import { ErrorBoundary } from '@semajsx/core';
import { webDevPlugin } from '@semajsx/web/plugins';

function App() {
  return (
    <ErrorBoundary
      fallback={(error, retry) => (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
      onError={(error, info) => {
        console.error('App Error:', error, info);
        // Send to error reporting service
      }}
    >
      <MyApp />
    </ErrorBoundary>
  );
}
```

## Plugins

### Development Plugin

Enhanced debugging and development experience:

```tsx
import { webDevPlugin } from '@semajsx/web/plugins';

const devPlugin = webDevPlugin({
  showComponentStack: true,    // Show component hierarchy in errors
  trackPerformance: true,      // Monitor render performance
  validateCleanup: true        // Validate memory cleanup
});
```

### Theme Plugin

Comprehensive theming with CSS custom properties:

```tsx
import { webThemePlugin, toggleTheme } from '@semajsx/web/plugins';

const themePlugin = webThemePlugin({
  mode: 'auto',                // 'light' | 'dark' | 'auto'
  customProperties: {
    '--primary': '#007bff',
    '--secondary': '#6c757d'
  },
  mediaQueries: {
    'mobile': '(max-width: 768px)',
    'desktop': '(min-width: 1024px)'
  },
  transitions: true            // Smooth theme transitions
});

// Theme utilities
function ThemeToggle() {
  return (
    <button onClick={toggleTheme}>
      Switch Theme
    </button>
  );
}
```

### Router Plugin

Client-side routing with lazy loading and guards:

```tsx
import { webRouterPlugin, createAuthGuard } from '@semajsx/web/plugins';

const authGuard = createAuthGuard(() => isLoggedIn());

const routerPlugin = webRouterPlugin([
  { 
    path: '/', 
    component: HomePage 
  },
  { 
    path: '/dashboard', 
    component: DashboardPage,
    guards: [authGuard]
  },
  { 
    path: '/profile/:id', 
    component: ProfilePage,
    lazy: true                 // Lazy load component
  }
]);
```

## Browser Compatibility

semajsx/web includes feature detection and polyfills for:

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Legacy Support**: IE11 with polyfills (limited functionality)

```tsx
import { getWebCapabilities } from '@semajsx/web';

const capabilities = getWebCapabilities();

if (capabilities.features.customElements) {
  // Use Web Components features
}

if (capabilities.features.cssCustomProperties) {
  // Use CSS custom properties
}
```

## Performance Monitoring

Built-in performance monitoring for development:

```tsx
import { measureRender, getPerformanceMetrics } from '@semajsx/web';

const { result, metrics } = measureRender(() => {
  return render(<ComplexApp />, container);
});

console.log('Render metrics:', metrics);
// {
//   renderTime: 16.2,
//   nodeCount: 150,
//   signalCount: 45,
//   updateCount: 12
// }

// Global metrics
const globalMetrics = getPerformanceMetrics();
```

## Web Components Integration

Create custom elements with semajsx:

```tsx
import { defineWebComponent } from '@semajsx/web';

function MyCustomElement({ title, value }: { title: string; value: number }) {
  return (
    <div>
      <h3>{title}</h3>
      <p>Value: {value}</p>
    </div>
  );
}

defineWebComponent('my-custom-element', MyCustomElement, {
  shadowDOM: true,
  observedAttributes: ['title', 'value']
});

// Use in HTML
// <my-custom-element title="Test" value="42"></my-custom-element>
```

## TypeScript Support

Full TypeScript support with enhanced type safety:

```tsx
import type { CSSStyleObject, HTMLElementProps } from '@semajsx/web';

interface ButtonProps extends HTMLElementProps<'button'> {
  variant: 'primary' | 'secondary';
  size: 'sm' | 'md' | 'lg';
}

function Button({ variant, size, children, ...props }: ButtonProps) {
  const styles: CSSStyleObject = {
    padding: size === 'sm' ? '0.5rem' : '1rem',
    backgroundColor: variant === 'primary' ? '#007bff' : '#6c757d'
  };
  
  return (
    <button {...props} style={styles}>
      {children}
    </button>
  );
}
```

## Migration from React

semajsx/web provides familiar patterns for React developers:

```tsx
// React pattern
const [count, setCount] = useState(0);
useEffect(() => {
  console.log(count);
}, [count]);

// semajsx pattern
const count = signal(0);
effect(() => {
  console.log(count.value);
}, [count]);

// Both patterns work similarly, but semajsx provides more direct reactivity
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](../../LICENSE) for details.