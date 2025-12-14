import React, { useMemo, useState } from "react";
import { createMealLog, type MealType } from "../../services/mealLogService";
import type { Food } from "../../services/foodService";

export function AddMealModal(props: {
  open: boolean;
  dateKey: string;
  food: Food | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { open, dateKey, food, onClose, onSaved } = props;

  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [grams, setGrams] = useState<number>(food?.servingSizeG ?? 100);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  React.useEffect(() => {
    if (open) {
      setErr("");
      setMealType("breakfast");
      setGrams(food?.servingSizeG ?? 100);
    }
  }, [open, food]);

  const preview = useMemo(() => {
    if (!food) return null;
    const factor = grams / 100;
    return {
      calories: Math.round((food.caloriesPer100g ?? 0) * factor),
      protein: Math.round(((food.proteinPer100g ?? 0) * factor) * 10) / 10,
      carb: Math.round(((food.carbPer100g ?? 0) * factor) * 10) / 10,
      fat: Math.round(((food.fatPer100g ?? 0) * factor) * 10) / 10,
    };
  }, [food, grams]);

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Add Meal</h3>
          <button onClick={onClose} disabled={saving}>✕</button>
        </div>

        {!food ? <div style={{ marginTop: 10, color: "#999" }}>No food selected.</div> : null}
        {err ? <div style={{ marginTop: 10, color: "#b00020", fontSize: 12, fontWeight: 800 }}>{err}</div> : null}

        {food ? (
          <>
            <div style={{ marginTop: 12, fontWeight: 900 }}>{food.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {food.caloriesPer100g} kcal/100g • P {food.proteinPer100g} • C {food.carbPer100g} • F {food.fatPer100g}
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label}>Meal type</div>
              <select style={inp} value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label}>Grams</div>
              <input style={inp} type="number" min={1} value={grams} onChange={(e) => setGrams(Number(e.target.value))} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[food.servingSizeG, 50, 100, 150, 200].filter(Boolean).map((x) => (
                  <button key={x} onClick={() => setGrams(Number(x))}>{x}g</button>
                ))}
              </div>
            </div>

            <div style={previewBox}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Preview</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{preview?.calories ?? 0} kcal</span>
                <span>P {preview?.protein ?? 0} • C {preview?.carb ?? 0} • F {preview?.fat ?? 0}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button onClick={onClose} disabled={saving}>Cancel</button>
              <button
                disabled={saving}
                style={primaryBtn}
                onClick={async () => {
                  setErr("");
                  if (!food) return;
                  if (!grams || grams <= 0) return setErr("grams must be > 0");

                  setSaving(true);
                  try {
                    await createMealLog({
                      dateKey,
                      mealType,
                      foodId: food.id,
                      grams,
                    });
                    onSaved();
                  } catch (e: any) {
                    setErr(e?.message ?? "Failed to create meal");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "grid", placeItems: "center", zIndex: 80 };
const card: React.CSSProperties = { width: 520, background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #eee", boxShadow: "0 18px 40px rgba(0,0,0,0.18)" };
const label: React.CSSProperties = { fontSize: 12, color: "#444", fontWeight: 700, marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10, background: "#fff" };
const previewBox: React.CSSProperties = { marginTop: 12, border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" };
const primaryBtn: React.CSSProperties = { background: "#1f7ae0", color: "#fff", border: "1px solid #1f7ae0", padding: "10px 14px", borderRadius: 10, fontWeight: 900 };
