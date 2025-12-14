import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProfile } from "../../services/profileService";

type Sex = "F" | "M";
type Goal = "lose" | "maintain" | "gain";
type Activity = "sedentary" | "light" | "moderate" | "active";

type SignupState = { firstName?: string; lastName?: string; email?: string; age?: number };

function round1(x: number) {
  return Math.round(x * 10) / 10;
}
function bmi(weightKg: number, heightCm: number): number | null {
  const m = heightCm / 100;
  if (!m || !Number.isFinite(m)) return null;
  return round1(weightKg / (m * m));
}
function bmrMifflin(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "M" ? base + 5 : base - 161);
}
function activityFactor(level: Activity) {
  switch (level) {
    case "sedentary": return 1.2;
    case "light": return 1.375;
    case "active": return 1.725;
    case "moderate":
    default: return 1.55;
  }
}

export function OnBoardingPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const st = (loc.state ?? {}) as SignupState;

  const [name, setName] = useState(() => `${st.firstName ?? ""} ${st.lastName ?? ""}`.trim() || "Demo User");
  const [weightKg, setWeightKg] = useState<number>(60);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [sex, setSex] = useState<Sex>("F");
  const [age, setAge] = useState<number>(st.age ?? 20);

  const [goal, setGoal] = useState<Goal>("maintain");
  const [targetWeightKg, setTargetWeightKg] = useState<number>(55);
  const [activity, setActivity] = useState<Activity>("moderate");

  const [adjustKcal, setAdjustKcal] = useState<number>(300);
  const [saving, setSaving] = useState(false);

  const currentBmi = useMemo(() => bmi(weightKg, heightCm), [weightKg, heightCm]);
  const targetBmi = useMemo(() => bmi(targetWeightKg, heightCm), [targetWeightKg, heightCm]);

  const BMR = useMemo(() => bmrMifflin(sex, weightKg, heightCm, age), [sex, weightKg, heightCm, age]);
  const TDEE = useMemo(() => Math.round(BMR * activityFactor(activity)), [BMR, activity]);

  const targetCalories = useMemo(() => {
    const delta = Math.max(0, Number(adjustKcal) || 0);
    if (goal === "maintain") return TDEE;
    if (goal === "lose") return TDEE - delta;
    return TDEE + delta;
  }, [goal, TDEE, adjustKcal]);

  const caloriesBelowBmr = useMemo(() => targetCalories < BMR, [targetCalories, BMR]);

  const canContinue = useMemo(() => {
    return name.trim().length > 0 && weightKg > 0 && heightCm > 0 && age > 0 && targetWeightKg > 0;
  }, [name, weightKg, heightCm, age, targetWeightKg]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.h2}>Get Started</h2>

        <div style={styles.label}>How should we call you?</div>
        <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />

        <div style={styles.row2}>
          <div>
            <div style={styles.label}>Your weight?</div>
            <div style={styles.inputUnitWrap}>
              <input style={styles.inputUnit} type="number" min={1} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
              <div style={styles.unit}>kg</div>
            </div>
          </div>

          <div>
            <div style={styles.label}>Your height?</div>
            <div style={styles.inputUnitWrap}>
              <input style={styles.inputUnit} type="number" min={1} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
              <div style={styles.unit}>cm</div>
            </div>
          </div>
        </div>

        <div style={styles.row2}>
          <div>
            <div style={styles.label}>Your age?</div>
            <input style={styles.input} type="number" min={1} value={age} onChange={(e) => setAge(Number(e.target.value))} />
          </div>

          <div>
            <div style={styles.label}>Your gender?</div>
            <select style={styles.select} value={sex} onChange={(e) => setSex(e.target.value as Sex)}>
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
        </div>

        <div style={styles.label}>What is your goal?</div>
        <select style={styles.select} value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
          <option value="lose">Lose weight</option>
          <option value="maintain">Maintain</option>
          <option value="gain">Gain weight</option>
        </select>

        <div style={styles.row2}>
          <div>
            <div style={styles.label}>What is your target weight?</div>
            <div style={styles.inputUnitWrap}>
              <input style={styles.inputUnit} type="number" min={1} value={targetWeightKg} onChange={(e) => setTargetWeightKg(Number(e.target.value))} />
              <div style={styles.unit}>kg</div>
            </div>

            <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.35 }}>
              <div style={styles.muted}>Your current BMI is {currentBmi ?? "-"}</div>
              <div style={styles.muted}>Your target BMI is {targetBmi ?? "-"}</div>
            </div>
          </div>

          <div>
            <div style={styles.label}>What is your active level?</div>
            <select style={styles.select} value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
            </select>

            <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.35 }}>
              <div style={styles.muted}>Your BMR is {BMR}.</div>
              <div style={styles.muted}>Your TDEE is {TDEE}.</div>
            </div>
          </div>
        </div>

        <div style={styles.label}>How much calories a day do you want to adjust?</div>
        <div style={styles.row2}>
          <select style={styles.select} value={goal === "gain" ? "surplus" : "deficit"} disabled>
            <option value="deficit">Deficit</option>
            <option value="surplus">Surplus</option>
          </select>
          <input style={styles.input} type="number" min={0} value={adjustKcal} onChange={(e) => setAdjustKcal(Number(e.target.value))} />
        </div>

        {caloriesBelowBmr ? (
          <div style={{ marginTop: 6, fontSize: 11, color: "#d00000" }}>
            You shouldn't consume calories below your BMR, Lower your deficit or raise your activity level
          </div>
        ) : null}

        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span style={styles.muted}>Target calories/day</span>
            <span style={{ fontWeight: 900 }}>{targetCalories} kcal</span>
          </div>
        </div>

        <button
          style={{ ...styles.primaryBtn, opacity: !canContinue || saving ? 0.6 : 1 }}
          disabled={!canContinue || saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateProfile({
                name,
                sex,
                heightCm,
                weightKg,
                age,
                activityLevel: activity,
                goal: { targetWeightKg },
                goals: { calories: targetCalories, waterMl: 2000, steps: 8000, sleepMinutes: 450 },
              });

              window.dispatchEvent(new CustomEvent("lockin:refresh"));
              nav("/dashboard");
            } finally {
              setSaving(false);
            }
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "linear-gradient(180deg, #5a5bd7 0%, #cfd3e7 70%, #e9edf7 100%)" },
  card: { width: 420, background: "#fff", borderRadius: 12, padding: 22, boxShadow: "0 18px 40px rgba(0,0,0,0.18)", border: "1px solid rgba(0,0,0,0.08)" },
  h2: { margin: 0, textAlign: "center", fontWeight: 900, fontSize: 20 },
  label: { marginTop: 14, marginBottom: 6, fontSize: 12, fontWeight: 700, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e6e6e6", outline: "none" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e6e6e6", background: "#fff", outline: "none" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" },
  inputUnitWrap: { display: "grid", gridTemplateColumns: "1fr 58px", border: "1px solid #e6e6e6", borderRadius: 6, overflow: "hidden" },
  inputUnit: { border: "none", padding: "10px 12px", outline: "none" },
  unit: { display: "grid", placeItems: "center", borderLeft: "1px solid #e6e6e6", color: "#555", fontWeight: 700, background: "#fafafa" },
  muted: { color: "#666" },
  summary: { marginTop: 12, paddingTop: 10, borderTop: "1px solid #eee" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  primaryBtn: { width: "100%", marginTop: 16, padding: "12px 14px", borderRadius: 8, border: "1px solid #1f7ae0", background: "#1f7ae0", color: "#fff", fontWeight: 900, cursor: "pointer" },
};
