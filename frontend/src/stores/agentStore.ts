import { create } from 'zustand';
import { Agent } from '../types';

interface AgentState {
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),
}));
