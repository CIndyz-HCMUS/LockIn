import React, { useEffect, useMemo, useState } from "react";
import { searchExercises, type Exercise } from "../../services/exerciseService";
import { AddWorkoutModal } from "../../components/modals/AddWorkoutModal";
import { todayKey } from "../../utils/date";

export function ExercisesPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Cardiovascular");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    const t = setTimeout(async () => {
      try {
        // NOTE: project bạn đang gọi searchExercises(q) (không chắc service signature),
        // nên mình giữ cách gọi như cũ và normalize response.
        const res: any = await (searchExercises as any)(q);

        if (!alive) return;

        // ✅ Normalize: res có thể là Exercise[] hoặc { items: Exercise[] }
        const arr: Exercise[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : [];

        setItems(arr);
      } catch (e: any) {
        console.error(e);
        if (!alive) return;
        setItems([]);
        setErr(e?.message ?? "Failed to load exercises");
      } finally {
        if (alive) setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const cardio = useMemo(
    () => (Array.isArray(items) ? items : []).filter((x) => (x.category ?? "").toLowerCase() === "cardiovascular"),
    [items]
  );

  const strength = useMemo(
    () => (Array.isArray(items) ? items : []).filter((x) => (x.category ?? "").toLowerCase() === "strength training"),
    [items]
  );

  return (
    <div>
      <h1>Exercises</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 10 }}
          placeholder="Search exercises…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
      </div>

      {loading ? <div>Loading…</div> : null}
      {err ? <div style={{ color: "#b00020", fontWeight: 700, marginBottom: 10 }}>{err}</div> : null}

      <Section
        title="Cardiovascular"
        items={cardio}
        onAdd={() => {
          setCategory("Cardiovascular");
          setOpen(true);
        }}
      />

      <Section
        title="Strength Training"
        items={strength}
        onAdd={() => {
          setCategory("Strength Training");
          setOpen(true);
        }}
      />

      <AddWorkoutModal open={open} dateKey={dateKey} category={category} onClose={() => setOpen(false)} />
    </div>
  );
}

function Section(props: { title: string; items: Exercise[]; onAdd: () => void }) {
  const { title, items, onAdd } = props;

  return (
    <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button onClick={onAdd}>Add Exercise</button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {items.map((x) => {
          const kcalPerMin = (x as any).caloriesPerMinute;
          const met = (x as any).met;
          const right = kcalPerMin != null ? `${kcalPerMin} kcal/min` : met != null ? `MET ${met}` : "-";

          return (
            <div key={x.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>{x.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {x.category} • {right}
              </div>
            </div>
          );
        })}

        {items.length === 0 ? <div style={{ color: "#999" }}>No exercises</div> : null}
      </div>
    </div>
  );
}
