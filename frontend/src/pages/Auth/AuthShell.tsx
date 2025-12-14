import React from "react";
import { NavLink } from "react-router-dom";

export function AuthShell(props: { active: "login" | "signup"; children: React.ReactNode }) {
  const { active, children } = props;

  return (
    <div style={styles.page}>
      <BackgroundArt />

      <div style={styles.center}>
        <div style={styles.brand}>LockIn</div>

        <div style={styles.switchWrap}>
          <NavLink to="/login" style={{ ...styles.switchBtn, ...(active === "login" ? styles.switchBtnActive : {}) }}>
            Sign In
          </NavLink>
          <NavLink to="/signup" style={{ ...styles.switchBtn, ...(active === "signup" ? styles.switchBtnActive : {}) }}>
            Sign Up
          </NavLink>
        </div>

        <div style={styles.card}>{children}</div>
      </div>
    </div>
  );
}

function BackgroundArt() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="none" style={styles.bgSvg}>
      <path d="M120 230c60-70 110-70 150 0s90 70 150 0 110-70 150 0" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
      <path d="M110 270c80-40 120-10 150 20s90 60 170 10 140-10 190 30" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
      <path d="M60 340c120-40 240 40 360 0 140-50 200 40 360 0" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
      <path d="M900 365c55-70 120-85 150-40 18 27 4 62-40 70" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
      <path d="M955 330c10 25 16 45 10 62" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
      <path d="M830 420c70-40 180-40 280 0" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.85" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { position: "relative", minHeight: "100vh", background: "#eef3f7", overflow: "hidden" },
  bgSvg: { position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" },
  center: { position: "relative", zIndex: 1, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 },
  brand: {
    fontSize: 56,
    fontWeight: 900,
    letterSpacing: 1,
    background: "linear-gradient(90deg,#7a3cff,#4d9dff)",
    WebkitBackgroundClip: "text",
    color: "transparent",
    marginBottom: 14,
    textAlign: "center",
  },
  switchWrap: {
    width: 420,
    background: "#e7e7e7",
    borderRadius: 999,
    padding: 6,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 6,
    marginBottom: 14,
    boxShadow: "0 1px 0 rgba(0,0,0,0.08) inset",
  },
  switchBtn: { textDecoration: "none", textAlign: "center", padding: "10px 12px", borderRadius: 999, fontWeight: 700, color: "#111", background: "transparent" },
  switchBtnActive: { background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.12)" },
  card: { width: 420, background: "#fff", borderRadius: 16, padding: 22, boxShadow: "0 12px 30px rgba(0,0,0,0.14)", border: "1px solid rgba(0,0,0,0.06)" },
};
