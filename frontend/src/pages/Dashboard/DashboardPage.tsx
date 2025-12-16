import React, { useEffect, useMemo, useState } from "react";
import { getJson } from "../../services/http";
import { todayKey } from "../../utils/date";
import { AddWorkoutModal } from "../../components/modals/AddWorkoutModal";
import { useNavigate } from "react-router-dom";
import { listMealLogs, deleteMealLog, type MealLog, type MealType } from "../../services/mealLogService";
import { QuickAddWaterModal } from "../../components/modals/QuickAddWaterModal";
import { QuickAddStepsModal } from "../../components/modals/QuickAddStepsModal";
import { QuickAddSleepModal } from "../../components/modals/QuickAddSleepModal";
import { listWorkoutLogs, type WorkoutLog } from "../../services/workoutLogService";

type DashboardDto = {
  date: string;
  totals?: {
    caloriesIn: number;
    caloriesOut: number;
    netCalories: number;
    waterMl: number;
    steps: number;
    sleepMinutes: number;
    totalCaloriesBurned: number;
  };
  groups?: Array<{
    category: string;
    totalCalories: number;
    items: Array<{ id: number; title: string; minutes: number; caloriesBurned: number }>;
  }>;
  profile?: {
    name: string;
    sex: "F" | "M";
    heightCm: number;
    weightKg: number;
    age: number;
    measurements: Record<string, number>;
    goal: { targetWeightKg?: number };
    avatarDataUrl?: string; // ✅ add
  };
  metrics?: { bmr: number; tdee: number; bmi: number | null };
  goals?: { calories: number; waterMl: number; steps: number; sleepMinutes: number };
};

function pickGroup(groups: DashboardDto["groups"] | undefined, name: string) {
  const list = Array.isArray(groups) ? groups : [];
  const g = list.find((x) => (x.category ?? "").toLowerCase() === name.toLowerCase());
  return g ?? { category: name, totalCalories: 0, items: [] };
}

function groupMeals(items: MealLog[]) {
  const groups: Record<MealType, MealLog[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const it of items) groups[it.mealType].push(it);
  return groups;
}

function sumCaloriesIn(items: MealLog[]) {
  return items.reduce((s, x) => s + (Number(x.calories) || 0), 0);
}

