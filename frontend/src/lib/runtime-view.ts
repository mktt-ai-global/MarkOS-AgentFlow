import type {
  ApiAgent,
  ApiAgentRole,
  ApiAgentStatus,
  ApiSkill,
  ApiTask,
  ApiTeam,
  DashboardStats
} from "../types/runtime";

type MetricCard = {
  title: string;
  subtitle: string;
  icon: string;
  iconTone: string;
  tone: string;
  pill: string;
  pillTone: string;
  metric: string;
  metricLabel: string;
  metricSub: string;
};

type TaskFlowItem = {
  name: string;
  meta: string;
  agent: string;
  agentTone: string;
  time: string;
  state: string;
};

type AssignmentItem = {
  name: string;
  meta: string;
  badge: string;
  tone: string;
  time: string;
  state: string;
};

type BarItem = {
  height: number;
  tone: string;
};

type DeliverableItem = {
  icon: string;
  tone: string;
  name: string;
  meta: string;
  size: string;
  time: string;
  highlight: boolean;
};

type AgentSkillItem = {
  icon: string;
  tone: string;
  name: string;
  meta: string;
  status: string | null;
  statusTone: string;
  pulse: boolean;
  dashed?: boolean;
};

type MetricProgress = {
  label: string;
  value: string;
  width: string;
  color: string;
};

type TaskBoardColumn = {
  title: string;
  count: string;
  items: Array<{
    taskId?: string;
    name: string;
    meta: string;
    badge: string;
    tone: string;
    state: string;
    canRun?: boolean;
  }>;
};

type EscalationItem = {
  icon: string;
  tone: string;
  name: string;
  meta: string;
  owner: string;
  time: string;
  highlight: boolean;
};

type SummaryCard = {
  title: string;
  status: string;
  statusTone: string;
  pulse: boolean;
  value: string;
  unit: string;
  meta: string;
  width: string;
  color: string;
};

type TeamGuidanceItem = {
  title: string;
  description: string;
};

type TeamGroupItem = {
  name: string;
  focus: string;
  description: string;
  memberCount: string;
  members: string;
  tone: string;
};

type SkillLibraryItem = {
  name: string;
  category: string;
  description: string;
  usage: string;
  hint: string;
  tone: string;
  core: boolean;
};

export type DashboardView = {
  profileStats: { role: string; projects: string };
  agentCards: MetricCard[];
  taskFlowBars: BarItem[];
  taskFlowItems: TaskFlowItem[];
  successRates: Array<{ label: string; value: number; color: string }>;
  deliverables: DeliverableItem[];
  agentSkills: AgentSkillItem[];
  orchestratorMetrics: MetricProgress[];
  throughputBars: BarItem[];
  throughputValue: string;
  tokenValue: string;
  tokenMeta: string;
  tokenBarWidth: string;
};

export type TasksView = {
  taskCardStats: MetricCard[];
  boardColumns: TaskBoardColumn[];
  escalations: EscalationItem[];
  statusSummary: SummaryCard[];
  activeTasksValue: string;
};

export type TeamView = {
  teamCardStats: MetricCard[];
  roster: AgentSkillItem[];
  teamGroups: TeamGroupItem[];
  skillLibrary: SkillLibraryItem[];
  assignments: AssignmentItem[];
  skillCoverage: SummaryCard[];
  guidance: TeamGuidanceItem[];
  slotCount: string;
};

export type MessagesView = {
  threads: Array<{
    avatar: string;
    tone: string;
    title: string;
    preview: string;
    time: string;
    active: boolean;
  }>;
  messages: Array<{
    author: string;
    time: string;
    content: string;
    tone: "self" | "other" | "system";
  }>;
  summary: SummaryCard[];
};

const ROLE_META: Record<
  ApiAgentRole,
  {
    title: string;
    subtitle: string;
    icon: string;
    iconTone: string;
    tone: string;
    agentTone: string;
    accentColor: string;
  }
