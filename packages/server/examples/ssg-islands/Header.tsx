/** @jsxImportSource @semajsx/dom */

/**
 * Static Header component - no hydration needed
 */
export function Header({ title }: { title: string }) {
  return (
    <header
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "40px 20px",
        textAlign: "center",
        borderRadius: "8px",
        marginBottom: "30px",
      }}
    >
      <h1 style={{ margin: "0 0 10px 0", fontSize: "2.5rem" }}>{title}</h1>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Static Site Generation with Islands Architecture
      </p>
    </header>
  );
}