export function DashboardPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string>("");

  const [addOpen, setAddOpen] = useState(false);
  const [addCategory, setAddCategory] = useState("Cardiovascular");
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const nav = useNavigate();

  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [mealGroups, setMealGroups] = useState<Record<MealType, MealLog[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  // meals popup
  const [mealPopupOpen, setMealPopupOpen] = useState(false);
  const [mealPopupType, setMealPopupType] = useState<MealType>("breakfast");

  // quick add
  const [qaWaterOpen, setQaWaterOpen] = useState(false);
  const [qaStepsOpen, setQaStepsOpen] = useState(false);
  const [qaSleepOpen, setQaSleepOpen] = useState(false);

  async function refreshMealsOnly() {
    const mealRes = await listMealLogs(dateKey);
    const meals = mealRes.items ?? [];
    setMealLogs(meals);
    setMealGroups(groupMeals(meals));
  }

  async function load() {
    setLoading(true);
    setPageError("");
    try {
      const res = await getJson<DashboardDto>(`/stats/today?date=${dateKey}`);
      setData(res);
      const logs = await listWorkoutLogs(todayKey()); // hoặc dateKey state của bạn
      setWorkoutLogs(Array.isArray(logs) ? logs : []);  
      await refreshMealsOnly();
    } catch (e: any) {
      console.error(e);
      setData(null);
      setMealLogs([]);
      setMealGroups({ breakfast: [], lunch: [], dinner: [], snack: [] });
      setPageError(e?.message ?? "Failed to load dashboard");
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

  const cardio = useMemo(() => (data ? pickGroup(data.groups, "Cardiovascular") : null), [data]);
  const strength = useMemo(() => (data ? pickGroup(data.groups, "Strength Training") : null), [data]);

  const profile = data?.profile;
  const metrics = data?.metrics;
  const totals = data?.totals;

  const caloriesInFromMeals = sumCaloriesIn(mealLogs);
  const caloriesInShown = totals?.caloriesIn ?? caloriesInFromMeals;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }}>
      {/* LEFT */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, color: "#666" }}>TODAY, DATE</div>
            <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
          </div>

          <button
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#5a7cff",
              color: "#fff",
              fontWeight: 700,
            }}
            disabled
          >
            Your exercise guide
          </button>
        </div>

        {pageError ? (
          <div
            style={{
              marginTop: 12,
              background: "#fff5f5",
              border: "1px solid #ffcccc",
              borderRadius: 12,
              padding: 12,
              color: "#b00020",
              fontWeight: 800,
            }}
          >
            {pageError}
          </div>
        ) : null}

        {/* Total calories burned */}
        <div style={{ marginTop: 12, background: "#fff", border: "2px solid #4da3ff", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>TOTAL CALORIES BURNED</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{totals?.totalCaloriesBurned ?? 0}</div>
            <div style={{ color: "#666" }}>kcal</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <MiniCard title="Calories In" value={caloriesInShown} unit="kcal" />
            <MiniCard title="Calories Out" value={totals?.caloriesOut ?? 0} unit="kcal" />
            <MiniCard title="Net" value={totals?.netCalories ?? 0} unit="kcal" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <MiniCard title="Water" value={totals?.waterMl ?? 0} unit="ml" />
            <MiniCard title="Steps" value={totals?.steps ?? 0} unit="steps" />
            <MiniCard title="Sleep" value={totals?.sleepMinutes ?? 0} unit="min" />
          </div>
        </div>

        {/* Quick Add */}
        <div style={{ marginTop: 12, background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
          <div style={{ fontWeight: 900 }}>QUICK ADD</div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => setQaWaterOpen(true)}>+ Water</button>
            <button onClick={() => setQaStepsOpen(true)}>+ Steps</button>
            <button onClick={() => setQaSleepOpen(true)}>+ Sleep</button>
          </div>
        </div>

        {/* Meals */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Meals</div>
            <button style={styles.smallBtn} onClick={() => nav("/foods")}>
              + Add meal
            </button>
          </div>

          <div style={styles.mealGrid}>
            <MealGroupCard
              title="Breakfast"
              items={mealGroups.breakfast}
              onOpen={() => {
                setMealPopupType("breakfast");
                setMealPopupOpen(true);
              }}
            />
            <MealGroupCard
              title="Lunch"
              items={mealGroups.lunch}
              onOpen={() => {
                setMealPopupType("lunch");
                setMealPopupOpen(true);
              }}
            />
            <MealGroupCard
              title="Dinner"
              items={mealGroups.dinner}
              onOpen={() => {
                setMealPopupType("dinner");
                setMealPopupOpen(true);
              }}
            />
            <MealGroupCard
              title="Snack"
              items={mealGroups.snack}
              onOpen={() => {
                setMealPopupType("snack");
                setMealPopupOpen(true);
              }}
            />
          </div>

          <MealLogsModal
            open={mealPopupOpen}
            title={
              mealPopupType === "breakfast"
                ? "Breakfast"
                : mealPopupType === "lunch"
                ? "Lunch"
                : mealPopupType === "dinner"
                ? "Dinner"
                : "Snack"
            }
            items={mealGroups[mealPopupType]}
            onClose={() => setMealPopupOpen(false)}
            onDelete={async (id) => {
              await deleteMealLog(id);
              await refreshMealsOnly();
              window.dispatchEvent(new CustomEvent("lockin:refresh"));
            }}
          />
        </div>

        {/* Cardio */}
        <Section
          title="Cardiovascular"
          totalKcal={cardio?.totalCalories ?? 0}
          rows={cardio?.items ?? []}
          onAdd={() => {
            setAddCategory("Cardiovascular");
            setAddOpen(true);
          }}
        />

        {/* Strength */}
        <Section
          title="Strength Training"
          totalKcal={strength?.totalCalories ?? 0}
          rows={strength?.items ?? []}
          onAdd={() => {
            setAddCategory("Strength Training");
            setAddOpen(true);
          }}
        />

        {loading ? <div style={{ marginTop: 10, color: "#666" }}>Loading…</div> : null}
      </div>

      {/* RIGHT */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>USER PROFILE</div>
          <button
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
            title="Edit"
            onClick={() => nav("/profile")}
          >
            ✎
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, marginTop: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <Line label="Name" value={profile?.name ?? "-"} unit="" />
            <Line label="Sex" value={profile?.sex ?? "-"} unit="" />
            <Line label="Height" value={profile?.heightCm ?? 0} unit="cm" />
            <Line label="Weight" value={profile?.weightKg ?? 0} unit="kg" />
            <Line label="Age" value={profile?.age ?? 0} unit="year" />
          </div>

          {/* ✅ AVATAR CIRCLE */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              background: "#ddd",
              justifySelf: "end",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #eee",
            }}
          >
            {profile?.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ fontWeight: 900, fontSize: 40, color: "#555" }}>
                {(profile?.name || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #eee" }} />

        <div style={{ fontWeight: 900 }}>BODY MEASUREMENTS</div>
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <Line label="Neck" value={(profile?.measurements as any)?.neckCm ?? 0} unit="cm" />
          <Line label="Bust" value={(profile?.measurements as any)?.bustCm ?? 0} unit="cm" />
          <Line label="Waist" value={(profile?.measurements as any)?.waistCm ?? 0} unit="cm" />
          <Line label="Upper Arm" value={(profile?.measurements as any)?.upperArmCm ?? 0} unit="cm" />
          <Line label="Thigh" value={(profile?.measurements as any)?.thighCm ?? 0} unit="cm" />
        </div>

        <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #eee" }} />

        <div style={{ fontWeight: 900 }}>GOAL</div>
        <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
          <Line label="Target weight" value={profile?.goal?.targetWeightKg ?? 0} unit="kg" />
        </div>

        <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #eee" }} />

        <div style={{ fontWeight: 900 }}>BMR (Basal Metabolic Rate)</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Minimum energy your body needs to survive</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontWeight: 900 }}>{metrics?.bmr ?? 0}</div>
          <div style={{ color: "#666" }}>kcal</div>
        </div>

        <div style={{ marginTop: 14, fontWeight: 900 }}>TDEE (Total Daily Energy Expenditure)</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>BMR + calories burned from everyday activities</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontWeight: 900 }}>{metrics?.tdee ?? 0}</div>
          <div style={{ color: "#666" }}>kcal</div>
        </div>

        <div style={{ marginTop: 14, fontWeight: 900 }}>BMI (Body Mass Index)</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
          Simple number used to estimate whether your weight is healthy
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontWeight: 900 }}>{metrics?.bmi ?? 0}</div>
          <div style={{ color: "#666" }}>—</div>
        </div>
      </div>

      <AddWorkoutModal open={addOpen} dateKey={dateKey} category={addCategory} onClose={() => setAddOpen(false)} />

      {/* Quick Add Modals */}
      <QuickAddWaterModal
        open={qaWaterOpen}
        dateKey={dateKey}
        onClose={() => setQaWaterOpen(false)}
        onSaved={() => {
          setQaWaterOpen(false);
          window.dispatchEvent(new CustomEvent("lockin:refresh"));
        }}
      />
      <QuickAddStepsModal
        open={qaStepsOpen}
        dateKey={dateKey}
        onClose={() => setQaStepsOpen(false)}
        onSaved={() => {
          setQaStepsOpen(false);
          window.dispatchEvent(new CustomEvent("lockin:refresh"));
        }}
      />
      <QuickAddSleepModal
        open={qaSleepOpen}
        dateKey={dateKey}
        onClose={() => setQaSleepOpen(false)}
        onSaved={() => {
          setQaSleepOpen(false);
          window.dispatchEvent(new CustomEvent("lockin:refresh"));
        }}
      />
    </div>
  );
}

