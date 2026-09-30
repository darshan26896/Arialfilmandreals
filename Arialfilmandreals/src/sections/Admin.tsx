import { useEffect, useMemo, useRef, useState } from "react";
import {
  FILTERS,
  LIBRARY,
  STUDIO,
  ADMIN_PASSWORD_SHA256,
  ADMIN_SETUP_KEY,
  type LibraryItem,
} from "../data";
import { Mark, Reveal } from "../ui";
import {
  hashPassword,
  verifyAgainst,
  passwordStrength,
  getStoredHash,
  setStoredHash,
  loadCustom,
  saveCustom,
  loadHidden,
  saveHidden,
  getLibraryItems,
  formatEntry,
  exportable,
  type CustomItem,
} from "../lib/admin";
import {
  probeBackend,
  apiLogin,
  apiList,
  apiAdd,
  apiRemove,
} from "../lib/backend";

const FIELD =
  "w-full border-b border-ink/30 bg-transparent py-2.5 text-[13.5px] text-ink placeholder:text-ink/35 transition-colors focus:border-signal focus:outline-none";


const TAGS = FILTERS.filter((f) => f.id !== "all").map((f) => f.id);
const RATIOS = ["aspect-[16/10]", "aspect-[4/3]", "aspect-[3/4]", "aspect-[4/5]"];

const blank: CustomItem = {
  id: "",
  kind: "photo",
  title: "",
  place: "",
  meta: "Still · 12 MP · DJI Neo",
  img: "",
  tags: ["photo"],
  ratio: "aspect-[4/3]",
};

