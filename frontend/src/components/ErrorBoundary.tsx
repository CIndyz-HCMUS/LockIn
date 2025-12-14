import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  error?: Error;
  info?: React.ErrorInfo;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // log ra console để debug
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: "ui-sans-serif, system-ui" }}>
          <h2 style={{ margin: "0 0 12px" }}>⚠️ App bị lỗi</h2>

          <div style={{ marginBottom: 8 }}>
            <b>{this.state.error.name}:</b> {this.state.error.message}
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
            {this.state.error.stack || "(no stack)"}
          </pre>

          {this.state.info?.componentStack && (
            <>
              <h3 style={{ margin: "16px 0 8px" }}>Component stack</h3>
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
                {this.state.info.componentStack}
              </pre>
            </>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
