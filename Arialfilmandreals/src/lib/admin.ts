import { LIBRARY, type LibraryItem } from "../data";

export type CustomItem = LibraryItem & { sessionOnly?: boolean };

const K_ITEMS = "afm.library.custom.v1";
const K_HIDDEN = "afm.library.hidden.v1";
const K_PASS = "afm.admin.hash.v1";
const SALT = "afm::salt::v1::";

/* ---------- password: stored only as a SHA-256 digest ---------- */

export async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + pw);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function passwordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 12) s += 1;
  if (pw.length >= 16) s += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 5);
}

export function getStoredHash(): string | null {
  try {
    return localStorage.getItem(K_PASS);
  } catch {
    return null;
  }
}

export function setStoredHash(hash: string) {
  try {
    localStorage.setItem(K_PASS, hash);
  } catch {
    /* private mode */
  }
}

/* ---------- library storage ---------- */

export function loadCustom(): CustomItem[] {
  try {
    const raw = localStorage.getItem(K_ITEMS);
    return raw ? (JSON.parse(raw) as CustomItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCustom(items: CustomItem[]) {
  try {
    localStorage.setItem(K_ITEMS, JSON.stringify(items));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event("library:changed"));
}

export function loadHidden(): string[] {
  try {
    const raw = localStorage.getItem(K_HIDDEN);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveHidden(ids: string[]) {
  try {
    localStorage.setItem(K_HIDDEN, JSON.stringify(ids));
  } catch {
    /* quota */
  }
  window.dispatchEvent(new Event("library:changed"));
}

/** Custom items first, built-in items after, minus anything removed. */
export function getLibraryItems(): CustomItem[] {
  const hidden = new Set(loadHidden());
  return [...loadCustom(), ...LIBRARY].filter((i) => !hidden.has(i.id));
}

/* ---------- code export ---------- */

export function formatEntry(item: CustomItem): string {
  const lines = [
    `  {`,
    `    id: "${item.id}",`,
    `    kind: "${item.kind}",`,
    `    title: "${item.title.replace(/"/g, "'")}",`,
    `    place: "${item.place.replace(/"/g, "'")}",`,
    `    meta: "${item.meta.replace(/"/g, "'")}",`,
    `    img: "${item.img}",`,
  ];
  if (item.video) lines.push(`    video: "${item.video}",`);
  lines.push(`    tags: [${item.tags.map((t) => `"${t}"`).join(", ")}],`);
  lines.push(`    ratio: "${item.ratio}",`);
  lines.push(`  },`);
  return lines.join("\n");
}

export function exportable(items: CustomItem[]): CustomItem[] {
  return items.filter((i) => !i.sessionOnly);
}
