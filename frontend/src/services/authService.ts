import { getJson, postJson } from "./http";

export type User = {
  id: number;
  email: string;
  name: string;
  age?: number;
  createdAt?: string;
};

export async function login(email: string, password: string, remember: boolean) {
  return postJson<{ token: string; user: User }>("/auth/login", { email, password, remember });
}

export async function register(payload: { email: string; password: string; name: string; age?: number }) {
  return postJson<{ token: string; user: User }>("/auth/register", payload);
}

export async function me() {
  return getJson<{ user: User }>("/auth/me");
}

export async function logout() {
  return postJson<{ ok: true }>("/auth/logout", {});
}