> = {
  PM: {
    title: "PM Agent",
    subtitle: "需求分析 · 任务分解",
    icon: "📋",
    iconTone: "b",
    tone: "bl",
    agentTone: "pm",
    accentColor: "var(--accent)"
  },
  DEV: {
    title: "Dev Agent",
    subtitle: "代码生成 · 单元测试",
    icon: "💻",
    iconTone: "g",
    tone: "gl",
    agentTone: "dev",
    accentColor: "var(--green)"
  },
  QA: {
    title: "QA Agent",
    subtitle: "测试覆盖 · 风险反馈",
    icon: "🔬",
    iconTone: "a",
    tone: "al",
    agentTone: "qa",
    accentColor: "var(--amber)"
  }
};

const STATUS_LABELS: Record<ApiAgentStatus, { label: string; pillTone: string; statusTone: string; pulse: boolean }> =
  {
    ONLINE: { label: "在线", pillTone: "up", statusTone: "on", pulse: true },
    IDLE: { label: "等待", pillTone: "blue", statusTone: "off", pulse: false },
    OFFLINE: { label: "离线", pillTone: "warn", statusTone: "off", pulse: false }
  };

function formatCompactNumber(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

function formatPercent(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(1)) : 0;
}

function formatRelativeTime(iso: string) {
  const timestamp = new Date(iso).getTime();
  if (Number.isNaN(timestamp)) {
    return "刚刚";
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 1) {
    return "刚刚";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  if (diffMinutes < 1440) {
    return `${Math.round(diffMinutes / 60)}h`;
  }

  return `${Math.round(diffMinutes / 1440)}d`;
}

function formatClock(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function scaleBars(values: number[]) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...safeValues, 1);
  const peakValue = Math.max(...safeValues);

  return safeValues.map((value, index) => {
    const height = Math.max(12, Math.round((value / maxValue) * 100));
    const tone = value === peakValue && peakValue > 0 ? "hi" : index === safeValues.length - 2 ? "mid" : "";

    return { height, tone };
  });
}

function mapTaskState(status: ApiTask["status"]) {
  switch (status) {
    case "DONE":
      return "done";
    case "RUNNING":
      return "run";
    case "BLOCKED":
    case "FAILED":
      return "blk";
    default:
      return "wait";
  }
}

function mapAssignedAgent(role: string) {
  const normalizedRole = role.toUpperCase();

  if (normalizedRole === "PM" || normalizedRole === "DEV" || normalizedRole === "QA") {
    const meta = ROLE_META[normalizedRole];
    return {
      label: normalizedRole === "DEV" ? "Dev" : normalizedRole,
      tone: meta.agentTone
    };
  }

  return {
    label: "Auto",
    tone: "pm"
  };
}

function mapThreadTone(role: ApiAgentRole) {
  if (role === "DEV") {
    return "tone-green";
  }

  if (role === "QA") {
    return "tone-amber";
  }

  return "tone-blue";
}

function mapTeamTone(color: string) {
  const normalized = color.trim().toLowerCase();

  if (normalized.includes("green")) {
    return "dev";
  }

  if (normalized.includes("amber") || normalized.includes("orange") || normalized.includes("gold")) {
    return "qa";
  }

  return "pm";
}

function mapSkillTone(category: string) {
  const normalized = category.trim().toLowerCase();

  if (normalized.includes("quality")) {
    return "a";
  }

  if (normalized.includes("engineer")) {
    return "g";
  }

  return "b";
}

function toWidth(value: number, total: number) {
  const percentage = total > 0 ? Math.max(8, Math.round((value / total) * 100)) : 8;
  return `${Math.min(100, percentage)}%`;
}

function summarizeTaskMeta(task: ApiTask) {
  const description = task.description.trim();
  if (description) {
    return description.length > 38 ? `${description.slice(0, 35)}...` : description;
  }

  return `依赖 ${task.depends_on.length} 项 · Token ${task.token_used}`;
}

