import { getJson } from "./http";

export type RelaxationCategory =
  | "Breathing"
  | "Stretching"
  | "Mindfulness"
  | "Recovery"
  | "Other";

export type RelaxationActivity = {
  id: number;
  title: string;
  category: RelaxationCategory;
  desc: string;
  steps?: string[];
  suggestedMinutes?: number;
  isVerified?: boolean;
  createdAt?: string;
  imageUri?: string | null;
};

export type SearchRelaxationsParams = {
  q?: string;
  category?: string; // "" = all
  limit?: number;
  offset?: number;
};

export type SearchRelaxationsResponse = {
  items: RelaxationActivity[];
  total: number;
  limit: number;
  offset: number;
};

export async function searchRelaxations(
  params: SearchRelaxationsParams
): Promise<SearchRelaxationsResponse> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.offset != null) sp.set("offset", String(params.offset));

  const qs = sp.toString();
  return getJson<SearchRelaxationsResponse>(`/relaxations${qs ? `?${qs}` : ""}`);
}
