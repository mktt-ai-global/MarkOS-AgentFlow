import type { WorkspaceRealtimeMessage } from "../types/runtime";
import { API_BASE_URL } from "./api";

type WorkspaceSocketHandlers = {
  onOpen?: () => void;
  onSnapshot: (message: WorkspaceRealtimeMessage) => void;
  onClose?: () => void;
  onError?: () => void;
};

export type WorkspaceSocketConnection = {
  close: () => void;
};

function resolveWorkspaceSocketUrl() {
  const override = import.meta.env.VITE_WS_BASE_URL?.trim();
  const baseUrl = override || API_BASE_URL.replace(/^http/i, "ws");
  return `${baseUrl.replace(/\/$/, "")}/ws/workspace`;
}

export function connectWorkspaceSocket(
  handlers: WorkspaceSocketHandlers
): WorkspaceSocketConnection {
  const socket = new WebSocket(resolveWorkspaceSocketUrl());

  socket.addEventListener("open", () => {
    handlers.onOpen?.();
  });

  socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data) as WorkspaceRealtimeMessage;
      if (payload.type === "workspace.snapshot") {
        handlers.onSnapshot(payload);
      }
    } catch {
      handlers.onError?.();
    }
  });

  socket.addEventListener("close", () => {
    handlers.onClose?.();
  });

  socket.addEventListener("error", () => {
    handlers.onError?.();
  });

  return {
    close: () => {
      socket.close();
    }
  };
}
