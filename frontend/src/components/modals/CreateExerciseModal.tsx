import React, { useEffect, useState } from "react";
import { createExercise, type Exercise } from "../../services/exerciseService";

type Props = {
  open: boolean;
  defaultCategory: string;
  onClose: () => void;
  onCreated: (ex: Exercise) => void;
};

export function CreateExerciseModal({ open, defaultCategory, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [met, setMet] = useState<number>(4);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setMet(4);
    setErr(null);
  }, [open]);

  if (!open) return null;

  async function onSave() {
    setErr(null);
    const t = title.trim();
    if (!t) return setErr("Title is required");
    if (!Number.isFinite(met) || met <= 0) return setErr("MET must be > 0");

    setSaving(true);
    try {
      const ex = await createExercise({ title: t, category: defaultCategory, met });
      onCreated(ex);
      onClose();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Add new exercise</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Category</div>
          <input value={defaultCategory} disabled style={{ ...styles.input, background: "#f6f6f6" }} />

          <div style={{ fontSize: 12, color: "#666" }}>Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Rushing" style={styles.input} />

          <div style={{ fontSize: 12, color: "#666" }}>MET</div>
          <input type="number" min={1} value={met} onChange={(e) => setMet(Number(e.target.value))} style={styles.input} />

          {err ? <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button style={styles.btnOutline} onClick={onClose} disabled={saving}>Cancel</button>
            <button style={styles.btn} onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 10000, padding: 16 },
  card: { width: 520, maxWidth: "96vw", background: "#fff", borderRadius: 14, border: "1px solid #eee", padding: 16 },
  closeBtn: { border: "1px solid #ddd", background: "#fff", borderRadius: 10, width: 40, height: 40, cursor: "pointer", fontWeight: 900 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd", outline: "none", fontFamily: "inherit" },
  btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer", fontWeight: 900 },
  btnOutline: { padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontWeight: 900 },
};
