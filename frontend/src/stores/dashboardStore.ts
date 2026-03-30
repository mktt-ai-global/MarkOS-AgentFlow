import { create } from "zustand";
import {
  AGENT_CARDS,
  AGENT_SKILLS,
  DELIVERABLES,
  NAV_ITEMS,
  ORCHESTRATOR_METRICS,
  PROFILE_STATS,
  SUCCESS_RATES,
  TASK_FLOW_BARS,
  TASK_FLOW_ITEMS,
  THROUGHPUT_BARS
} from "../data/dashboard";

export type SuccessRateRange = "本周" | "本月";

export type DashboardStoreState = {
  searchQuery: string;
  successRateRange: SuccessRateRange;
  navItems: typeof NAV_ITEMS;
  agentCards: typeof AGENT_CARDS;
  profileStats: typeof PROFILE_STATS;
  taskFlowBars: typeof TASK_FLOW_BARS;
  taskFlowItems: typeof TASK_FLOW_ITEMS;
  successRates: typeof SUCCESS_RATES;
  deliverables: typeof DELIVERABLES;
  agentSkills: typeof AGENT_SKILLS;
  orchestratorMetrics: typeof ORCHESTRATOR_METRICS;
  throughputBars: typeof THROUGHPUT_BARS;
  setSearchQuery: (value: string) => void;
  setSuccessRateRange: (value: SuccessRateRange) => void;
};

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  searchQuery: "",
  successRateRange: "本周",
  navItems: NAV_ITEMS,
  agentCards: AGENT_CARDS,
  profileStats: PROFILE_STATS,
  taskFlowBars: TASK_FLOW_BARS,
  taskFlowItems: TASK_FLOW_ITEMS,
  successRates: SUCCESS_RATES,
  deliverables: DELIVERABLES,
  agentSkills: AGENT_SKILLS,
  orchestratorMetrics: ORCHESTRATOR_METRICS,
  throughputBars: THROUGHPUT_BARS,
  setSearchQuery: (value) => set({ searchQuery: value }),
  setSuccessRateRange: (value) => set({ successRateRange: value })
}));
