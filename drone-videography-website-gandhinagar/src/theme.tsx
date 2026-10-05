import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Plan = "plan-a" | "plan-b";

type PlanValue = { plan: Plan; setPlan: (p: Plan) => void };

const PlanCtx = createContext<PlanValue>({
  plan: "plan-b",
  setPlan: () => {},
});

export const usePlan = () => useContext(PlanCtx);

/**
 * Switches the whole sheet between two art directions:
 *  plan-a — "Sheet"  · survey-plate paper, chart annotation
 *  plan-b — "Cinema" · camera-body graphite, drone OSD (default)
 */
export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>("plan-b");

  useEffect(() => {
    document.documentElement.dataset.plan = plan;
  }, [plan]);

  return (
    <PlanCtx.Provider value={{ plan, setPlan }}>{children}</PlanCtx.Provider>
  );
}