function buildAgentCards(tasks: ApiTask[], agents: ApiAgent[]) {
  return (Object.keys(ROLE_META) as ApiAgentRole[]).map((role) => {
    const meta = ROLE_META[role];
    const roleTasks = tasks.filter((task) => task.assigned_agent.toUpperCase() === role);
    const doneCount = roleTasks.filter((task) => task.status === "DONE").length;
    const runningCount = roleTasks.filter((task) => task.status === "RUNNING").length;
    const blockedCount = roleTasks.filter(
      (task) => task.status === "BLOCKED" || task.status === "FAILED"
    ).length;
    const agent = agents.find((item) => item.role === role);
    const status = STATUS_LABELS[agent?.status ?? "IDLE"];

    return {
      title: meta.title,
      subtitle: meta.subtitle,
      icon: meta.icon,
      iconTone: meta.iconTone,
      tone: meta.tone,
      pill: status.label,
      pillTone: status.pillTone,
      metric: formatCompactNumber(roleTasks.length),
      metricLabel: "已分配任务",
      metricSub: `完成 ${doneCount} · 运行 ${runningCount} · 阻塞 ${blockedCount}`
    };
  });
}

function buildTaskFlowItems(tasks: ApiTask[]) {
  return tasks.slice(0, 5).map((task) => {
    const agent = mapAssignedAgent(task.assigned_agent);

    return {
      name: task.title,
      meta: summarizeTaskMeta(task),
      agent: agent.label,
      agentTone: agent.tone,
      time: formatRelativeTime(task.updated_at),
      state: mapTaskState(task.status)
    };
  });
}

function buildSuccessRates(stats: DashboardStats) {
  return stats.tasks_by_agent.map((item) => ({
    label: item.label,
    value: formatPercent(item.success_rate),
    color:
      item.role === "PM"
        ? "var(--accent)"
        : item.role === "DEV"
          ? "var(--green)"
          : "var(--amber)"
  }));
}

function buildDeliverables(stats: DashboardStats): DeliverableItem[] {
  return stats.recent_outputs.map((item) => ({
    icon: item.output_key.toLowerCase().includes("test")
      ? "🧪"
      : item.output_key.toLowerCase().includes("report")
        ? "📊"
        : "📄",
    tone: item.output_key.toLowerCase().includes("test") ? "a" : "b",
    name: item.output_key,
    meta: item.task_title,
    size: "实时",
    time: formatClock(item.updated_at),
    highlight: true
  }));
}

function buildAgentSkills(agents: ApiAgent[]) {
  const items: AgentSkillItem[] = agents.map((agent) => {
    const meta = ROLE_META[agent.role];
    const status = STATUS_LABELS[agent.status];

    return {
      icon: meta.icon,
      tone: meta.iconTone,
      name: agent.name,
      meta: agent.skills.join(" · ") || "未配置 skills",
      status: status.label,
      statusTone: status.statusTone,
      pulse: status.pulse,
      dashed: false
    };
  });

  items.push({
    icon: "+",
    tone: "",
    name: "添加新 Agent…",
    meta: "后续阶段接入配置与扩容",
    status: null,
    statusTone: "off",
    pulse: false,
    dashed: true
  });

  return items;
}

function buildOrchestratorMetrics(stats: DashboardStats): MetricProgress[] {
  const summary = stats.task_summary;

  return [
    {
      label: "已调度任务",
      value: String(summary.total),
      width: toWidth(summary.total, Math.max(summary.total, 1)),
      color: "var(--accent)"
    },
    {
      label: "成功率",
      value: `${formatPercent(summary.success_rate)}%`,
      width: `${Math.max(8, Math.round(summary.success_rate))}%`,
      color: "var(--green)"
    },
    {
      label: "失败重试",
      value: String(summary.total_retries),
      width: toWidth(summary.total_retries, Math.max(summary.total, 1)),
      color: "var(--amber)"
    },
    {
      label: "人工介入",
      value: String(summary.intervention_count),
      width: toWidth(summary.intervention_count, Math.max(summary.total, 1)),
      color: "var(--red)"
    }
  ];
}

