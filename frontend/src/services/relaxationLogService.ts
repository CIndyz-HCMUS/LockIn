import { delJson, getJson, postJson } from "./http";

export type RelaxationLog = {
  id: number;
  dateKey: string; // YYYY-MM-DD
  activityId: number;
  activityTitle: string;
  minutes: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
  loggedAt: string; // ISO
};

export type ListRelaxationLogsResponse = {
  items: RelaxationLog[];
};

export async function listRelaxationLogs(dateKey: string) {
  const sp = new URLSearchParams();
  sp.set("date", dateKey);
  return getJson<ListRelaxationLogsResponse>(`/logs/relaxations?${sp.toString()}`);
}

export type CreateRelaxationLogInput = {
  dateKey: string;
  activityId: number;
  activityTitle: string;
  minutes: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
};

export async function createRelaxationLog(input: CreateRelaxationLogInput) {
  return postJson<RelaxationLog>("/logs/relaxations", input);
}

export async function deleteRelaxationLog(id: number) {
  return delJson<{ ok: true }>(`/logs/relaxations/${id}`);
}
