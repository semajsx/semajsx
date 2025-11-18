import { createRouter } from "../../src/server";
import { App } from "./App";

/**
 * SSR Islands Server Example
 * Demonstrates runtime island discovery and lazy building
 */

// Create router with routes
const router = createRouter({
  "/": () => <App />,
});

// Create HTTP server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

    // Handle island code requests
    if (url.pathname.startsWith("/islands/")) {
      const islandId = url.pathname.match(/\/islands\/(.+)\.js/)?.[1];

      if (!islandId) {
        return new Response("Island ID not found", { status: 400 });
      }

      try {
        const island = router.getIsland(islandId);
        if (!island) {
          return new Response("Island not found", { status: 404 });
        }

        console.log(`  → Building island: ${islandId} (${island.path})`);
        const code = await router.getIslandCode(islandId);

        return new Response(code, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        console.error(`  ✗ Error building island ${islandId}:`, error);
        return new Response(`Error building island: ${error}`, {
          status: 500,
        });
      }
    }

    // Handle page requests
    try {
      const result = await router.get(url.pathname);

      console.log(`  ✓ Rendered page with ${result.islands.length} islands`);
      for (const island of result.islands) {
        console.log(`    - ${island.id}: ${island.componentName || "anonymous"} (${island.path})`);
      }

      const html = `
<!DOCTYPE html>
${result.html}
${result.scripts}
      `.trim();

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    } catch (error: any) {
      console.error(`  ✗ Error rendering page:`, error);

      if (error.message?.includes("Route not found")) {
        return new Response("404 - Page Not Found", { status: 404 });
      }

      return new Response(`500 - Internal Server Error\n\n${error.message}`, {
        status: 500,
      });
    }
  },
});

console.log(`
🏝️  SemaJSX SSR Islands Server

Server running at: http://localhost:${server.port}

Features:
  ✅ Runtime island discovery
  ✅ Lazy island building
  ✅ Automatic hydration
  ✅ Minimal JavaScript

Try it:
  Open http://localhost:${server.port} in your browser!
`);
