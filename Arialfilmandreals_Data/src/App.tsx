import { PlanProvider } from "./theme";
import { Rail, Header, Hero } from "./sections/Hero";
import { Services, Work } from "./sections/Work";
import { Library } from "./sections/Library";

import { Kit, Process } from "./sections/Kit";
import { Rates, Faq } from "./sections/Rates";
import { Contact, Footer } from "./sections/Contact";

export default function App() {
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
        <Header />
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
    </div>
    </PlanProvider>
  );
}
