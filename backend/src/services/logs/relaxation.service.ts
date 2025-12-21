import {
  create,
  listByDate,
  remove,
  type CreateRelaxationLogInput,
} from "../../repos/logs/relaxationLog.repo.js";

export async function list(date: string) {
  return listByDate(date);
}

export async function createLog(input: CreateRelaxationLogInput) {
  if (!input?.date) throw new Error("date is required");
  if (!input?.title) throw new Error("title is required");
  const minutes = Number(input.minutes);
  if (!Number.isFinite(minutes) || minutes <= 0) throw new Error("minutes must be > 0");

  return create({
    ...input,
    title: String(input.title).trim(),
    minutes,
  });
}

export async function removeLog(id: number) {
  return remove(id);
}
