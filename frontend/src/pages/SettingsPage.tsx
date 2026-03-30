import EmptyState from "../components/EmptyState";
import { SETTINGS_GROUPS, SETTINGS_RUNTIME } from "../data/workspace";
import { filterByQuery, getSearchMeta } from "../lib/search";
import { useDashboardStore } from "../stores/dashboardStore";

export default function SettingsPage() {
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const filteredGroups = filterByQuery(SETTINGS_GROUPS, searchQuery, (group) => [
    group.label,
    group.help,
    group.value
  ]);
  const filteredRuntime = filterByQuery(SETTINGS_RUNTIME, searchQuery, (item) => [
    item.title,
    item.status,
    item.value,
    item.meta
  ]);

  return (
    <div className="page-stack">
      <div className="page-grid-main">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">工作台设置</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredGroups.length, "基础偏好")}
            </div>
          </div>
          {filteredGroups.length ? (
            <div className="settings-list">
              {filteredGroups.map((group) => (
                <div key={group.label} className="settings-row">
                  <div>
                    <div className="settings-label">{group.label}</div>
                    <div className="settings-help">{group.help}</div>
                  </div>
                  <div className="settings-value">{group.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="设置项里没有匹配内容"
              description="可以搜索背景、透明度、模型名或交接单设置。"
            />
          )}
        </div>

        <div className="statcol">
          {filteredRuntime.length ? (
            filteredRuntime.map((item) => (
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
                  <div className="bf" style={{ width: item.width, background: item.color }} />
                </div>
              </div>
            ))
          ) : (
            <div className="sp">
              <EmptyState
                compact
                title="运行状态里没有匹配项"
                description="可以搜索持久化、工程状态或运行指标。"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
