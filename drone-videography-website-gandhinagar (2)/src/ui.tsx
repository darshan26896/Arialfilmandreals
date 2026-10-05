import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TICKER, STUDIO } from "./data";

/* ------------------------------------------------------------------ */
/* Brand mark — reticle + quadcopter glyph, hand-drawn paths           */
/* ------------------------------------------------------------------ */

export function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="13.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M16 0.9v4.4M16 26.7v4.4M0.9 16h4.4M26.7 16h4.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
      <path
        d="M16 10.4 21.6 16 16 21.6 10.4 16Z"
        fill="currentColor"
      />
      <path
        d="M13.4 13.4 10.2 10.2M18.6 13.4l3.2-3.2M13.4 18.6l-3.2 3.2M18.6 18.6l3.2 3.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="square"
      />
      <circle
        cx="8.6"
        cy="8.6"
        r="2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="23.4"
        cy="8.6"
        r="2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="8.6"
        cy="23.4"
        r="2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="23.4"
        cy="23.4"
        r="2.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Motion helper                                                      */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 18,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Section header — stamped plate number + rule                        */
/* ------------------------------------------------------------------ */

export function SectionHead({
  plate,
  kicker,
  title,
  voice,
  right,
}: {
  plate: string;
  kicker: string;
  title: string;
  voice?: string;
  right?: string;
}) {
  return (
    <Reveal>
      <div className="flex items-end justify-between gap-6 border-t border-ink/25 pt-3">
        <div className="u-label text-inksoft">
          <span className="text-signal">{plate}</span>
          <span className="mx-2 text-ink/30">/</span>
          {kicker}
        </div>
        {right && <div className="u-label hidden text-inksoft sm:block">{right}</div>}
      </div>
      <h2 className="u-display mt-6 text-[clamp(2.4rem,7vw,5.6rem)]">
        {title}
        {voice && (
          <span className="u-voice ml-3 lowercase text-signal">{voice}</span>
        )}
      </h2>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Chart overlay drawn over the hero plate                             */
/* ------------------------------------------------------------------ */

export function ChartOverlay() {
  const cols = [8.33, 25, 41.66, 58.33, 75, 91.66];
  const rows = [14.28, 28.57, 42.85, 57.14, 71.42, 85.71];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {cols.map((x) => (
          <line
            key={`c${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2="100"
            stroke="#F3EEE5"
            strokeOpacity="0.16"
            strokeWidth="0.12"
          />
        ))}
        {rows.map((y) => (
          <line
            key={`r${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#F3EEE5"
            strokeOpacity="0.16"
            strokeWidth="0.12"
          />
        ))}
        <rect
          x="3.4"
          y="4.2"
          width="93.2"
          height="91.6"
          fill="none"
          stroke="#F3EEE5"
          strokeOpacity="0.34"
          strokeWidth="0.16"
        />
      </svg>

      {/* corner crop marks */}
      {[
        "left-3 top-3 border-l border-t",
        "right-3 top-3 border-r border-t",
        "left-3 bottom-3 border-b border-l",
        "right-3 bottom-3 border-b border-r",
      ].map((pos) => (
        <span
          key={pos}
          className={`absolute h-6 w-6 border-paper/50 ${pos}`}
        />
      ))}

      {/* edge ticks */}
      <div className="absolute left-3 right-3 top-[4.2%] flex justify-between">
        {Array.from({ length: 13 }).map((_, i) => (
          <span key={i} className="h-2 w-px bg-paper/35" />
        ))}
      </div>

      {/* reticle */}
      <div className="absolute right-[6%] top-[16%] hidden h-40 w-40 sm:block">
        <svg viewBox="0 0 100 100" className="h-full w-full u-reticle">
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#DC4B23"
            strokeOpacity="0.9"
            strokeWidth="0.8"
            strokeDasharray="6 5"
          />
          <path
            d="M50 4v12M50 84v12M4 50h12M84 50h12"
            stroke="#F3EEE5"
            strokeOpacity="0.8"
            strokeWidth="1.2"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="u-label text-paper/85">LOCK</span>
        </div>
      </div>

      {/* coordinate callouts */}
      <div className="absolute left-6 top-[14%] hidden lg:block">
        <div className="u-label text-paper/70">GRID 43 Q / SHEET 1</div>
        <div className="u-label mt-1 text-signal">23.2156° N · 72.6369° E</div>
      </div>
      <div className="absolute bottom-[8%] right-6 text-right">
        <div className="u-label text-paper/70">DJI NEO · 4K/30 · ND16</div>
        <div className="u-label mt-1 text-paper/50">SCALE 1:12500</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee ticker of coverage areas                                   */
/* ------------------------------------------------------------------ */

export function Ticker() {
  const row = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-ink/20 bg-ink py-3">
      <div className="u-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className="u-label-lg text-paper/80">{t}</span>
            <span className="text-signal">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small section: dotted-leader row                                    */
/* ------------------------------------------------------------------ */

export function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2 py-[7px]">
      <span className="u-label whitespace-nowrap text-inksoft">{k}</span>
      <span className="u-leader" />
      <span className="u-num whitespace-nowrap text-[12px] font-medium">{v}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Camera OSD — Plan B "Cinema"                                        */
/* ------------------------------------------------------------------ */

export function CameraHUD() {
  const reduce = useReducedMotion();
  const [tc, setTc] = useState("00:00:04:12");

  useEffect(() => {
    if (reduce) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      const el = Date.now() - start;
      const s = Math.floor(el / 1000);
      const f = Math.floor((el % 1000) / 33.367);
      setTc(
        `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
          s % 60,
        ).padStart(2, "0")}:${String(f).padStart(2, "0")}`,
      );
    }, 60);
    return () => window.clearInterval(id);
  }, [reduce]);

  const GLASS = "text-[#F2F6F7]";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 2.39:1 letterbox */}
      <div className="absolute inset-x-0 top-0 h-[7vh] bg-[#0B1013]" />
      <div className="absolute inset-x-0 bottom-0 h-[7vh] bg-[#0B1013]" />

      {/* rule-of-thirds guides */}
      <div className="absolute inset-x-[12%] inset-y-[12%]">
        <span className="absolute left-1/3 top-0 h-full w-px bg-[#F2F6F7]/12" />
        <span className="absolute left-2/3 top-0 h-full w-px bg-[#F2F6F7]/12" />
        <span className="absolute top-1/3 left-0 h-px w-full bg-[#F2F6F7]/12" />
        <span className="absolute top-2/3 left-0 h-px w-full bg-[#F2F6F7]/12" />
      </div>

      {/* focus box */}
      <div className="absolute left-1/2 top-1/2 h-[34vh] w-[42vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2">
        {[
          "left-0 top-0 border-l-2 border-t-2",
          "right-0 top-0 border-r-2 border-t-2",
          "left-0 bottom-0 border-b-2 border-l-2",
          "right-0 bottom-0 border-b-2 border-r-2",
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-7 w-7 border-signal ${pos}`}
          />
        ))}
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#F2F6F7]/70" />
      </div>

      {/* top OSD */}
      <div className="absolute inset-x-0 top-[calc(3.5rem+1.6rem)] flex items-center justify-between px-5 sm:px-8">
        <div className={`flex items-center gap-3 ${GLASS}`}>
          <span className="u-rec inline-block h-2.5 w-2.5 rounded-full bg-signal" />
          <span className="u-label">REC</span>
          <span className="hidden h-3 w-px bg-[#F2F6F7]/30 sm:block" />
          <span className="u-label hidden text-[#F2F6F7]/75 sm:inline">
            4K/30 · RockSteady
          </span>
        </div>
        <div className={`flex items-center gap-3 ${GLASS}`}>
          <span className="u-label hidden text-[#F2F6F7]/75 sm:inline">
            DJI NEO · 135 g
          </span>
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            {[6, 9, 12, 15].map((h) => (
              <span
                key={h}
                style={{ height: h }}
                className="w-[3px] bg-[#F2F6F7]/80"
              />
            ))}
          </span>
          <span className="u-num text-[11px]">96%</span>
        </div>
      </div>

      {/* bottom OSD */}
      <div className="absolute inset-x-0 bottom-[calc(7vh+1.15rem)] flex items-end justify-between gap-4 px-5 sm:px-8">
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${GLASS}`}>
          <span className="u-label">ISO 100</span>
          <span className="u-label">1/120</span>
          <span className="u-label hidden sm:inline">EV 0.0</span>
          <span className="u-label hidden sm:inline">WB 5600K</span>
        </div>
        <div className={`flex items-center gap-3 ${GLASS}`}>
          <span className="u-label hidden text-[#F2F6F7]/70 sm:inline">
            {STUDIO.lat} / {STUDIO.lon}
          </span>
          <span className="u-num border border-signal px-2 py-1 text-[11px] text-signal">
            {tc}
          </span>
        </div>
      </div>

      {/* exposure scale */}
      <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-[5px] lg:flex">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className={`h-px ${
              i === 4 ? "w-6 bg-signal" : "w-3 bg-[#F2F6F7]/40"
            }`}
          />
        ))}
        <span className="u-label mt-2 text-[#F2F6F7]/60">+0.3</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline strip — Plan B "Cinema"                                    */
/* ------------------------------------------------------------------ */

export function TimelineStrip() {
  const clips = [
    { t: "00:00:00", label: "Reveal · Sector 21", img: "images/hero-sector-grid.jpg" },
    { t: "00:00:04", label: "Villa · nadir pass", img: "images/plate-villa.jpg" },
    { t: "00:00:09", label: "Stepwell · dawn", img: "images/neo-stepwell.jpg" },
    { t: "00:00:14", label: "Garba · night orbit", img: "images/plate-garba.jpg" },
    { t: "00:00:19", label: "GIFT City · progress", img: "images/plate-construction.jpg" },
    { t: "00:00:24", label: "River · mist run", img: "images/plate-riverfront.jpg" },
    { t: "00:00:28", label: "iPhone · interiors", img: "images/phone-rig.jpg" },
  ];

  return (
    <div className="relative overflow-hidden bg-plate">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink/15 px-4 py-2.5 sm:px-7">
        <span className="u-label text-signal">● Timeline · V1</span>
        <span className="u-label text-inksoft">
          Sequence 01 · 24 fps · 00:00:31:00
        </span>
        <span className="u-label ml-auto hidden text-inksoft sm:block">
          Aerial + iPhone selects
        </span>
      </div>

      <div className="relative">
        <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-3 sm:px-7">
          {clips.map((c) => (
            <figure
              key={c.t}
              className="group relative h-[78px] w-[138px] shrink-0 overflow-hidden border border-ink/20"
            >
              <img
                src={c.img}
                alt={c.label}
                loading="lazy"
                className="h-full w-full object-cover opacity-85 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1013]/90 via-[#0B1013]/20 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-1.5">
                <div className="u-label text-[8.5px] text-[#F2F6F7]">
                  {c.label}
                </div>
                <div className="u-num text-[9px] text-[#F2F6F7]/65">{c.t}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        <span
          className="pointer-events-none absolute bottom-0 left-[14%] top-0 w-[2px] bg-signal"
          aria-hidden="true"
        >
          <span className="absolute -left-[3px] -top-[1px] h-2 w-2 bg-signal" />
        </span>
      </div>
    </div>
  );
}
