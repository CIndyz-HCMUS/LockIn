import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "./AuthShell";
import { login } from "../../services/authService";
import { setToken } from "../../utils/authStorage";

export function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation();

  const [username, setUsername] = useState(""); // bạn có thể đổi label thành Email
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const from = (loc.state as any)?.from || "/dashboard";

  async function handleLogin(kind: "normal" | "google") {
    setLoading(true);
    setErr(null);
    try {
      // Demo: google cũng gọi API như thường (hoặc bạn để alert)
      if (kind === "google") {
        // Nếu chưa làm OAuth thật thì giữ demo alert:
        // alert("Google OAuth not implemented");
        // return;
      }

      const res = await login(username, password, remember);
      setToken(res.token, remember);
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell active="login">
      <h2 style={styles.title}>Sign in to continue</h2>

      <Field label="Username / Email">
        <input
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your email"
        />
      </Field>

      <Field label="Password">
        <input
          style={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your Password"
        />
      </Field>

      <div style={styles.rowBetween}>
        <label style={styles.checkbox}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember me</span>
        </label>

        <button style={styles.linkBtn} type="button" onClick={() => alert("Forgot password chưa làm (demo)")}>
          Forgot password?
        </button>
      </div>

      {err ? <div style={{ marginTop: 10, color: "#d00000", fontSize: 12 }}>{err}</div> : null}

      <button
        style={{ ...styles.primaryBtn, opacity: loading ? 0.7 : 1 }}
        disabled={loading}
        onClick={() => handleLogin("normal")}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <DividerOr />

      <button
        style={{ ...styles.googleBtn, opacity: loading ? 0.7 : 1 }}
        disabled={loading}
        onClick={() => handleLogin("google")}
      >
        <GoogleIcon />
        <span style={{ fontWeight: 800 }}>CONTINUE WITH GOOGLE</span>
      </button>
    </AuthShell>
  );
}

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={styles.label}>{props.label}</div>
      {props.children}
    </div>
  );
}

function DividerOr() {
  return (
    <div style={styles.orWrap}>
      <div style={styles.orLine} />
      <div style={styles.orText}>OR</div>
      <div style={styles.orLine} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.3 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.7 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.4 39.6 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.4 5.4-6.2 6.8l.1.1 6.3 5.2C38 37.6 44 33 44 24c0-1.3-.1-2.2-.4-3.5z" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { margin: 0, fontSize: 20, fontWeight: 900 },
  label: { fontSize: 12, color: "#444", fontWeight: 700, marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e7e7e7", background: "#f3f3f3", outline: "none" },
  rowBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  checkbox: { display: "flex", gap: 8, alignItems: "center", color: "#444", fontSize: 12 },
  linkBtn: { border: "none", background: "transparent", color: "#666", cursor: "pointer", fontSize: 12 },
  primaryBtn: { width: "100%", marginTop: 14, padding: "12px 14px", borderRadius: 10, border: "1px solid #1f7ae0", background: "#1f7ae0", color: "#fff", fontWeight: 900, cursor: "pointer" },
  orWrap: { display: "flex", alignItems: "center", gap: 10, marginTop: 14 },
  orLine: { height: 1, background: "#eee", flex: 1 },
  orText: { color: "#999", fontSize: 12, fontWeight: 800 },
  googleBtn: { width: "100%", marginTop: 12, padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", display: "flex", gap: 10, alignItems: "center", justifyContent: "center", cursor: "pointer" },
};
