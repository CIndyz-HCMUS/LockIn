import React, { useEffect, useMemo, useState } from "react";
import { getJson, postJson } from "../../services/http";

type Exercise = { id: number; title: string; category: string; met?: number };

export function AddExerciseModal(props: {
  open: boolean;
  category: string;
  dateKey: string; // YYYY-MM-DD
  onClose: () => void;
  onSaved: () => void;
}) {
  const { open, category, dateKey, onClose, onSaved } = props;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    getJson<{ items: Exercise[] }>(`/exercises?query=&type=workout`)
      .then((r) => setExercises(r.items || []))
      .catch(() => setExercises([]));
  }, [open]);

  const options = useMemo(
    () => exercises.filter((x) => (x.category || "").toLowerCase() === category.toLowerCase()),
    [exercises, category]
  );

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center" }}>
      <div style={{ width: 420, background: "#fff", borderRadius: 8, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add Exercise — {category}</h3>

        <label>Exercise</label>
        <select style={{ width: "100%", padding: 8 }} value={exerciseId} onChange={(e) => setExerciseId(Number(e.target.value) || "")}>
          <option value="">Select…</option>
          {options.map((x) => (
            <option key={x.id} value={x.id}>{x.title}</option>
          ))}
        </select>

        <div style={{ height: 12 }} />

        <label>Minutes</label>
        <input
          style={{ width: "100%", padding: 8 }}
          type="number"
          min={1}
          max={600}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
        />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button
            onClick={async () => {
              if (!exerciseId) return;
              setLoading(true);
              try {
                await postJson(`/logs/workouts`, {
                  loggedAt: `${dateKey}T12:00:00`,
                  exerciseId,
                  minutes,
                });
                onSaved();
                onClose();
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !exerciseId}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
