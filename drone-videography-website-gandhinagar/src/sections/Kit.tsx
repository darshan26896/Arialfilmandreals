import { NEO_SPECS, PHONE_SPECS, EDIT_SPECS, PROCESS } from "../data";
import { Reveal, SectionHead } from "../ui";

/* ---------------------------------------------------------------- */
/* Kit — spec plate, reversed to ink                                  */
/* ---------------------------------------------------------------- */

export function Kit() {
  return (
    <section id="kit" className="relative overflow-hidden bg-ink px-4 py-20 text-paper sm:px-7 sm:py-28">
      <div className="u-grain pointer-events-none absolute inset-0 opacity-[0.5] mix-blend-overlay" />

      <div className="relative">
        <Reveal>
          <div className="flex items-end justify-between gap-6 border-t border-paper/30 pt-3">
            <div className="u-label text-paper/60">
              <span className="text-signal">Sheet 04</span>
              <span className="mx-2 text-paper/30">/</span>
              Equipment manifest
            </div>
            <div className="u-label hidden text-paper/45 sm:block">
              Verified specs · DJI Neo (2024)
            </div>
          </div>
          <h2 className="u-display mt-6 text-[clamp(2.4rem,7vw,5.6rem)] text-paper">
            135 grams,
            <span className="u-voice ml-3 lowercase text-signal">plus a phone.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <Reveal>
            <figure className="relative">
              <img
                src="images/neo-stepwell.jpg"
                alt="Palm-sized DJI Neo drone hovering inside the carved sandstone geometry of the Adalaj stepwell"
                loading="lazy"
                className="aspect-[4/5] w-full border border-paper/20 object-cover"
              />
              <figcaption className="u-label mt-4 flex flex-wrap gap-x-4 gap-y-2 text-paper/60">
                <span className="text-signal">Fig. 4.1</span>
                <span>Neo hovering at Adalaj Vav · 07:12 IST</span>
                <span className="text-paper/40">Palm launch · no controller</span>
              </figcaption>
            </figure>

            <blockquote className="mt-10 border-l-2 border-signal pl-5">
              <p className="u-voice text-[clamp(1.35rem,2.6vw,1.95rem)] leading-[1.3] text-paper/95">
                Light enough to launch from a wedding mandap, small enough to
                carry into a half-built tower, quiet enough that nobody looks up.
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-10 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 border-b border-paper/30 pb-2.5">
                  <span className="u-label text-signal">A</span>
                  <h3 className="u-label-lg text-paper">DJI Neo — aircraft</h3>
                </div>
                <div className="mt-3">
                  {NEO_SPECS.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline gap-2 border-b border-paper/10 py-[7px]"
                    >
                      <span className="u-label whitespace-nowrap text-paper/55">
                        {k}
                      </span>
                      <span className="flex-1 -translate-y-[5px] border-b border-dotted border-paper/25" />
                      <span className="u-num whitespace-nowrap text-[12px] font-medium text-paper">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 border-b border-paper/30 pb-2.5">
                  <span className="u-label text-signal">B</span>
                  <h3 className="u-label-lg text-paper">iPhone — ground</h3>
                </div>
                <div className="mt-3">
                  {PHONE_SPECS.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline gap-2 border-b border-paper/10 py-[7px]"
                    >
                      <span className="u-label whitespace-nowrap text-paper/55">
                        {k}
                      </span>
                      <span className="flex-1 -translate-y-[5px] border-b border-dotted border-paper/25" />
                      <span className="u-num whitespace-nowrap text-[12px] font-medium text-paper">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 border-b border-paper/30 pb-2.5">
                  <span className="u-label text-signal">C</span>
                  <h3 className="u-label-lg text-paper">Post — the edit</h3>
                </div>
                <div className="mt-3">
                  {EDIT_SPECS.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline gap-2 border-b border-paper/10 py-[7px]"
                    >
                      <span className="u-label whitespace-nowrap text-paper/55">
                        {k}
                      </span>
                      <span className="flex-1 -translate-y-[5px] border-b border-dotted border-paper/25" />
                      <span className="u-num whitespace-nowrap text-[12px] font-medium text-paper">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 border border-paper/25 p-6">
              <div className="u-label text-signal">On editing reels</div>
              <p className="mt-3 text-[15px] leading-[1.68] text-paper/80">
                A reel is won or lost in the first second. We cut for the hook
                first — the reveal, the drop, the face — then build the rest
                around it. Trending audio where it helps, licensed score where it
                counts, and every export sized for the feed it is going into:
                9:16 for Instagram, 16:9 for the website, 1:1 for the WhatsApp
                status.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Process — flight path                                              */
/* ---------------------------------------------------------------- */

export function Process() {
  return (
    <section className="px-4 py-20 sm:px-7 sm:py-24">
      <SectionHead
        plate="Sheet 05"
        kicker="How a shoot runs"
        title="Flight"
        voice="plan."
        right="Typical turnaround: 48 hours"
      />

      <Reveal className="mt-12">
        <ol className="relative grid gap-8 border-t border-ink/25 pt-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          <span
            className="pointer-events-none absolute left-0 right-0 top-[4.5rem] hidden border-t border-dashed border-signal/45 lg:block"
            aria-hidden="true"
          />
          {PROCESS.map((p, i) => (
            <li key={p.n} className="relative">
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-signal bg-paper">
                  <span className="u-num text-[11px] font-semibold text-signal">
                    {p.n}
                  </span>
                </span>
                <span className="u-label text-inksoft">Step {p.n}</span>
              </div>
              <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.025em]">
                {p.t}
              </h3>
              <p className="mt-2.5 max-w-[34ch] text-[14.5px] leading-[1.6] text-inksoft">
                {p.d}
              </p>
              {i < PROCESS.length - 1 && (
                <span
                  className="absolute -bottom-5 left-4 h-4 w-px bg-ink/20 lg:hidden"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
