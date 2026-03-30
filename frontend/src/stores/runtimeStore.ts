import { create } from "zustand";
import { ApiError } from "../services/api";
import {
  createAgent as createAgentRequest,
  createSkill as createSkillRequest,
  createTask as createTaskRequest,
  createTeam as createTeamRequest,
  getDashboardStats,
  listAgents,
  listSkills,
  listTasks,
  listTeams,
  runTask as runTaskRequest
} from "../services/api";
import {
  connectWorkspaceSocket,
  type WorkspaceSocketConnection
} from "../services/ws";
import type {
  ApiAgent,
  ApiSkill,
  ApiTask,
  ApiTeam,
  CreateAgentPayload,
  CreateSkillPayload,
  CreateTaskPayload,
  CreateTeamPayload,
  DashboardStats,
  WorkspaceRealtimeMessage
} from "../types/runtime";

let workspaceSocket: WorkspaceSocketConnection | null = null;
let reconnectTimer: number | null = null;
let reconnectEnabled = true;

type RuntimeStoreState = {
  tasks: ApiTask[];
  agents: ApiAgent[];
  teams: ApiTeam[];
  skills: ApiSkill[];
  dashboardStats: DashboardStats | null;
  hasLoadedRemote: boolean;
  isRefreshing: boolean;
  isRealtimeConnected: boolean;
  lastRealtimeAt: string;
  loadError: string;
  isTaskComposerOpen: boolean;
  isCreatingTask: boolean;
  createTaskError: string;
  isCreatingAgent: boolean;
  createAgentError: string;
  isCreatingTeam: boolean;
  createTeamError: string;
  isCreatingSkill: boolean;
  createSkillError: string;
  runningTaskIds: string[];
  taskActionError: string;
  loadWorkspaceData: () => Promise<void>;
  connectRealtime: () => void;
  disconnectRealtime: () => void;
  openTaskComposer: () => void;
  closeTaskComposer: () => void;
  createTask: (payload: CreateTaskPayload) => Promise<boolean>;
  createAgent: (payload: CreateAgentPayload) => Promise<boolean>;
  createTeam: (payload: CreateTeamPayload) => Promise<boolean>;
  createSkill: (payload: CreateSkillPayload) => Promise<boolean>;
  runTask: (taskId: string) => Promise<boolean>;
  clearTaskActionError: () => void;
  clearRuntimeState: () => void;
};

