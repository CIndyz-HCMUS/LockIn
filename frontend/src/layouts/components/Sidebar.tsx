import React from "react";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside style={{ width: 240, padding: 16, borderRight: "1px solid #eee" }}>
      <h3>LockIn</h3>
      <nav style={{ display: "grid", gap: 8 }}>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/foods">Foods</NavLink>
        <NavLink to="/exercises">Exercises</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </aside>
  );
}
