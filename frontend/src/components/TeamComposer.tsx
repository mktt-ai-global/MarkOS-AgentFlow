import { useEffect, useState } from "react";
import type { ApiAgent, CreateTeamPayload } from "../types/runtime";

type TeamComposerProps = {
  open: boolean;
  isSubmitting: boolean;
  error: string;
  agents: ApiAgent[];
  onClose: () => void;
  onSubmit: (payload: CreateTeamPayload) => Promise<boolean>;
};

const TEAM_COLORS = [
  { label: "Blue", value: "blue" },
  { label: "Green", value: "green" },
  { label: "Amber", value: "amber" }
] as const;

export default function TeamComposer({
  open,
  isSubmitting,
  error,
  agents,
  onClose,
  onSubmit
}: TeamComposerProps) {
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setFocus("");
      setDescription("");
      setColor("blue");
      setSelectedAgents([]);
      setLocalError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setLocalError("请先填写团队名称");
      return;
    }

    setLocalError("");
    const ok = await onSubmit({
      name: normalizedName,
      focus: focus.trim(),
      description: description.trim(),
      color,
      agent_ids: selectedAgents
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <>
      <div className="composer-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="composer-panel" role="dialog" aria-modal="true" aria-label="创建团队">
        <div className="composer-head">
          <div>
            <div className="composer-title">创建团队</div>
            <div className="composer-sub">把多个 Agent 组合成不同的专项协作小组。</div>
          </div>
          <button className="bpp-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="composer-form">
          <label className="composer-field">
            <span>团队名称</span>
            <input
              type="text"
              value={name}
              placeholder="例如：Growth Team"
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
              <span>团队焦点</span>
              <input
                type="text"
                value={focus}
                placeholder="例如：增长实验"
                onChange={(event) => setFocus(event.target.value)}
              />
            </label>

            <label className="composer-field">
              <span>主色调</span>
              <select value={color} onChange={(event) => setColor(event.target.value)}>
                {TEAM_COLORS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="composer-field">
            <span>团队描述</span>
            <textarea
              rows={4}
              value={description}
              placeholder="补充这个团队负责的链路、模块或专项目标。"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="composer-field">
            <span>团队成员</span>
            <select
              multiple
              className="composer-multi"
              value={selectedAgents}
              onChange={(event) =>
                setSelectedAgents(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} · {agent.role}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={`composer-error${localError || error ? " show" : ""}`}>
          {localError || error || "创建失败"}
        </div>

        <div className="composer-meta">团队是轻量编组层，方便你按模块或专项去组织多个 Agent。</div>

        <div className="composer-actions">
          <button className="btn-ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="btn-new composer-submit" type="button" onClick={handleSubmit}>
            {isSubmitting ? "创建中…" : "创建团队"}
          </button>
        </div>
      </div>
    </>
  );
}
