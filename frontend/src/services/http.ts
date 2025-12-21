// frontend/src/services/http.ts
import { getToken, clearToken } from "../utils/authStorage";

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:5179";

function authHeaders(extra: HeadersInit = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

/**
 * Read response body safely (json/text) and build a readable error message.
 */
async function parseOrThrow(res: Response): Promise<Response> {
  if (res.ok) return res;

  // default message
  let msg = `HTTP ${res.status}`;

  // try json first
  try {
    const data = await res.clone().json();
    if (data?.message) msg = String(data.message);
    else if (data?.error) msg = String(data.error);
  } catch {
    // fallback to text
    try {
      const text = await res.clone().text();
      if (text) msg = text;
    } catch {
      // ignore
    }
  }

  // If unauthorized, clear token so UI can re-login cleanly
  if (res.status === 401 || res.status === 403) {
    try {
      clearToken();
    } catch {
      // ignore
    }
  }

  throw new Error(msg);
}

function buildUrl(path: string) {
  if (!path) return BASE;
  // allow absolute URLs
  if (/^https?:\/\//i.test(path)) return path;
  // ensure slash
  if (path.startsWith("/")) return `${BASE}${path}`;
  return `${BASE}/${path}`;
}

export async function getJson<T = any>(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    method: "GET",
    headers: authHeaders({
      Accept: "application/json",
      ...(init.headers || {}),
    }),
  });
  await parseOrThrow(res);

  // if empty body (204), return null
  const text = await res.text();
  if (!text) return null as any;

  try {
    return JSON.parse(text) as T;
  } catch {
    // if backend sometimes returns text
    return text as any as T;
  }
}

export async function postJson<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    method: "POST",
    headers: authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await parseOrThrow(res);

  const text = await res.text();
  if (!text) return null as any;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any as T;
  }
}

export async function putJson<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    method: "PUT",
    headers: authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await parseOrThrow(res);

  const text = await res.text();
  if (!text) return null as any;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any as T;
  }
}

export async function patchJson<T = any>(
  path: string,
  body?: any,
  init: RequestInit = {}
) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    method: "PATCH",
    headers: authHeaders({
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    }),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  await parseOrThrow(res);

  const text = await res.text();
  if (!text) return null as any;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any as T;
  }
}

/**
 * Keep delJson as requested. Some backends return 204 No Content.
 * We return null for empty body.
 */
export async function delJson<T = any>(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    ...init,
    method: "DELETE",
    headers: authHeaders({
      Accept: "application/json",
      ...(init.headers || {}),
    }),
  });
  await parseOrThrow(res);

  const text = await res.text();
  if (!text) return null as any;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any as T;
  }
}
