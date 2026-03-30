import { useEffect, useState } from "react";
import type {
  ApiAgentRole,
  ApiAgentStatus,
  ApiSkill,
  ApiTeam,
  CreateAgentPayload
} from "../types/runtime";

type AgentComposerProps = {
  open: boolean;
  isSubmitting: boolean;
  error: string;
  skills: ApiSkill[];
  teams: ApiTeam[];
  onClose: () => void;
  onSubmit: (payload: CreateAgentPayload) => Promise<boolean>;
};

const ROLE_OPTIONS: ApiAgentRole[] = ["PM", "DEV", "QA"];
const STATUS_OPTIONS: ApiAgentStatus[] = ["IDLE", "ONLINE", "OFFLINE"];

export default function AgentComposer({
  open,
  isSubmitting,
  error,
  skills,
  teams,
  onClose,
  onSubmit
}: AgentComposerProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<ApiAgentRole>("PM");
  const [status, setStatus] = useState<ApiAgentStatus>("IDLE");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setRole("PM");
      setStatus("IDLE");
      setSelectedSkills([]);
      setSelectedTeams([]);
      setLocalError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setLocalError("请先填写 Agent 名称");
      return;
    }

    setLocalError("");
    const ok = await onSubmit({
      name: normalizedName,
      role,
      status,
      skills: selectedSkills,
      team_ids: selectedTeams
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <>
      <div className="composer-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="composer-panel" role="dialog" aria-modal="true" aria-label="新建 Agent">
        <div className="composer-head">
          <div>
            <div className="composer-title">新增 Agent</div>
            <div className="composer-sub">为你的工作台补充新的执行成员和团队归属。</div>
          </div>
          <button className="bpp-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="composer-form">
          <label className="composer-field">
            <span>Agent 名称</span>
            <input
              type="text"
              value={name}
              placeholder="例如：Review Agent"
              onChange={(event) => {
                setName(event.target.value);
                if (localError) {
                  setLocalError("");
                }
              }}
            />
          </label>

          <div className="composer-grid-2">
            <label className="composer-field">
              <span>角色</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as ApiAgentRole)}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="composer-field">
              <span>状态</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ApiAgentStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="composer-field">
            <span>Skills</span>
            <select
              multiple
              className="composer-multi"
              value={selectedSkills}
              onChange={(event) =>
                setSelectedSkills(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {skills.map((skill) => (
                <option key={skill.id} value={skill.slug}>
                  {skill.name} · {skill.category}
                </option>
              ))}
            </select>
          </label>

          <label className="composer-field">
            <span>加入团队</span>
            <select
              multiple
              className="composer-multi"
              value={selectedTeams}
              onChange={(event) =>
                setSelectedTeams(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} · {team.focus || "未设置焦点"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={`composer-error${localError || error ? " show" : ""}`}>
          {localError || error || "创建失败"}
        </div>

        <div className="composer-meta">Agent 会继承现有视觉工作台，只新增成员数据和团队归属。</div>

        <div className="composer-actions">
          <button className="btn-ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="btn-new composer-submit" type="button" onClick={handleSubmit}>
            {isSubmitting ? "创建中…" : "创建 Agent"}
          </button>
        </div>
      </div>
    </>
  );
}
