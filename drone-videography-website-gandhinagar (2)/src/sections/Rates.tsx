import { RATES, FAQ } from "../data";
import { Reveal, SectionHead } from "../ui";

/* ---------------------------------------------------------------- */
/* Rates — printed price sheet with dotted leaders                    */
/* ---------------------------------------------------------------- */

export function Rates() {
  return (
    <section id="rates" className="bg-plate px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 06"
        kicker="Rate card · 2026"
        title="What it"
        voice="costs."
        right="Every plan under ₹10,000 · GST extra where applicable"
      />

      <div className="mt-12 border-t border-ink/30">
        {RATES.map((r, i) => (
          <Reveal key={r.code} delay={i * 0.05}>
            <article
              className={`relative border-b border-ink/20 px-1 py-9 transition-colors sm:px-4 ${
                r.featured
                  ? "border-l-2 border-l-signal bg-paper"
                  : "hover:bg-paper/55"
              }`}
            >
              {r.featured && (
                <div className="u-label absolute right-3 top-3 border border-signal px-2 py-1 text-signal sm:right-5">
                  Most booked
                </div>
              )}

              <div className="grid gap-7 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,11rem)] lg:gap-10">
                <div>
                  <div className="u-label text-signal">Plan {r.code}</div>
                  <h3 className="u-display mt-3 text-[clamp(1.75rem,3.6vw,2.35rem)]">
                    {r.name}
                  </h3>
                  <p className="u-label mt-3 max-w-[26ch] leading-[1.7] text-inksoft">
                    {r.note}
                  </p>
                </div>

                <ul className="space-y-2.5">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-3 text-[14.5px] leading-[1.55]">
                      <span className="mt-[2px] text-signal" aria-hidden="true">
                        ✳
                      </span>
                      <span className="text-ink/85">{it}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-baseline gap-2 lg:flex-col lg:items-end lg:gap-1">
                  <span className="u-label whitespace-nowrap text-inksoft lg:order-2">
                    onwards · all-in
                  </span>
                  <span className="u-leader lg:hidden" />
                  <span className="u-num whitespace-nowrap text-[clamp(1.9rem,4.2vw,2.55rem)] font-medium leading-none lg:order-1">
                    ₹{r.price}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="u-label text-inksoft">
            50% advance confirms the date · balance on delivery
          </p>
          <p className="u-label text-inksoft">
            Travel within 25 km of Gandhinagar included
          </p>
          <p className="u-label text-inksoft">Rush delivery same day: +30%</p>
          <a
            href="#contact"
            className="u-label-lg ml-auto flex items-center gap-2 border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
          >
            Get a quote <span aria-hidden="true">→</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* FAQ / drone rules                                                  */
/* ---------------------------------------------------------------- */

export function Faq() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 07"
        kicker="Permissions, weather, turnaround"
        title="Straight"
        voice="answers."
        right="DGCA Drone Rules 2021 · as applied in Gandhinagar"
      />

      <div className="mt-12 grid gap-x-14 gap-y-0 lg:grid-cols-2">
        {FAQ.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <details className="group border-t border-ink/20 py-5">
              <summary className="flex cursor-pointer list-none items-start gap-4 [&::-webkit-details-marker]:hidden">
                <span className="u-num mt-[3px] text-[12px] text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex-1 text-[18px] font-semibold leading-[1.35] tracking-[-0.02em] sm:text-[20px]">
                  {f.q}
                </h3>
                <span
                  className="mt-[2px] text-lg text-ink/45 transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-[52ch] pl-9 text-[14.5px] leading-[1.7] text-inksoft">
                {f.a}
              </p>
            </details>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12">
        <div className="border border-signal/45 bg-signal/[0.07] p-6 sm:p-8">
          <div className="u-label text-signal">Airspace note</div>
          <p className="mt-3 max-w-3xl text-[15px] leading-[1.7] text-ink/85">
            Gandhinagar sits close to restricted airspace — Sachivalaya, defence
            land and the Ahmedabad approach corridor. Every flight is checked on
            the Digital Sky airspace map first, we fly within visual line of sight
            and well below the green-zone ceiling, and we will always tell you
            before the shoot if a location needs prior permission.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
