import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";

function FatalScreen({ error }: { error: unknown }) {
  const e = error instanceof Error ? error : new Error(String(error));
  return (
    <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
      <h2 style={{ margin: "0 0 12px" }}>💥 Fatal error (app chưa kịp render)</h2>
      <div style={{ marginBottom: 8 }}>
        <b>{e.name}:</b> {e.message}
      </div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#111",
          color: "#eee",
          padding: 12,
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        {e.stack ?? "(no stack)"}
      </pre>
    </div>
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root");

const root = ReactDOM.createRoot(rootEl);

async function bootstrap() {
  try {
    const mod = await import("./app/App");
    const App = mod.App;

    // ✅ Tạm thời bỏ StrictMode để tránh double-mount trong dev
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    // ✅ render fatal bằng React (KHÔNG innerHTML)
    root.render(<FatalScreen error={err} />);
  }
}

bootstrap();
