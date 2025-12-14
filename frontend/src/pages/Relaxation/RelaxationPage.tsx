// frontend/src/pages/Relaxation/RelaxationPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { todayKey } from "../../utils/date";
import { getProfile } from "../../services/profileService";
import { searchRelaxations, type RelaxationActivity, type RelaxationCategory } from "../../services/relaxationService";
import { createRelaxationLog, deleteRelaxationLog, listRelaxationLogs, type RelaxationLog } from "../../services/relaxationLogService";
import { StartRelaxationModal } from "../../components/modals/StartRelaxationModal";

const CATEGORIES: Array<"all" | RelaxationCategory> = ["all", "Breathing", "Stretching", "Mindfulness", "Recovery", "Other"];

export function RelaxationPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<"all" | RelaxationCategory>("all");

  const [goalMinutes, setGoalMinutes] = useState(10);

  const [items, setItems] = useState<RelaxationActivity[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [logs, setLogs] = useState<RelaxationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<RelaxationActivity | null>(null);

  async function reloadAll() {
    setLoading(true);
    setErr(null);
    try {
      const [profile, catalog, logRes] = await Promise.all([
        getProfile(),
        searchRelaxations({ q, category: category === "all" ? "" : category, limit: 50, offset: 0 }),
        listRelaxationLogs(dateKey),
      ]);

      setGoalMinutes(Number(profile.goals?.relaxMinutes ?? 10));
      setItems(catalog.items);
      setTotalItems(catalog.total);
      setLogs(logRes.items);
    } catch (e: any) {
      setErr(e?.message || "Failed to load relaxation data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  // Search/filter: reload when user clicks Search (đỡ spam request)
  async function onSearch() {
    setLoading(true);
    setErr(null);
    try {
      const catalog = await searchRelaxations({ q, category: category === "all" ? "" : category, limit: 50, offset: 0 });
      setItems(catalog.items);
      setTotalItems(catalog.total);
    } catch (e: any) {
      setErr(e?.message || "Failed to search relaxations");
    } finally {
      setLoading(false);
    }
  }

  const totalMinutes = useMemo(() => logs.reduce((s, x) => s + (Number(x.minutes) || 0), 0), [logs]);
  const progressPct = useMemo(() => {
    const g = Math.max(1, Number(goalMinutes) || 10);
    return Math.min(100, Math.round((totalMinutes / g) * 100));
  }, [totalMinutes, goalMinutes]);

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Relaxation</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#666" }}>Date</div>
          <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 12, background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14 }}>Today</div>
            <div style={{ color: "#666", marginTop: 4 }}>
              {totalMinutes} / {goalMinutes} minutes
            </div>
          </div>

          <div style={{ minWidth: 220, flex: 1 }}>
            <div style={{ height: 10, background: "#f0f0f0", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "#111" }} />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{progressPct}%</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 160px 120px", gap: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (box breathing, mindfulness...)"
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </select>

        <button
          onClick={onSearch}
          disabled={loading}
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {err ? <div style={{ marginTop: 10, color: "#d00000", fontSize: 12 }}>{err}</div> : null}

      <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <div style={{ fontWeight: 900 }}>Activities ({totalItems})</div>

        {items.map((x) => (
          <div key={x.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 900 }}>{x.title}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{x.category}</div>
              </div>

              <button
                onClick={() => {
                  setActive(x);
                  setOpen(true);
                }}
                style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #111", background: "#fff", cursor: "pointer", fontWeight: 800 }}
              >
                Start
              </button>
            </div>

            <div style={{ color: "#666", marginTop: 8 }}>{x.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Logs ({logs.length})</div>

        {logs.length === 0 ? (
          <div style={{ color: "#666" }}>No relaxation logs for this day.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 12, display: "flex", gap: 12, justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 900 }}>
                  {l.activityTitle} • {l.minutes} min
                </div>
                <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                  {l.moodBefore ? `Mood before: ${l.moodBefore}` : ""}
                  {l.moodBefore && l.moodAfter ? " · " : ""}
                  {l.moodAfter ? `Mood after: ${l.moodAfter}` : ""}
                </div>
                {l.note ? <div style={{ color: "#444", fontSize: 12, marginTop: 6 }}>{l.note}</div> : null}
              </div>

              <button
                onClick={async () => {
                  await deleteRelaxationLog(l.id);
                  const next = await listRelaxationLogs(dateKey);
                  setLogs(next.items);
                }}
                style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <StartRelaxationModal
        open={open}
        activity={active}
        onClose={() => setOpen(false)}
        onSave={async (payload) => {
          if (!active) return;
          await createRelaxationLog({
            ...payload,
            activityId: active.id,
            activityTitle: active.title,
          });
          const next = await listRelaxationLogs(payload.dateKey);
          setLogs(next.items);
        }}
      />
    </div>
  );
}
