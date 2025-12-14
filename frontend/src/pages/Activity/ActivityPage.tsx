import React, { useEffect, useMemo, useState } from "react";
import { todayKey } from "../../utils/date";
import { AddWorkoutModal } from "../../components/modals/AddWorkoutModal";
import { deleteWorkoutLog, listWorkoutLogs, type WorkoutLog } from "../../services/workoutLogService";

const CATEGORIES = ["Cardiovascular", "Strength Training"];

export function ActivityPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [open, setOpen] = useState(false);

  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await listWorkoutLogs(dateKey);
      setLogs(res.items ?? []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load workouts");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener("lockin:refresh", fn as any);
    return () => window.removeEventListener("lockin:refresh", fn as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const totalMinutes = useMemo(() => logs.reduce((s, x) => s + (Number(x.minutes) || 0), 0), [logs]);
  const totalKcal = useMemo(() => logs.reduce((s, x) => s + (Number(x.caloriesBurned) || 0), 0), [logs]);

  const byCategory = useMemo(() => {
    const map: Record<string, WorkoutLog[]> = {};
    for (const l of logs) {
      const c = l.category || "Other";
      (map[c] ??= []).push(l);
    }
    return map;
  }, [logs]);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Activity</h1>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Date</div>
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={panel}>
          <div style={{ fontSize: 12, color: "#666" }}>Total minutes</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{totalMinutes} min</div>
        </div>
        <div style={panel}>
          <div style={{ fontSize: 12, color: "#666" }}>Total calories burned</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{totalKcal} kcal</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={input}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button style={btn} onClick={() => setOpen(true)}>+ Add workout</button>

        <button style={btnOutline} onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {err ? <div style={{ marginTop: 10, color: "#b00020", fontSize: 12 }}>{err}</div> : null}

      <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
        {Object.keys(byCategory).length === 0 ? (
          <div style={{ color: "#666" }}>No workouts for this day.</div>
        ) : (
          Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} style={panel}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>{cat}</div>
                <div style={{ fontWeight: 900 }}>
                  {items.reduce((s, x) => s + (Number(x.caloriesBurned) || 0), 0)} kcal
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {items.map((l) => (
                  <div key={l.id} style={row}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{l.exerciseName}</div>
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{l.minutes} min • {l.caloriesBurned} kcal</div>
                    </div>

                    <button
                      style={btnSmall}
                      onClick={async () => {
                        await deleteWorkoutLog(l.id);
                        await load();
                        window.dispatchEvent(new CustomEvent("lockin:refresh"));
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AddWorkoutModal
        open={open}
        dateKey={dateKey}
        category={category}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

const panel: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 14,
};

const row: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 14,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const input: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const btnOutline: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};

const btnSmall: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 900,
};
