import { useState } from "react";
import { SERVICES, PLATES } from "../data";
import { Reveal, SectionHead } from "../ui";

/* ---------------------------------------------------------------- */
/* Services — numbered editorial list with image swap                 */
/* ---------------------------------------------------------------- */

export function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="services" className="px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 02"
        kicker="What we shoot"
        title="Five kinds"
        voice="of film."
        right="Hover a row to load the frame"
      />

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* image column */}
        <div className="order-first lg:order-last">
          <div className="relative aspect-[4/3] overflow-hidden border border-ink/20 bg-plate lg:aspect-[4/5] lg:sticky lg:top-20">
            {SERVICES.map((s, i) => (
              <img
                key={s.n}
                src={s.img}
                alt={s.title}
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
              <div className="u-label text-signal">
                Frame {SERVICES[active].n} / 05
              </div>
              <div className="u-label mt-1.5 text-[#F2F6F7]/85">
                {SERVICES[active].meta}
              </div>
            </div>
            <div className="pointer-events-none absolute left-4 top-4 h-5 w-5 border-l border-t border-paper/60" />
            <div className="pointer-events-none absolute right-4 top-4 h-5 w-5 border-r border-t border-paper/60" />
          </div>
        </div>

        {/* list */}
        <ul className="border-t border-ink/25">
          {SERVICES.map((s, i) => (
            <li key={s.n}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`group block w-full border-b border-ink/15 py-6 text-left transition-colors ${
                  i === active ? "bg-plate/45" : ""
                }`}
              >
                <div className="flex items-start gap-5 px-1 sm:gap-7">
                  <span
                    className={`u-num pt-1 text-[13px] transition-colors ${
                      i === active ? "text-signal" : "text-inksoft"
                    }`}
                  >
                    {s.n}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[27px]">
                      {s.title}
                    </h3>
                    <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.62] text-inksoft">
                      {s.body}
                    </p>
                    <div className="u-label mt-4 text-inksoft">{s.meta}</div>
                  </div>
                  <span
                    className={`mt-2 text-lg transition-transform ${
                      i === active
                        ? "translate-x-1 text-signal"
                        : "text-ink/30 group-hover:translate-x-1"
                    }`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Plates — work grid as chart annotations                            */
/* ---------------------------------------------------------------- */

export function Work() {
  return (
    <section id="work" className="bg-plate px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 03"
        kicker="Selected frames"
        title="The"
        voice="plates."
        right="Captured on DJI Neo + iPhone · ungraded stills"
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:auto-rows-[228px] sm:grid-cols-4 lg:auto-rows-[262px]">
        {PLATES.map((p, i) => (
          <Reveal
            key={p.id}
            delay={i * 0.06}
            className={`${p.span} group relative overflow-hidden border border-ink/20 bg-ink`}
          >
            <figure className="relative h-[262px] sm:h-full">
              <img
                src={p.img}
                alt={`${p.title} — ${p.sub}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-ink/5" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="u-label text-signal">Plate {p.id}</div>
                    <h3 className="mt-2 text-[19px] font-semibold leading-tight tracking-[-0.02em] text-[#F2F6F7] sm:text-[23px]">
                      {p.title}
                    </h3>
                    <div className="u-label mt-1.5 text-[#F2F6F7]/70">{p.sub}</div>
                  </div>
                  <div className="text-right">
                    <div className="u-label text-[#F2F6F7]/75">{p.coords}</div>
                    <div className="u-label mt-1 text-[#F2F6F7]/50">{p.meta}</div>
                  </div>
                </div>
              </figcaption>
              <div className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l border-t border-paper/55" />
              <div className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r border-t border-paper/55" />
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <blockquote className="max-w-3xl">
          <p className="u-voice text-[clamp(1.55rem,3.4vw,2.6rem)] leading-[1.22] text-ink">
            “Anyone can fly a drone over a building. The job is knowing what the
            second shot should be.”
          </p>
          <footer className="u-label mt-5 text-inksoft">
            — Studio note, kept on the flight-log wall
          </footer>
        </blockquote>
      </Reveal>
    </section>
  );
}