export function buildDashboardView(
  tasks: ApiTask[],
  agents: ApiAgent[],
  stats: DashboardStats
): DashboardView {
  const activityBars = scaleBars(stats.activity_bars);
  const summary = stats.task_summary;

  return {
    profileStats: {
      role: "项目负责人",
      projects: String(summary.active)
    },
    agentCards: buildAgentCards(tasks, agents),
    taskFlowBars: activityBars,
    taskFlowItems: buildTaskFlowItems(stats.recent_tasks),
    successRates: buildSuccessRates(stats),
    deliverables: buildDeliverables(stats),
    agentSkills: buildAgentSkills(agents),
    orchestratorMetrics: buildOrchestratorMetrics(stats),
    throughputBars: activityBars,
    throughputValue: formatCompactNumber(summary.total),
    tokenValue: formatCompactNumber(summary.total_tokens),
    tokenMeta: `总计 Token · 重试 ${summary.total_retries} 次`,
    tokenBarWidth: `${Math.min(100, Math.max(8, Math.round(summary.success_rate)))}%`
  };
}

export function buildTasksView(tasks: ApiTask[], stats: DashboardStats): TasksView {
  const summary = stats.task_summary;
  const pendingItems = tasks
    .filter((task) => task.status === "PENDING" || task.status === "SKIPPED")
    .slice(0, 6);
  const runningItems = tasks.filter((task) => task.status === "RUNNING").slice(0, 6);
  const blockedItems = tasks
    .filter((task) => task.status === "BLOCKED" || task.status === "FAILED")
    .slice(0, 6);

  return {
    taskCardStats: [
      {
        title: "等待执行",
        subtitle: "队列深度 · 顺序调度",
        icon: "📥",
        iconTone: "b",
        tone: "bl",
        pill: "正常",
        pillTone: "up",
        metric: String(summary.pending),
        metricLabel: "待触发任务",
        metricSub: `总任务 ${summary.total} · 跳过 ${summary.skipped}`
      },
      {
        title: "正在执行",
        subtitle: "活跃链路 · 实时更新",
        icon: "⚙️",
        iconTone: "g",
        tone: "gl",
        pill: `${summary.running} 运行中`,
        pillTone: "blue",
        metric: summary.running.toString().padStart(2, "0"),
        metricLabel: "当前执行链",
        metricSub: `活跃任务 ${summary.active} · 成功率 ${formatPercent(summary.success_rate)}%`
      },
      {
        title: "阻塞任务",
        subtitle: "异常流转 · 人工介入",
        icon: "🚧",
        iconTone: "a",
        tone: "al",
        pill: summary.intervention_count ? "需处理" : "稳定",
        pillTone: summary.intervention_count ? "warn" : "up",
        metric: String(summary.blocked + summary.failed).padStart(2, "0"),
        metricLabel: "待解除阻塞",
        metricSub: `失败 ${summary.failed} · 阻塞 ${summary.blocked}`
      }
    ],
    boardColumns: [
      {
        title: "待排队",
        count: `${pendingItems.length} 项`,
        items: pendingItems.map((task) => {
          const agent = mapAssignedAgent(task.assigned_agent);
          const assigned = task.assigned_agent.toUpperCase();
          return {
            taskId: task.id,
            name: task.title,
            meta: summarizeTaskMeta(task),
            badge: agent.label,
            tone: agent.tone,
            state: mapTaskState(task.status),
            canRun: ["AUTO", "PM", "DEV", "QA"].includes(assigned)
          };
        })
      },
      {
        title: "执行中",
        count: `${runningItems.length} 项`,
        items: runningItems.map((task) => {
          const agent = mapAssignedAgent(task.assigned_agent);
          return {
            taskId: task.id,
            name: task.title,
            meta: summarizeTaskMeta(task),
            badge: agent.label,
            tone: agent.tone,
            state: "run",
            canRun: false
          };
        })
      },
      {
        title: "阻塞 / 介入",
        count: `${blockedItems.length} 项`,
        items: blockedItems.map((task) => {
          const agent = mapAssignedAgent(task.assigned_agent);
          const assigned = task.assigned_agent.toUpperCase();
          return {
            taskId: task.id,
            name: task.title,
            meta: summarizeTaskMeta(task),
            badge: agent.label,
            tone: agent.tone,
            state: "blk",
            canRun: ["AUTO", "PM", "DEV", "QA"].includes(assigned)
          };
        })
      }
    ],
    escalations: blockedItems.map((task) => ({
      icon: task.status === "FAILED" ? "🧪" : "🛠",
      tone: task.status === "FAILED" ? "g" : "a",
      name: task.title,
      meta: summarizeTaskMeta(task),
      owner: mapAssignedAgent(task.assigned_agent).label,
      time: formatRelativeTime(task.updated_at),
      highlight: true
    })),
    statusSummary: [
      {
        title: "链路健康度",
        status: summary.success_rate >= 80 ? "稳定" : "波动",
        statusTone: summary.success_rate >= 80 ? "on" : "off",
        pulse: summary.running > 0,
        value: String(formatPercent(summary.success_rate)),
        unit: "%",
        meta: `完成 ${summary.done} / 有效任务 ${Math.max(summary.total - summary.skipped, 0)}`,
        width: `${Math.max(8, Math.round(summary.success_rate))}%`,
        color: "var(--green)"
      },
      {
        title: "介入密度",
        status: summary.intervention_count > 0 ? "偏高" : "平稳",
        statusTone: summary.intervention_count > 0 ? "off" : "on",
        pulse: summary.intervention_count > 0,
        value: String(summary.intervention_count),
        unit: " 次",
        meta: `失败 ${summary.failed} · 阻塞 ${summary.blocked}`,
        width: toWidth(summary.intervention_count, Math.max(summary.total, 1)),
        color: "var(--amber)"
      }
    ],
    activeTasksValue: String(summary.active)
  };
}

