import React from "react";
import { Outlet } from "react-router-dom";
import { TopTabsNav } from "../components/navigation/TopTabNav";
import { RightSidebar } from "../components/sidebar/RightSidebar";

export function MainShellLayout() {
  return (
    <div>
      <TopTabsNav />

      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }}>
          <main style={{ minHeight: 300 }}>
            <Outlet />
          </main>

          <aside>
            <RightSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}
