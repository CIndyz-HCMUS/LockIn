import React, { useMemo, useState } from "react";
import { todayKey } from "../../utils/date";
import { addWater } from "../../services/waterLogService";
import { setSteps } from "../../services/stepsLogService";
import { addSleep } from "../../services/sleepLogService";

export function QuickAddModal(props: { open: boolean; onClose: () => void }) {
  const { open, onClose } = props;
  const [tab, setTab] = useState<"water" | "steps" | "sleep">("water");
  const [dateKey, setDateKey] = useState(todayKey());
  const [saving, setSaving] = useState(false);

  // water
  const [waterMl, setWaterMl] = useState(250);

  // steps
  const [steps, setStepsValue] = useState(8000);

  // sleep
  const [sleepStart, setSleepStart] = useState(`${dateKey}T23:00`);
  const [sleepEnd, setSleepEnd] = useState(`${dateKey}T07:00`);
  const [quality, setQuality] = useState(3);

  // keep sleep default aligned with date
  React.useEffect(() => {
    setSleepStart(`${dateKey}T23:00`);
    // end next morning (demo): still ISO valid even same date; user can edit
    setSleepEnd(`${dateKey}T07:00`);
  }, [dateKey]);

  const canSave = useMemo(() => {
    if (tab === "water") return waterMl > 0;
    if (tab === "steps") return steps >= 0;
    // sleep
    return Boolean(sleepStart) && Boolean(sleepEnd);
  }, [tab, waterMl, steps, sleepStart, sleepEnd]);

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Quick Add</h3>
          <button onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <TabBtn active={tab === "water"} onClick={() => setTab("water")}>Water</TabBtn>
          <TabBtn active={tab === "steps"} onClick={() => setTab("steps")}>Steps</TabBtn>
          <TabBtn active={tab === "sleep"} onClick={() => setTab("sleep")}>Sleep</TabBtn>
          <div style={{ marginLeft: "auto" }}>
            <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
          </div>
        </div>

        {/* WATER */}
        {tab === "water" ? (
          <div style={{ marginTop: 12 }}>
            <div style={label}>Amount (ml)</div>
            <input style={inp} type="number" min={1} value={waterMl} onChange={(e) => setWaterMl(Number(e.target.value))} />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[150, 250, 330, 500].map((x) => (
                <button key={x} onClick={() => setWaterMl(x)}>{x}ml</button>
              ))}
            </div>
          </div>
        ) : null}

        {/* STEPS */}
        {tab === "steps" ? (
          <div style={{ marginTop: 12 }}>
            <div style={label}>Steps (set today total)</div>
            <input style={inp} type="number" min={0} value={steps} onChange={(e) => setStepsValue(Number(e.target.value))} />
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              This overwrites today’s step count (1 record/day).
            </div>
          </div>
        ) : null}

        {/* SLEEP */}
        {tab === "sleep" ? (
          <div style={{ marginTop: 12 }}>
            <div style={label}>Sleep start</div>
            <input style={inp} type="datetime-local" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />

            <div style={{ ...label, marginTop: 10 }}>Sleep end</div>
            <input style={inp} type="datetime-local" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />

            <div style={{ ...label, marginTop: 10 }}>Quality (1..5)</div>
            <input style={inp} type="number" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} />
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onClose} disabled={saving}>Cancel</button>
          <button
            disabled={!canSave || saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (tab === "water") {
                  await addWater(dateKey, Number(waterMl));
                } else if (tab === "steps") {
                  await setSteps(dateKey, Number(steps));
                } else {
                  // datetime-local returns "YYYY-MM-DDTHH:mm" => convert to ISO with seconds
                  const startIso = `${sleepStart}:00`;
                  const endIso = `${sleepEnd}:00`;
                  await addSleep(startIso, endIso, Number(quality));
                }

                window.dispatchEvent(new CustomEvent("lockin:refresh"));
                onClose();
              } finally {
                setSaving(false);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function TabBtn(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: props.active ? "#111" : "#fff",
        color: props.active ? "#fff" : "#111",
        cursor: "pointer",
      }}
    >
      {props.children}
    </button>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 60,
};

const card: React.CSSProperties = {
  width: 520,
  background: "#fff",
  borderRadius: 14,
  padding: 16,
  border: "1px solid #eee",
  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
};

const label: React.CSSProperties = { fontSize: 12, color: "#444", fontWeight: 700, marginBottom: 6 };

const inp: React.CSSProperties = {
  width: "100%",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 10,
};
