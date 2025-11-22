# SSG with Tailwind CSS Example

This example demonstrates how to use Tailwind CSS with SemaJSX SSG (Static Site Generation) and the Island Architecture.

## Setup

1. Install dependencies (already included in the root package):

```bash
bun add tailwindcss @tailwindcss/vite -D
```

2. Configure the Tailwind plugin in your app:

```typescript
import tailwindcss from "@tailwindcss/vite";

const app = createApp({
  vite: {
    plugins: [tailwindcss()],
  },
  // ... other config
});
```

3. Create a CSS file with Tailwind import:

```css
/* style.css */
@import "tailwindcss";
```

4. Link the CSS in your document template:

```tsx
const Document: DocumentTemplate = ({ children, scripts, title }) => (
  <html lang="en">
    <head>
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      {children}
      {scripts}
    </body>
  </html>
);
```

## Running the Example

From the server package directory:

```bash
bun run example:ssg-tailwind
```

Or from the root:

```bash
bun --filter @semajsx/server run example:ssg-tailwind
```

Then open http://localhost:3000 in your browser.

## How It Works

1. The `@tailwindcss/vite` plugin processes CSS files containing `@import "tailwindcss"`
2. Vite transforms the CSS on-demand, generating only the classes used in your components
3. The server serves the transformed CSS at `/style.css`
4. All Tailwind utility classes work seamlessly with SSR and island hydration

## Files

- `server.tsx` - Main server with Tailwind plugin configuration
- `App.tsx` - Main app component using Tailwind classes
- `Counter.tsx` - Interactive island component with Tailwind styling
- `style.css` - CSS file with Tailwind import
