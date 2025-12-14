import React, { useEffect, useMemo, useState } from "react";
import { searchExercises, type Exercise } from "../../services/exerciseService";
import { createWorkoutLog } from "../../services/workoutLogService";

type Props = {
  open: boolean;
  dateKey: string;
  category: string;
  onClose: () => void;
};

export function AddWorkoutModal({ open, dateKey, category, onClose }: Props) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [minutes, setMinutes] = useState<number>(10);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setItems([]);
    setSelectedId("");
    setMinutes(10);
    setErr(null);
  }, [open]);

  async function load() {
    const res = await searchExercises({ q, category, limit: 50, offset: 0 });
    setItems(res.items);
  }

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const selected = useMemo(
    () => items.find((x) => x.id === selectedId) ?? null,
    [items, selectedId]
  );

  if (!open) return null;

  async function onSave() {
    setErr(null);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setErr("Minutes must be > 0");
      return;
    }
    if (!selectedId) {
      setErr("Please choose an exercise");
      return;
    }

    setSaving(true);
    try {
      await createWorkoutLog({
        dateKey,
        minutes,
        exerciseId: Number(selectedId),
      });
      window.dispatchEvent(new CustomEvent("lockin:refresh"));
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={styles.overlay}
      onMouseDown={(e) => {
        // ✅ chỉ đóng khi click đúng nền overlay
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Add workout</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              Date: <b>{dateKey}</b> • Category: <b>{category}</b>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exercise..."
            style={styles.input}
          />
          <button style={styles.btnOutline} onClick={load} disabled={saving}>Search</button>

          <div style={{ fontSize: 12, color: "#666" }}>Exercise</div>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
            style={styles.input}
          >
            <option value="">-- Choose exercise --</option>
            {items.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title} ({x.caloriesPerMinute} kcal/min)
              </option>
            ))}
          </select>

          {selected?.desc ? <div style={{ fontSize: 12, color: "#666" }}>{selected.desc}</div> : null}

          <div style={{ fontSize: 12, color: "#666" }}>Minutes</div>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            style={styles.input}
          />

          {err ? <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button style={styles.btnOutline} onClick={onClose} disabled={saving}>Cancel</button>
            <button style={styles.btn} onClick={onSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
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
    zIndex: 9999,
    padding: 16,
  },
  card: {
    width: 560,
    maxWidth: "95vw",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eee",
    padding: 14,
  },
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
    borderRadius: 12,
    border: "1px solid #ddd",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnOutline: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
