/** @jsxImportSource semajsx/dom */

import { createViteRouter, type DocumentTemplate } from "semajsx/server";
import { logger } from "semajsx/terminal/logger";
import { App } from "./App";

/**
 * SSR Islands Server with Vite
 * Uses Vite dev server for module transformation (no bundling!)
 */

// Custom HTML document template (JSX!)
const Document: DocumentTemplate = ({ children, scripts, title }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {title && <title>{title}</title>}
      <style>{`
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f9fafb;
        }
      `}</style>
    </head>
    <body>
      {children}
      {scripts}
    </body>
  </html>
);

// Create Vite-powered router with JSX document template
const router = await createViteRouter(
  {
    "/": () => <App />,
  },
  {
    dev: true, // Enable Vite dev server
    root: import.meta.dir, // Project root
    document: Document, // Use JSX document template!
    title: "SemaJSX SSR Islands (Vite)", // Page title
  },
);

// Create HTTP server
const server = Bun.serve({
  port: 3000,
  async fetch(req: Request) {
    const url = new URL(req.url);
    logger.info(`${req.method} ${url.pathname}`);

    try {
      // Handle Vite module requests (/@fs/, /@vite/, /node_modules/, etc.)
      if (
        url.pathname.startsWith("/@") ||
        url.pathname.startsWith("/node_modules/") ||
        url.pathname.includes("/@fs/")
      ) {
        logger.debug(`  → Vite module request: ${url.pathname}`);
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

        logger.debug(`  → Island entry point: ${islandId}`);
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
        logger.debug(`  → Source file request: ${url.pathname}`);
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

        logger.success(`Rendered page with ${result.islands.length} islands`);
        for (const island of result.islands) {
          logger.debug(
            `  - ${island.id}: ${island.componentName || "anonymous"} (${island.path})`,
          );
        }

        // Use the complete HTML document rendered from JSX template
        const html = result.document || result.html;

        return new Response(html, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });
      } catch (routeError: unknown) {
        if (
          routeError instanceof Error &&
          routeError.message?.includes("Route not found")
        ) {
          logger.warn(`404 Not Found: ${url.pathname}`);
          return new Response("404 - Page Not Found", { status: 404 });
        }
        throw routeError; // Re-throw other errors
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Error: ${errorMessage}`);

      return new Response(`500 - Internal Server Error\n\n${errorMessage}`, {
        status: 500,
      });
    }
  },
});

logger.blank();
logger.success("SemaJSX SSR Islands Server (Vite-powered!)");
logger.blank();
logger.info(`Server running at: http://localhost:${server.port}`);
logger.blank();
logger
  .group("Features", { borderColor: "green" })
  .info("Vite dev server for instant module transformation")
  .info("No bundling - modules loaded on demand")
  .info("Shared dependencies - semajsx loaded once")
  .info("Fast HMR-ready setup")
  .info("Browser caching for dependencies")
  .groupEnd();
logger.blank();
logger
  .group("Dev Tools", { borderColor: "cyan" })
  .info("Check Network tab to see module loading")
  .info("Notice how semajsx is loaded separately and cached")
  .info("Islands share the same semajsx dependency!")
  .groupEnd();
logger.blank();

// Cleanup on exit
process.on("SIGINT", async () => {
  logger.blank();
  logger.warn("Shutting down...");
  await router.close();
  server.stop();
  process.exit(0);
});