function buildMessageContent(task: ApiTask) {
  if (task.status === "DONE") {
    return `《${task.title}》已完成当前阶段，交付物与 handoff 已归档。`;
  }

  if (task.status === "RUNNING") {
    return `《${task.title}》正在执行中，已接收上游 handoff 并推进主链路。`;
  }

  if (task.status === "BLOCKED" || task.status === "FAILED") {
    return `《${task.title}》进入阻塞态，建议优先检查依赖、产物和人工介入说明。`;
  }

  return `《${task.title}》已进入任务队列，等待依赖完成后继续执行。`;
}

export function buildMessagesView(tasks: ApiTask[], stats: DashboardStats): MessagesView {
  const recentTasks = stats.recent_tasks;
  const roleOrder: ApiAgentRole[] = ["QA", "DEV", "PM"];
  const threads = roleOrder.map((role, index) => {
    const latestTask = recentTasks.find((task) => task.assigned_agent.toUpperCase() === role);
    const title =
      role === "QA" ? "QA 阻塞同步" : role === "DEV" ? "Dev 输出归档" : "PM 验收清单";

    return {
      avatar: role === "QA" ? "Q" : role === "DEV" ? "D" : "P",
      tone: mapThreadTone(role),
      title,
      preview: latestTask ? buildMessageContent(latestTask) : `${role} 当前没有新的链路更新。`,
      time: latestTask ? formatRelativeTime(latestTask.updated_at) : "刚刚",
      active: index === 0
    };
  });

  const taskMessages = recentTasks.map((task) => ({
    updatedAt: task.updated_at,
    author: `${mapAssignedAgent(task.assigned_agent).label} Agent`,
    time: formatClock(task.updated_at),
    content: buildMessageContent(task),
    tone:
      task.status === "RUNNING"
        ? ("self" as const)
        : task.status === "BLOCKED" || task.status === "FAILED"
          ? ("system" as const)
          : ("other" as const)
  }));
  const outputMessages = stats.recent_outputs.map((output) => {
    const task = tasks.find((item) => item.id === output.task_id);
    return {
      updatedAt: output.updated_at,
      author: `${mapAssignedAgent(task?.assigned_agent ?? "AUTO").label} Agent`,
      time: formatClock(output.updated_at),
      content: `已写入 ${output.output_key}，${output.summary}`,
      tone: "other" as const
    };
  });

  const messages = [...taskMessages, ...outputMessages]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 6)
    .map((message) => ({
      author: message.author,
      time: message.time,
      content: message.content,
      tone: message.tone
    }));

  const unreadCount = messages.filter((message) => message.tone !== "other").length;
  const activeThreads = threads.filter((thread) => thread.preview).length;

  return {
    threads,
    messages,
    summary: [
      {
        title: "未读消息",
        status: unreadCount > 0 ? "提醒中" : "稳定",
        statusTone: unreadCount > 0 ? "off" : "on",
        pulse: unreadCount > 0,
        value: String(unreadCount),
        unit: " 条",
        meta: `最近消息 ${messages.length} 条 · 当前线程 ${activeThreads} 个`,
        width: toWidth(unreadCount, Math.max(messages.length, 1)),
        color: unreadCount > 0 ? "var(--amber)" : "var(--green)"
      },
      {
        title: "线程活跃度",
        status: stats.task_summary.running > 0 ? "在线" : "平稳",
        statusTone: stats.task_summary.running > 0 ? "on" : "off",
        pulse: stats.task_summary.running > 0,
        value: String(messages.length),
        unit: " /h",
        meta: "根据最近任务状态与产物更新时间聚合",
        width: toWidth(messages.length, 8),
        color: "var(--accent)"
      }
    ]
  };
}

