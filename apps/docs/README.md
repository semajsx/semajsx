# SemaJSX Documentation Site

Official documentation site for SemaJSX, built with `@semajsx/ssg`.

## Structure

```
apps/docs/
├── content/              # Documentation content
│   ├── docs/            # Documentation pages
│   └── guides/          # Tutorial guides
├── components/          # Reusable components
│   ├── Layout.tsx       # Main layout
│   ├── Callout.tsx      # Callout component
│   └── CodeBlock.tsx    # Code syntax highlighting
├── rfcs/                # RFC documents (Requirements)
├── designs/             # Design documents
├── adrs/                # Architecture Decision Records
├── guides/              # Development guides
│   └── workflow.md      # Development workflow guide
├── build.tsx            # Build script
├── styles.css           # Global styles
└── package.json
```

**Documentation Types**:
- `content/` - User-facing documentation and guides (published to docs site)
- `rfcs/` - Feature proposals and requirements (internal)
- `designs/` - Technical design documents (internal)
- `adrs/` - Architecture decisions (internal)
- `guides/` - Development workflow and processes (internal)

See [Development Workflow](../../CLAUDE.md#development-workflow) for how these are used.

## Development

### Install Dependencies

From the repository root:

```bash
bun install
```

### Build the Site

```bash
cd apps/docs
bun run build
```

This generates static HTML in the `dist/` directory.

### Preview the Site

```bash
bun run serve
```

Open `http://localhost:4173` to preview the built site.

## Adding Documentation

### Add a Doc Page

Create a Markdown file in `content/docs/`:

```markdown
---
title: Your Title
description: Short description
order: 10
category: Category Name
---

# Your Title

Content goes here...
```

### Add a Guide

Create a Markdown file in `content/guides/`:

```markdown
---
title: Guide Title
description: What you'll learn
order: 1
difficulty: beginner
---

# Guide Title

Step-by-step instructions...
```

## MDX Components

You can use these components in your Markdown files:

### Callout

```markdown
<Callout type="info" title="Note">
Important information here
</Callout>
```

Types: `info`, `warning`, `success`, `error`, `tip`

### CodeBlock

Code blocks are automatically styled. Just use standard Markdown fenced code blocks:

````markdown
```tsx
function Example() {
  return <div>Hello!</div>;
}
```
````

## Features

- **Collections** - Type-safe content management with schema validation
- **MDX Support** - Write docs in MDX with custom components
- **Static Generation** - Fast, SEO-friendly static HTML
- **Hot Reload** - Auto-rebuild on content changes (in watch mode)
- **Island Architecture** - Add interactive components that hydrate on the client

## Build Output

The build generates:

- Static HTML pages for all routes
- Optimized CSS and JavaScript bundles
- Island bundles for interactive components (if any)

```
dist/
├── index.html
├── docs/
│   ├── index.html
│   └── getting-started/
│       └── index.html
├── guides/
│   └── index.html
└── _assets/
```

## Deployment

Deploy the `dist/` directory to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## License

MIT
