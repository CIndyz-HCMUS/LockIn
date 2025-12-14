// frontend/src/pages/Foods/FoodsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { todayKey } from "../../utils/date";

// ✅ services
import {
  searchFoods,
  listCustomFoods,
  deleteCustomFood,
  type Food,
} from "../../services/foodService";

// ✅ modals (đổi path/tên file nếu project bạn khác)
import { AddMealModal } from "../../components/modals/AddMealModal";
import { AddCustomFoodModal } from "../../components/modals/AddCustomFoodModal";

type Tab = "all" | "custom";

export function FoodsPage() {
  const [tab, setTab] = useState<Tab>("all");

  // Search merged foods (base + custom)
  const [q, setQ] = useState("");
  const [mergedFoods, setMergedFoods] = useState<Food[]>([]);
  const [mergedTotal, setMergedTotal] = useState(0);

  // Custom-only list
  const [customFoods, setCustomFoods] = useState<Food[]>([]);

  const [dateKey, setDateKey] = useState(todayKey());
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  // Meal modal
  const [mealOpen, setMealOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Custom modal
  const [customOpen, setCustomOpen] = useState(false);

  // debounce
  const debounceRef = useRef<number | null>(null);

  async function loadMerged(query: string) {
    setLoading(true);
    setErr("");
    try {
      const res = await searchFoods(query, 50, 0);
      setMergedFoods(res.items ?? []);
      setMergedTotal(res.total ?? 0);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load foods");
    } finally {
      setLoading(false);
    }
  }

  async function loadCustom() {
    setLoading(true);
    setErr("");
    try {
      const res = await listCustomFoods();
      setCustomFoods(res.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load custom foods");
    } finally {
      setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadMerged("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // search debounce for All tab
  useEffect(() => {
    if (tab !== "all") return;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      loadMerged(q);
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tab]);

  // when switch tab
  useEffect(() => {
    if (tab === "custom") loadCustom();
  }, [tab]);

  // refresh event hook (sau khi add meal / add custom)
  useEffect(() => {
    const onRefresh = () => {
      if (tab === "custom") loadCustom();
      loadMerged(q);
    };
    window.addEventListener("lockin:refresh", onRefresh);
    return () => window.removeEventListener("lockin:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, q]);

  const listToShow = useMemo(() => {
    return tab === "custom" ? customFoods : mergedFoods;
  }, [tab, customFoods, mergedFoods]);

  return (
    <div style={{ padding: 4 }}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0 }}>Foods</h1>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {tab === "all" ? (
              <span>
                Showing {mergedFoods.length} / {mergedTotal} results
              </span>
            ) : (
              <span>My custom foods: {customFoods.length}</span>
            )}
          </div>
        </div>

        <button style={styles.addBtn} onClick={() => setCustomOpen(true)}>
          + Add custom food
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button
          style={{ ...styles.tabBtn, ...(tab === "all" ? styles.tabBtnActive : {}) }}
          onClick={() => setTab("all")}
        >
          All foods
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === "custom" ? styles.tabBtnActive : {}) }}
          onClick={() => setTab("custom")}
        >
          My custom foods
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#666", fontWeight: 700 }}>Date</div>
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
        </div>
      </div>

      {/* Search (only in All foods tab) */}
      {tab === "all" ? (
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <input
            style={styles.search}
            placeholder="Search foods by name or brand…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            style={styles.smallBtn}
            onClick={() => {
              setQ("");
              loadMerged("");
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {/* Error / Loading */}
      {err ? <div style={styles.err}>{err}</div> : null}
      {loading ? <div style={{ color: "#666", marginBottom: 10 }}>Loading…</div> : null}

      {/* List */}
      <div style={{ display: "grid", gap: 10 }}>
        {listToShow.map((f) => (
          <div key={f.id} style={styles.card}>
            <div style={styles.thumb}>
              {f.imagePrimaryUri ? (
                <img
                  src={String(f.imagePrimaryUri)}
                  alt={f.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.titleRow}>
                <div style={styles.foodName}>
                  {f.name}
                  {f.brand ? <span style={styles.brand}> • {f.brand}</span> : null}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {f.isVerified ? (
                    <span style={styles.badgeVerified}>verified</span>
                  ) : (
                    <span style={styles.badgeCustom}>custom</span>
                  )}
                </div>
              </div>

              <div style={styles.meta}>
                <span style={{ fontWeight: 800 }}>{f.caloriesPer100g}</span> kcal / 100g
                <span style={{ marginLeft: 10 }}>
                  P {f.proteinPer100g}g • C {f.carbPer100g}g • F {f.fatPer100g}g
                </span>
              </div>

              <div style={styles.meta2}>
                Serving: {f.servingLabel} ({f.servingSizeG}g)
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                style={styles.primaryAction}
                onClick={() => {
                  setSelectedFood(f);
                  setMealOpen(true);
                }}
              >
                Add meal
              </button>

              {/* Delete only for custom tab OR custom item (id < 0 / isVerified false) */}
              {!f.isVerified ? (
                <button
                  style={styles.dangerAction}
                  onClick={async () => {
                    const ok = window.confirm(`Delete custom food "${f.name}"?`);
                    if (!ok) return;

                    try {
                      setLoading(true);
                      await deleteCustomFood(f.id);
                      // reload both lists
                      await Promise.all([loadCustom(), loadMerged(q)]);
                    } catch (e: any) {
                      setErr(e?.message ?? "Delete failed");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Delete
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {!loading && listToShow.length === 0 ? (
          <div style={{ color: "#999" }}>
            {tab === "all"
              ? "No foods found. Try adding a custom food."
              : "No custom foods yet. Click “+ Add custom food” to create one."}
          </div>
        ) : null}
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        open={mealOpen}
        dateKey={dateKey}
        food={selectedFood as any}
        onClose={() => setMealOpen(false)}
        onSaved={() => {
          window.dispatchEvent(new CustomEvent("lockin:refresh"));
          setMealOpen(false);
        }}
      />

      {/* Add Custom Food Modal */}
      <AddCustomFoodModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onCreated={(food) => {
          // update lists instantly for UX
          setCustomFoods((prev) => [food, ...prev]);
          setMergedFoods((prev) => [food, ...prev]);
          window.dispatchEvent(new CustomEvent("lockin:refresh"));
        }}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  addBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
  tabRow: { display: "flex", gap: 8, alignItems: "center", marginBottom: 12 },
  tabBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  tabBtnActive: { background: "#111", color: "#fff", border: "1px solid #111" },

  search: { flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 10 },
  smallBtn: { padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },

  err: { marginBottom: 10, color: "#b00020", fontSize: 12, fontWeight: 800 },

  card: {
    display: "flex",
    gap: 12,
    padding: 12,
    border: "1px solid #eee",
    borderRadius: 12,
    alignItems: "center",
    background: "#fff",
  },
  thumb: { width: 56, height: 56, borderRadius: 10, background: "#eee", overflow: "hidden", flexShrink: 0 },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  foodName: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  brand: { fontWeight: 700, color: "#666", fontSize: 12 },
  meta: { marginTop: 4, fontSize: 12, color: "#444" },
  meta2: { marginTop: 2, fontSize: 12, color: "#777" },

  badgeVerified: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#e7f7ee", color: "#087443", fontWeight: 900, border: "1px solid #bfead1" },
  badgeCustom: { fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "#f5f5f5", color: "#666", fontWeight: 900, border: "1px solid #e6e6e6" },

  primaryAction: { padding: "8px 10px", borderRadius: 10, border: "1px solid #1f7ae0", background: "#1f7ae0", color: "#fff", fontWeight: 900, cursor: "pointer" },
  dangerAction: { padding: "8px 10px", borderRadius: 10, border: "1px solid #d33", background: "#fff", color: "#d33", fontWeight: 900, cursor: "pointer" },
};
