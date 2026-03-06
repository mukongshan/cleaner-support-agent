
  import { createRoot } from "react-dom/client";
  import React from "react";
  import App from "./App.tsx";
  import "./index.css";

  class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: 24, fontFamily: "sans-serif" }}>
            <h2 style={{ color: "#ef4444" }}>页面加载出错</h2>
            <pre style={{ fontSize: 12, color: "#666", whiteSpace: "pre-wrap" }}>
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
            >
              重新加载
            </button>
          </div>
        );
      }
      return this.props.children;
    }
  }

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  