import type {
  ApiAgent,
  ApiSkill,
  ApiTask,
  ApiTeam,
  CreateAgentPayload,
  CreateSkillPayload,
  CreateTaskPayload,
  CreateTeamPayload,
  DashboardStats
} from "../types/runtime";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let detail: unknown = null;

    try {
      detail = await response.json();
    } catch {
      detail = await response.text();
    }

    throw new ApiError("请求后端接口失败", response.status, detail);
  }

  return (await response.json()) as T;
}

export function listTasks() {
  return request<ApiTask[]>("/tasks");
}

export function createTask(payload: CreateTaskPayload) {
  return request<ApiTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function runTask(taskId: string) {
  return request<ApiTask>(`/tasks/${taskId}/run`, {
    method: "POST"
  });
}

export function listAgents() {
  return request<ApiAgent[]>("/agents");
}

export function createAgent(payload: CreateAgentPayload) {
  return request<ApiAgent>("/agents", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listTeams() {
  return request<ApiTeam[]>("/teams");
}

export function createTeam(payload: CreateTeamPayload) {
  return request<ApiTeam>("/teams", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listSkills() {
  return request<ApiSkill[]>("/skills");
}

export function createSkill(payload: CreateSkillPayload) {
  return request<ApiSkill>("/skills", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getDashboardStats() {
  return request<DashboardStats>("/dashboard/stats");
}
