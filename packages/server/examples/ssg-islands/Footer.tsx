/** @jsxImportSource @semajsx/dom */

/**
 * Static Footer component
 */
export function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "20px",
        textAlign: "center",
        color: "#6b7280",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <p>Built with SemaJSX SSG + Islands Architecture</p>
      <p style={{ fontSize: "0.875rem" }}>
        Static content renders instantly, islands hydrate on demand
      </p>
    </footer>
  );
}
