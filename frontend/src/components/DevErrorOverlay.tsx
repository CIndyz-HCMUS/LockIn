import React, { useEffect, useState } from "react";

type ErrState = {
  title: string;
  message: string;
  stack?: string;
  source?: string;
};

export function DevErrorOverlay() {
  const [err, setErr] = useState<ErrState | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const e = event.error as Error | undefined;
      setErr({
        title: "window.onerror",
        message: e?.message || event.message || "Unknown error",
        stack: e?.stack,
        source: `${event.filename || ""}:${event.lineno || ""}:${event.colno || ""}`,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
          ? reason
          : JSON.stringify(reason);

      setErr({
        title: "Unhandled Promise Rejection",
        message,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!err) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        color: "white",
        zIndex: 999999,
        padding: 16,
        overflow: "auto",
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>💥 {err.title}</h2>
        <button
          onClick={() => setErr(null)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #666",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <b>Message:</b> {err.message}
        </div>
        {err.source && (
          <div style={{ marginBottom: 8 }}>
            <b>Source:</b> {err.source}
          </div>
        )}

        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#111",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          {err.stack || "(no stack)"}
        </pre>

        <button
          onClick={() => navigator.clipboard.writeText(`${err.title}\n${err.message}\n${err.source ?? ""}\n${err.stack ?? ""}`)}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #666",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          Copy error
        </button>
      </div>
    </div>
  );
}
