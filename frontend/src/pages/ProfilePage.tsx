import EmptyState from "../components/EmptyState";
import { useAuthStore } from "../stores/authStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { filterByQuery, getSearchMeta } from "../lib/search";
import {
  PROFILE_ACTIVITY,
  PROFILE_ASSETS,
  PROFILE_CARD_STATS,
  PROFILE_PREFERENCES,
  PROFILE_TIMELINE
} from "../data/workspace";

export default function ProfilePage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const filteredTimeline = filterByQuery(PROFILE_TIMELINE, searchQuery, (item) => [
    item.name,
    item.meta,
    item.badge,
    item.time
  ]);
  const filteredAssets = filterByQuery(PROFILE_ASSETS, searchQuery, (item) => [
    item.name,
    item.meta,
    item.size,
    item.time
  ]);
  const filteredPreferences = filterByQuery(PROFILE_PREFERENCES, searchQuery, (item) => [
    item.name,
    item.meta,
    item.status
  ]);

  return (
    <div className="page-stack">
      <div className="row r4">
        {PROFILE_CARD_STATS.map((card) => (
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
          <div className="prole">项目负责人</div>
          <div className="pst">8.6</div>
          <div className="pstl">本周协作评分</div>
          <button className="pbtn" type="button">
            编辑资料 →
          </button>
        </div>
      </div>

      <div className="row rmid">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">最近动态</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredTimeline.length, "今天")}
            </div>
          </div>
          {filteredTimeline.length ? (
            <div className="tl">
              {filteredTimeline.map((item) => (
                <div key={item.name} className="ti">
                  <div className={`sd ${item.state}`} />
                  <div className="ti-info">
                    <div className="ti-n">{item.name}</div>
                    <div className="ti-m">{item.meta}</div>
                  </div>
                  <span className={`tsm ${item.tone}`}>{item.badge}</span>
                  <span className="tt">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="个人动态中没有匹配项"
              description="可以搜索任务名称、角色标记或时间关键字。"
            />
          )}
        </div>

        <div className="statcol">
          {PROFILE_ACTIVITY.map((activity) => (
            <div key={activity.title} className="sp">
              <div className="sph">
                <span className="spt">{activity.title}</span>
                <div className={`lp ${activity.statusTone}`}>
                  <span className={`ld${activity.pulse ? " pulse" : ""}`} />
                  {activity.status}
                </div>
              </div>
              <div className="bign">
                {activity.value}
                {activity.unit ? <span>{activity.unit}</span> : null}
              </div>
              <div className="token-meta">{activity.meta}</div>
              <div className="bt token-bar">
                <div
                  className="bf"
                  style={{ width: activity.width, background: activity.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="page-grid-2">
        <div className="panel">
          <div className="ph">
            <div className="ptitle">我的交付物</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredAssets.length, "固定资产")}
            </div>
          </div>
          {filteredAssets.length ? (
            <div className="ol">
              {filteredAssets.map((item) => (
                <div key={item.name} className="oi">
                  <div className={`oico ${item.tone}`}>{item.icon}</div>
                  <div className="oi-info">
                    <div className="oi-n">{item.name}</div>
                    <div className="oi-m">{item.meta}</div>
                  </div>
                  <span className="ois ois-size">{item.size}</span>
                  <span className="ois ois-time">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="交付资产里没有匹配项"
              description="可以尝试搜索文件名、文档类型或更新时间。"
            />
          )}
        </div>

        <div className="panel">
          <div className="ph">
            <div className="ptitle">偏好设置</div>
            <div className="psub">
              {getSearchMeta(searchQuery, filteredPreferences.length, "账户层")}
            </div>
          </div>
          {filteredPreferences.length ? (
            <div className="aclist">
              {filteredPreferences.map((item) => (
                <div key={item.name} className="aci">
                  <div className={`aico ${item.tone}`}>{item.icon}</div>
                  <div className="ti-info">
                    <div className="ti-n">{item.name}</div>
                    <div className="ti-m">{item.meta}</div>
                  </div>
                  <div className={`lp ${item.statusTone}`}>
                    <span className={`ld${item.pulse ? " pulse" : ""}`} />
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="偏好设置里没有匹配项"
              description="可以搜索通知、归档、日报等设置项。"
            />
          )}
        </div>
      </div>
    </div>
  );
}
