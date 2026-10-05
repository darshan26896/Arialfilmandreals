import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { STUDIO, NAV, STATS } from "../data";
import { Mark, ChartOverlay, CameraHUD, TimelineStrip, Ticker } from "../ui";
import { KeyRound } from "lucide-react";
import { usePlan, type Plan } from "../theme";

/* ---------------------------------------------------------------- */
/* Left flight-log rail (desktop chart margin)                        */
/* ---------------------------------------------------------------- */

export function Rail() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[52px] flex-col items-center justify-between border-r border-ink/20 bg-paper py-5 xl:flex">
      <div className="relative flex h-24 w-full items-start justify-center overflow-hidden">
        <div className="u-sweep h-10 w-4 border-t border-signal bg-signal/15" />
        <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-[6px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={`h-px ${i % 3 === 0 ? "w-4 bg-ink/45" : "w-2 bg-ink/20"}`}
            />
          ))}
        </div>
      </div>

      <div className="u-label text-inksoft" style={{ writingMode: "vertical-rl" }}>
        <span className="text-ink">FLIGHT LOG</span>
        <span className="mx-3 text-ink/30">—</span>
        {STUDIO.lat} / {STUDIO.lon}
        <span className="mx-3 text-ink/30">—</span>
        GANDHINAGAR · GUJARAT
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-px bg-ink/25" />
        <span className="u-label text-signal" style={{ writingMode: "vertical-rl" }}>
          ALT 214 M
        </span>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- */
/* View switch — Sheet (plan A) / Cinema (plan B)                     */
/* ---------------------------------------------------------------- */

export function ViewToggle() {
  const { plan, setPlan } = usePlan();
  const options: { id: Plan; label: string; short: string; title: string }[] = [
    { id: "plan-a", label: "Sheet", short: "A", title: "Survey sheet view" },
    { id: "plan-b", label: "Cinema", short: "B", title: "Drone camera view" },
  ];

  return (
    <div
      className="flex items-stretch border border-ink/30"
      role="group"
      aria-label="Choose page view"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          title={o.title}
          aria-pressed={plan === o.id}
          onClick={() => setPlan(o.id)}
          className={`u-label px-2.5 py-2 transition-colors ${
            plan === o.id
              ? "bg-ink text-paper"
              : "text-inksoft hover:text-signal"
          }`}
        >
          <span className="sm:hidden">{o.short}</span>
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Masthead                                                          */
/* ---------------------------------------------------------------- */

export function Header({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-ink/20 bg-paper/95 backdrop-blur-sm xl:left-[52px]">
      <div className="flex h-14 items-center gap-3 px-4 sm:gap-5 sm:px-7">
        <a href="#top" className="flex shrink-0 items-center gap-2.5 text-ink">
          <Mark className="h-7 w-7 text-signal" />
          <span className="leading-none">
            <span className="u-wordmark block whitespace-nowrap text-[16px] sm:text-[21px]">
              {STUDIO.name}
            </span>
            <span className="u-label mt-2.5 block text-[8.5px] text-inksoft">
              Drone photo &amp; video
            </span>
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="u-label text-inksoft transition-colors hover:text-signal"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
          <ViewToggle />
          <button
            type="button"
            onClick={onOpenAdmin}
            title="Open the admin panel"
            aria-label="Open the admin panel"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border border-ink/30 text-inksoft transition-colors hover:border-signal hover:text-signal"
          >
            <KeyRound className="h-[15px] w-[15px]" strokeWidth={1.8} />
          </button>
          <a
            href="#contact"
            className="u-label flex items-center gap-2 border border-ink px-3 py-2 text-ink transition-colors hover:border-signal hover:bg-signal hover:text-paper"
          >
            <span className="hidden sm:inline">Book a shoot</span>
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
/* Hero plate                                                        */
/* ---------------------------------------------------------------- */

export function Hero() {
  const reduce = useReducedMotion();
  const { plan } = usePlan();
  const [typed, setTyped] = useState("");

  const line = "23.2156° N / 72.6369° E · DJI NEO · 4K/30";

  useEffect(() => {
    if (reduce) {
      setTyped(line);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(id);
    }, 34);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <section id="top" className="relative isolate">
      <div className="relative min-h-[100svh] overflow-hidden bg-[#0B1013] pt-14">
        <img
          src="images/hero-sector-grid.jpg"
          alt="Dusk aerial view over the planned sector grid of Gandhinagar, Gujarat"
          className="absolute inset-0 h-full w-full object-cover object-[62%_46%]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1013]/92 via-[#0B1013]/58 to-[#0B1013]/22" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0B1013] via-[#0B1013]/55 to-transparent" />

        {plan === "plan-b" ? <CameraHUD /> : <ChartOverlay />}

        <div className="relative z-10 flex min-h-[calc(100svh-3.5rem)] flex-col justify-end px-4 pb-8 pt-16 sm:px-7 sm:pb-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[68rem]"
          >
            <div className="u-label-lg mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[#F2F6F7]/75">
              <span className="border border-signal px-2 py-1 text-signal">
                {plan === "plan-b" ? "Shot on DJI Neo" : "Plate 01"}
              </span>
              <span>Aerial photography &amp; videography · Gandhinagar</span>
              <span className="hidden h-3 w-px bg-[#F2F6F7]/30 sm:block" />
              <span className="text-[#F2F6F7]/55">
                Sectors 1–30 &amp; 25 km around
              </span>
            </div>

            <h1 className="u-display text-[clamp(2.9rem,12.5vw,9.5rem)] text-[#F2F6F7]">
              Gandhinagar,
              <span className="u-voice block lowercase tracking-[-0.02em] text-signal">
                from the air.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[17px] leading-[1.6] text-[#F2F6F7]/85 sm:text-[19px]">
              Drone photography, aerial videography and scroll-stopping reels —
              shot across Gandhinagar, Kudasan, Adalaj and GIFT City on a
              135-gram DJI Neo and an iPhone. Edited, graded and back to you in
              48 hours.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="u-label-lg group flex items-center gap-3 bg-signal px-6 py-4 text-[#0B1013] transition-colors hover:bg-[#F2F6F7] hover:text-[#0B1013]"
              >
                Book a shoot
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="#work"
                className="u-label-lg flex items-center gap-3 border border-[#F2F6F7]/45 px-6 py-4 text-[#F2F6F7] transition-colors hover:bg-[#F2F6F7] hover:text-[#0B1013]"
              >
                See the shots
              </a>
            </div>
          </motion.div>

          {/* telemetry strip */}
          <motion.dl
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[#F2F6F7]/25 pt-5 sm:grid-cols-3 lg:grid-cols-5"
          >
            {STATS.map((s) => (
              <div key={s.k}>
                <dt className="u-label text-[#F2F6F7]/55">{s.k}</dt>
                <dd className="u-num mt-1.5 text-[22px] font-medium text-[#F2F6F7]">
                  {s.v}
                </dd>
              </div>
            ))}
          </motion.dl>

          <div className="u-label mt-6 h-4 overflow-hidden text-[#F2F6F7]/45">
            {typed}
            <span className="ml-1 inline-block h-[10px] w-[6px] translate-y-[1px] bg-signal" />
          </div>
        </div>
      </div>

      {plan === "plan-b" && <TimelineStrip />}
      <Ticker />
    </section>
  );
}
