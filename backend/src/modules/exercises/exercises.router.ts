import { Router } from "express";
import { createExercise, deleteCustomExercise, searchExercises } from "./exercises.repo.js";

export const exercisesRouter = Router();

exercisesRouter.get("/", async (req, res) => {
  const query =
    typeof req.query.query === "string"
      ? req.query.query
      : typeof req.query.q === "string"
      ? req.query.q
      : "";

  const category = typeof req.query.category === "string" ? req.query.category : "all";
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
  const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

  res.json(await searchExercises({ query, category, limit, offset }));
});

exercisesRouter.post("/", async (req, res) => {
  try {
    const created = await createExercise({
      title: String(req.body?.title ?? ""),
      category: String(req.body?.category ?? "Other"),
      met: Number(req.body?.met ?? 4),
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ message: e?.message ?? "Create failed" });
  }
});

exercisesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });

  const ok = await deleteCustomExercise(id);
  if (!ok) return res.status(404).json({ message: "Not found (custom only)" });

  res.json({ ok: true });
});