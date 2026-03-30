import { NavLink, Outlet } from "react-router-dom";
import type { AccountRecord } from "../data/dashboard";
import { NAV_ITEMS, SETTINGS_ITEM } from "../data/workspace";
import {
  BellIcon,
  ImageIcon,
  LogoIcon,
  MoonIcon,
  SearchIcon
} from "./Icons";

type WorkspaceLayoutProps = {
  isVisible: boolean;
  currentUser: AccountRecord;
  searchQuery: string;
  runtimeLabel: string;
  runtimeTone: "connected" | "demo" | "syncing" | "live";
  onSearchQueryChange: (value: string) => void;
  onOpenBackgroundPanel: () => void;
  onOpenTaskComposer: () => void;
  onLogout: () => void;
};

export default function WorkspaceLayout({
  isVisible,
  currentUser,
  searchQuery,
  runtimeLabel,
  runtimeTone,
  onSearchQueryChange,
  onOpenBackgroundPanel,
  onOpenTaskComposer,
  onLogout
}: WorkspaceLayoutProps) {
  return (
    <div id="app" className={isVisible ? "is-visible" : ""}>
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-mark">
            <LogoIcon />
          </div>
          <div className="sb-wordmark">Flow</div>
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `ni${isActive ? " on" : ""}`}
            >
              <item.Icon />
              {item.badge ? <span className="nbadge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-div" />
        <NavLink
          to={SETTINGS_ITEM.path}
          className={({ isActive }) => `ni${isActive ? " on" : ""}`}
        >
          <SETTINGS_ITEM.Icon />
        </NavLink>
        <button
          className="sb-foot sb-logout"
          type="button"
          title="点击退出登录"
          onClick={onLogout}
        >
          <div className="sb-av">{currentUser.init}</div>
          <div className="sb-online" />
        </button>
      </aside>

      <div className="right">
        <header className="topbar">
          <div className="tb-title">
            AgentFlow <span className="tb-tag">Dev Team · Sprint 3</span>
            <span className={`tb-tag tb-tag-mode ${runtimeTone}`}>{runtimeLabel}</span>
          </div>
          <div className="tb-search">
            <span className="si">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="搜索任务、Agent、输出物…"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
            />
          </div>
          <div className="tb-r">
            <button className="btn-bg" type="button" onClick={onOpenBackgroundPanel}>
              <ImageIcon />
              背景
            </button>
            <button className="btn-new" type="button" onClick={onOpenTaskComposer}>
              ＋ 新建任务
            </button>
            <div className="ib">
              <MoonIcon />
            </div>
            <div className="ib" style={{ position: "relative" }}>
              <BellIcon />
              <span className="idot" />
            </div>
            <div className="tb-av">{currentUser.init}</div>
          </div>
        </header>

        <div className="content-wrap">
          <div className="cs">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
