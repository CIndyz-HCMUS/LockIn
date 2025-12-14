import React, { useEffect, useMemo, useState } from "react";
import { createWorkoutLog, searchExercises, type Exercise } from "../../services/exerciseService";

export function AddWorkoutModal(props: {
  open: boolean;
  dateKey: string;
  category: string; // "Cardiovascular" | "Strength Training"
  onClose: () => void;
}) {
  const { open, dateKey, category, onClose } = props;

  const [q, setQ] = useState("");
  const [items, setItems] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      const res = await searchExercises(q);
      if (!alive) return;
      setItems(res);
    })();
    return () => {
      alive = false;
    };
  }, [open, q]);

  const filtered = useMemo(() => {
    const c = category.toLowerCase();
    return items.filter((x) => (x.category ?? "").toLowerCase() === c);
  }, [items, category]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 50 }}>
      <div style={{ width: 520, background: "#fff", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Add Exercise — {category}</h3>
          <button onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Search</div>
          <input value={q} onChange={(e) => setQ(e.target.value)} style={inp} placeholder="e.g. jogging" />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Exercise</div>
          <select
            style={inp}
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Select…</option>
            {filtered.map((x) => (
              <option key={x.id} value={x.id}>
                {x.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Minutes</div>
          <input type="number" min={1} step={1} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={inp} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button
            disabled={saving || !exerciseId}
            onClick={async () => {
              if (!exerciseId) return;
              setSaving(true);
              try {
                await createWorkoutLog({ dateKey, exerciseId: Number(exerciseId), minutes: Number(minutes) });
                window.dispatchEvent(new CustomEvent("lockin:refresh"));
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 10,
};
