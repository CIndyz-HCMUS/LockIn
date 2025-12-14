import { Router } from "express";
import { searchRelaxations } from "./relaxations.repo";

export const relaxationsRouter = Router();

relaxationsRouter.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
  const offset = typeof req.query.offset === "string" ? Number(req.query.offset) : 0;

  const result = await searchRelaxations({ q, category, limit, offset });
  res.json(result);
});
