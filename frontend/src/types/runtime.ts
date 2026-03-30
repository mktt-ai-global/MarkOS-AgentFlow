export type ApiTaskStatus =
  | "PENDING"
  | "RUNNING"
  | "DONE"
  | "BLOCKED"
  | "FAILED"
  | "SKIPPED";

export type ApiAgentRole = "PM" | "DEV" | "QA";
export type ApiAgentStatus = "ONLINE" | "IDLE" | "OFFLINE";

export type ApiTask = {
  id: string;
  title: string;
  description: string;
  assigned_agent: string;
  status: ApiTaskStatus;
  depends_on: string[];
  handoff_context: Record<string, unknown>;
  output: Record<string, unknown>;
  token_used: number;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiAgent = {
  id: string;
  name: string;
  role: ApiAgentRole;
  skills: string[];
  team_ids: string[];
  team_names: string[];
  system_prompt: string;
  model: string;
  max_tokens: number;
  status: ApiAgentStatus;
  created_at: string;
  updated_at: string;
};

export type ApiTeam = {
  id: string;
  name: string;
  focus: string;
  description: string;
  color: string;
  agent_ids: string[];
  agent_names: string[];
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type ApiSkill = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  prompt_hint: string;
  is_core: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type DashboardTaskSummary = {
  total: number;
  pending: number;
  running: number;
  done: number;
  blocked: number;
  failed: number;
  skipped: number;
  active: number;
  success_rate: number;
  total_tokens: number;
  total_retries: number;
  intervention_count: number;
};

export type DashboardAgentSummary = {
  total: number;
  online: number;
  idle: number;
  offline: number;
};

export type DashboardAgentRate = {
  role: string;
  label: string;
  total: number;
  done: number;
  running: number;
  blocked: number;
  success_rate: number;
};

export type DashboardRecentOutput = {
  task_id: string;
  task_title: string;
  output_key: string;
  summary: string;
  updated_at: string;
};

export type DashboardStats = {
  task_summary: DashboardTaskSummary;
  agent_summary: DashboardAgentSummary;
  tasks_by_agent: DashboardAgentRate[];
  activity_bars: number[];
  recent_tasks: ApiTask[];
  recent_outputs: DashboardRecentOutput[];
};

export type WorkspaceSnapshot = {
  emitted_at: string;
  tasks: ApiTask[];
  agents: ApiAgent[];
  teams: ApiTeam[];
  skills: ApiSkill[];
  dashboard_stats: DashboardStats;
};

export type WorkspaceRealtimeMessage = {
  type: "workspace.snapshot";
  payload: WorkspaceSnapshot;
};

export type CreateTaskPayload = {
  title: string;
  description: string;
  assigned_agent: string;
  depends_on?: string[];
  handoff_context?: Record<string, unknown>;
  output?: Record<string, unknown>;
};

export type CreateAgentPayload = {
  name: string;
  role: ApiAgentRole;
  skills?: string[];
  team_ids?: string[];
  system_prompt?: string;
  model?: string;
  max_tokens?: number;
  status?: ApiAgentStatus;
};

export type CreateTeamPayload = {
  name: string;
  focus: string;
  description: string;
  color: string;
  agent_ids?: string[];
};

export type CreateSkillPayload = {
  name: string;
  category: string;
  description: string;
  prompt_hint?: string;
  is_core?: boolean;
};
