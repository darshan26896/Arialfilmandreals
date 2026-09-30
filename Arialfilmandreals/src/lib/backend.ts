import type { LibraryItem } from "../data";

/**
 * Client for the optional MongoDB backend (api/ folder).
 *
 * On a static host (GitHub Pages) these calls simply fail and the panel falls
 * back to its local, browser-only mode. On Vercel/Netlify with MONGODB_URI set,
 * the same panel reads and writes the shared database instead.
 */

const ENDPOINT = "api/library";
const AUTH = "api/auth";

let cachedOnline: boolean | null = null;

export async function probeBackend(force = false): Promise<boolean> {
  if (cachedOnline !== null && !force) return cachedOnline;
  try {
    const res = await fetch(ENDPOINT, { method: "GET" });
    const data = await res.json();
    cachedOnline = Boolean(res.ok && data && data.ok);
  } catch {
    cachedOnline = false;
  }
  return cachedOnline;
}

export async function apiLogin(password: string): Promise<string | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    return res.ok && data && data.token ? (data.token as string) : null;
  } catch {
    return null;
  }
}

export async function apiList(): Promise<LibraryItem[]> {
  try {
    const res = await fetch(ENDPOINT);
    const data = await res.json();
    return res.ok && Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function apiAdd(
  token: string,
  item: LibraryItem,
): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiRemove(token: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
