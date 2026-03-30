import { useEffect, useState } from "react";
import type { CreateSkillPayload } from "../types/runtime";

type SkillComposerProps = {
  open: boolean;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (payload: CreateSkillPayload) => Promise<boolean>;
};

const SKILL_CATEGORIES = ["product", "engineering", "quality", "ops"] as const;

export default function SkillComposer({
  open,
  isSubmitting,
  error,
  onClose,
  onSubmit
}: SkillComposerProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof SKILL_CATEGORIES)[number]>("engineering");
  const [description, setDescription] = useState("");
  const [promptHint, setPromptHint] = useState("");
  const [isCore, setIsCore] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setCategory("engineering");
      setDescription("");
      setPromptHint("");
      setIsCore(false);
      setLocalError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      setLocalError("请先填写 Skill 名称");
      return;
    }

    setLocalError("");
    const ok = await onSubmit({
      name: normalizedName,
      category,
      description: description.trim(),
      prompt_hint: promptHint.trim(),
      is_core: isCore
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <>
      <div className="composer-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="composer-panel" role="dialog" aria-modal="true" aria-label="新增 Skill">
        <div className="composer-head">
          <div>
            <div className="composer-title">新增 Skill</div>
            <div className="composer-sub">把高频能力沉淀进 Skills 库，供不同 Agent 复用。</div>
          </div>
          <button className="bpp-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="composer-form">
          <label className="composer-field">
            <span>Skill 名称</span>
            <input
              type="text"
              value={name}
              placeholder="例如：Code Review"
              onChange={(event) => {
                setName(event.target.value);
                if (localError) {
                  setLocalError("");
                }
              }}
            />
          </label>

          <label className="composer-field">
            <span>类别</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof SKILL_CATEGORIES)[number])
              }
            >
              {SKILL_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="composer-field">
            <span>描述</span>
            <textarea
              rows={4}
              value={description}
              placeholder="说明这个 Skill 解决什么问题，适合哪些 Agent。"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="composer-field">
            <span>Prompt Hint</span>
            <textarea
              rows={3}
              value={promptHint}
              placeholder="可选：补充对提示词或执行阶段的使用建议。"
              onChange={(event) => setPromptHint(event.target.value)}
            />
          </label>

          <label className="composer-check">
            <input
              type="checkbox"
              checked={isCore}
              onChange={(event) => setIsCore(event.target.checked)}
            />
            <span>标记为核心 Skill</span>
          </label>
        </div>

        <div className={`composer-error${localError || error ? " show" : ""}`}>
          {localError || error || "创建失败"}
        </div>

        <div className="composer-meta">Skills 库是 Agent 团队的共享能力目录，不会改变你现有页面视觉框架。</div>

        <div className="composer-actions">
          <button className="btn-ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="btn-new composer-submit" type="button" onClick={handleSubmit}>
            {isSubmitting ? "创建中…" : "创建 Skill"}
          </button>
        </div>
      </div>
    </>
  );
}
