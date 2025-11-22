/** @jsxImportSource @semajsx/dom */

import { createApp, type DocumentTemplate } from "@semajsx/server";
import { logger, createLogger } from "@semajsx/logger";
import { App } from "./App";

// Create a startup logger without timestamps
const startupLogger = createLogger({
  timestamp: false,
  showLevel: false,
});

/**
 * SSG Islands Server
 * Demonstrates Static Site Generation with Islands Architecture
 */

// Custom HTML document template
const Document: DocumentTemplate = ({ children, scripts, title }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {title && <title>{title}</title>}
      <style>{`
        body {
          margin: 0;
          background: #f9fafb;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </head>
    <body>
      {children}
      {scripts}
    </body>
  </html>
);

// Create app with SSG configuration
const app = createApp({
  routes: {
    "/": () => <App />,
  },
  islands: {
    basePath: "/islands",
  },
  document: Document,
  title: "SemaJSX SSG Islands Demo",
  root: import.meta.dir,
});

// Initialize the app
await app.prepare();

// Check if we're running in build mode
const isBuildMode = process.argv.includes("--build");

if (isBuildMode) {
  // SSG Build Mode - generate static files
  startupLogger.blank();
  startupLogger.info("Building static site...");
  startupLogger.blank();

  try {
    const result = await app.build({
      outDir: "dist",
      minify: true,
    });

    startupLogger.success("Build completed!");
    startupLogger.blank();
    startupLogger
      .group("Build Output", { borderColor: "green" })
      .info(`Output directory: ${result.outDir}`)
      .info(`Islands built: ${result.islands.length}`)
      .groupEnd();

    if (result.islands.length > 0) {
      startupLogger.blank();
      startupLogger.group("Islands", { borderColor: "cyan" });
      for (const island of result.islands) {
        startupLogger.info(`- ${island.id}`);
      }
      startupLogger.groupEnd();
    }

    startupLogger.blank();
  } catch (error) {
    logger.error("Build failed:", error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
} else {
  // Development Server Mode
  const server = Bun.serve({
    port: 3000,
    async fetch(req: Request) {
      const url = new URL(req.url);
      logger.info(`${req.method} ${url.pathname}`);

      const response = await app.handleRequest(req);

      // Log island info for page requests
      if (
        response.headers.get("Content-Type")?.includes("text/html") &&
        response.status === 200
      ) {
        try {
          const result = await app.render(url.pathname);
          logger.success(`Rendered with ${result.islands.length} islands`);
          for (const island of result.islands) {
            logger.debug(
              `  - ${island.id}: ${island.componentName || "anonymous"}`,
            );
          }
        } catch {
          // Ignore
        }
      }

      return response;
    },
  });

  // Display startup info
  startupLogger.blank();
  startupLogger.success("SSG Islands Server (Development)");
  startupLogger.blank();
  startupLogger.info(`Server: http://localhost:${server.port}`);
  startupLogger.blank();
  startupLogger
    .group("Components", { borderColor: "green" })
    .info("Static: Header, Card, Footer")
    .info("Islands: Counter, ContactForm")
    .groupEnd();
  startupLogger.blank();
  startupLogger
    .group("Commands", { borderColor: "cyan" })
    .info("Dev server: bun run server.tsx")
    .info("Build SSG:  bun run server.tsx --build")
    .groupEnd();
  startupLogger.blank();

  // Cleanup on exit
  let isShuttingDown = false;
  process.on("SIGINT", async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.blank();
    logger.warn("Shutting down...");
    await app.close();
    server.stop();
    process.exit(0);
  });
}