export function buildTeamView(
  tasks: ApiTask[],
  agents: ApiAgent[],
  teams: ApiTeam[],
  skills: ApiSkill[],
  stats: DashboardStats
): TeamView {
  const summary = stats.task_summary;
  const devLoad = stats.tasks_by_agent.find((item) => item.role === "DEV")?.total ?? 0;
  const loadPeak = summary.total ? Math.round((devLoad / summary.total) * 100) : 0;
  const roleCoverage = Math.round((new Set(agents.map((agent) => agent.role)).size / 3) * 100);
  const activeTeams = teams.filter((team) => team.member_count > 0).length;
  const coreSkills = skills.filter((skill) => skill.is_core).length;
  const averageSkillReuse = skills.length
    ? Math.round(skills.reduce((sum, skill) => sum + skill.usage_count, 0) / skills.length)
    : 0;

  return {
    teamCardStats: [
      {
        title: "在线成员",
        subtitle: "角色槽位 · 当前状态",
        icon: "👥",
        iconTone: "b",
        tone: "bl",
        pill: `${stats.agent_summary.online} 在线`,
        pillTone: "up",
        metric: stats.agent_summary.online.toString().padStart(2, "0"),
        metricLabel: "当前工作中",
        metricSub: `总成员 ${stats.agent_summary.total} · 空闲 ${stats.agent_summary.idle}`
      },
      {
        title: "团队编组",
        subtitle: "分组视图 · 协作边界",
        icon: "🧩",
        iconTone: "g",
        tone: "gl",
        pill: activeTeams > 0 ? "已成型" : "待创建",
        pillTone: activeTeams > 0 ? "blue" : "warn",
        metric: String(teams.length).padStart(2, "0"),
        metricLabel: "当前团队数",
        metricSub: `活跃团队 ${activeTeams} · 角色覆盖 ${roleCoverage}%`
      },
      {
        title: "Skills 库",
        subtitle: "技能目录 · 复用密度",
        icon: "🗂",
        iconTone: "a",
        tone: "al",
        pill: skills.length >= 6 ? "可复用" : "待扩充",
        pillTone: skills.length >= 6 ? "up" : "warn",
        metric: String(skills.length).padStart(2, "0"),
        metricLabel: "已录入 Skills",
        metricSub: `核心 ${coreSkills} · 平均复用 ${averageSkillReuse} 次`
      }
    ],
    roster: agents.map((agent) => {
      const meta = ROLE_META[agent.role];
      const status = STATUS_LABELS[agent.status];
      const teamMeta = agent.team_names.length ? ` · 团队：${agent.team_names.join(" / ")}` : "";
      return {
        icon: meta.icon,
        tone: meta.iconTone,
        name: agent.name,
        meta: `${agent.skills.join(" · ") || meta.subtitle}${teamMeta}`,
        status: status.label,
        statusTone: status.statusTone,
        pulse: status.pulse,
        dashed: false
      };
    }),
    teamGroups: teams.map((team) => ({
      name: team.name,
      focus: team.focus || "未填写焦点说明",
      description: team.description || "当前团队还没有补充描述。",
      memberCount: `${team.member_count} 人`,
      members: team.agent_names.join(" · ") || "暂未分配成员",
      tone: mapTeamTone(team.color)
    })),
    skillLibrary: skills
      .slice()
      .sort((left, right) => {
        if (left.is_core !== right.is_core) {
          return left.is_core ? -1 : 1;
        }

        if (left.usage_count !== right.usage_count) {
          return right.usage_count - left.usage_count;
        }

        return left.name.localeCompare(right.name, "zh-CN");
      })
      .map((skill) => ({
        name: skill.name,
        category: skill.category,
        description: skill.description || "当前 Skill 还没有补充描述。",
        usage: `${skill.usage_count} Agent 使用`,
        hint: skill.prompt_hint || "未提供 prompt hint",
        tone: mapSkillTone(skill.category),
        core: skill.is_core
      })),
    assignments: stats.recent_tasks.map((task) => {
      const agent = mapAssignedAgent(task.assigned_agent);
      return {
        name: task.title,
        meta: summarizeTaskMeta(task),
        badge: agent.label,
        agent: agent.label,
        agentTone: agent.tone,
        tone: agent.tone,
        time: formatRelativeTime(task.updated_at),
        state: mapTaskState(task.status)
      };
    }),
    skillCoverage: [
      {
        title: "核心技能覆盖",
        status: skills.length >= 6 ? "已满足" : "待补强",
        statusTone: skills.length >= 6 ? "on" : "off",
        pulse: skills.length < 6,
        value: String(skills.length),
        unit: " 项",
        meta: `核心 ${coreSkills} · 平均复用 ${averageSkillReuse} 次`,
        width: `${Math.min(100, Math.max(8, skills.length * 10))}%`,
        color: "var(--accent)"
      },
      {
        title: "团队覆盖度",
        status: roleCoverage >= 100 ? "完整" : "需补位",
        statusTone: roleCoverage >= 100 ? "on" : "off",
        pulse: roleCoverage < 100,
        value: String(teams.length),
        unit: " 组",
        meta: `角色覆盖 ${roleCoverage}% · Dev 峰值 ${loadPeak}%`,
        width: `${Math.max(8, roleCoverage)}%`,
        color: "var(--green)"
      }
    ],
    guidance: [
      {
        title: teams.length > 1 ? "团队拆分已经开始成型。" : "可以开始建立更多专门团队。",
        description:
          teams.length > 1
            ? "建议按产品、实现、测试或专项风险继续细分团队，降低单队列拥堵。"
            : "当前更适合先把默认交付团队之外的专项团队补出来，例如审阅、增长或回归小组。"
      },
      {
        title: skills.length >= 6 ? "Skills 库已经有了基础规模。" : "Skills 库还可以继续扩充。",
        description:
          skills.length >= 6
            ? "下一步建议把高频技能继续整理成更明确的类别，方便复用和团队分配。"
            : "建议先补充 code-review、observability、security 等复用度高的 skills。"
      },
      {
        title: summary.intervention_count > 0 ? "阻塞任务仍在影响团队吞吐。" : "当前团队协作节奏平稳。",
        description:
          summary.intervention_count > 0
            ? "建议给高风险任务单独挂一个专项 Agent 团队，避免主链路被阻塞。"
            : "可以逐步把更多 Agent 分配进专项团队，提升并行度。"
      }
    ],
    slotCount: String(teams.length)
  };
}
