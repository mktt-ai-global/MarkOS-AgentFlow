import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundPanel from "../components/BackgroundPanel";
import LoginScreen from "../components/LoginScreen";
import TaskComposer from "../components/TaskComposer";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { PRESETS } from "../data/dashboard";
import { useAuthStore } from "../stores/authStore";
import { useDashboardStore } from "../stores/dashboardStore";
import { useRuntimeStore } from "../stores/runtimeStore";
import { useUiStore } from "../stores/uiStore";

export default function WorkspacePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginExiting, setIsLoginExiting] = useState(false);
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.currentUser);
  const sessionUserKey = useAuthStore((state) => state.sessionUserKey);
  const hasHydratedSession = useAuthStore((state) => state.hasHydrated);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const isBgPanelOpen = useUiStore((state) => state.isBgPanelOpen);
  const activePresetKey = useUiStore((state) => state.activePresetKey);
  const customBackground = useUiStore((state) => state.customBackground);
  const overlayValue = useUiStore((state) => state.overlayValue);
  const panelValue = useUiStore((state) => state.panelValue);
  const hydrateUi = useUiStore((state) => state.hydrateFromStorage);
  const openBgPanel = useUiStore((state) => state.openBackgroundPanel);
  const closeBgPanel = useUiStore((state) => state.closeBackgroundPanel);
  const selectPreset = useUiStore((state) => state.selectPreset);
  const setCustomBackground = useUiStore((state) => state.setCustomBackground);
  const setOverlayValue = useUiStore((state) => state.setOverlayValue);
  const setPanelValue = useUiStore((state) => state.setPanelValue);

  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery);

  const hasLoadedRemote = useRuntimeStore((state) => state.hasLoadedRemote);
  const isRefreshing = useRuntimeStore((state) => state.isRefreshing);
  const isRealtimeConnected = useRuntimeStore((state) => state.isRealtimeConnected);
  const tasks = useRuntimeStore((state) => state.tasks);
  const isTaskComposerOpen = useRuntimeStore((state) => state.isTaskComposerOpen);
  const isCreatingTask = useRuntimeStore((state) => state.isCreatingTask);
  const createTaskError = useRuntimeStore((state) => state.createTaskError);
  const loadWorkspaceData = useRuntimeStore((state) => state.loadWorkspaceData);
  const connectRealtime = useRuntimeStore((state) => state.connectRealtime);
  const disconnectRealtime = useRuntimeStore((state) => state.disconnectRealtime);
  const openTaskComposer = useRuntimeStore((state) => state.openTaskComposer);
  const closeTaskComposer = useRuntimeStore((state) => state.closeTaskComposer);
  const createTask = useRuntimeStore((state) => state.createTask);
  const clearRuntimeState = useRuntimeStore((state) => state.clearRuntimeState);
  const isAuthenticated = Boolean(sessionUserKey);

  useEffect(() => {
    hydrateSession();
    hydrateUi();
  }, [hydrateSession, hydrateUi]);

  useEffect(() => {
    if (hasHydratedSession && isAuthenticated) {
      void loadWorkspaceData();
    }
  }, [hasHydratedSession, isAuthenticated, loadWorkspaceData]);

  useEffect(() => {
    if (hasHydratedSession && isAuthenticated && hasLoadedRemote) {
      connectRealtime();
      return () => {
        disconnectRealtime();
      };
    }

    disconnectRealtime();
    return undefined;
  }, [
    connectRealtime,
    disconnectRealtime,
    hasHydratedSession,
    hasLoadedRemote,
    isAuthenticated
  ]);

  const activePreset = useMemo(
    () => PRESETS.find((preset) => preset.key === activePresetKey) ?? PRESETS[0],
    [activePresetKey]
  );

  const panelOpacity = (panelValue / 100).toFixed(2);
  const panelOpacityNumber = Number(panelOpacity);
  const overlayOpacity = (overlayValue / 100).toFixed(2);

  const rootVariables = {
    "--glass": `rgba(218,218,224,${panelOpacity})`,
    "--glass-deep": `rgba(205,205,212,${Math.min(panelOpacityNumber + 0.1, 1).toFixed(2)})`,
    "--glass-card": `rgba(228,228,234,${Math.min(panelOpacityNumber + 0.14, 1).toFixed(2)})`,
    "--glass-inner": `rgba(235,235,240,${Math.min(panelOpacityNumber + 0.17, 1).toFixed(2)})`,
    "--overlay-opacity": overlayOpacity
  } as CSSProperties;

  const handleLogin = () => {
    const result = login(username, password);

    if (!result.ok) {
      setError(result.error);
      if (result.clearPassword) {
        setPassword("");
      }
      return;
    }

    setError("");
    setShowPassword(false);
    setIsLoginExiting(true);

    window.setTimeout(() => {
      setIsLoginExiting(false);
      setPassword("");
    }, 340);
  };

  const handleLogout = () => {
    disconnectRealtime();
    logout();
    clearRuntimeState();
    closeBgPanel();
    setUsername("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleUploadFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomBackground(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTask = async (payload: {
    title: string;
    description: string;
    assigned_agent: string;
    depends_on?: string[];
  }) => {
    const ok = await createTask(payload);

    if (ok) {
      navigate("/tasks");
    }

    return ok;
  };

  const runtimeTone = isRealtimeConnected
    ? "live"
    : isRefreshing && !hasLoadedRemote
      ? "syncing"
      : hasLoadedRemote
        ? "connected"
        : "demo";
  const runtimeLabel =
    runtimeTone === "live"
      ? "实时同步"
      : runtimeTone === "connected"
        ? "API 已连接"
        : runtimeTone === "syncing"
          ? "同步中"
          : "演示模式";

  return (
    <div className="agentflow-root" style={rootVariables}>
      <div
        id="bg-layer"
        style={{ background: customBackground ? "#333" : activePreset.css }}
      >
        <div
          id="bg-img"
          style={{
            backgroundImage: customBackground ? `url(${customBackground})` : "none",
            opacity: 1
          }}
        />
        <div
          id="bg-overlay"
          style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
        />
      </div>

      {hasHydratedSession && (!isAuthenticated || isLoginExiting) && (
        <LoginScreen
          username={username}
          password={password}
          showPassword={showPassword}
          error={error}
          isExiting={isLoginExiting}
          onUsernameChange={(value) => {
            setUsername(value);
            if (error) {
              setError("");
            }
          }}
          onPasswordChange={(value) => {
            setPassword(value);
            if (error) {
              setError("");
            }
          }}
          onTogglePassword={() => setShowPassword((value) => !value)}
          onSubmit={handleLogin}
        />
      )}

      {isBgPanelOpen && (
        <div
          className="bg-panel-backdrop"
          aria-hidden="true"
          onClick={closeBgPanel}
        />
      )}

      <BackgroundPanel
        open={isBgPanelOpen}
        presets={PRESETS}
        activePresetKey={customBackground ? null : activePresetKey}
        overlayValue={overlayValue}
        panelValue={panelValue}
        onClose={closeBgPanel}
        onSelectPreset={selectPreset}
        onUploadFile={handleUploadFile}
        onOverlayChange={setOverlayValue}
        onPanelChange={setPanelValue}
      />

      <TaskComposer
        open={isTaskComposerOpen}
        isSubmitting={isCreatingTask}
        error={createTaskError}
        availableTasks={tasks.map((task) => ({
          id: task.id,
          title: task.title,
          assigned_agent: task.assigned_agent
        }))}
        onClose={closeTaskComposer}
        onSubmit={handleCreateTask}
      />

      <WorkspaceLayout
        isVisible={hasHydratedSession && isAuthenticated}
        currentUser={currentUser}
        searchQuery={searchQuery}
        runtimeLabel={runtimeLabel}
        runtimeTone={runtimeTone}
        onSearchQueryChange={setSearchQuery}
        onOpenBackgroundPanel={openBgPanel}
        onOpenTaskComposer={openTaskComposer}
        onLogout={handleLogout}
      />
    </div>
  );
}
