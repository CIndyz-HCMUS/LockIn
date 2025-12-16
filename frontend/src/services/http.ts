import { clearToken, getToken } from "../utils/authStorage";

const BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:5179";

function authHeaders(extra: HeadersInit = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function parseOrThrow(res: Response) {
  if (res.ok) return res;

  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.json();
    if (data?.message) msg = data.message;
  } catch {
    const text = await res.text().catch(() => "");
    if (text) msg = text;
  }

  // auto logout on 401 (trừ khi đang gọi /auth)
  if (res.status === 401) {
    clearToken();
    if (!location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  throw new Error(msg);
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await parseOrThrow(await fetch(`${BASE}${path}`, { headers: authHeaders() }));
  return (await res.json()) as T;
}

export async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await parseOrThrow(
    await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
  );
  return (await res.json()) as T;
}

export async function putJson<T>(path: string, body: any): Promise<T> {
  const res = await parseOrThrow(
    await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    })
  );
  return (await res.json()) as T;
}

export async function delJson<T>(path: string): Promise<T> {
  const res = await parseOrThrow(
    await fetch(`${BASE}${path}`, { method: "DELETE", headers: authHeaders() })
  );

  // DELETE có thể trả 204 (no content)
  if (res.status === 204) return undefined as unknown as T;

  const text = await res.text();
  if (!text) return undefined as unknown as T;

  return JSON.parse(text) as T;
}

