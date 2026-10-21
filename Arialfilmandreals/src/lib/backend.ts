import { API_BASE, type LibraryItem } from "../data";

const ROOT = (API_BASE ?? "").replace(/\/+$/, "");
const ENDPOINT = `${ROOT}/api/library`;
const AUTH = `${ROOT}/api/auth`;
const OTP = `${ROOT}/api/otp`;

let cachedOnline: boolean | null = null;
const COOKIE_SESSION = "cookie-session";
const PASSWORD_OK = "password-ok";

export async function probeBackend(force = false): Promise<boolean> {
  if (cachedOnline !== null && !force) return cachedOnline;
  try {
    const res = await fetch(ENDPOINT, { method: "GET", credentials: "include" });
    const data = await res.json();
    cachedOnline = Boolean(res.ok && data?.ok);
  } catch {
    cachedOnline = false;
  }
  return cachedOnline;
}

/** Validates the HttpOnly cookie on the server after a reload. */
export async function apiSession(): Promise<boolean> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "session" }),
    });
    const data = await res.json();
    return Boolean(res.ok && data?.authenticated);
  } catch {
    return false;
  }
}

/** Clears the server-issued session cookie. */
export async function apiLogout(): Promise<boolean> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    const data = await res.json();
    return Boolean(res.ok && data?.ok);
  } catch {
    return false;
  }
}

/** Password step: returns password-ok when OTP is required, otherwise cookie-session. */
export async function apiLogin(password: string): Promise<string | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return null;
    return data.requiresOtp ? PASSWORD_OK : data.authenticated ? COOKIE_SESSION : null;
  } catch {
    return null;
  }
}

/** Is an admin password configured in MongoDB? null means the API is unavailable. */
export async function apiAuthStatus(): Promise<boolean | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    });
    const data = await res.json();
    return res.ok ? Boolean(data?.configured) : null;
  } catch {
    return null;
  }
}

/** First-time password creation. The backend decides whether OTP is required. */
export async function apiSetup(setupKey: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", setupKey, password }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return null;
    return data.requiresOtp ? PASSWORD_OK : data.authenticated ? COOKIE_SESSION : null;
  } catch {
    return null;
  }
}

export async function apiList(): Promise<LibraryItem[]> {
  try {
    const res = await fetch(ENDPOINT, { credentials: "include" });
    const data = await res.json();
    return res.ok && Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

/** Cookie-only admin write; token parameter retained for source compatibility, never transmitted. */
export async function apiAdd(_sessionMarker: string, item: LibraryItem): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendOtp(_email?: string): Promise<"sent" | "failed"> {
  try {
    const res = await fetch(OTP, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send" }),
    });
    const data = await res.json();
    return res.ok && data?.ok && data?.sent ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

/** Verifies the code and lets the backend set the HttpOnly session cookie. */
export async function verifyOtp(_email: string, code: string): Promise<string | null> {
  try {
    const res = await fetch(OTP, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", code }),
    });
    const data = await res.json();
    return res.ok && data?.authenticated ? COOKIE_SESSION : null;
  } catch {
    return null;
  }
}

export async function apiRemove(_sessionMarker: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
