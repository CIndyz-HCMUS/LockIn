import type { Request, Response } from "express";
import { getProfile, saveProfile } from "./profile.repo.js";

function isPosNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
function isNonNegNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0;
}

export async function handleGetProfile(_req: Request, res: Response) {
  res.json(await getProfile());
}

export async function handleUpdateProfile(req: Request, res: Response) {
  const body = (req.body ?? {}) as any;

  // validate tối thiểu (demo-friendly)
  if (body.sex && body.sex !== "F" && body.sex !== "M") {
    return res.status(400).json({ message: "sex must be F or M" });
  }
  if (body.heightCm !== undefined && !isPosNumber(body.heightCm)) {
    return res.status(400).json({ message: "heightCm invalid" });
  }
  if (body.weightKg !== undefined && !isPosNumber(body.weightKg)) {
    return res.status(400).json({ message: "weightKg invalid" });
  }
  if (body.age !== undefined && (!Number.isFinite(Number(body.age)) || Number(body.age) <= 0)) {
    return res.status(400).json({ message: "age invalid" });
  }

  if (body.activityLevel !== undefined) {
    const v = String(body.activityLevel);
    const ok = v === "sedentary" || v === "light" || v === "moderate" || v === "active";
    if (!ok) return res.status(400).json({ message: "activityLevel invalid" });
  }

  // ✅ validate goals.* (quan trọng cho Relaxation progress)
  if (body.goals?.calories !== undefined && !isNonNegNumber(body.goals.calories)) {
    return res.status(400).json({ message: "goals.calories invalid" });
  }
  if (body.goals?.waterMl !== undefined && !isNonNegNumber(body.goals.waterMl)) {
    return res.status(400).json({ message: "goals.waterMl invalid" });
  }
  if (body.goals?.steps !== undefined && !isNonNegNumber(body.goals.steps)) {
    return res.status(400).json({ message: "goals.steps invalid" });
  }
  if (body.goals?.sleepMinutes !== undefined && !isNonNegNumber(body.goals.sleepMinutes)) {
    return res.status(400).json({ message: "goals.sleepMinutes invalid" });
  }
  if (body.goals?.relaxMinutes !== undefined) {
    const v = Number(body.goals.relaxMinutes);
    if (!Number.isFinite(v) || v < 0 || v > 300) {
      return res.status(400).json({ message: "goals.relaxMinutes invalid (0..300)" });
    }
  }
  // avatarDataUrl (base64 data url)
if (body.avatarDataUrl !== undefined) {
  if (typeof body.avatarDataUrl !== "string") {
    return res.status(400).json({ message: "avatarDataUrl must be a string" });
  }

  const s = body.avatarDataUrl;

  // allow clearing avatar
  if (s === "") {
    body.avatarDataUrl = undefined;
  } else {
    const okPrefix =
      s.startsWith("data:image/png;base64,") ||
      s.startsWith("data:image/jpeg;base64,") ||
      s.startsWith("data:image/webp;base64,");

    if (!okPrefix) {
      return res.status(400).json({ message: "avatar must be png/jpeg/webp data URL" });
    }

    // giới hạn ~1.5MB string (demo-safe)
    if (s.length > 1_500_000) {
      return res.status(400).json({ message: "avatar too large (max ~1.5MB)" });
    }
  }
}


  const saved = await saveProfile(body);
  res.json(saved);
}
