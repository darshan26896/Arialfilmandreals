import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  FILTERS,
  LIBRARY,
  STUDIO,
  ADMIN_EMAIL,
  type LibraryItem,
} from "../data";
import { Mark, Reveal } from "../ui";
import {
  passwordStrength,
  loadCustom,
  saveCustom,
  loadHidden,
  saveHidden,
  getLibraryItems,
  type CustomItem,
} from "../lib/admin";
import {
  probeBackend,
  apiLogin,
  apiList,
  apiAdd,
  apiRemove,
  apiUploadMedia,
  sendOtp,
  verifyOtp,
  apiAuthStatus,
  apiSetup,
  apiSession,
  apiLogout,
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
  const [stage, setStage] = useState<"password" | "otp">("password");
  const [otp, setOtp] = useState("");
  const [otpNote, setOtpNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /* ---- library state ---- */
  const [items, setItems] = useState<CustomItem[]>([]);
  const [databaseIds, setDatabaseIds] = useState<string[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);
  const [form, setForm] = useState<CustomItem>(blank);
  const [source, setSource] = useState<"link" | "local">("link");
  const [note, setNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [token, setToken] = useState<string | null>(null);
  const [cloud, setCloud] = useState<boolean | null>(null);

  useEffect(() => {
    setItems(getLibraryItems());
    setHidden(loadHidden());

    /* Auth and library both live in MongoDB. */
    (async () => {
      const online = await probeBackend(true);
      setCloud(online);
      if (!online) return;

      // Restore the admin UI only after the backend validates the HttpOnly cookie.
      if (await apiSession()) {
        setToken("cookie-session");
        setUnlocked(true);
      }

      const configured = await apiAuthStatus();
      if (configured !== null) setHasPassword(configured);
      const remote = await apiList();
      const remoteIds = remote.map((item) => item.id);
      setDatabaseIds(remoteIds);
      // MongoDB items are the managed entries. Keep the original sample library
      // visible, but never let a local copy shadow a database record.
      setItems([
        ...remote,
        ...getLibraryItems().filter((item) => !remoteIds.includes(item.id)),
      ]);
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
      if (!cloud) {
        setError("Cannot reach the backend. Check the Vercel /api rewrite and Render service status.");
        return;
      }

      let result: string | null;
      if (needEntry) {
        result = await apiLogin(pw);
        if (!result) {
          setError("Wrong password or authentication service error. Try again.");
          return;
        }
      } else {
        if (passwordStrength(pw) < 3) {
          setError("Use at least 12 characters with capitals, numbers and a symbol.");
          return;
        }
        if (pw !== pw2) {
          setError("The two passwords do not match.");
          return;
        }
        result = await apiSetup(setupKey.trim(), pw);
        if (!result) {
          setError("Could not create the password — please check the setup key and try again.");
          return;
        }
        setHasPassword(true);
      }

      setPw("");
      setPw2("");

      if (result === "cookie-session") {
        setToken("cookie-session");
        setUnlocked(true);
        return;
      }

      // The server says OTP is required; no authenticated cookie exists yet.
      setToken(null);
      setOtpNote("Sending…");
      setStage("otp");
      const sent = await sendOtp(ADMIN_EMAIL);
      setOtpNote(sent === "failed"
        ? "Could not send the code — check the Resend settings and try again."
        : "");
    } finally {
      setBusy(false);
    }
  };

  const submitOtp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setBusy(true);
    setOtpNote("");
    try {
      const t = await verifyOtp(ADMIN_EMAIL, otp);
      if (t !== "cookie-session") {
        setOtpNote("That code is not right, has expired, or the session cookie could not be set.");
        return;
      }
      setToken("cookie-session");
      setUnlocked(true);
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    setOtpNote("Sending…");
    const r = await sendOtp(ADMIN_EMAIL);
    setOtpNote(
      r === "failed"
        ? "Could not send the code — check the email settings."
        : "A new code has been sent ✓",
    );
  };

  const logout = async () => {
    setBusy(true);
    try {
      const ok = await apiLogout();
      if (!ok) {
        setNote("Could not confirm logout with the backend. Check the connection and try again.");
        return;
      }
      setToken(null);
      setUnlocked(false);
      setStage("password");
      setOtp("");
      setOtpNote("");
      setPw("");
      setPw2("");
      setError("");
      setNote("");
    } finally {
      setBusy(false);
    }
  };

  /* ---- media sources: upload selected files to Cloudinary for permanent URLs ---- */
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const f = e.target.files?.[0];
    if (!f) return;
    if (!token) {
      setNote("Log in to the admin panel before uploading media.");
      input.value = "";
      return;
    }
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      setNote("Choose an image or video file.");
      input.value = "";
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setNote("This file is over 100 MB. Please choose a smaller file.");
      input.value = "";
      return;
    }

    const isVideo = f.type.startsWith("video/");
    setBusy(true);
    setNote(`Uploading ${isVideo ? "video" : "image"} to Cloudinary…`);
    try {
      const url = await apiUploadMedia(f);
      if (!url) {
        setNote("Upload failed. Check that CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are configured in Render, and that you are logged in.");
        return;
      }
      if (isVideo) {
        setForm((current) => ({
          ...current,
          kind: "video",
          video: url,
          sessionOnly: false,
          meta: current.meta || "00:20 · 4K/30 · DJI Neo",
        }));
      } else {
        setForm((current) => ({ ...current, img: url, sessionOnly: false }));
      }
      setNote(`${isVideo ? "Video" : "Image"} uploaded to Cloudinary ✓ Its permanent URL is ready to save.`);
    } finally {
      setBusy(false);
      input.value = "";
    }
  };

  /* ---- add / remove: MongoDB is the source of truth for managed entries ---- */
  const add = async () => {
    if (!token) {
      setNote("Your admin session is not active. Log in again before saving.");
      return;
    }
    if (!form.title.trim() || !form.img.trim()) {
      setNote("A title and a public image URL are required.");
      return;
    }
    const validUrl = (value: string) => {
      try {
        const url = new URL(value.trim());
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    };
    if (!validUrl(form.img)) {
      setNote("Use a public image URL beginning with https:// or http://. Device-only uploads cannot be saved to MongoDB.");
      return;
    }
    if (form.video && !validUrl(form.video)) {
      setNote("Use a public video URL beginning with https:// or http://.");
      return;
    }

    setBusy(true);
    setNote("Saving to MongoDB…");
    const item: CustomItem = {
      ...form,
      id: form.id.trim() || `U${Date.now().toString(36)}`,
      kind: (form.video ?? "").trim() ? "video" : form.kind,
      title: form.title.trim(),
      place: form.place.trim(),
      img: form.img.trim(),
      video: form.video?.trim() || undefined,
      tags: (form.video ?? "").trim()
        ? [...new Set(["video", ...form.tags.filter((tag) => tag !== "photo")])]
        : [...new Set(["photo", ...form.tags.filter((tag) => tag !== "video")])],
    };

    try {
      const saved = await apiAdd(token, item);
      if (!saved) {
        setNote("Could not save to MongoDB. Check your session and Render logs, then try again.");
        return;
      }
      const remote = await apiList();
      const remoteIds = remote.map((entry) => entry.id);
      setDatabaseIds(remoteIds);
      setItems([
        ...remote,
        ...getLibraryItems().filter((entry) => !remoteIds.includes(entry.id)),
      ]);
      setForm(blank);
      setNote("Saved to MongoDB ✓ The public library will show this item.");
      if (fileRef.current) fileRef.current.value = "";
      window.dispatchEvent(new Event("library:changed"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (databaseIds.includes(id)) {
      if (!token) {
        setNote("Your admin session is not active. Log in again before deleting.");
        return;
      }
      setBusy(true);
      setNote("Removing from MongoDB…");
      try {
        const removed = await apiRemove(token, id);
        if (!removed) {
          setNote("Could not remove this item from MongoDB. Check your session and try again.");
          return;
        }
        saveCustom(loadCustom().filter((item) => item.id !== id));
        const remote = await apiList();
        const remoteIds = remote.map((item) => item.id);
        setDatabaseIds(remoteIds);
        setItems([
          ...remote,
          ...getLibraryItems().filter((item) => !remoteIds.includes(item.id)),
        ]);
        setNote("Removed from MongoDB ✓ It is no longer in the public database library.");
        window.dispatchEvent(new Event("library:changed"));
      } finally {
        setBusy(false);
      }
      return;
    }

    // Built-in sample entries are not database records; preserve their existing
    // hide/restore behavior without pretending they were deleted from MongoDB.
    const custom = loadCustom();
    if (custom.some((item) => item.id === id)) {
      saveCustom(custom.filter((item) => item.id !== id));
    } else {
      saveHidden([...new Set([...loadHidden(), id])]);
    }
    const remote = items.filter((item) => databaseIds.includes(item.id));
    setItems([
      ...remote,
      ...getLibraryItems().filter((item) => !databaseIds.includes(item.id)),
    ]);
    setHidden(loadHidden());
    setNote("Sample entry hidden on this browser. Database entries are deleted permanently.");
  };

  const restore = () => {
    saveHidden([]);
    const remote = items.filter((item) => databaseIds.includes(item.id));
    setItems([...remote, ...getLibraryItems().filter((item) => !databaseIds.includes(item.id))]);
    setHidden([]);
    setNote("All built-in sample items restored ✓");
  };

  const strength = passwordStrength(pw);

  /* Authentication is MongoDB-only: the password is stored in the database
     and is never part of the code, the repository or GitHub Secrets. */
  const needEntry = hasPassword;

  /* ================= OTP STEP ================= */
  if (!unlocked && stage === "otp") {
    return (
      <section id="admin" className="bg-ink px-4 py-20 text-paper sm:px-7 sm:py-24">
        <div className="mx-auto max-w-xl">
          <div className="u-label text-signal">Step 2 of 2 · verification</div>
          <h2 className="u-display mt-5 text-[clamp(2.1rem,6vw,3.4rem)] text-paper">
            Check your
            <span className="u-voice ml-3 lowercase text-signal">email.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.7] text-paper/70">
            A 6-digit code was sent to{" "}
            <span className="text-paper">{ADMIN_EMAIL}</span>. It expires in 10
            minutes.
          </p>

          <form
            onSubmit={submitOtp}
            className="mt-8 border border-paper/25 p-6 sm:p-8"
          >
            <label className="u-label block text-paper/60" htmlFor="a-otp">
              Verification code
            </label>
            <input
              id="a-otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="u-num mt-3 w-full border-b border-paper/30 bg-transparent py-3 text-[26px] tracking-[0.45em] text-paper placeholder:text-paper/25 focus:border-signal focus:outline-none"
            />

            {otpNote && <div className="u-label mt-5 text-signal">{otpNote}</div>}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={busy || otp.length < 6}
                className="u-label-lg flex items-center gap-3 bg-signal px-6 py-4 text-[#0B1013] transition-colors hover:bg-paper hover:text-ink disabled:opacity-50"
              >
                Verify &amp; open <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={resendOtp}
                className="u-label border border-paper/30 px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                Send a new code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("password");
                  setOtp("");
                  setOtpNote("");
                }}
                className="u-label border border-paper/30 px-4 py-3 text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                ← Back
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

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
            onClick={() => void logout()}
            className="u-label border border-paper/30 px-3.5 py-2 transition-colors hover:bg-paper hover:text-ink"
          >
            Log out
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
                  {form.img.startsWith("https://res.cloudinary.com/") && (
                    <p className="u-label mt-2 text-signal">Image uploaded ✓</p>
                  )}
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
                  {form.video?.startsWith("https://res.cloudinary.com/") && (
                    <p className="u-label mt-2 text-signal">Video uploaded ✓</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <label className="u-label block text-paper/60" htmlFor="a-file">
                  Upload a poster image or video file
                </label>
                <input
                  id="a-file"
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(event) => void onFile(event)}
                  disabled={busy}
                  className="u-label mt-3 block w-full border border-dashed border-paper/35 px-4 py-6 text-paper/70 file:mr-4 file:border-0 file:bg-paper file:px-4 file:py-2.5 file:text-ink"
                />
                <p className="u-label mt-3 leading-[1.9] text-paper/50">
                  Selected files upload to Cloudinary and receive permanent public URLs. For a video entry, upload a poster image and the video clip separately, or paste their URLs above.
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
            onClick={() => void add()}
            disabled={busy}
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
                  onClick={() => void remove(it.id)}
                  disabled={busy}
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
              Database publishing
            </div>
            <p className="u-label mt-3 leading-[1.9] text-paper/60">
              New entries are saved to MongoDB and loaded by the public Library page.
              You no longer need to copy code into <span className="text-paper">src/data.ts</span> or redeploy to publish a media link.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
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
