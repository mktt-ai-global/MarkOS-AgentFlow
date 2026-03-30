import { useMemo } from "react";
import EmptyState from "../components/EmptyState";
import {
  TASK_BOARD_COLUMNS,
  TASK_CARD_STATS,
  TASK_ESCALATIONS,
  TASK_STATUS_SUMMARY
} from "../data/workspace";
import { filterByQuery, getSearchMeta } from "../lib/search";
import { buildTasksView } from "../lib/runtime-view";
import { useDashboardStore } from "../stores/dashboardStore";
import { useRuntimeStore } from "../stores/runtimeStore";

type TaskBoardItem = {
  taskId?: string;
  name: string;
  meta: string;
  badge: string;
  tone: string;
  state: string;
  canRun?: boolean;
};

export default function TasksPage() {
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const tasks = useRuntimeStore((state) => state.tasks);
  const dashboardStats = useRuntimeStore((state) => state.dashboardStats);
  const hasLoadedRemote = useRuntimeStore((state) => state.hasLoadedRemote);
  const runningTaskIds = useRuntimeStore((state) => state.runningTaskIds);
  const taskActionError = useRuntimeStore((state) => state.taskActionError);
  const runTask = useRuntimeStore((state) => state.runTask);
  const clearTaskActionError = useRuntimeStore((state) => state.clearTaskActionError);

  const runtimeView = useMemo(() => {
    if (!hasLoadedRemote || !dashboardStats) {
      return null;
    }

    return buildTasksView(tasks, dashboardStats);
  }, [dashboardStats, hasLoadedRemote, tasks]);

  const taskCardStats = runtimeView?.taskCardStats ?? TASK_CARD_STATS;
  const boardColumns = runtimeView?.boardColumns ?? TASK_BOARD_COLUMNS;
  const escalations = runtimeView?.escalations ?? TASK_ESCALATIONS;
  const statusSummary = runtimeView?.statusSummary ?? TASK_STATUS_SUMMARY;
  const activeTasksValue = runtimeView?.activeTasksValue ?? "27";

  const filteredColumns = boardColumns.map((column) => ({
    ...column,
    items: filterByQuery<TaskBoardItem>(column.items, searchQuery, (item) => [
      item.name,
      item.meta,
      item.badge
    ])
  }));
  const filteredEscalations = filterByQuery(escalations, searchQuery, (item) => [
    item.name,
    item.meta,
    item.owner,
    item.time
  ]);

  const handleRunTask = async (taskId: string) => {
    clearTaskActionError();
    await runTask(taskId);
  };

  return (
    <div className="page-stack">
      {taskActionError ? (
        <div className="runtime-alert">
          <span>{taskActionError}</span>
          <button type="button" onClick={clearTaskActionError}>
            关闭
          </button>
        </div>
      ) : null}

      <div className="row r4">
        {taskCardStats.map((card) => (
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
          <div className="pav">队</div>
          <div className="pname">任务中枢</div>
          <div className="prole">执行面板</div>
          <div className="pst">{activeTasksValue}</div>
          <div className="pstl">当前活跃任务</div>
          <button className="pbtn" type="button">
            导入 Sprint →
          </button>
        </div>
      </div>

      <div className="page-grid-3">
        {filteredColumns.map((column) => (
          <div key={column.title} className="panel">
            <div className="ph">
              <div className="ptitle">{column.title}</div>
              <div className="psub">
                {getSearchMeta(searchQuery, column.items.length, column.count)}
              </div>
            </div>
            {column.items.length ? (
              <div className="tl">
                {column.items.map((item) => (
                  <div key={item.name} className="ti">
                    <div className={`sd ${item.state}`} />
                    <div className="ti-info">
                      <div className="ti-n">{item.name}</div>
                      <div className="ti-m">{item.meta}</div>
                    </div>
                    {hasLoadedRemote && item.taskId && item.canRun ? (
                      <button
                        className="ti-act"
                        type="button"
                        onClick={() => void handleRunTask(item.taskId!)}
                        disabled={runningTaskIds.includes(item.taskId)}
                      >
                        {runningTaskIds.includes(item.taskId) ? "执行中…" : "运行"}
                      </button>
                    ) : null}
                    <span className={`tsm ${item.tone}`}>{item.badge}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                title={`${column.title}里没有匹配项`}
                description="可以尝试搜索任务名称、说明或负责角色。"
              />
            )}
          </div>
        ))}
      </div>

      <div className="row rmid">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">人工介入记录</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredEscalations.length, "最近 24h")}
            </div>
          </div>
          {filteredEscalations.length ? (
            <div className="ol">
              {filteredEscalations.map((item) => (
                <div key={item.name} className="oi">
                  <div className={`oico ${item.tone}`}>{item.icon}</div>
                  <div className="oi-info">
                    <div className="oi-n">{item.name}</div>
                    <div className="oi-m">{item.meta}</div>
                  </div>
                  <span className="ois ois-size">{item.owner}</span>
                  <span className={`ois ois-time${item.highlight ? " ois-highlight" : ""}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="人工介入记录里没有匹配项"
              description="可以搜索问题名称、处理人或最近时间。"
            />
          )}
        </div>

        <div className="statcol">
          {statusSummary.map((item) => (
            <div key={item.title} className="sp">
              <div className="sph">
                <span className="spt">{item.title}</span>
                <div className={`lp ${item.statusTone}`}>
                  <span className={`ld${item.pulse ? " pulse" : ""}`} />
                  {item.status}
                </div>
              </div>
              <div className="bign">
                {item.value}
                {item.unit ? <span>{item.unit}</span> : null}
              </div>
              <div className="token-meta">{item.meta}</div>
              <div className="bt token-bar">
                <div
                  className="bf"
                  style={{ width: item.width, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
