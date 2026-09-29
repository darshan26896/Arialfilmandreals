import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LIBRARY, FILTERS } from "../data";
import { Reveal, SectionHead } from "../ui";

export function Library() {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const items = useMemo(
    () =>
      filter === "all"
        ? LIBRARY
        : LIBRARY.filter((i) => i.tags.includes(filter)),
    [filter],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight")
        setOpen((o) => (o === null ? o : (o + 1) % items.length));
      if (e.key === "ArrowLeft")
        setOpen((o) => (o === null ? o : (o - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, items.length]);

  const current = open === null ? null : items[open];

  return (
    <section id="library" className="px-4 py-20 sm:px-7 sm:py-28">
      <SectionHead
        plate="Sheet 09"
        kicker="Sample library · photos & video"
        title="Press"
        voice="play."
        right="Tap any frame to open it · ← → to browse"
      />

      {/* filters */}
      <Reveal className="mt-10">
        <div className="flex flex-wrap items-center gap-2 border-y border-ink/20 py-4">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setOpen(null);
                }}
                className={`u-label border px-3.5 py-2.5 transition-colors ${
                  active
                    ? "border-signal bg-signal text-[#0B1013]"
                    : "border-ink/25 text-inksoft hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            );
          })}
          <span className="u-label ml-auto text-inksoft">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>
      </Reveal>

      {/* contact sheet */}
      {items.length === 0 ? (
        <div className="mt-10 border border-dashed border-ink/30 px-6 py-20 text-center">
          <div className="u-label text-signal">Empty roll</div>
          <p className="u-voice mt-4 text-[22px] leading-snug text-ink">
            Nothing filed under this heading yet.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="u-label mt-6 border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
          >
            Show everything
          </button>
        </div>
      ) : (
        <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpen(i)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden border border-ink/20 text-left"
            >
              <img
                src={item.img}
                alt={`${item.title} — ${item.place}`}
                loading="lazy"
                className={`w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05] ${item.ratio}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1013]/88 via-[#0B1013]/12 to-transparent" />

              <span className="u-label absolute left-3 top-3 flex items-center gap-1.5 bg-[#0B1013]/75 px-2 py-1.5 text-[#F2F6F7]">
                {item.kind === "video" ? (
                  <>
                    <span className="text-signal" aria-hidden="true">
                      ▶
                    </span>
                    {item.meta.split(" · ")[0]}
                  </>
                ) : (
                  <>
                    <span className="text-signal" aria-hidden="true">
                      ◈
                    </span>
                    Photo
                  </>
                )}
              </span>

              <span className="pointer-events-none absolute inset-x-0 bottom-0 block p-3">
                <span className="block text-[14px] font-semibold leading-tight text-[#F2F6F7]">
                  {item.title}
                </span>
                <span className="u-label mt-1 block text-[#F2F6F7]/70">
                  {item.place}
                </span>
              </span>

              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#F2F6F7]/60 text-[#F2F6F7] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {item.kind === "video" ? "▶" : "+"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0B1013]/96 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="u-label absolute right-4 top-4 z-10 border border-[#F2F6F7]/40 px-3 py-2 text-[#F2F6F7] transition-colors hover:bg-[#F2F6F7] hover:text-[#0B1013]"
            >
              Close · Esc
            </button>

            <motion.div
              className="w-full max-w-5xl"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center bg-black">
                {current.kind === "video" &&
                current.video &&
                !failed[current.id] ? (
                  <video
                    src={current.video}
                    poster={current.img}
                    controls
                    autoPlay
                    playsInline
                    onError={() =>
                      setFailed((f) => ({ ...f, [current.id]: true }))
                    }
                    className="max-h-[66vh] w-full object-contain"
                  />
                ) : (
                  <img
                    src={current.img}
                    alt={`${current.title} — ${current.place}`}
                    className="max-h-[66vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-[#F2F6F7]/20 px-1 pt-4">
                <div>
                  <div className="u-label text-signal">
                    {current.id} ·{" "}
                    {current.kind === "video" ? "Video sample" : "Photo sample"}
                  </div>
                  <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-[#F2F6F7]">
                    {current.title}
                  </h3>
                  <div className="u-label mt-2 text-[#F2F6F7]/70">
                    {current.place} · {current.meta}
                  </div>
                  {failed[current.id] && (
                    <div className="u-label mt-3 text-signal">
                      Poster frame shown — full clip available on request
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpen((o) =>
                        o === null ? o : (o - 1 + items.length) % items.length,
                      )
                    }
                    className="u-label border border-[#F2F6F7]/40 px-4 py-2.5 text-[#F2F6F7] transition-colors hover:bg-[#F2F6F7] hover:text-[#0B1013]"
                  >
                    ← Prev
                  </button>
                  <span className="u-num text-[11px] text-[#F2F6F7]/60">
                    {(open ?? 0) + 1} / {items.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOpen((o) => (o === null ? o : (o + 1) % items.length))
                    }
                    className="u-label border border-[#F2F6F7]/40 px-4 py-2.5 text-[#F2F6F7] transition-colors hover:bg-[#F2F6F7] hover:text-[#0B1013]"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Reveal className="mt-12">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="u-label text-inksoft">
            Every frame here was flown or filmed by the studio · Gandhinagar &
            25 km around
          </p>
          <a
            href="#contact"
            className="u-label-lg ml-auto flex items-center gap-2 border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
          >
            Book something like this <span aria-hidden="true">→</span>
          </a>
        </div>
      </Reveal>
    </section>
  );
}
