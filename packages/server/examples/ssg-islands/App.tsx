/** @jsxImportSource @semajsx/dom */

// Static components (no hydration)
import { Header } from "./Header";
import { Card } from "./Card";
import { Footer } from "./Footer";

// Island components (hydrate on client)
import { Counter } from "./Counter";
import { ContactForm } from "./ContactForm";

/**
 * Main App component demonstrating SSG with static components and islands
 */
export function App() {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Static component */}
      <Header title="SSG Islands Demo" />

      {/* Static card with explanation */}
      <Card title="About This Demo" variant="info">
        <p>
          This page demonstrates <strong>Static Site Generation (SSG)</strong>{" "}
          with the Islands Architecture. The page is pre-rendered at build time,
          with interactive components (islands) that hydrate on the client.
        </p>
      </Card>

      {/* Static content section */}
      <Card title="Static Components">
        <p>
          These components are rendered at build time and don't need JavaScript:
        </p>
        <ul>
          <li>
            <code>Header</code> - Page header with gradient background
          </li>
          <li>
            <code>Card</code> - Reusable content container
          </li>
          <li>
            <code>Footer</code> - Page footer
          </li>
        </ul>
      </Card>

      {/* Island component - Counter */}
      <Card title="Interactive Islands" variant="highlight">
        <p style={{ marginBottom: "15px" }}>
          Islands are interactive components that hydrate on the client:
        </p>

        <Counter initial={10} label="Score" />

        <Counter initial={0} label="Clicks" />
      </Card>

      {/* Another static section */}
      <Card title="How It Works">
        <ol style={{ paddingLeft: "20px" }}>
          <li>Server pre-renders all routes to static HTML</li>
          <li>Islands are detected and their code is bundled separately</li>
          <li>Client loads HTML instantly (SEO-friendly)</li>
          <li>Island scripts load and hydrate interactive components</li>
        </ol>
      </Card>

      {/* Island component - ContactForm */}
      <Card title="Form Example" variant="highlight">
        <p style={{ marginBottom: "15px" }}>
          Forms with validation and state management work seamlessly as islands:
        </p>

        <ContactForm />
      </Card>

      {/* Benefits section */}
      <Card title="Benefits of SSG + Islands">
        <ul>
          <li>
            <strong>Fast Initial Load:</strong> Pre-rendered HTML loads
            instantly
          </li>
          <li>
            <strong>SEO Friendly:</strong> Search engines see complete content
          </li>
          <li>
            <strong>Minimal JavaScript:</strong> Only islands load JS
          </li>
          <li>
            <strong>Progressive Enhancement:</strong> Content works without JS
          </li>
        </ul>
      </Card>

      {/* Static footer */}
      <Footer />
    </div>
  );
}
