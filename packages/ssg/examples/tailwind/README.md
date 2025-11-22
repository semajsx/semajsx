# SSG with Tailwind CSS Example

Demonstrates Tailwind CSS integration with `@semajsx/ssg`.

## Setup

Install Tailwind dependencies:

```bash
bun add tailwindcss @tailwindcss/vite -D
```

## Usage

```typescript
const ssg = createSSG({
  outDir: "./dist",
  tailwind: true,  // That's it!
  routes: [...],
});
```

The framework automatically:

- Loads `@tailwindcss/vite` plugin
- Creates virtual CSS file at `/@tailwind.css`
- Injects CSS link via `styles` prop in DocumentTemplate

## Run

```bash
bun run examples/tailwind/build.tsx
```

Output will be in `examples/tailwind/dist/`.
