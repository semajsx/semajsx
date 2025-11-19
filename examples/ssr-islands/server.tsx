/** @jsxImportSource ../../src/dom */

import { createViteRouter } from "../../src/server";
import { App } from "./App";

/**
 * SSR Islands Server with Vite
 * Uses Vite dev server for module transformation (no bundling!)
 */

// Create Vite-powered router
const router = await createViteRouter(
  {
    "/": () => <App />,
  },
  {
    dev: true, // Enable Vite dev server
    root: import.meta.dir, // Project root
  },
);

// Create HTTP server
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);

    try {
      // Handle Vite module requests (/@fs/, /@vite/, /node_modules/, etc.)
      if (
        url.pathname.startsWith("/@") ||
        url.pathname.startsWith("/node_modules/") ||
        url.pathname.includes("/@fs/")
      ) {
        console.log(`  → Vite module request: ${url.pathname}`);
        const result = await router.handleModuleRequest(url.pathname);

        if (result) {
          return new Response(result.code, {
            headers: {
              "Content-Type": "application/javascript",
              "Cache-Control": "no-cache",
            },
          });
        }

        return new Response("Module not found", { status: 404 });
      }

      // Handle island entry point requests
      if (url.pathname.startsWith("/islands/")) {
        const islandId = url.pathname.match(/\/islands\/(.+)\.js/)?.[1];

        if (!islandId) {
          return new Response("Invalid island ID", { status: 400 });
        }

        console.log(`  → Island entry point: ${islandId}`);
        const code = await router.getIslandEntryPoint(islandId);

        return new Response(code, {
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      }

      // Handle source file requests (TypeScript/JavaScript files)
      // These should be transformed by Vite
      if (
        url.pathname.endsWith(".tsx") ||
        url.pathname.endsWith(".ts") ||
        url.pathname.endsWith(".jsx") ||
        url.pathname.endsWith(".js")
      ) {
        console.log(`  → Source file request: ${url.pathname}`);
        const result = await router.handleModuleRequest(url.pathname);

        if (result) {
          return new Response(result.code, {
            headers: {
              "Content-Type": "application/javascript",
              "Cache-Control": "no-cache",
            },
          });
        }

        return new Response("Module not found", { status: 404 });
      }

      // Handle page requests
      try {
        const result = await router.get(url.pathname);

        console.log(`  ✓ Rendered page with ${result.islands.length} islands`);
        for (const island of result.islands) {
          console.log(
            `    - ${island.id}: ${island.componentName || "anonymous"} (${island.path})`,
          );
        }

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SemaJSX SSR Islands (Vite)</title>
</head>
<body>
  ${result.html}
  ${result.scripts}
</body>
</html>
      `.trim();

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      } catch (routeError: any) {
        if (routeError.message?.includes("Route not found")) {
          console.log(`  → 404 Not Found: ${url.pathname}`);
          return new Response("404 - Page Not Found", { status: 404 });
        }
        throw routeError; // Re-throw other errors
      }
    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);

      return new Response(`500 - Internal Server Error\n\n${error.message}`, {
        status: 500,
      });
    }
  },
});

console.log(`
🏝️  SemaJSX SSR Islands Server (Vite-powered!)

Server running at: http://localhost:${server.port}

Features:
  ✅ Vite dev server for instant module transformation
  ✅ No bundling - modules loaded on demand
  ✅ Shared dependencies - semajsx loaded once
  ✅ Fast HMR-ready setup
  ✅ Browser caching for dependencies

Try it:
  Open http://localhost:${server.port} in your browser!

Dev Tools:
  - Check Network tab to see module loading
  - Notice how semajsx is loaded separately and cached
  - Islands share the same semajsx dependency!
`);

// Cleanup on exit
process.on("SIGINT", async () => {
  console.log("\n\nShutting down...");
  await router.close();
  server.stop();
  process.exit(0);
});
