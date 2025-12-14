import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RelaxationActivity } from "../../services/relaxationService";
import { todayKey } from "../../utils/date";

type Props = {
  open: boolean;
  activity: RelaxationActivity | null;
  onClose: () => void;
  onSave: (payload: {
    dateKey: string;
    minutes: number;
    moodBefore?: string;
    moodAfter?: string;
    note?: string;
  }) => Promise<void> | void;
};

export function StartRelaxationModal({ open, activity, onClose, onSave }: Props) {
  const [mode, setMode] = useState<"timer" | "manual">("timer");
  const [dateKey, setDateKey] = useState(todayKey());

  const [moodBefore, setMoodBefore] = useState("");
  const [moodAfter, setMoodAfter] = useState("");
  const [note, setNote] = useState("");

  const [manualMinutes, setManualMinutes] = useState<number>(activity?.suggestedMinutes ?? 5);

  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const [saving, setSaving] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    setMode("timer");
    setDateKey(todayKey());
    setMoodBefore("");
    setMoodAfter("");
    setNote("");

    setManualMinutes(activity?.suggestedMinutes ?? 5);
    setRunning(false);
    setSeconds(0);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [open, activity]);

  useEffect(() => {
    if (!open) return;
    if (!running) {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [open, running]);

  const timerMinutes = useMemo(() => Math.max(0, Math.round(seconds / 60)), [seconds]);

  if (!open || !activity) return null;

  async function handleSave() {
    const minutes = mode === "manual" ? Number(manualMinutes) : timerMinutes;

    if (!Number.isFinite(minutes) || minutes <= 0) {
      alert("Minutes must be > 0");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        dateKey,
        minutes,
        moodBefore: moodBefore.trim() || undefined,
        moodAfter: moodAfter.trim() || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{activity.title}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{activity.category}</div>
          </div>
          <button style={styles.xBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button
            style={{ ...styles.tab, background: mode === "timer" ? "#111" : "#fff", color: mode === "timer" ? "#fff" : "#111" }}
            onClick={() => setMode("timer")}
          >
            Timer
          </button>
          <button
            style={{ ...styles.tab, background: mode === "manual" ? "#111" : "#fff", color: mode === "manual" ? "#fff" : "#111" }}
            onClick={() => setMode("manual")}
          >
            Manual
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={styles.label}>Date</div>
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={styles.input} />
        </div>

        {mode === "timer" ? (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
            <div style={{ fontWeight: 900, fontSize: 26 }}>
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
            </div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Recorded minutes: {timerMinutes}</div>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                style={{ ...styles.btn, background: running ? "#fff" : "#111", color: running ? "#111" : "#fff" }}
                onClick={() => setRunning((r) => !r)}
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                style={{ ...styles.btn, background: "#fff", color: "#111" }}
                onClick={() => {
                  setRunning(false);
                  setSeconds(0);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={styles.label}>Minutes</div>
            <input
              type="number"
              min={1}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(Number(e.target.value))}
              style={styles.input}
            />
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <div style={styles.label}>Mood before</div>
          <input value={moodBefore} onChange={(e) => setMoodBefore(e.target.value)} style={styles.input} placeholder="e.g. stressed, tired" />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={styles.label}>Mood after</div>
          <input value={moodAfter} onChange={(e) => setMoodAfter(e.target.value)} style={styles.input} placeholder="e.g. calm, focused" />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={styles.label}>Note</div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} style={{ ...styles.input, height: 80 }} placeholder="optional" />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={{ ...styles.btn, background: "#fff", color: "#111" }} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button style={{ ...styles.btn, background: "#111", color: "#fff", opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save log"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 99999,
  },
  card: {
    width: "min(560px, 100%)",
    background: "#fff",
    borderRadius: 16,
    padding: 14,
    border: "1px solid #eee",
  },
  xBtn: {
    border: "1px solid #eee",
    background: "#fff",
    borderRadius: 10,
    cursor: "pointer",
    width: 36,
    height: 36,
  },
  tab: {
    border: "1px solid #111",
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  label: { fontSize: 12, color: "#444", fontWeight: 800, marginBottom: 6 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #ddd",
    outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #111",
    cursor: "pointer",
    fontWeight: 800,
  },
};
