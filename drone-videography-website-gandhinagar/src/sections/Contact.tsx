import { useState, type FormEvent } from "react";
import { STUDIO, SERVICES, TICKER, WEB3FORMS_KEY } from "../data";
import { Reveal, SectionHead, Mark } from "../ui";

const FIELD =
  "w-full border-b border-ink/30 bg-transparent py-2.5 text-[15px] text-ink placeholder:text-ink/35 transition-colors focus:border-signal focus:outline-none";
const LABEL = "u-label block text-inksoft";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: SERVICES[0].title,
    location: "",
    date: "",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const payload = () => ({
    Name: form.name,
    Email: form.email || "not provided",
    Phone: form.phone,
    "Shoot type": form.type,
    Location: form.location || "To be confirmed",
    "Preferred date": form.date || "Flexible",
    Details: form.notes || "—",
  });

  /* Prefilled email draft — last-resort fallback */
  const mailtoHref = () => {
    const body = Object.entries(payload())
      .map(([k, v]) => `${k}: ${v}`)
      .concat("", form.notes || "(no details added)")
      .join("\n");
    return `mailto:${STUDIO.notify}?subject=${encodeURIComponent(
      `New shoot enquiry — ${form.name || "Website"} (${form.type})`,
    )}&body=${encodeURIComponent(body)}`;
  };

  /* 1 · Web3Forms — primary delivery to your dashboard + inbox */
  const sendWeb3Forms = async () => {
    if (WEB3FORMS_KEY.startsWith("PASTE")) return false;
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New shoot enquiry — ${form.name} (${form.type})`,
          from_name: "Arialfilmandreals · Website enquiry",
          replyto: form.email || undefined,
          botcheck: "",
          ...payload(),
        }),
      });
      const data: { success?: boolean } = await res
        .json()
        .catch(() => ({}) as { success?: boolean });
      return res.ok && data.success !== false;
    } catch {
      return false;
    }
  };

  /* 2 · FormSubmit relay — keeps mail flowing if Web3Forms is blocked */
  const sendFormSubmit = async () => {
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${STUDIO.notify}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `New shoot enquiry — ${form.name} (${form.type})`,
          _template: "table",
          _captcha: "false",
          ...payload(),
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  /* 3 · If both are blocked, the visitor gets a prefilled email draft */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const ok = (await sendWeb3Forms()) || (await sendFormSubmit());
    setStatus(ok ? "sent" : "error");
  };

  return (
    <section id="contact" className="bg-plate px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 08"
        kicker="Book a flight"
        title="Let's plan"
        voice="the shot."
        right="Replies within a few hours · 09:00–21:00 IST"
      />

      <div className="mt-14 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* left: contact block */}
        <Reveal>
          <p className="max-w-[38ch] text-[17px] leading-[1.62] text-ink/85">
            Tell us what you are shooting and where. You will get a shot list, a
            fixed price and the earliest available date — no call centre, no
            package upsell.
          </p>

          <dl className="mt-10 border-t border-ink/25">
            {[
              ["Phone / WhatsApp", STUDIO.phone, STUDIO.phoneHref],
              ["Email", STUDIO.email, `mailto:${STUDIO.email}`],
              ["Instagram", STUDIO.instagram, "#top"],
              ["Studio", STUDIO.base, "#top"],
            ].map(([k, v, href]) => (
              <div
                key={k}
                className="flex items-baseline gap-3 border-b border-ink/15 py-3.5"
              >
                <dt className="u-label w-[110px] shrink-0 text-inksoft">{k}</dt>
                <dd className="u-num text-[13px] leading-[1.5]">
                  <a
                    href={href}
                    className="transition-colors hover:text-signal"
                  >
                    {v}
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          <a
            href={STUDIO.whatsapp}
            className="u-label-lg mt-8 inline-flex items-center gap-3 bg-ink px-6 py-4 text-paper transition-colors hover:bg-signal"
          >
            Message on WhatsApp <span aria-hidden="true">→</span>
          </a>

          <div className="u-label mt-8 text-inksoft">
            {STUDIO.lat} / {STUDIO.lon} · ALT 214 M
          </div>
        </Reveal>

        {/* right: form */}
        <Reveal delay={0.1}>
          {status === "sent" ? (
            <div className="border border-ink/25 bg-paper p-8 sm:p-12">
              <div className="u-label text-signal">Transmission received</div>
              <h3 className="u-display mt-5 text-[clamp(2rem,5vw,3.2rem)]">
                Thanks, {form.name.split(" ")[0] || "friend"}.
              </h3>
              <p className="mt-5 max-w-[46ch] text-[15.5px] leading-[1.68] text-inksoft">
                Your enquiry is logged and a copy has been delivered to{" "}
                <span className="u-num text-ink">{STUDIO.notify}</span>. We will
                reply on WhatsApp with a shot list, a fixed price and available
                dates — usually within a few hours.
              </p>
              <dl className="mt-8 border-t border-ink/20">
                {[
                  ["Shoot type", form.type],
                  ["Location", form.location || "To be confirmed"],
                  ["Preferred date", form.date || "Flexible"],
                  ["Contact", form.phone],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline gap-3 border-b border-ink/12 py-2.5"
                  >
                    <dt className="u-label w-[110px] shrink-0 text-inksoft">
                      {k}
                    </dt>
                    <dd className="u-num text-[12px]">{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="u-label mt-8 border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="border border-ink/25 bg-paper p-6 sm:p-10"
            >
              <div className="u-label flex flex-wrap items-center justify-between gap-2 text-inksoft">
                <span>Enquiry form · F-01</span>
                <span className="text-signal">All fields marked ✳ required</span>
              </div>

              {status === "error" && (
                <div
                  role="alert"
                  className="mt-6 border border-signal/50 bg-signal/[0.08] p-4"
                >
                  <div className="u-label text-signal">
                    Could not send automatically
                  </div>
                  <p className="mt-2 text-[13.5px] leading-[1.6] text-ink/80">
                    The connection to the mail server was blocked. Tap below to
                    send the same details from your email app instead.
                  </p>
                  <a
                    href={mailtoHref()}
                    className="u-label mt-3 inline-flex items-center gap-2 border border-ink px-4 py-2.5 transition-colors hover:bg-ink hover:text-paper"
                  >
                    Open email draft <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}

              <div className="mt-8 grid gap-7 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="f-name">
                    ✳ Your name
                  </label>
                  <input
                    id="f-name"
                    required
                    value={form.name}
                    onChange={set("name")}
                    placeholder="e.g. Nirav Patel"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="f-phone">
                    ✳ Phone / WhatsApp
                  </label>
                  <input
                    id="f-phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+91"
                    className={FIELD}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="f-email">
                    Email (optional)
                  </label>
                  <input
                    id="f-email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className={FIELD}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-type">
                    Type of shoot
                  </label>
                  <select
                    id="f-type"
                    value={form.type}
                    onChange={set("type")}
                    className={FIELD}
                  >
                    {SERVICES.map((s) => (
                      <option key={s.n}>{s.title}</option>
                    ))}
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor="f-date">
                    Preferred date
                  </label>
                  <input
                    id="f-date"
                    type="date"
                    value={form.date}
                    onChange={set("date")}
                    className={`${FIELD} u-num`}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="f-loc">
                    Location / sector
                  </label>
                  <input
                    id="f-loc"
                    value={form.location}
                    onChange={set("location")}
                    placeholder="e.g. Sargasan, near the party plot"
                    className={FIELD}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="f-notes">
                    What are we making?
                  </label>
                  <textarea
                    id="f-notes"
                    rows={4}
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="A 60-second film for a 4BHK villa listing, plus 3 reels for Instagram."
                    className={`${FIELD} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="u-label-lg group flex items-center gap-3 bg-signal px-7 py-4 text-paper transition-colors hover:bg-ink disabled:cursor-wait disabled:bg-ink/45"
                >
                  {status === "sending" ? "Sending…" : "Send enquiry"}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
                <p className="u-label max-w-[30ch] leading-[1.8] text-inksoft">
                  Delivered straight to {STUDIO.notify} · no spam, no mailing
                  list. One reply, one price.
                </p>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Footer                                                            */
/* ---------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink px-4 pb-10 pt-16 text-paper sm:px-7">
      <div className="u-grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />

      <div className="relative">
        <div className="flex flex-col gap-10 border-b border-paper/25 pb-12 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9 text-signal" />
              <div>
                <div className="u-wordmark text-[28px] sm:text-[42px]">
                  {STUDIO.name}
                </div>
                <div className="u-label mt-3 text-paper/55">{STUDIO.full}</div>
              </div>
            </div>
            <p className="u-voice mt-7 max-w-[30ch] text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.2] text-paper">
              Gandhinagar, from the air — and from the ground.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:gap-16">
            <div>
              <div className="u-label text-signal">Contact</div>
              <ul className="mt-5 space-y-2.5">
                {[
                  [STUDIO.phone, STUDIO.phoneHref],
                  [STUDIO.email, `mailto:${STUDIO.email}`],
                  [STUDIO.instagram, "#top"],
                  [STUDIO.whatsapp.replace("https://", ""), STUDIO.whatsapp],
                ].map(([v, href]) => (
                  <li key={v}>
                    <a
                      href={href}
                      className="u-num text-[12.5px] text-paper/80 transition-colors hover:text-signal"
                    >
                      {v}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="u-label text-signal">Coverage</div>
              <ul className="mt-5 space-y-2.5">
                {["Gandhinagar 1–30", "Kudasan · Sargasan", "Adalaj · Koba", "GIFT City · Infocity", "Kalol · Chiloda", "SG Highway · Chandkheda"].map(
                  (v) => (
                    <li key={v} className="u-label text-paper/70">
                      {v}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* legend strip */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-paper/15 py-5">
          <span className="u-label text-paper/50">
            <span className="mr-2 inline-block h-2 w-2 translate-y-[1px] bg-signal" />
            Flight-tested location
          </span>
          <span className="u-label text-paper/50">
            <span className="mr-2 inline-block h-[7px] w-[7px] rotate-45 border border-paper/60" />
            Permission required
          </span>
          <span className="u-label text-paper/50">
            <span className="mr-2 inline-block h-px w-4 translate-y-[-3px] bg-paper/60" />
            Sector grid, 1:12500
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
          <div className="u-label text-paper/45">
            © {new Date().getFullYear()} {STUDIO.name} · {STUDIO.base}
          </div>
          <div className="u-label text-paper/45">
            Sheet 1 of 1 · Plate 01–09 · DJI Neo + iPhone
          </div>
          <div className="u-label text-paper/45">
            Surveyed {STUDIO.lat} / {STUDIO.lon}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 overflow-hidden">
          {TICKER.slice(0, 10).map((t) => (
            <span key={t} className="u-label text-paper/25">
              {t}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
