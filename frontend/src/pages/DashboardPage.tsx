import { useMemo } from "react";
import EmptyState from "../components/EmptyState";
import {
  AGENT_CARDS,
  AGENT_SKILLS,
  DELIVERABLES,
  ORCHESTRATOR_METRICS,
  PROFILE_STATS,
  SUCCESS_RATES,
  TASK_FLOW_BARS,
  TASK_FLOW_ITEMS,
  THROUGHPUT_BARS
} from "../data/dashboard";
import { filterByQuery, getSearchMeta } from "../lib/search";
import { buildDashboardView } from "../lib/runtime-view";
import { useAuthStore } from "../stores/authStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { useRuntimeStore } from "../stores/runtimeStore";

export default function DashboardPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const successRateRange = useDashboardStore((state) => state.successRateRange);
  const setSuccessRateRange = useDashboardStore((state) => state.setSuccessRateRange);
  const tasks = useRuntimeStore((state) => state.tasks);
  const agents = useRuntimeStore((state) => state.agents);
  const dashboardStats = useRuntimeStore((state) => state.dashboardStats);
  const hasLoadedRemote = useRuntimeStore((state) => state.hasLoadedRemote);

  const runtimeView = useMemo(() => {
    if (!hasLoadedRemote || !dashboardStats) {
      return null;
    }

    return buildDashboardView(tasks, agents, dashboardStats);
  }, [agents, dashboardStats, hasLoadedRemote, tasks]);

  const profileStats = runtimeView?.profileStats ?? PROFILE_STATS;
  const agentCards = runtimeView?.agentCards ?? AGENT_CARDS;
  const taskFlowBars = runtimeView?.taskFlowBars ?? TASK_FLOW_BARS;
  const taskFlowItems = runtimeView?.taskFlowItems ?? TASK_FLOW_ITEMS;
  const successRates = runtimeView?.successRates ?? SUCCESS_RATES;
  const deliverables = runtimeView?.deliverables ?? DELIVERABLES;
  const agentSkills = runtimeView?.agentSkills ?? AGENT_SKILLS;
  const orchestratorMetrics = runtimeView?.orchestratorMetrics ?? ORCHESTRATOR_METRICS;
  const throughputBars = runtimeView?.throughputBars ?? THROUGHPUT_BARS;
  const tokenValue = runtimeView?.tokenValue ?? "2.1M";
  const tokenMeta = runtimeView?.tokenMeta ?? "今日 · 额度剩余 7.9M";
  const tokenBarWidth = runtimeView?.tokenBarWidth ?? "21%";
  const throughputValue = runtimeView?.throughputValue ?? "83.8";

  const filteredTaskFlowItems = filterByQuery(taskFlowItems, searchQuery, (item) => [
    item.name,
    item.meta,
    item.agent,
    item.time
  ]);
  const filteredDeliverables = filterByQuery(deliverables, searchQuery, (item) => [
    item.name,
    item.meta,
    item.size,
    item.time
  ]);
  const filteredAgentSkills = filterByQuery(agentSkills, searchQuery, (item) => [
    item.name,
    item.meta,
    item.status
  ]);

  return (
    <div className="page-stack">
      <div className="row r4">
        {agentCards.map((card) => (
          <div key={card.title} className={`card ${card.tone}`}>
            <div className="acl" />
            <div className="ch">
              <div className={`aico ${card.iconTone}`}>{card.icon}</div>
              <div>
                <div className="cn">{card.title}</div>
                <div className="cr">{card.subtitle}</div>
              </div>
              <div className={`pill ${card.pillTone}`}>{card.pill}</div>
            </div>
            <div className="metric">{card.metric}</div>
            <div className="mlabel">{card.metricLabel}</div>
            <div className="msub">{card.metricSub}</div>
          </div>
        ))}

        <div className="pcard">
          <div className="pav">{currentUser.init}</div>
          <div className="pname">{currentUser.name}</div>
          <div className="prole">{profileStats.role}</div>
          <div className="pst">{profileStats.projects}</div>
          <div className="pstl">进行中项目</div>
          <button className="pbtn" type="button">
            查看详情 →
          </button>
        </div>
      </div>

      <div className="row rmid">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">任务执行流</div>
            <div className="dnav">
              <div className="db">←</div>
              <div className="dl">
                {getSearchMeta(searchQuery, filteredTaskFlowItems.length, "本周 · Sprint 3")}
              </div>
              <div className="db">→</div>
            </div>
          </div>
          <div className="mc">
            {taskFlowBars.map((bar) => (
              <div
                key={`${bar.height}-${bar.tone}`}
                className={`mb${bar.tone ? ` ${bar.tone}` : ""}`}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          <div className="clrow">
            {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
              <span key={day} className="cl">
                {day}
              </span>
            ))}
          </div>
          {filteredTaskFlowItems.length ? (
            <div className="tl">
              {filteredTaskFlowItems.map((item) => (
                <div key={item.name} className="ti">
                  <div className={`sd ${item.state}`} />
                  <div className="ti-info">
                    <div className="ti-n">{item.name}</div>
                    <div className="ti-m">{item.meta}</div>
                  </div>
                  <span className={`tsm ${item.agentTone}`}>{item.agent}</span>
                  <span className="tt">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="任务执行流里没有匹配项"
              description="可以尝试搜索任务名、阶段说明或负责 Agent。"
            />
          )}
        </div>

        <div className="statcol">
          <div className="sp">
            <div className="sph">
              <span className="spt">任务成功率</span>
              <select
                className="sel"
                value={successRateRange}
                onChange={(event) =>
                  setSuccessRateRange(event.target.value as "本周" | "本月")
                }
              >
                <option>本周</option>
                <option>本月</option>
              </select>
            </div>
            <div className="bign">
              94.2<span>%</span>
            </div>
            <div className="bl2">
              {successRates.map((rate) => (
                <div key={rate.label} className="bi">
                  <div className="bir">
                    <span className="bil">{rate.label}</span>
                    <span className="bip">{rate.value}%</span>
                  </div>
                  <div className="bt">
                    <div
                      className="bf"
                      style={{ width: `${rate.value}%`, background: rate.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sp">
            <div className="sph">
              <span className="spt">Token 消耗</span>
              <div className="lp on">
                <span className="ld pulse" />
                实时
              </div>
            </div>
            <div className="bign">
              {tokenValue}
            </div>
            <div className="token-meta">{tokenMeta}</div>
            <div className="bt token-bar">
              <div
                className="bf"
                style={{
                  width: tokenBarWidth,
                  background: "linear-gradient(90deg,var(--accent),#7c3aed)"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row rbot">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">最近交付物</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredDeliverables.length, "今日 · 3 项")}
            </div>
          </div>
          <div className="colhr deliverable-header">
            <span className="colh colh-flex">文件名称</span>
            <span className="colh colh-size">大小</span>
            <span className="colh colh-time">时间</span>
          </div>
          {filteredDeliverables.length ? (
            <div className="ol">
              {filteredDeliverables.map((item) => (
                <div key={item.name} className="oi">
                  <div className={`oico ${item.tone}`}>{item.icon}</div>
                  <div className="oi-info">
                    <div className="oi-n">{item.name}</div>
                    <div className="oi-m">{item.meta}</div>
                  </div>
                  <span className="ois ois-size">{item.size}</span>
                  <span className={`ois ois-time${item.highlight ? " ois-highlight" : ""}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="当前交付物列表没有匹配项"
              description="可以尝试用文件名、类型或时间关键词重新搜索。"
            />
          )}
        </div>

        <div className="panel">
          <div className="ph">
            <div className="ptitle">Agent Skills 配置</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredAgentSkills.length, "当前团队")}
            </div>
          </div>
          {filteredAgentSkills.length ? (
            <div className="aclist">
              {filteredAgentSkills.map((skill) => (
                <div key={skill.name} className={`aci${skill.dashed ? " ds" : ""}`}>
                  <div
                    className={skill.dashed ? "addico" : `aico ${skill.tone}`}
                    style={
                      skill.dashed
                        ? undefined
                        : { width: "26px", height: "26px", fontSize: "12px", flexShrink: 0 }
                    }
                  >
                    {skill.icon}
                  </div>
                  <div className="ti-info">
                    <div
                      className="ti-n"
                      style={skill.dashed ? { color: "var(--text3)" } : undefined}
                    >
                      {skill.name}
                    </div>
                    <div className="ti-m">{skill.meta}</div>
                  </div>
                  {skill.status ? (
                    <div className={`lp ${skill.statusTone}`}>
                      <span className={`ld${skill.pulse ? " pulse" : ""}`} />
                      {skill.status}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="当前技能配置没有匹配项"
              description="可以搜索 Agent 名称、技能标签或运行状态。"
            />
          )}
        </div>

        <div className="sp orchestrator-panel">
          <div className="sph">
            <span className="spt">Orchestrator</span>
            <div className="lp on">
              <span className="ld pulse" />
              运行中
            </div>
          </div>
          <div className="bl2">
            {orchestratorMetrics.map((metric) => (
              <div key={metric.label} className="bi">
                <div className="bir">
                  <span className="bil">{metric.label}</span>
                  <span className="bip">{metric.value}</span>
                </div>
                <div className="bt">
                  <div
                    className="bf"
                    style={{ width: metric.width, background: metric.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="sep" />
          <div className="throughput-label">今日吞吐量</div>
          <div className="mc throughput-chart">
            {throughputBars.map((bar) => (
              <div
                key={`${bar.height}-${bar.tone}`}
                className={`mb${bar.tone ? ` ${bar.tone}` : ""}`}
                style={{ height: `${bar.height}%` }}
              />
            ))}
          </div>
          <div className="throughput-value">
            {throughputValue} <span>任务 / 天</span>
          </div>
        </div>
      </div>
    </div>
  );
}
