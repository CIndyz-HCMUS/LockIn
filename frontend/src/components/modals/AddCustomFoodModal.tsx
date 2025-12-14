import React, { useMemo, useState } from "react";
import { createFood, type Food } from "../../services/foodService";

/**
 * Giải thích:
 * - User nhập theo "per serving" (dễ nhập) + servingSizeG
 * - Ta convert ra per100g để backend lưu chuẩn.
 */
function toPer100g(perServing: number, servingSizeG: number) {
  if (servingSizeG <= 0) return 0;
  return Math.round((perServing / servingSizeG) * 100 * 10) / 10;
}

export function AddCustomFoodModal(props: {
  open: boolean;
  onClose: () => void;
  onCreated: (food: Food) => void;
}) {
  const { open, onClose, onCreated } = props;

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [servingSizeG, setServingSizeG] = useState<number>(100);
  const [servingLabel, setServingLabel] = useState<string>("1 serving (100g)");

  // nhập theo serving
  const [calServing, setCalServing] = useState<number>(0);
  const [pServing, setPServing] = useState<number>(0);
  const [cServing, setCServing] = useState<number>(0);
  const [fServing, setFServing] = useState<number>(0);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  const previewPer100 = useMemo(() => {
    return {
      cal: toPer100g(calServing, servingSizeG),
      p: toPer100g(pServing, servingSizeG),
      c: toPer100g(cServing, servingSizeG),
      f: toPer100g(fServing, servingSizeG),
    };
  }, [calServing, pServing, cServing, fServing, servingSizeG]);

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Add Custom Food</h3>
          <button onClick={onClose} disabled={saving}>✕</button>
        </div>

        {err ? <div style={{ color: "#d00000", marginTop: 10, fontSize: 12 }}>{err}</div> : null}

        <div style={{ marginTop: 12 }}>
          <div style={label}>Food name</div>
          <input style={inp} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Oatmeal" />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={label}>Brand (optional)</div>
          <input style={inp} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Quaker" />
        </div>

        <div style={row2}>
          <div>
            <div style={label}>Serving size</div>
            <div style={unitWrap}>
              <input style={unitInp} type="number" min={1} value={servingSizeG} onChange={(e) => {
                const g = Number(e.target.value);
                setServingSizeG(g);
                setServingLabel(`1 serving (${g}g)`);
              }} />
              <div style={unit}>g</div>
            </div>
          </div>

          <div>
            <div style={label}>Serving label</div>
            <input style={inp} value={servingLabel} onChange={(e) => setServingLabel(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12, fontWeight: 900 }}>Nutrition per serving</div>

        <div style={row2}>
          <div>
            <div style={label}>Calories</div>
            <input style={inp} type="number" min={0} value={calServing} onChange={(e) => setCalServing(Number(e.target.value))} />
          </div>
          <div>
            <div style={label}>Protein (g)</div>
            <input style={inp} type="number" min={0} value={pServing} onChange={(e) => setPServing(Number(e.target.value))} />
          </div>
          <div>
            <div style={label}>Carb (g)</div>
            <input style={inp} type="number" min={0} value={cServing} onChange={(e) => setCServing(Number(e.target.value))} />
          </div>
          <div>
            <div style={label}>Fat (g)</div>
            <input style={inp} type="number" min={0} value={fServing} onChange={(e) => setFServing(Number(e.target.value))} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={label}>Image URL (optional)</div>
          <input style={inp} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div style={previewBox}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Stored as per 100g (preview)</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{previewPer100.cal} kcal / 100g</span>
            <span>P {previewPer100.p}g • C {previewPer100.c}g • F {previewPer100.f}g</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button
            disabled={saving}
            onClick={async () => {
              setErr("");
              const n = name.trim();
              if (!n) return setErr("Name is required");
              if (!Number.isFinite(servingSizeG) || servingSizeG <= 0) return setErr("Serving size must be > 0");

              setSaving(true);
              try {
                const created = await createFood({
                  name: n,
                  brand: brand.trim() ? brand.trim() : null,
                  servingSizeG,
                  servingLabel: servingLabel.trim() || `1 serving (${servingSizeG}g)`,
                  caloriesPer100g: previewPer100.cal,
                  proteinPer100g: previewPer100.p,
                  carbPer100g: previewPer100.c,
                  fatPer100g: previewPer100.f,
                  imagePrimaryUri: imageUrl.trim() ? imageUrl.trim() : null,
                  isVerified: false,
                });

                onCreated(created);
                onClose();
              } catch (e: any) {
                setErr(e?.message ?? "Failed to create food");
              } finally {
                setSaving(false);
              }
            }}
            style={{ background: "#1f7ae0", color: "#fff", border: "1px solid #1f7ae0", padding: "10px 14px", borderRadius: 10, fontWeight: 900 }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 70,
};
const card: React.CSSProperties = {
  width: 560,
  background: "#fff",
  borderRadius: 14,
  padding: 16,
  border: "1px solid #eee",
  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
};
const label: React.CSSProperties = { fontSize: 12, color: "#444", fontWeight: 700, marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 10 };
const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 };
const unitWrap: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 58px", border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" };
const unitInp: React.CSSProperties = { border: "none", padding: 10, outline: "none" };
const unit: React.CSSProperties = { display: "grid", placeItems: "center", borderLeft: "1px solid #ddd", background: "#fafafa", fontWeight: 800, color: "#555" };
const previewBox: React.CSSProperties = { marginTop: 12, border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fafafa" };
