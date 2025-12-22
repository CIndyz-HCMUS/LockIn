import React, { useEffect, useMemo, useState } from "react";
import { delJson, getJson, postJson } from "../../services/http";
import { searchFoods, type Food } from "../../services/foodService";

type MealLog = {
  id: number;
  date: string;
  mealType: string;
  foodName: string;
  brand?: string;
  grams?: number;
  calories: number;
  loggedAt?: string;
};

function todayKeyLocal() {
  return new Date().toISOString().slice(0, 10);
}
function norm(s: any) {
  return String(s ?? "").trim().toLowerCase();
}
function fmtMealType(s: string) {
  const x = norm(s);
  if (x === "breakfast") return "Breakfast";
  if (x === "lunch") return "Lunch";
  if (x === "dinner") return "Dinner";
  if (x === "snack" || x === "snacks") return "Snacks";
  return s || "Other";
}
const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snacks"];

function kcalFrom(food: Food, grams: number) {
  const g = Number(grams) || 0;
  const per100 = Number(food.caloriesPer100g) || 0;
  return Math.round((per100 * g) / 100);
}

export function MealPage() {
  const [date, setDate] = useState(todayKeyLocal());
  const [items, setItems] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  // picker modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMealType, setPickerMealType] = useState<string>("breakfast");
  const [q, setQ] = useState("");
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodErr, setFoodErr] = useState("");
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState<number>(100);

  const totals = useMemo(() => {
    const byType: Record<string, number> = {};
    let total = 0;
    for (const it of items) {
      const t = norm(it.mealType) || "other";
      const c = Number(it.calories) || 0;
      byType[t] = (byType[t] || 0) + c;
      total += c;
    }
    return { byType, total };
  }, [items]);

  const grouped = useMemo(() => {
    const map: Record<string, MealLog[]> = {};
    for (const it of items) {
      const t = norm(it.mealType) || "other";
      (map[t] ||= []).push(it);
    }
    const order = [...MEAL_TYPES, ...Object.keys(map).filter((k) => !MEAL_TYPES.includes(k))];
    return order.map((k) => ({ key: k, label: fmtMealType(k), items: map[k] || [] }));
  }, [items]);

  async function loadLogs() {
    setErr("");
    setLoading(true);
    try {
      const res = await getJson<{ items: MealLog[] }>(`/logs/meals?date=${encodeURIComponent(date)}`);
      setItems(res?.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load meal logs");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function openPicker(type?: string) {
    setPickerMealType(type || "breakfast");
    setPickerOpen(true);
    setSelectedFood(null);
    setGrams(100);
    setQ("");
    setFoods([]);
    setFoodErr("");
  }

  async function loadFoods(query: string) {
    setFoodErr("");
    setFoodLoading(true);
    try {
      const list = await searchFoods(query);
      setFoods(list);
    } catch (e: any) {
      setFoods([]);
      setFoodErr(e?.message ?? "Failed to load foods");
    } finally {
      setFoodLoading(false);
    }
  }

  // simple debounce search
  useEffect(() => {
    if (!pickerOpen) return;
    const t = setTimeout(() => loadFoods(q), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pickerOpen]);

  function onChooseFood(f: Food) {
    setSelectedFood(f);
    setGrams(Number(f.servingSizeG ?? 100) || 100);
  }

  async function onSaveSelected() {
    setErr("");
    if (!selectedFood) return;

    const g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) {
      setErr("Grams must be > 0");
      return;
    }

    const calories = kcalFrom(selectedFood, g);

    try {
      await postJson("/logs/meals", {
        date,
        mealType: pickerMealType,
        foodName: selectedFood.name,
        brand: selectedFood.brand ?? undefined,
        grams: g,
        calories,
        // (optional) nếu backend sau này support foodId, em có thể gửi thêm:
        // foodId: selectedFood.id
      });
      setPickerOpen(false);
      setSelectedFood(null);
      await loadLogs();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add food");
    }
  }

  async function onDelete(id: number) {
    setErr("");
    try {
      await delJson(`/logs/meals/${id}`);
      setItems((cur) => cur.filter((x) => x.id !== id));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.title}>Meal Diary</div>
          <div style={styles.sub}>Choose foods (from foods.json + foods.custom.json)</div>
        </div>

        <div style={styles.headerRight}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.dateInput} />
          <button onClick={() => openPicker("breakfast")} style={styles.primaryBtn}>
            + Add Food
          </button>
        </div>
      </div>

      <div style={styles.cardsRow}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Calories</div>
          <div style={styles.bigNumber}>{Math.round(totals.total)}</div>
          <div style={styles.muted}>for {date}</div>
        </div>

        {MEAL_TYPES.map((t) => (
          <div key={t} style={styles.card}>
            <div style={styles.cardLabel}>{fmtMealType(t)}</div>
            <div style={styles.bigNumber}>{Math.round(totals.byType[t] || 0)}</div>
            <div style={styles.muted}>kcal</div>
          </div>
        ))}
      </div>

      {err ? <div style={styles.error}>{err}</div> : null}
      {loading ? <div style={styles.muted}>Loading…</div> : null}

      <div style={{ display: "grid", gap: 14 }}>
        {grouped.map((g) => (
          <div key={g.key} style={styles.section}>
            <div style={styles.sectionHead}>
              <div style={styles.sectionTitle}>
                {g.label} <span style={styles.sectionKcal}>• {Math.round(totals.byType[g.key] || 0)} kcal</span>
              </div>
              <button onClick={() => openPicker(g.key)} style={styles.secondaryBtn}>
                Add
              </button>
            </div>

            {g.items.length === 0 ? (
              <div style={styles.empty}>No items</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {g.items.map((it) => (
                  <div key={it.id} style={styles.row}>
                    <div>
                      <div style={styles.rowTitle}>{it.foodName}</div>
                      <div style={styles.rowSub}>
                        {it.brand ? `${it.brand} • ` : ""}
                        {it.grams ? `${it.grams}g • ` : ""}
                        {it.loggedAt ? new Date(it.loggedAt).toLocaleTimeString() : ""}
                      </div>
                    </div>
                    <div style={styles.rowRight}>
                      <div style={styles.kcal}>{Math.round(Number(it.calories) || 0)} kcal</div>
                      <button onClick={() => onDelete(it.id)} style={styles.dangerBtn}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FOOD PICKER MODAL */}
      {pickerOpen ? (
        <div style={styles.modalOverlay} onMouseDown={() => setPickerOpen(false)}>
          <div style={styles.modalWide} onMouseDown={(e) => e.stopPropagation()}>
            <div style={styles.modalTitleRow}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Choose food</div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select
                  value={pickerMealType}
                  onChange={(e) => setPickerMealType(e.target.value)}
                  style={{ ...styles.input, height: 38 }}
                >
                  {MEAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {fmtMealType(t)}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>

                <button onClick={() => setPickerOpen(false)} style={styles.secondaryBtn}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: 14 }}>
              {/* left: search + list */}
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search food name / brand..."
                    style={{ ...styles.input, height: 40, flex: 1 }}
                  />
                  <button onClick={() => loadFoods(q)} style={styles.secondaryBtn}>
                    Search
                  </button>
                </div>

                {foodErr ? <div style={styles.error}>{foodErr}</div> : null}
                {foodLoading ? <div style={styles.muted}>Loading foods…</div> : null}

                <div style={{ display: "grid", gap: 10, maxHeight: 420, overflow: "auto", paddingRight: 4 }}>
                  {foods.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChooseFood(f)}
                      style={{
                        ...styles.foodRow,
                        borderColor: selectedFood?.id === f.id ? "rgba(29,119,232,0.6)" : "rgba(0,0,0,0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* ảnh có thể là path local; nếu không load thì vẫn ổn */}
                        {f.imagePrimaryUri ? (
                          <img
                            src={f.imagePrimaryUri.startsWith("http") ? f.imagePrimaryUri : `/${f.imagePrimaryUri}`}
                            alt=""
                            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <div>
                          <div style={{ fontWeight: 900 }}>{f.name}</div>
                          <div style={{ color: "#777", fontSize: 12 }}>
                            {f.brand ? `${f.brand} • ` : ""}
                            {f.isVerified ? "Verified" : "Custom"} • {f.caloriesPer100g} kcal/100g
                          </div>
                          <div style={{ color: "#777", fontSize: 12 }}>
                            {f.servingLabel ? f.servingLabel : f.servingSizeG ? `${f.servingSizeG}g serving` : ""}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {foods.length === 0 && !foodLoading ? <div style={styles.empty}>No foods</div> : null}
                </div>
              </div>

              {/* right: quantity + confirm */}
              <div style={styles.sidePanel}>
                <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 10 }}>Selected</div>

                {!selectedFood ? (
                  <div style={styles.muted}>Pick a food from the list</div>
                ) : (
                  <>
                    <div style={{ fontWeight: 900 }}>{selectedFood.name}</div>
                    <div style={{ color: "#777", fontSize: 12, marginBottom: 10 }}>
                      {selectedFood.brand ? `${selectedFood.brand} • ` : ""}
                      {selectedFood.caloriesPer100g} kcal/100g
                    </div>

                    <div style={styles.field}>
                      <div style={styles.label}>Grams</div>
                      <input
                        type="number"
                        value={grams}
                        onChange={(e) => setGrams(Number(e.target.value))}
                        style={styles.input}
                      />
                    </div>

                    <div style={{ marginTop: 10, fontWeight: 900 }}>
                      Calories: {kcalFrom(selectedFood, grams)} kcal
                    </div>

                    <button onClick={onSaveSelected} style={{ ...styles.primaryBtn, marginTop: 12 }}>
                      Add to {fmtMealType(pickerMealType)}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MealPage;

const styles: Record<string, React.CSSProperties> = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 12 },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  title: { fontSize: 28, fontWeight: 800 },
  sub: { color: "#666" },

  dateInput: { height: 38, borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", padding: "0 10px" },

  cardsRow: { display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 12, marginBottom: 12 },
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
  rowTitle: { fontWeight: 800 },
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
  modalWide: {
    width: 980,
    maxWidth: "95vw",
    background: "#fff",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalTitleRow: {
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  sidePanel: {
    background: "#fafafa",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    padding: 14,
    height: "fit-content",
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

  foodRow: {
    width: "100%",
    textAlign: "left",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    padding: 12,
    cursor: "pointer",
  },
};
