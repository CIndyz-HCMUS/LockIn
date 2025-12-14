import React, { useMemo, useState } from "react";
import { postJson } from "../../services/http";

export function QuickAddStepsModal(props: {
  open: boolean;
  dateKey: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { open, dateKey, onClose, onSaved } = props;
  const [steps, setSteps] = useState<number>(1000);
  const [saving, setSaving] = useState(false);
  const canSave = useMemo(() => Number.isFinite(steps) && steps > 0, [steps]);

  if (!open) return null;

  async function save() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      // backend: POST /logs/steps
      await postJson("/logs/steps", { date: dateKey, steps });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.overlay} onMouseDown={onClose}>
      <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Quick Add • Steps</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{dateKey}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Steps</div>
          <input
            type="number"
            value={steps}
            min={1}
            onChange={(e) => setSteps(Number(e.target.value))}
            style={styles.input}
          />
        </div>

        <div style={styles.footer}>
          <button style={styles.secondaryBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button style={styles.primaryBtn} onClick={save} disabled={!canSave || saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
  },
  card: {
    width: 520,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #eee",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  closeBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    width: 38,
    height: 38,
    cursor: "pointer",
    fontWeight: 900,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 14,
  },
  footer: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  secondaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #5a7cff",
    background: "#5a7cff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
