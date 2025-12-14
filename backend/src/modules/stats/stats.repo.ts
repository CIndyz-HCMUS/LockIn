import path from "path";
import { env } from "../../config/env.js";
import { readJsonFile } from "../../storage/jsonStore.js";

// ===== Types (match output DashboardDto của frontend) =====
type WorkoutLog = {
  id: number;
  loggedAt: string; // ISO
  category: string; // Cardiovascular / Strength Training / ...
  title: string;
  minutes: number;
  caloriesBurned: number;
};

type MealLog = {
  id: number;
  loggedAt: string; // ISO
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodId: number;
  foodName: string;
  brand: string | null;
  grams: number;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
};

type WaterLog = { id: number; loggedAt: string; ml: number };
type StepsLog = { id: number; loggedAt: string; steps: number };
type SleepLog = { id: number; loggedAt: string; minutes: number };

type Profile = {
  name: string;
  sex: "F" | "M";
  heightCm: number;
  weightKg: number;
  age: number;
  measurements: Record<string, number>;
  goal: { targetWeightKg?: number };
};

type DashboardDto = {
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
  groups: Array<{
    category: string;
    totalCalories: number;
    items: Array<{ id: number; title: string; minutes: number; caloriesBurned: number }>;
  }>;
  profile: Profile;
  metrics: { bmr: number; tdee: number; bmi: number | null };
  goals: { calories: number; waterMl: number; steps: number; sleepMinutes: number };
};

// ===== File paths (logs/custom nằm ở env.dataDir = backend/electron/data) =====
const MEAL_LOGS_FILE = path.join(env.dataDir, "mealLogs.json");
const WORKOUT_LOGS_FILE = path.join(env.dataDir, "workoutLogs.json");
const WATER_LOGS_FILE = path.join(env.dataDir, "waterLogs.json");
const STEPS_LOGS_FILE = path.join(env.dataDir, "stepsLogs.json");
const SLEEP_LOGS_FILE = path.join(env.dataDir, "sleepLogs.json");

// profile/goals có thể bạn đang lưu chỗ khác; tạm mặc định backend dataDir
const PROFILE_FILE = path.join(env.dataDir, "profile.json");

function isSameDate(iso: string, dateKey: string) {
  return String(iso).startsWith(dateKey);
}

function sumNumber(items: any[], key: string) {
  return items.reduce((s, x) => s + (Number(x?.[key]) || 0), 0);
}

// very basic: demo formulas
function calcBmi(weightKg: number, heightCm: number) {
  if (!heightCm) return null;
  const h = heightCm / 100;
  if (h <= 0) return null;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

function calcBmr(profile: Profile) {
  // Mifflin-St Jeor (demo)
  const w = profile.weightKg || 0;
  const h = profile.heightCm || 0;
  const a = profile.age || 0;
  if (profile.sex === "M") return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  return Math.round(10 * w + 6.25 * h - 5 * a - 161);
}

export async function getDashboardToday(dateKey: string): Promise<DashboardDto> {
  const [mealLogs, workoutLogs, waterLogs, stepsLogs, sleepLogs, profile] = await Promise.all([
    readJsonFile<MealLog[]>(MEAL_LOGS_FILE, []),
    readJsonFile<WorkoutLog[]>(WORKOUT_LOGS_FILE, []),
    readJsonFile<WaterLog[]>(WATER_LOGS_FILE, []),
    readJsonFile<StepsLog[]>(STEPS_LOGS_FILE, []),
    readJsonFile<SleepLog[]>(SLEEP_LOGS_FILE, []),
    readJsonFile<Profile>(
      PROFILE_FILE,
      {
        name: "Demo User",
        sex: "F",
        heightCm: 160,
        weightKg: 55,
        age: 20,
        measurements: {},
        goal: {},
      }
    ),
  ]);

  const mealsToday = mealLogs.filter((x) => isSameDate(x.loggedAt, dateKey));
  const workoutsToday = workoutLogs.filter((x) => isSameDate(x.loggedAt, dateKey));
  const waterToday = waterLogs.filter((x) => isSameDate(x.loggedAt, dateKey));
  const stepsToday = stepsLogs.filter((x) => isSameDate(x.loggedAt, dateKey));
  const sleepToday = sleepLogs.filter((x) => isSameDate(x.loggedAt, dateKey));

  const caloriesIn = sumNumber(mealsToday, "calories");
  const caloriesOut = sumNumber(workoutsToday, "caloriesBurned");
  const netCalories = caloriesIn - caloriesOut;

  const waterMl = sumNumber(waterToday, "ml");
  const steps = sumNumber(stepsToday, "steps");
  const sleepMinutes = sumNumber(sleepToday, "minutes");

  // group workouts by category
  const groupMap = new Map<string, DashboardDto["groups"][number]>();
  for (const w of workoutsToday) {
    const cat = w.category || "Other";
    if (!groupMap.has(cat)) {
      groupMap.set(cat, { category: cat, totalCalories: 0, items: [] });
    }
    const g = groupMap.get(cat)!;
    g.totalCalories += Number(w.caloriesBurned) || 0;
    g.items.push({
      id: w.id,
      title: w.title,
      minutes: Number(w.minutes) || 0,
      caloriesBurned: Number(w.caloriesBurned) || 0,
    });
  }

  const groups = Array.from(groupMap.values()).sort((a, b) => b.totalCalories - a.totalCalories);

  const bmr = calcBmr(profile);
  const tdee = Math.round(bmr * 1.2); // demo
  const bmi = calcBmi(profile.weightKg, profile.heightCm);

  // demo goals (sau bạn có onboarding thì ghi vào profile/goals)
  const goals = {
    calories: 2000,
    waterMl: 2000,
    steps: 8000,
    sleepMinutes: 480,
  };

  return {
    date: dateKey,
    totals: {
      caloriesIn,
      caloriesOut,
      netCalories,
      waterMl,
      steps,
      sleepMinutes,
      totalCaloriesBurned: caloriesOut,
    },
    groups,
    profile,
    metrics: { bmr, tdee, bmi },
    goals,
  };
}
