// frontend/src/pages/Report/ReportPage.tsx
import React, { useEffect, useState } from "react";
import { getJson } from "../../services/http";
import { todayKey } from "../../utils/date";

type ReportDto = {
  date: string;
  totals: {
    caloriesIn: number;
    caloriesOut: number;
    netCalories: number;
    waterMl: number;
    steps: number;
    sleepMinutes: number;
    totalCaloriesBurned: number;
  };
  metrics: { bmr: number; tdee: number; bmi: number | null };
  goals: { calories: number; waterMl: number; steps: number; sleepMinutes: number };
};

export function ReportPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [data, setData] = useState<ReportDto | null>(null);

  async function load() {
    const r = await getJson<ReportDto>(`/stats/today?date=${dateKey}`);
    setData(r);
  }

  useEffect(() => {
    load();
    // refresh when logs updated anywhere
    const fn = () => load();
    window.addEventListener("lockin:refresh", fn as any);
    return () => window.removeEventListener("lockin:refresh", fn as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1>Report</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ color: "#666" }}>Date</div>
        <input type="date" value={dateKey} onChange={(e) => setDateKey(e.target.value)} />
        <button onClick={load}>Refresh</button>
      </div>

      {!data ? (
        <div style={{ marginTop: 12 }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <Card title="Calories In" value={data.totals.caloriesIn} unit="kcal" />
            <Card title="Calories Out" value={data.totals.caloriesOut} unit="kcal" />
            <Card title="Net" value={data.totals.netCalories} unit="kcal" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <Card title="Water" value={data.totals.waterMl} unit="ml" />
            <Card title="Steps" value={data.totals.steps} unit="steps" />
            <Card title="Sleep" value={data.totals.sleepMinutes} unit="min" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 }}>
            <Card title="BMR" value={data.metrics.bmr} unit="kcal" />
            <Card title="TDEE" value={data.metrics.tdee} unit="kcal" />
            <Card title="BMI" value={data.metrics.bmi ?? 0} unit="" />
          </div>

          <div style={{ marginTop: 12, color: "#666" }}>
            Goals: Calories {data.goals.calories} • Water {data.goals.waterMl}ml • Steps {data.goals.steps} • Sleep{" "}
            {data.goals.sleepMinutes}min
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value, unit }: { title: string; value: number; unit: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{value}</div>
        <div style={{ color: "#666" }}>{unit}</div>
      </div>
    </div>
  );
}