function MealGroupCard(props: { title: string; items: MealLog[]; onOpen: () => void }) {
  const { title, items, onOpen } = props;
  const total = items.reduce((s, x) => s + (Number(x.calories) || 0), 0);

  return (
    <button onClick={onOpen} style={styles.mealCardBtn} title="Click to view details">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ fontWeight: 900 }}>{total} kcal</div>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
        {items.length} item{items.length === 1 ? "" : "s"} • Click to view
      </div>
    </button>
  );
}

function MealLogsModal(props: {
  open: boolean;
  title: string;
  items: MealLog[];
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const { open, title, items, onClose, onDelete } = props;
  if (!open) return null;

  const total = items.reduce((s, x) => s + (Number(x.calories) || 0), 0);

  return (
    <div style={styles.modalOverlay} onMouseDown={onClose}>
      <div style={styles.modalCard} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              {items.length} item(s) • {total} kcal
            </div>
          </div>

          <button style={styles.modalCloseBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 8, maxHeight: 420, overflow: "auto" }}>
          {items.length === 0 ? (
            <div style={{ color: "#999", padding: 8 }}>No meals yet.</div>
          ) : (
            items.map((it) => (
              <div key={it.id} style={styles.modalRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.foodName}
                    {it.brand ? <span style={{ color: "#777", fontWeight: 700 }}> • {it.brand}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {it.grams}g • P {it.protein} • C {it.carb} • F {it.fat}
                  </div>
                </div>

                <div style={{ width: 90, textAlign: "right", fontWeight: 900 }}>{it.calories} kcal</div>

                <button
                  style={styles.deleteBtn}
                  onClick={async () => {
                    const ok = window.confirm(`Delete "${it.foodName}" log?`);
                    if (!ok) return;
                    await onDelete(it.id);
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>{value}</div>
        <div style={{ color: "#666" }}>{unit}</div>
      </div>
    </div>
  );
}

function Section(props: {
  title: string;
  totalKcal: number;
  rows: Array<{ id: number; title: string; minutes: number; caloriesBurned: number }>;
  onAdd: () => void;
}) {
  const { title, totalKcal, rows, onAdd } = props;
  return (
    <div style={{ marginTop: 14, background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ color: "#666" }}>{totalKcal} kcal</div>
      </div>

      <button style={{ marginTop: 10 }} onClick={onAdd}>
        Add Exercise
      </button>

      <div style={{ marginTop: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 140px", fontSize: 12, color: "#666", padding: "0 6px" }}>
          <div> </div>
          <div style={{ textAlign: "center" }}>Minutes</div>
          <div style={{ textAlign: "center" }}>Calories burned</div>
        </div>

        <div style={{ borderTop: "1px solid #eee", marginTop: 8 }} />

        {rows.length === 0 ? (
          <div style={{ color: "#999", padding: 10 }}>No exercises yet.</div>
        ) : (
          rows.map((r) => (
            <div
              key={`${r.id}-${r.title}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 140px",
                padding: "10px 6px",
                borderBottom: "1px solid #f3f3f3",
              }}
            >
              <div style={{ fontWeight: 700 }}>{r.title}</div>
              <div style={{ textAlign: "center" }}>{r.minutes}</div>
              <div style={{ textAlign: "center" }}>{r.caloriesBurned}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Line({ label, value, unit }: { label: string; value: any; unit: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "baseline" }}>
      <div style={{ color: "#333" }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#666" }}>{unit}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    marginTop: 14,
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 14,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  mealGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  mealCardBtn: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #eee",
    borderRadius: 12,
    background: "#fafafa",
    padding: 12,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 999,
  },
  modalCard: {
    width: 640,
    maxWidth: "92vw",
    background: "#fff",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #eee",
    boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
  },
  modalCloseBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    width: 38,
    height: 38,
    cursor: "pointer",
    fontWeight: 900,
  },
  modalRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 10,
    background: "#fafafa",
  },

  deleteBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #d33",
    background: "#fff",
    color: "#d33",
    fontWeight: 900,
    cursor: "pointer",
  },
};