const LOAD_ERROR_MESSAGE = "后端暂时未连接，当前显示静态演示数据。";
const CREATE_ERROR_MESSAGE = "创建任务失败，请确认后端服务已启动。";
const CREATE_AGENT_ERROR_MESSAGE = "创建 Agent 失败，请确认后端服务已启动。";
const CREATE_TEAM_ERROR_MESSAGE = "创建团队失败，请确认后端服务已启动。";
const CREATE_SKILL_ERROR_MESSAGE = "创建 Skill 失败，请确认后端服务已启动。";
const RUN_ERROR_MESSAGE = "任务执行失败，请确认依赖已完成且后端服务正常。";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (typeof error.detail === "string" && error.detail.trim()) {
      return error.detail;
    }

    if (
      error.detail &&
      typeof error.detail === "object" &&
      "detail" in error.detail &&
      typeof error.detail.detail === "string"
    ) {
      return error.detail.detail;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function applyWorkspaceSnapshot(
  set: (
    partial:
      | Partial<RuntimeStoreState>
      | ((state: RuntimeStoreState) => Partial<RuntimeStoreState>)
  ) => void,
  message: WorkspaceRealtimeMessage
) {
  set({
    tasks: message.payload.tasks,
    agents: message.payload.agents,
    teams: message.payload.teams,
    skills: message.payload.skills,
    dashboardStats: message.payload.dashboard_stats,
    hasLoadedRemote: true,
    isRefreshing: false,
    isRealtimeConnected: true,
    lastRealtimeAt: message.payload.emitted_at,
    loadError: ""
  });
}

export const useRuntimeStore = create<RuntimeStoreState>((set, get) => ({
  tasks: [],
  agents: [],
  teams: [],
  skills: [],
  dashboardStats: null,
  hasLoadedRemote: false,
  isRefreshing: false,
  isRealtimeConnected: false,
  lastRealtimeAt: "",
  loadError: "",
  isTaskComposerOpen: false,
  isCreatingTask: false,
  createTaskError: "",
  isCreatingAgent: false,
  createAgentError: "",
  isCreatingTeam: false,
  createTeamError: "",
  isCreatingSkill: false,
  createSkillError: "",
  runningTaskIds: [],
  taskActionError: "",
  loadWorkspaceData: async () => {
    set({ isRefreshing: true, loadError: "" });

    try {
      const [tasks, agents, teams, skills, dashboardStats] = await Promise.all([
        listTasks(),
        listAgents(),
        listTeams(),
        listSkills(),
        getDashboardStats()
      ]);

      set({
        tasks,
        agents,
        teams,
        skills,
        dashboardStats,
        hasLoadedRemote: true,
        isRefreshing: false,
        loadError: ""
      });
    } catch (error) {
      set((state) => ({
        isRefreshing: false,
        loadError: getApiErrorMessage(error, LOAD_ERROR_MESSAGE),
        hasLoadedRemote: state.hasLoadedRemote
      }));
    }
  },
  connectRealtime: () => {
    if (typeof window === "undefined" || workspaceSocket) {
      return;
    }

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    reconnectEnabled = true;
    workspaceSocket = connectWorkspaceSocket({
      onOpen: () => {
        set({ isRealtimeConnected: true, loadError: "" });
      },
      onSnapshot: (message) => {
        applyWorkspaceSnapshot(set, message);
      },
      onClose: () => {
        workspaceSocket = null;
        set({ isRealtimeConnected: false });

        if (!reconnectEnabled || !get().hasLoadedRemote) {
          return;
        }

        reconnectTimer = window.setTimeout(() => {
          reconnectTimer = null;
          get().connectRealtime();
        }, 1400);
      },
      onError: () => {
        set({ isRealtimeConnected: false });
      }
    });
  },
  disconnectRealtime: () => {
    reconnectEnabled = false;

    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    workspaceSocket?.close();
    workspaceSocket = null;
    set({ isRealtimeConnected: false });
  },
  openTaskComposer: () => set({ isTaskComposerOpen: true, createTaskError: "" }),
  closeTaskComposer: () =>
    set({ isTaskComposerOpen: false, isCreatingTask: false, createTaskError: "" }),
  createTask: async (payload) => {
    set({ isCreatingTask: true, createTaskError: "" });

    try {
      await createTaskRequest(payload);
      await get().loadWorkspaceData();
      set({
        isTaskComposerOpen: false,
        isCreatingTask: false,
        createTaskError: ""
      });
      return true;
    } catch (error) {
      set({
        isCreatingTask: false,
        createTaskError: getApiErrorMessage(error, CREATE_ERROR_MESSAGE)
      });
      return false;
    }
  },
  createAgent: async (payload) => {
    set({ isCreatingAgent: true, createAgentError: "" });

    try {
      await createAgentRequest(payload);
      await get().loadWorkspaceData();
      set({
        isCreatingAgent: false,
        createAgentError: ""
      });
      return true;
    } catch (error) {
      set({
        isCreatingAgent: false,
        createAgentError: getApiErrorMessage(error, CREATE_AGENT_ERROR_MESSAGE)
      });
      return false;
    }
  },
  createTeam: async (payload) => {
    set({ isCreatingTeam: true, createTeamError: "" });

    try {
      await createTeamRequest(payload);
      await get().loadWorkspaceData();
      set({
        isCreatingTeam: false,
        createTeamError: ""
      });
      return true;
    } catch (error) {
      set({
        isCreatingTeam: false,
        createTeamError: getApiErrorMessage(error, CREATE_TEAM_ERROR_MESSAGE)
      });
      return false;
    }
  },
  createSkill: async (payload) => {
    set({ isCreatingSkill: true, createSkillError: "" });

    try {
      await createSkillRequest(payload);
      await get().loadWorkspaceData();
      set({
        isCreatingSkill: false,
        createSkillError: ""
      });
      return true;
    } catch (error) {
      set({
        isCreatingSkill: false,
        createSkillError: getApiErrorMessage(error, CREATE_SKILL_ERROR_MESSAGE)
      });
      return false;
    }
  },
  runTask: async (taskId) => {
    set((state) => ({
      runningTaskIds: [...state.runningTaskIds, taskId],
      taskActionError: ""
    }));

    try {
      await runTaskRequest(taskId);
      await get().loadWorkspaceData();
      set((state) => ({
        runningTaskIds: state.runningTaskIds.filter((id) => id !== taskId),
        taskActionError: ""
      }));
      return true;
    } catch (error) {
      set((state) => ({
        runningTaskIds: state.runningTaskIds.filter((id) => id !== taskId),
        taskActionError: getApiErrorMessage(error, RUN_ERROR_MESSAGE)
      }));
      return false;
    }
  },
  clearTaskActionError: () => set({ taskActionError: "" }),
  clearRuntimeState: () => {
    reconnectEnabled = false;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    workspaceSocket?.close();
    workspaceSocket = null;

    set({
      tasks: [],
      agents: [],
      teams: [],
      skills: [],
      dashboardStats: null,
      hasLoadedRemote: false,
      isRefreshing: false,
      isRealtimeConnected: false,
      lastRealtimeAt: "",
      loadError: "",
      isTaskComposerOpen: false,
      isCreatingTask: false,
      createTaskError: "",
      isCreatingAgent: false,
      createAgentError: "",
      isCreatingTeam: false,
      createTeamError: "",
      isCreatingSkill: false,
      createSkillError: "",
      runningTaskIds: [],
      taskActionError: ""
    });
  }
}));
