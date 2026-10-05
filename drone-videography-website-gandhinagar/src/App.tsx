import { useEffect, useState } from "react";
import { PlanProvider } from "./theme";
import { Rail, Header, Hero } from "./sections/Hero";
import { Services, Work } from "./sections/Work";
import { Library } from "./sections/Library";
import { AdminView } from "./sections/Admin";
import { Kit, Process } from "./sections/Kit";
import { Rates, Faq } from "./sections/Rates";
import { Contact, Footer } from "./sections/Contact";

export default function App() {
  const [adminOpen, setAdminOpen] = useState(false);

  /* the admin page lives at #admin, so it can be bookmarked */
  useEffect(() => {
    const sync = () => setAdminOpen(window.location.hash === "#admin");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const openAdmin = () => {
    window.location.hash = "#admin";
    setAdminOpen(true);
  };

  const closeAdmin = () => {
    setAdminOpen(false);
    if (window.location.hash === "#admin") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  return (
    <PlanProvider>
      <div className="min-h-screen bg-paper text-ink">
        {/* survey-paper tooth over the whole sheet */}
        <div
          aria-hidden="true"
          className="u-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.28] mix-blend-multiply"
        />
        <Rail />
        <div className="xl:pl-[52px]">
          <Header onOpenAdmin={openAdmin} />
          <main>
            <Hero />
            <Services />
            <Work />
            <Library />
            <Kit />
            <Process />
            <Rates />
            <Faq />
            <Contact />
          </main>
          <Footer />
        </div>

        <AdminView open={adminOpen} onClose={closeAdmin} />
      </div>
    </PlanProvider>
  );
}
