import React, { useMemo, useState } from "react";
import type { RelaxationActivity } from "../../services/relaxationService";

type Payload = {
  dateKey: string;
  minutes: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
};

type Props = {
  open: boolean;
  dateKey: string;
  activity: RelaxationActivity | null;
  onClose: () => void;
  onSave: (payload: Payload) => Promise<void>;
};

export function StartRelaxationModal({ open, dateKey, activity, onClose, onSave }: Props) {
  const [minutes, setMinutes] = useState(10);
  const [moodBefore, setMoodBefore] = useState("");
  const [moodAfter, setMoodAfter] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const suggested = useMemo(() => activity?.suggestedMinutes ?? 10, [activity]);

  // reset when opened/activity changes
  React.useEffect(() => {
    if (!open) return;
    setMinutes(suggested);
    setMoodBefore("");
    setMoodAfter("");
    setNote("");
    setErr(null);
  }, [open, suggested]);

  if (!open) return null;

  async function handleSave() {
    setErr(null);
    if (!activity) {
      setErr("No activity selected");
      return;
    }
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setErr("Minutes must be > 0");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        dateKey,
        minutes,
        moodBefore: moodBefore.trim() ? moodBefore.trim() : undefined,
        moodAfter: moodAfter.trim() ? moodAfter.trim() : undefined,
        note: note.trim() ? note.trim() : undefined,
      });
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={styles.backdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.card} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Start relaxation</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              {activity ? (
                <>
                  <b>{activity.title}</b> • {activity.category}
                </>
              ) : (
                "No activity"
              )}
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Date</div>
          <input value={dateKey} readOnly style={styles.input} />

          <div style={{ fontSize: 12, color: "#666" }}>Minutes</div>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            style={styles.input}
          />

          <div style={{ fontSize: 12, color: "#666" }}>Mood before (optional)</div>
          <input value={moodBefore} onChange={(e) => setMoodBefore(e.target.value)} style={styles.input} />

          <div style={{ fontSize: 12, color: "#666" }}>Mood after (optional)</div>
          <input value={moodAfter} onChange={(e) => setMoodAfter(e.target.value)} style={styles.input} />

          <div style={{ fontSize: 12, color: "#666" }}>Note (optional)</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={styles.textarea} />

          {err ? <div style={{ color: "#b00020", fontSize: 12 }}>{err}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button style={styles.btnOutline} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button style={styles.btn} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 16,
  },
  card: {
    width: 560,
    maxWidth: "95vw",
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #eee",
    padding: 14,
  },
  closeBtn: {
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: 10,
    width: 38,
    height: 38,
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
  textarea: {
    width: "100%",
    minHeight: 90,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnOutline: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },
};
