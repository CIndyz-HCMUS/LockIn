import React, { useEffect, useMemo, useState } from "react";
import { searchExercises, deleteExercise, type Exercise } from "../../services/exerciseService";
import { createWorkoutLog } from "../../services/workoutLogService";
import { CreateExerciseModal } from "./CreateExerciseModal";

type Props = {
  open: boolean;
  dateKey: string; // YYYY-MM-DD
  category: string;
  onClose: () => void;
};

function labelOf(x: Exercise) {
  return String((x as any).title ?? (x as any).name ?? "").trim();
}
function norm(s: any) {
  return String(s ?? "").trim().toLowerCase();
}
function sameCategory(a: string, b: string) {
  return norm(a) === norm(b);
}
function kcalFromMet(met: number | undefined, weightKg: number, minutes: number) {
  const m = Number.isFinite(met as number) ? (met as number) : 4;
  const w = Number.isFinite(weightKg) ? weightKg : 60;
  const mins = Number.isFinite(minutes) ? minutes : 0;
  return Math.round((m * 3.5 * w * mins) / 200);
}

export function AddWorkoutModal({ open, dateKey, category, onClose }: Props) {
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [minutes, setMinutes] = useState<number>(10);

  const [allItems, setAllItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [weightKg] = useState<number>(60);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSelectedId("");
    setMinutes(10);
    setErr(null);
  }, [open]);

  async function loadFromServer() {
    setLoading(true);
    setErr(null);
    try {
      const res = await searchExercises({ query: "", limit: 500, offset: 0 });
      const arr = Array.isArray(res?.items) ? res.items : [];
      setAllItems(arr);

      if (selectedId && !arr.some((x) => x.id === selectedId)) setSelectedId("");
    } catch (e: any) {
      console.error(e);
      setAllItems([]);
      setErr(e?.message ?? "Failed to load exercises");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const filteredItems = useMemo(() => {
    const qq = norm(q);
    const byCat = allItems.filter((x) => sameCategory((x as any).category, category));
    const base = byCat.length > 0 ? byCat : allItems;

    return base
      .filter((x) => (!qq ? true : labelOf(x).toLowerCase().includes(qq)))
      .sort((a, b) => labelOf(a).localeCompare(labelOf(b)));
  }, [allItems, q, category]);

  const selected = useMemo(
    () => filteredItems.find((x) => x.id === selectedId) ?? null,
    [filteredItems, selectedId]
  );

  const canDelete = Boolean(selected && (selected as any).isCustom);

  const estimatedKcal = useMemo(() => {
    if (!selected) return null;
    return kcalFromMet((selected as any).met, weightKg, minutes);
  }, [selected, weightKg, minutes]);

  if (!open) return null;

  async function onSave() {
    setErr(null);
    if (!selectedId) return setErr("Please choose an exercise");
    if (!Number.isFinite(minutes) || minutes <= 0) return setErr("Minutes must be > 0");

    setSaving(true);
    try {
      await (createWorkoutLog as any)({ dateKey, exerciseId: Number(selectedId), minutes });
      window.dispatchEvent(new CustomEvent("lockin:refresh"));
      onClose();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteCustom() {
    if (!selected || !canDelete) return;
    const ok = window.confirm(`Delete custom exercise "${labelOf(selected)}"?`);
    if (!ok) return;

    setDeleting(true);
    setErr(null);
    try {
      await deleteExercise(selected.id);
      await loadFromServer();
      setSelectedId("");
      setQ("");
    } catch (e: any) {
      console.error(e);
      setErr(e?.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        style={styles.overlay}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Add workout</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                Date: <b>{dateKey}</b> • Category: <b>{category}</b>
                {loading ? <span> • Loading…</span> : null}
              </div>
            </div>
            <button style={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {/* Search nằm lớp thấp */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search exercise..."
                style={styles.input}
              />
            </div>

            {/* Buttons cũng lớp thấp */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button style={styles.btnOutline} onClick={() => setOpenCreate(true)} disabled={saving || deleting}>
                + Add new exercise
              </button>

              <button
                style={{
                  ...styles.btnOutline,
                  borderColor: canDelete ? "#d32f2f" : "#ddd",
                  color: canDelete ? "#d32f2f" : "#999",
                  cursor: canDelete ? "pointer" : "not-allowed",
                }}
                onClick={onDeleteCustom}
                disabled={!canDelete || saving || deleting}
              >
                {deleting ? "Deleting..." : "Delete custom"}
              </button>

              <div style={{ fontSize: 12, color: "#666" }}>
                Showing <b>{filteredItems.length}</b> item(s)
              </div>
            </div>

            {/* ✅ Select ở lớp cao hơn để popup nổi lên trên search */}
            <div style={{ position: "relative", zIndex: 50 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Exercise</div>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
                style={styles.input}
              >
                <option value="">-- Choose exercise --</option>
                {filteredItems.map((x: any) => (
                  <option key={x.id} value={x.id}>
                    {labelOf(x) || "(no name)"} • MET {x.met ?? "-"} {x.isCustom ? "• (custom)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selected ? (
              <div style={{ fontSize: 12, color: "#666" }}>
                Selected: <b>{labelOf(selected)}</b>
                {estimatedKcal != null ? (
                  <>
                    {" "}
                    • Estimated: <b>{estimatedKcal} kcal</b>
                  </>
                ) : null}
              </div>
            ) : null}

            <div style={{ fontSize: 12, color: "#666" }}>Minutes</div>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              style={styles.input}
            />

            {err ? <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button style={styles.btnOutline} onClick={onClose} disabled={saving || deleting}>
                Cancel
              </button>
              <button style={styles.btn} onClick={onSave} disabled={saving || deleting}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateExerciseModal
        open={openCreate}
        defaultCategory={category}
        onClose={() => setOpenCreate(false)}
        onCreated={(ex) => {
          setAllItems((prev) => [ex, ...prev]);
          setSelectedId(ex.id);
          setQ("");
        }}
      />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 16,
  },
  // ✅ thêm position/zIndex để tránh stacking-context lạ
  card: {
    position: "relative",
    zIndex: 1,
    width: 820,
    maxWidth: "96vw",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eee",
    padding: 16,
  },
  closeBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    width: 40,
    height: 40,
    cursor: "pointer",
    fontWeight: 900,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnOutline: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
