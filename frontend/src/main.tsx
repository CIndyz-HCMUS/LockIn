import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DevErrorOverlay } from "./components/DevErrorOverlay";

function renderFatal(err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  console.error("FATAL BOOTSTRAP ERROR:", e);

  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  rootEl.innerHTML = `
    <div style="padding:16px;font-family:ui-sans-serif,system-ui">
      <h2 style="margin:0 0 12px">💥 Fatal error (app chưa kịp render)</h2>
      <div style="margin-bottom:8px"><b>${e.name}:</b> ${e.message}</div>
      <pre style="white-space:pre-wrap;background:#111;color:#eee;padding:12px;border-radius:8px;overflow:auto">${
        e.stack ?? "(no stack)"
      }</pre>
    </div>
  `;
}

window.addEventListener("error", (ev) => {
  // bắt cả lỗi trước React
  renderFatal((ev as ErrorEvent).error ?? (ev as ErrorEvent).message);
});
window.addEventListener("unhandledrejection", (ev) => {
  renderFatal((ev as PromiseRejectionEvent).reason);
});

async function bootstrap() {
  try {
    // ✅ dynamic import để bắt lỗi import module (hay gây trắng màn)
    const mod = await import("./app/App");
    const App = mod.App;

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ErrorBoundary>
          {import.meta.env.DEV ? <DevErrorOverlay /> : null}
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    renderFatal(err);
  }
}

bootstrap();