export function Admin() {
  /* ---- lock state ---- */
  const [unlocked, setUnlocked] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /* ---- library state ---- */
  const [items, setItems] = useState<CustomItem[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [form, setForm] = useState<CustomItem>(blank);
  const [source, setSource] = useState<"link" | "local">("link");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [token, setToken] = useState<string | null>(null);
  const [cloud, setCloud] = useState<boolean | null>(null);

  useEffect(() => {
    setHasPassword(Boolean(getStoredHash()));
    setItems(getLibraryItems());
    setHidden(loadHidden());

    /* If a MongoDB backend is deployed, sync its items into the library. */
    (async () => {
      const online = await probeBackend(true);
      setCloud(online);
      if (!online) return;
      const remote = await apiList();
      if (remote.length) {
        const local = loadCustom();
        const merged = [
          ...remote,
          ...local.filter((l) => !remote.some((r) => r.id === l.id)),
        ];
        saveCustom(merged);
        setItems(getLibraryItems());
      }
    })();
  }, []);

  const set = (k: keyof CustomItem) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleTag = (t: string) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(t)
        ? f.tags.filter((x) => x !== t)
        : [...f.tags, t],
    }));

  /* ---- password ---- */
  const submitPassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (needEntry) {
        let ok = false;
        if (embedded) ok = await verifyAgainst(pw, embedded);
        if (!ok && hasPassword) {
          ok = (await hashPassword(pw)) === getStoredHash();
        }
        if (!ok && cloud) {
          const t = await apiLogin(pw);
          if (t) {
            setToken(t);
            ok = true;
          }
        }
        if (!ok) {
          setError("Wrong password. Try again.");
          return;
        }
      } else if (canSetup) {
        if (ADMIN_SETUP_KEY.trim() === "AFM-SETUP-ONLY-YOU-KNOW") {
          setError(
            "Panel not configured yet — add the GitHub secret VITE_ADMIN_PASSWORD_SHA256 and redeploy.",
          );
          return;
        }
        if (setupKey.trim() !== ADMIN_SETUP_KEY.trim()) {
          setError("That setup key is not correct.");
          return;
        }
        if (passwordStrength(pw) < 3) {
          setError("Use at least 12 characters with capitals, numbers and a symbol.");
          return;
        }
        if (pw !== pw2) {
          setError("The two passwords do not match.");
          return;
        }
        setStoredHash(await hashPassword(pw));
        setHasPassword(true);
      }
      setUnlocked(true);
      setPw("");
      setPw2("");
    } finally {
      setBusy(false);
    }
  };

  /* ---- media sources ---- */
  const onFile = (e: { target: { files: FileList | null } }) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    const big = f.size > 1_500_000;

    if (isVideo) {
      const url = URL.createObjectURL(f);
      setForm((s) => ({
        ...s,
        kind: "video",
        video: url,
        sessionOnly: true,
        meta: s.meta || "00:20 · 4K/30 · DJI Neo",
      }));
      setNote(
        "Local video previews now, but a browser cannot keep it after a refresh — paste a link (Dropbox/Drive) for a clip visitors will always see.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setForm((s) => ({
        ...s,
        img: url,
        sessionOnly: big || url.length > 900_000,
      }));
      setNote(
        big
          ? "Large photo — it previews now but is not saved after a refresh. Upload it to public/images and use a link instead."
          : "Photo loaded from your computer ✓",
      );
    };
    reader.readAsDataURL(f);
  };

  /* ---- add / remove ---- */
  const add = () => {
    if (!form.title.trim() || !form.img.trim()) {
      setNote("A title and an image (link or file) are required.");
      return;
    }
    const item: CustomItem = {
      ...form,
      id: form.id.trim() || `U${Date.now().toString().slice(-6)}`,
      kind: form.video ? "video" : form.kind,
    };
    const next = [item, ...loadCustom()];
    saveCustom(next);
    if (token) void apiAdd(token, item);
    setItems(getLibraryItems());
    setForm(blank);
    setNote("Added to the library ✓");
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = (id: string) => {
    const custom = loadCustom();
    if (custom.some((c) => c.id === id)) {
      saveCustom(custom.filter((c) => c.id !== id));
    } else {
      saveHidden([...new Set([...loadHidden(), id])]);
    }
    if (token) void apiRemove(token, id);
    setItems(getLibraryItems());
    setHidden(loadHidden());
    setNote("Removed ✓");
  };

  const restore = () => {
    saveHidden([]);
    setItems(getLibraryItems());
    setHidden([]);
    setNote("All built-in items restored ✓");
  };

  const snippet = useMemo(
    () =>
      exportable(loadCustom())
        .map(formatEntry)
        .join("\n"),
    [items],
  );

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const strength = passwordStrength(pw);

  /* A hash embedded in the code locks the panel: no one can set a new
     password from the website. Otherwise the one-time setup needs a key. */
  const embedded = ADMIN_PASSWORD_SHA256.trim();
  const needEntry = embedded.length > 0 || hasPassword;
  const canSetup = embedded.length === 0 && !hasPassword;

  /* ================= LOCKED ================= */
  if (!unlocked) {
    return (
      <section id="admin" className="bg-ink px-4 py-20 text-paper sm:px-7 sm:py-24">
        <div className="mx-auto max-w-xl">
          <div className="u-label text-signal">
            Restricted · studio access only
          </div>
          <h2 className="u-display mt-5 text-[clamp(2.1rem,6vw,3.4rem)] text-paper">
            Admin
            <span className="u-voice ml-3 lowercase text-signal">panel.</span>
          </h2>

          <form
            onSubmit={submitPassword}
            className="mt-9 border border-paper/25 p-6 sm:p-8"
          >
            <div className="u-label text-paper/60">
              {needEntry
                ? "Enter your password to manage the library"
                : "First time — create your admin password"}
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="u-label block text-paper/60" htmlFor="apw">
                  Password
                </label>
                <input
                  id="apw"
                  type="password"
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••••••"
                  className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
                />
              </div>

              {!needEntry && (
                <>
                  <div>
                    <label className="u-label block text-paper/60" htmlFor="akey">
                      Owner setup key
                    </label>
                    <input
                      id="akey"
                      type="password"
                      autoComplete="off"
                      value={setupKey}
                      onChange={(e) => setSetupKey(e.target.value)}
                      placeholder="the key only you know"
                      className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
                    />
                  </div>
                  <div>
                    <label className="u-label block text-paper/60" htmlFor="apw2">
                      Repeat password
                    </label>
                    <input
                      id="apw2"
                      type="password"
                      autoComplete="new-password"
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      placeholder="••••••••••••"
                      className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
                    />
                  </div>

                  <div>
                    <div className="flex gap-1.5" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 ${
                            i <= strength ? "bg-signal" : "bg-paper/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="u-label mt-2 text-paper/55">
                      {["Very weak", "Weak", "Fair", "Strong", "Very strong", "Excellent"][strength]}
                      {" · "}12+ characters, capitals, numbers and a symbol
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && <div className="u-label mt-5 text-signal">{error}</div>}

            <button
              type="submit"
              disabled={busy}
              className="u-label-lg mt-8 flex items-center gap-3 bg-signal px-6 py-4 text-[#0B1013] transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
            >
              {needEntry ? "Unlock" : "Create password & unlock"}
              <span aria-hidden="true">→</span>
            </button>

            <p className="u-label mt-6 leading-[1.9] text-paper/50">
              Your password is never stored as text — only its SHA-256 digest is
              kept, so it cannot be read back from the page or the repository.
            </p>
          </form>
        </div>
      </section>
    );
  }

  /* ================= UNLOCKED ================= */
  return (
    <section id="admin" className="bg-ink px-4 py-20 text-paper sm:px-7 sm:py-24">
      <div className="flex items-end justify-between gap-6 border-t border-paper/30 pt-3">
        <div className="u-label text-paper/60">
          <span className="text-signal">Studio</span>
          <span className="mx-2 text-paper/30">/</span>
          Library manager
        </div>
        <div className="flex items-center gap-3">
          <span className="u-label text-paper/50">
            {cloud
              ? "● MongoDB · connected"
              : "● Local mode · browser only"}
          </span>
          <button
            type="button"
            onClick={() => setUnlocked(false)}
            className="u-label border border-paper/30 px-3.5 py-2 transition-colors hover:bg-paper hover:text-ink"
          >
            Lock panel
          </button>
        </div>
      </div>

      <h2 className="u-display mt-5 text-[clamp(2.1rem,6vw,3.4rem)] text-paper">
        Add &amp; remove
        <span className="u-voice ml-3 lowercase text-signal">media.</span>
      </h2>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* ---------- form ---------- */}
        <div className="border border-paper/25 p-6 sm:p-8">
          <div className="u-label text-signal">New entry</div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <label className="u-label block text-paper/60" htmlFor="a-title">
                Title *
              </label>
              <input
                id="a-title"
                value={form.title}
                onChange={set("title")}
                placeholder="Gandhinagar garden flyover"
                className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
              />
            </div>
            <div>
              <label className="u-label block text-paper/60" htmlFor="a-place">
                Place
              </label>
              <input
                id="a-place"
                value={form.place}
                onChange={set("place")}
                placeholder="Sarita Udyan, Gandhinagar"
                className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
              />
            </div>

            <div>
              <label className="u-label block text-paper/60" htmlFor="a-meta">
                Details line
              </label>
              <input
                id="a-meta"
                value={form.meta}
                onChange={set("meta")}
                placeholder="00:28 · 4K/30 · DJI Neo"
                className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
              />
            </div>
            <div>
              <label className="u-label block text-paper/60" htmlFor="a-ratio">
                Tile shape
              </label>
              <select
                id="a-ratio"
                value={form.ratio}
                onChange={set("ratio")}
                className={`${FIELD} border-paper/30 text-paper [&>option]:text-ink`}
              >
                {RATIOS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* source */}
          <div className="mt-8">
            <div className="u-label text-paper/60">Image / video source</div>
            <div className="mt-3 flex gap-2">
              {(["link", "local"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`u-label border px-3.5 py-2.5 transition-colors ${
                    source === s
                      ? "border-signal bg-signal text-[#0B1013]"
                      : "border-paper/30 text-paper/70 hover:border-paper"
                  }`}
                >
                  {s === "link" ? "Paste a link" : "Upload from device"}
                </button>
              ))}
            </div>

            {source === "link" ? (
              <div className="mt-6 space-y-6">
                <div>
                  <label className="u-label block text-paper/60" htmlFor="a-img">
                    Image link (Dropbox, Drive or direct URL) *
                  </label>
                  <input
                    id="a-img"
                    value={form.img.startsWith("data:") || form.img.startsWith("blob:") ? "" : form.img}
                    onChange={set("img")}
                    placeholder="https://www.dropbox.com/s/…/poster.jpg?dl=0"
                    className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
                  />
                </div>
                <div>
                  <label className="u-label block text-paper/60" htmlFor="a-video">
                    Video link (optional)
                  </label>
                  <input
                    id="a-video"
                    value={form.video ?? ""}
                    onChange={set("video")}
                    placeholder="https://www.dropbox.com/s/…/clip.mp4?dl=0"
                    className={`${FIELD} border-paper/30 text-paper placeholder:text-paper/30`}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <label className="u-label block text-paper/60" htmlFor="a-file">
                  Choose a photo or video
                </label>
                <input
                  id="a-file"
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={onFile}
                  className="u-label mt-3 block w-full border border-dashed border-paper/35 px-4 py-6 text-paper/70 file:mr-4 file:border-0 file:bg-paper file:px-4 file:py-2.5 file:text-ink"
                />
                <p className="u-label mt-3 leading-[1.9] text-paper/50">
                  Photos under 1.5 MB are kept on this device. Larger files and
                  all videos preview only until the page reloads — use a link for
                  anything visitors should always see.
                </p>
              </div>
            )}
          </div>

          {/* tags */}
          <div className="mt-8">
            <div className="u-label text-paper/60">Show under</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`u-label border px-3 py-2 transition-colors ${
                    form.tags.includes(t)
                      ? "border-signal bg-signal text-[#0B1013]"
                      : "border-paper/25 text-paper/70 hover:border-paper"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {note && <div className="u-label mt-6 text-signal">{note}</div>}

          <button
            type="button"
            onClick={add}
            className="u-label-lg mt-8 flex items-center gap-3 bg-signal px-6 py-4 text-[#0B1013] transition-colors hover:bg-paper hover:text-ink"
          >
            Add to library <span aria-hidden="true">+</span>
          </button>
        </div>

        {/* ---------- list + publish ---------- */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <div className="u-label text-signal">
              In the library · {items.length} items
            </div>
            {hidden.length > 0 && (
              <button
                type="button"
                onClick={restore}
                className="u-label border border-paper/30 px-3 py-2 transition-colors hover:bg-paper hover:text-ink"
              >
                Restore removed ({hidden.length})
              </button>
            )}
          </div>

          <ul className="mt-5 max-h-[520px] overflow-y-auto border border-paper/20">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-4 border-b border-paper/12 p-3 last:border-b-0"
              >
                <img
                  src={it.img}
                  alt=""
                  className="h-12 w-16 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] text-paper">
                    {it.title}
                  </div>
                  <div className="u-label mt-1 truncate text-paper/50">
                    {it.kind === "video" ? "▶ video" : "◈ photo"} · {it.place}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="u-label shrink-0 border border-paper/30 px-3 py-2 transition-colors hover:border-signal hover:bg-signal hover:text-[#0B1013]"
                >
                  Remove
                </button>
              </li>
            ))}
            {items.length === 0 && (
              <li className="p-10 text-center">
                <div className="u-voice text-[19px] text-paper/70">
                  Nothing in the library yet.
                </div>
              </li>
            )}
          </ul>

          <div className="mt-8 border border-paper/25 p-6">
            <div className="u-label text-signal">
              Publish — make it visible to everyone
            </div>
            <p className="u-label mt-3 leading-[1.9] text-paper/60">
              A static site has no server, so items added here live in this
              browser. Copy the entries below into{" "}
              <span className="text-paper">src/data.ts</span> →{" "}
              <span className="text-paper">LIBRARY</span> and push, and every
              visitor sees them.
            </p>

            <pre className="u-num mt-4 max-h-56 overflow-auto border border-paper/20 bg-paper/[0.06] px-3 py-3 text-[10px] leading-[1.7] text-paper/85">
              {snippet || "// add an item above to generate the code"}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copySnippet}
                className="u-label border border-paper/30 px-4 py-2.5 transition-colors hover:bg-paper hover:text-ink"
              >
                {copied ? "Copied ✓" : "Copy code"}
              </button>
              <a
                href="#library"
                className="u-label border border-paper/30 px-4 py-2.5 transition-colors hover:bg-paper hover:text-ink"
              >
                Preview library
              </a>
            </div>
          </div>
        </div>
      </div>

      <Reveal className="mt-12">
        <div className="grid gap-8 border-t border-paper/25 pt-8 sm:grid-cols-3">
          {[
            ["Password", "Stored only as a SHA-256 digest with a salt. Nothing readable sits in the code or the repository."],
            ["Link vs local", "Links (Dropbox / Drive / direct) work for every visitor. Local files are for quick previews on your own device."],
            ["Removals", "Removing a built-in item hides it here; restore them any time with “Restore removed”."],
          ].map(([h, b]) => (
            <div key={h}>
              <div className="u-label text-paper">{h}</div>
              <p className="u-label mt-2.5 leading-[1.9] text-paper/55">{b}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* Keeps the Library section in sync with admin changes */
export function useLibrarySync() {
  const [, force] = useState(0);
  useEffect(() => {
    const onChange = () => force((n) => n + 1);
    window.addEventListener("library:changed", onChange);
    return () => window.removeEventListener("library:changed", onChange);
  }, []);
  return getLibraryItems as () => CustomItem[];
}

export const LIBRARY_ALL: LibraryItem[] = LIBRARY;

/**
 * The admin panel as its own page — opened with the key symbol in the
 * masthead or by visiting the site at #admin.
 */
export function AdminView({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-ink">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-paper/20 bg-ink px-4 sm:gap-5 sm:px-7">
        <Mark className="h-7 w-7 text-signal" />
        <div className="leading-none">
          <div className="u-wordmark text-[15px] text-paper sm:text-[17px]">
            {STUDIO.name}
          </div>
          <div className="u-label mt-1.5 text-paper/50">Admin panel</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="u-label ml-auto flex items-center gap-2 border border-paper/30 px-3.5 py-2.5 text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          <span aria-hidden="true">←</span> Back to site
        </button>
      </header>
      <Admin />
    </div>
  );
}
