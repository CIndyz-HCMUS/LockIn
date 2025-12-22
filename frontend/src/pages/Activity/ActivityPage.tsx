import React, { useEffect, useMemo, useState } from "react";
import { delJson, getJson, postJson } from "../../services/http";

type WorkoutLog = {
  id: number;
  date: string;
  title: string;
  category?: string; // "Cardiovascular" | "Strength Training" | ...
  minutes?: number;
  caloriesBurned: number;
  loggedAt?: string;
  imageUrl?: string;
};

function todayKeyLocal() {
  return new Date().toISOString().slice(0, 10);
}
function norm(s: any) {
  return String(s ?? "").trim().toLowerCase();
}

const CATS = ["Cardiovascular", "Strength Training", "Other"];

export function ActivityPage() {
  const [date, setDate] = useState(todayKeyLocal());
  const [items, setItems] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Cardiovascular");
  const [minutes, setMinutes] = useState<number>(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(200);
  const [imageUrl, setImageUrl] = useState("");

  const summary = useMemo(() => {
    const totalKcal = items.reduce((s, x) => s + (Number(x.caloriesBurned) || 0), 0);
    const totalMin = items.reduce((s, x) => s + (Number(x.minutes) || 0), 0);
    return { totalKcal, totalMin, count: items.length };
  }, [items]);

  const grouped = useMemo(() => {
    const map: Record<string, WorkoutLog[]> = {};
    for (const it of items) {
      const c = it.category?.trim() || "Other";
      (map[c] ||= []).push(it);
    }
    const order = [...CATS, ...Object.keys(map).filter((k) => !CATS.includes(k))];
    return order.map((k) => ({ key: k, items: map[k] || [] }));
  }, [items]);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await getJson<{ items: WorkoutLog[] }>(`/logs/workouts?date=${encodeURIComponent(date)}`);
      setItems(res?.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load workout logs");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openAddModal() {
    setTitle("");
    setCategory("Cardiovascular");
    setMinutes(30);
    setCaloriesBurned(200);
    setImageUrl("");
    setOpenAdd(true);
  }

  async function onCreate() {
    setErr("");
    const t = title.trim();
    if (!t) return setErr("Title is required");
    const min = Number(minutes);
    const kcal = Number(caloriesBurned);
    if (!Number.isFinite(min) || min <= 0) return setErr("Minutes must be > 0");
    if (!Number.isFinite(kcal) || kcal <= 0) return setErr("Calories burned must be > 0");

    try {
      await postJson("/logs/workouts", {
        date,
        title: t,
        category,
        minutes: min,
        caloriesBurned: kcal,
        imageUrl: imageUrl.trim() || undefined,
      });
      setOpenAdd(false);
      await load();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add activity");
    }
  }

  async function onDelete(id: number) {
    setErr("");
    try {
      await delJson(`/logs/workouts/${id}`);
      setItems((cur) => cur.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.title}>Activity Diary</div>
          <div style={styles.sub}>Log workouts and calories burned</div>
        </div>

        <div style={styles.headerRight}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.dateInput} />
          <button onClick={openAddModal} style={styles.primaryBtn}>
            + Add Activity
          </button>
        </div>
      </div>

      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Burned</div>
          <div style={styles.bigNumber}>{Math.round(summary.totalKcal)} kcal</div>
          <div style={styles.muted}>{summary.count} activities</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Minutes</div>
          <div style={styles.bigNumber}>{Math.round(summary.totalMin)}</div>
          <div style={styles.muted}>minutes</div>
        </div>
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}
      {loading ? <div style={styles.muted}>Loading…</div> : null}

      <div style={{ display: "grid", gap: 14 }}>
        {grouped.map((g) => {
          const total = g.items.reduce((s, x) => s + (Number(x.caloriesBurned) || 0), 0);
          return (
            <div key={g.key} style={styles.section}>
              <div style={styles.sectionHead}>
                <div style={styles.sectionTitle}>
                  {g.key} <span style={styles.sectionKcal}>• {Math.round(total)} kcal</span>
                </div>
              </div>

              {g.items.length === 0 ? (
                <div style={styles.empty}>No activities</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {g.items.map((it) => (
                    <div key={it.id} style={styles.row}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {it.imageUrl ? (
                          <img
                            src={it.imageUrl}
                            alt=""
                            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", border: "1px solid rgba(0,0,0,0.1)" }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e5e7eb" }} />
                        )}

                        <div>
                          <div style={styles.rowTitle}>{it.title}</div>
                          <div style={styles.rowSub}>
                            {it.minutes ? `${it.minutes} min • ` : ""}
                            {it.loggedAt ? new Date(it.loggedAt).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      </div>

                      <div style={styles.rowRight}>
                        <div style={styles.kcal}>{Math.round(Number(it.caloriesBurned) || 0)} kcal</div>
                        <button onClick={() => onDelete(it.id)} style={styles.dangerBtn}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {openAdd ? (
        <div style={styles.modalOverlay} onMouseDown={() => setOpenAdd(false)}>
          <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Add Activity</div>
            <div style={styles.modalBody}>
              <div style={styles.field}>
                <div style={styles.label}>Title</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
              </div>

              <div style={styles.grid2}>
                <div style={styles.field}>
                  <div style={styles.label}>Category</div>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.field}>
                  <div style={styles.label}>Minutes</div>
                  <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} style={styles.input} />
                </div>
              </div>

              <div style={styles.grid2}>
                <div style={styles.field}>
                  <div style={styles.label}>Calories Burned</div>
                  <input
                    type="number"
                    value={caloriesBurned}
                    onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <div style={styles.label}>Image URL (optional)</div>
                  <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={styles.input} />
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setOpenAdd(false)} style={styles.secondaryBtn}>
                Cancel
              </button>
              <button onClick={onCreate} style={styles.primaryBtn}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ActivityPage;

const styles: Record<string, React.CSSProperties> = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 12 },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  title: { fontSize: 28, fontWeight: 800 },
  sub: { color: "#666" },

  dateInput: { height: 38, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", padding: "0 10px" },

  cardsRow: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 12 },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  cardLabel: { color: "#666", fontWeight: 700, marginBottom: 6 },
  bigNumber: { fontSize: 24, fontWeight: 900 },
  muted: { color: "#777", fontSize: 13 },

  error: { background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: 10, borderRadius: 12 },

  section: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },
  sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 800 },
  sectionKcal: { color: "#666", fontWeight: 700, fontSize: 14 },
  empty: { color: "#777", padding: "6px 0" },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "#fafafa",
  },
  rowTitle: { fontWeight: 900 },
  rowSub: { color: "#777", fontSize: 12, marginTop: 2 },
  rowRight: { display: "flex", gap: 10, alignItems: "center" },
  kcal: { fontWeight: 900 },

  primaryBtn: {
    height: 38,
    padding: "0 12px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: "#1d77e8",
    color: "#fff",
    fontWeight: 800,
  },
  secondaryBtn: {
    height: 34,
    padding: "0 10px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },
  dangerBtn: {
    height: 30,
    padding: "0 10px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,0.14)",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
    color: "#b91c1c",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: 560,
    maxWidth: "95vw",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
  },
  modalTitle: { padding: 14, fontSize: 18, fontWeight: 900, borderBottom: "1px solid rgba(0,0,0,0.08)" },
  modalBody: { padding: 14, display: "grid", gap: 12 },
  modalActions: {
    padding: 14,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    borderTop: "1px solid rgba(0,0,0,0.08)",
  },
  field: { display: "grid", gap: 6 },
  label: { fontWeight: 800, color: "#333", fontSize: 13 },
  input: {
    height: 40,
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: "0 12px",
    background: "#f7f7f7",
    outline: "none",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
};
