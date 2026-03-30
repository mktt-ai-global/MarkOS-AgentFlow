import type { KeyboardEvent } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogoIcon,
  UserIcon
} from "./Icons";

type LoginScreenProps = {
  username: string;
  password: string;
  showPassword: boolean;
  error: string;
  isExiting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
};

export default function LoginScreen({
  username,
  password,
  showPassword,
  error,
  isExiting,
  onUsernameChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit
}: LoginScreenProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div id="login-screen" className={isExiting ? "is-exiting" : ""}>
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <LogoIcon />
          </div>
          <div className="login-logo-name">
            Agent<span>Flow</span>
          </div>
        </div>
        <div className="login-title">欢迎回来</div>
        <div className="login-sub">登录你的 AgentFlow 工作台</div>
        <div className="lfield">
          <label>账号</label>
          <div className="lfield-wrap">
            <span className="fic">
              <UserIcon />
            </span>
            <input
              type="text"
              placeholder="输入用户名"
              autoComplete="username"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        <div className="lfield">
          <label>密码</label>
          <div className="lfield-wrap">
            <span className="fic">
              <LockIcon />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="eye-btn" type="button" onClick={onTogglePassword}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div className="lforgot">忘记密码？</div>
        </div>
        <div className={`login-error${error ? " show" : ""}`}>
          {error || "账号或密码错误，请重试"}
        </div>
        <button className="login-btn" type="button" onClick={onSubmit}>
          登 录
        </button>
        <div className="login-demo">
          演示账号：<strong>admin</strong> &nbsp;/&nbsp; 密码：<strong>123456</strong>
        </div>
        <div className="login-footer">AgentFlow · Dev Team Workspace © 2026</div>
      </div>
    </div>
  );
}
