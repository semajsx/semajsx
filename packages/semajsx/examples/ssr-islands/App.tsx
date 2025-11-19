/** @jsxImportSource semajsx/dom */

import { Counter } from "./Counter";
import { TodoList } from "./TodoList";

/**
 * Main App component with static and interactive content
 */
export function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SemaJSX SSR Islands Demo</title>
        <style>
          {`
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: #f9fafb;
            }
            h1 {
              color: #1f2937;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 10px;
            }
            h2 {
              color: #374151;
              margin-top: 30px;
            }
            .static-content {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
          `}
        </style>
      </head>
      <body>
        <h1>🏝️ SemaJSX SSR Islands Architecture Demo</h1>

        <div class="static-content">
          <h2>What is this?</h2>
          <p>
            This page demonstrates <strong>SSR Islands</strong> - a technique
            where server-rendered HTML contains "islands" of interactivity.
          </p>
          <p>
            The static content (like this text) is rendered on the server and
            sent as HTML. The interactive components below are{" "}
            <strong>islands</strong> that hydrate on the client side.
          </p>
        </div>

        <h2>📊 Static Content</h2>
        <div class="static-content">
          <p>
            This is <em>static content</em> rendered on the server. It doesn't
            need JavaScript and loads instantly.
          </p>
          <ul>
            <li>✅ Fast initial load</li>
            <li>✅ SEO friendly</li>
            <li>✅ No JavaScript needed</li>
          </ul>
        </div>

        <h2>🎮 Interactive Islands</h2>
        <p style={{ color: "#6b7280" }}>
          The components below are marked as islands and will hydrate on the
          client:
        </p>

        {/* Island 1: Counter */}
        <Counter initial={0} />

        <div class="static-content">
          <p>
            <strong>More static content between islands!</strong> This
            demonstrates that you can mix static and interactive content freely.
          </p>
        </div>

        {/* Island 2: TodoList */}
        <TodoList />

        <h2>🎯 Key Benefits</h2>
        <div class="static-content">
          <ul>
            <li>
              <strong>Selective Hydration:</strong> Only interactive components
              load JavaScript
            </li>
            <li>
              <strong>Faster Performance:</strong> Less JavaScript = faster page
              loads
            </li>
            <li>
              <strong>Runtime Discovery:</strong> Islands are discovered at
              render time
            </li>
            <li>
              <strong>Lazy Building:</strong> Island code is built on-demand
            </li>
          </ul>
        </div>

        <footer
          style={{
            marginTop: "40px",
            padding: "20px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          <p>Built with ❤️ using SemaJSX</p>
        </footer>
      </body>
    </html>
  );
}
