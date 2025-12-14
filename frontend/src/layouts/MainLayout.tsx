// frontend/src/layouts/MainLayout.tsx
import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { QuickAddModal } from "../components/modals/QuickAddModal";
import { clearToken } from "../utils/authStorage";
import { logout } from "../services/authService";

export function MainLayout() {
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  React.useEffect(() => {
    // close user menu on route change
    setMenuOpen(false);
  }, [loc.pathname]);

  const tabStyle = ({ isActive }: { isActive: boolean }) =>
    ({
      padding: "10px 14px",
      borderRadius: 10,
      textDecoration: "none",
      color: isActive ? "#111" : "#555",
      background: isActive ? "#eee" : "transparent",
      border: "1px solid #e5e5e5",
    } as React.CSSProperties);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#7a3cff" }}>LockIn</div>

          {/* Tabs like prototype */}
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            <NavLink to="/dashboard" style={tabStyle}>
              Home
            </NavLink>
            <NavLink to="/meal" style={tabStyle}>
              Meal
            </NavLink>
            <NavLink to="/activity" style={tabStyle}>
              Activity
            </NavLink>
            <NavLink to="/relaxation" style={tabStyle}>
              Relaxation
            </NavLink>
            <NavLink to="/report" style={tabStyle}>
              Report
            </NavLink>
            <NavLink to="/plan" style={tabStyle}>
              My Plan
            </NavLink>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <NavLink to="/qa" style={{ ...tabStyle({ isActive: loc.pathname === "/qa" }), fontWeight: 700 }}>
              Q&amp;A
            </NavLink>

            <button
              onClick={() => setQuickOpen(true)}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Quick Add
            </button>

            {/* user menu */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: "#f1f1f1",
                  cursor: "pointer",
                }}
                title="User"
              >
                👤
              </button>

              {menuOpen ? (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 44,
                    width: 180,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    zIndex: 20,
                  }}
                >
                  <MenuItem label="Profile" onClick={() => nav("/profile")} />
                 <MenuItem
                    label="Logout"
                    onClick={async () => {
                      try {
                        await logout();
                      } catch {}
                      clearToken();
                      nav("/login");
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Page body */}
      <div style={{ padding: 16 }}>
        <Outlet />
      </div>

      <QuickAddModal open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  );
}

function MenuItem(props: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 12px",
        border: "none",
        background: "#fff",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => ((e.currentTarget.style.background = "#f6f6f6"))}
      onMouseLeave={(e) => ((e.currentTarget.style.background = "#fff"))}
    >
      {props.label}
    </button>
  );
}
