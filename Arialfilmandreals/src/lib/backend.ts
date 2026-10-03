import { API_BASE, type LibraryItem } from "../data";

/**
 * Client for the optional MongoDB backend (api/ folder).
 *
 * On a static host (GitHub Pages) these calls simply fail and the panel falls
 * back to its local, browser-only mode. On Vercel/Netlify with MONGODB_URI set,
 * the same panel reads and writes the shared database instead.
 */

const ROOT = (API_BASE ?? "").replace(/\/+$/, "");
const ENDPOINT = `${ROOT}/api/library`;
const AUTH = `${ROOT}/api/auth`;
const OTP = `${ROOT}/api/otp`;

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

/** Is a password configured in MongoDB yet? null = backend unreachable. */
export async function apiAuthStatus(): Promise<boolean | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status" }),
    });
    const data = await res.json();
    return res.ok ? Boolean(data?.configured) : null;
  } catch {
    return null;
  }
}

/** First-time password creation against the database. */
export async function apiSetup(
  setupKey: string,
  password: string,
): Promise<string | null> {
  try {
    const res = await fetch(AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", setupKey, password }),
    });
    const data = await res.json();
    return res.ok && data?.token ? (data.token as string) : null;
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

/* ---------------- one-time login codes (OTP) ---------------- */

type LocalOtp = { email: string; code: string; exp: number };
let localOtp: LocalOtp | null = null;

/**
 * Sends a 6-digit code to the admin email.
 *  - "sent"    delivered by the backend (email service)
 *  - "local"   code relayed through the mail fallback, verified in this session
 *  - "failed"  nothing could be sent
 */
export async function sendOtp(
  email: string,
): Promise<"sent" | "local" | "failed"> {
  try {
    const res = await fetch(OTP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", email }),
    });
    const data = await res.json();
    if (res.ok && data && data.ok) return data.sent ? "sent" : "local";
  } catch {
    /* no backend — fall through */
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  localOtp = { email, code, exp: Date.now() + 10 * 60 * 1000 };

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `Admin login code — ${code}`,
        _template: "table",
        _captcha: "false",
        "Login code": code,
        "Valid for": "10 minutes",
      }),
    });
    return res.ok ? "local" : "failed";
  } catch {
    return "failed";
  }
}

/** Returns a session token when the code is correct, otherwise null. */
export async function verifyOtp(
  email: string,
  code: string,
): Promise<string | null> {
  try {
    const res = await fetch(OTP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify", email, code }),
    });
    const data = await res.json();
    if (res.ok && data && data.token) return data.token as string;
  } catch {
    /* no backend — check the session code */
  }

  if (
    localOtp &&
    localOtp.email === email &&
    localOtp.exp > Date.now() &&
    localOtp.code === code.trim()
  ) {
    localOtp = null;
    return "local-session";
  }
  return null;
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
