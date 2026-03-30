import { create } from "zustand";
import { ACCOUNTS, type AccountRecord } from "../data/dashboard";

const SESSION_KEY = "af_session_user";
const DEFAULT_USER = ACCOUNTS.zhang;

type LoginResult =
  | { ok: true }
  | { ok: false; error: string; clearPassword: boolean };

type AuthStore = {
  hasHydrated: boolean;
  sessionUserKey: string | null;
  currentUser: AccountRecord;
  hydrateSession: () => void;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
};

function readStoredSessionUser(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored && ACCOUNTS[stored] ? stored : null;
  } catch {
    return null;
  }
}

function persistSessionUser(username: string | null): void {
  try {
    if (username) {
      localStorage.setItem(SESSION_KEY, username);
      return;
    }
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  hasHydrated: false,
  sessionUserKey: null,
  currentUser: DEFAULT_USER,
  hydrateSession: () => {
    const storedUser = readStoredSessionUser();

    set({
      hasHydrated: true,
      sessionUserKey: storedUser,
      currentUser: storedUser ? ACCOUNTS[storedUser] : DEFAULT_USER
    });
  },
  login: (username, password) => {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername || !password) {
      return { ok: false, error: "请输入账号和密码", clearPassword: false };
    }

    const account = ACCOUNTS[normalizedUsername];

    if (!account || account.pass !== password) {
      return { ok: false, error: "账号或密码错误，请重试", clearPassword: true };
    }

    persistSessionUser(normalizedUsername);

    set({
      sessionUserKey: normalizedUsername,
      currentUser: account
    });

    return { ok: true };
  },
  logout: () => {
    persistSessionUser(null);

    set({
      sessionUserKey: null,
      currentUser: DEFAULT_USER
    });
  }
}));
