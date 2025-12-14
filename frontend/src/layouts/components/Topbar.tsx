// frontend/src/layouts/components/Topbar.tsx
import React, { useState } from "react";
import { QuickAddModal } from "../../components/modals/QuickAddModal";

export function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Demo</span>
        <button onClick={() => setOpen(true)}>Quick Add</button>
      </div>

      <QuickAddModal open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
