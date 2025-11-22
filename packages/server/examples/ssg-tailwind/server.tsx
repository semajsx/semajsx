/** @jsxImportSource @semajsx/dom */

import { createApp, type DocumentTemplate } from "@semajsx/server";
import { createLogger } from "@semajsx/logger";
import tailwindcss from "@tailwindcss/vite";
import { App } from "./App";

const startupLogger = createLogger({
  timestamp: false,
  showLevel: false,
});

// Custom HTML document template with Tailwind CSS
const Document: DocumentTemplate = ({ children, scripts, title }) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      {title && <title>{title}</title>}
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      {children}
      {scripts}
    </body>
  </html>
);

// Create app with Tailwind CSS plugin
const app = createApp({
  routes: {
    "/": () => <App />,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  islands: {
    basePath: "/islands",
  },
  document: Document,
  title: "SemaJSX SSG with Tailwind CSS",
  root: import.meta.dir,
});

// Initialize the app
await app.prepare();

// Create HTTP server
const server = Bun.serve({
  port: 3000,
  async fetch(req: Request) {
    const url = new URL(req.url);

    // Serve CSS file through Vite
    if (url.pathname === "/style.css") {
      const vite = app.getViteServer();
      if (vite) {
        const result = await vite.transformRequest("/style.css");
        if (result) {
          return new Response(result.code, {
            headers: { "Content-Type": "text/css" },
          });
        }
      }
    }

    // Handle all other requests through the app
    return app.handleRequest(req);
  },
});

// Display startup info
startupLogger.blank();
startupLogger.success("SemaJSX SSG with Tailwind CSS");
startupLogger.blank();
startupLogger.info(`Server running at: http://localhost:${server.port}`);
startupLogger.blank();
startupLogger
  .group("Configuration", { borderColor: "cyan" })
  .info("Tailwind CSS via @tailwindcss/vite plugin")
  .info("CSS file: style.css with @import 'tailwindcss'")
  .info("Vite handles CSS transformation")
  .groupEnd();
startupLogger.blank();

// Cleanup on exit
let isShuttingDown = false;
process.on("SIGINT", async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  startupLogger.blank();
  startupLogger.warn("Shutting down...");
  await app.close();
  server.stop();
  process.exit(0);
});
