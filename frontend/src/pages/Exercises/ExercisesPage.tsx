import React, { useEffect, useMemo, useState } from "react";
import { AddWorkoutModal } from "../../components/modals/AddWorkoutModal";
import { todayKey } from "../../utils/date";
import { searchExercises, type Exercise } from "../../services/exerciseService";
import { listWorkoutLogs, deleteWorkoutLog } from "../../services/workoutLogService";

type WorkoutLog = {
  id: number;
  dateKey?: string;
  loggedAt?: string;
  exerciseId: number;
  minutes: number;
  caloriesBurned?: number;
  // backend có thể trả category luôn, không có thì mình derive từ exercise
  category?: string;
};

function norm(s: any) {
  return String(s ?? "").trim().toLowerCase();
}

function unwrapItems<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.items)) return res.items as T[];
  return [];
}

export function ExercisesPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [q, setQ] = useState("");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Cardiovascular");

  const exerciseById = useMemo(() => {
    const m = new Map<number, Exercise>();
    for (const x of exercises) m.set(x.id, x);
    return m;
  }, [exercises]);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [exRes, logRes] = await Promise.all([
        // load library để map title/category/met
        searchExercises({ query: "", limit: 1000, offset: 0 }),
        // load logs theo ngày
        listWorkoutLogs(dateKey),
      ]);

      setExercises(unwrapItems<Exercise>(exRes));
      setLogs(unwrapItems<WorkoutLog>(logRes));
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  // reload khi modal save xong (AddWorkoutModal dispatch lockin:refresh)
  useEffect(() => {
    const handler = () => loadAll();
    window.addEventListener("lockin:refresh", handler as any);
    return () => window.removeEventListener("lockin:refresh", handler as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const filteredLogs = useMemo(() => {
    const qq = norm(q);
    if (!qq) return logs;
    return logs.filter((l) => {
      const ex = exerciseById.get(Number((l as any).exerciseId));
      const name = ex ? (ex as any).title ?? "" : "";
      return norm(name).includes(qq);
    });
  }, [logs, q, exerciseById]);

  function categoryOfLog(l: WorkoutLog) {
    const fromLog = (l as any).category;
    if (fromLog) return String(fromLog);
    const ex = exerciseById.get(Number((l as any).exerciseId));
    return String((ex as any)?.category ?? "Other");
  }

  const cardioLogs = useMemo(
    () => filteredLogs.filter((l) => norm(categoryOfLog(l)) === "cardiovascular"),
    [filteredLogs]
  );
  const strengthLogs = useMemo(
    () => filteredLogs.filter((l) => norm(categoryOfLog(l)) === "strength training"),
    [filteredLogs]
  );

  const cardioTotal = useMemo(
    () => cardioLogs.reduce((sum, l: any) => sum + Number(l.caloriesBurned ?? 0), 0),
    [cardioLogs]
  );
  const strengthTotal = useMemo(
    () => strengthLogs.reduce((sum, l: any) => sum + Number(l.caloriesBurned ?? 0), 0),
    [strengthLogs]
  );

  async function onDeleteLog(id: number) {
    const ok = window.confirm("Delete this workout log?");
    if (!ok) return;
    try {
      await deleteWorkoutLog(id);
      await loadAll();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Delete failed");
    }
  }

  return (
    <div>
      <h1>Exercises</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          placeholder="Search logged workouts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
      </div>

      {loading ? <div>Loading…</div> : null}
      {err ? <div style={{ color: "crimson" }}>{err}</div> : null}

      <LogSection
        title="Cardiovascular"
        totalKcal={cardioTotal}
        logs={cardioLogs}
        exerciseById={exerciseById}
        onAdd={() => {
          setCategory("Cardiovascular");
          setOpen(true);
        }}
        onDeleteLog={onDeleteLog}
      />

      <LogSection
        title="Strength Training"
        totalKcal={strengthTotal}
        logs={strengthLogs}
        exerciseById={exerciseById}
        onAdd={() => {
          setCategory("Strength Training");
          setOpen(true);
        }}
        onDeleteLog={onDeleteLog}
      />

      <AddWorkoutModal open={open} dateKey={dateKey} category={category} onClose={() => setOpen(false)} />
    </div>
  );
}

function LogSection(props: {
  title: string;
  totalKcal: number;
  logs: any[];
  exerciseById: Map<number, Exercise>;
  onAdd: () => void;
  onDeleteLog: (id: number) => void;
}) {
  const { title, totalKcal, logs, exerciseById, onAdd, onDeleteLog } = props;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onAdd} style={{ marginTop: 6 }}>
            Add Exercise
          </button>
        </div>
        <div style={{ fontSize: 18 }}>{Math.round(totalKcal)} kcal</div>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 80, color: "#666" }}>
          <div>Minutes</div>
          <div>Calories burned</div>
        </div>

        {logs.length === 0 ? (
          <div style={{ color: "#999", marginTop: 12 }}>No exercises yet.</div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {logs.map((l: any) => {
              const ex = exerciseById.get(Number(l.exerciseId));
              const title = (ex as any)?.title ?? `Exercise #${l.exerciseId}`;
              return (
                <div
                  key={l.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 160px 90px",
                    gap: 10,
                    alignItems: "center",
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div style={{ textAlign: "right" }}>{l.minutes}</div>
                  <div style={{ textAlign: "right" }}>{Math.round(Number(l.caloriesBurned ?? 0))} kcal</div>
                  <button onClick={() => onDeleteLog(l.id)}>Delete</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
