import { useEffect, useState } from "react";

type TaskComposerProps = {
  open: boolean;
  isSubmitting: boolean;
  error: string;
  availableTasks: Array<{
    id: string;
    title: string;
    assigned_agent: string;
  }>;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string;
    assigned_agent: string;
    depends_on?: string[];
  }) => Promise<boolean>;
};

export default function TaskComposer({
  open,
  isSubmitting,
  error,
  availableTasks,
  onClose,
  onSubmit
}: TaskComposerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedAgent, setAssignedAgent] = useState("AUTO");
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setAssignedAgent("AUTO");
      setSelectedDependencies([]);
      setLocalError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setLocalError("请先填写任务标题");
      return;
    }

    setLocalError("");
    const ok = await onSubmit({
      title: normalizedTitle,
      description: description.trim(),
      assigned_agent: assignedAgent,
      depends_on: selectedDependencies
    });

    if (ok) {
      setTitle("");
      setDescription("");
      setAssignedAgent("AUTO");
      setSelectedDependencies([]);
    }
  };

  return (
    <>
      <div className="composer-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="composer-panel" role="dialog" aria-modal="true" aria-label="新建任务">
        <div className="composer-head">
          <div>
            <div className="composer-title">新建任务</div>
            <div className="composer-sub">保持你现有工作台结构，直接写入后端任务中心。</div>
          </div>
          <button className="bpp-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="composer-form">
          <label className="composer-field">
            <span>任务标题</span>
            <input
              type="text"
              value={title}
              placeholder="例如：认证模块登录接口"
              onChange={(event) => {
                setTitle(event.target.value);
                if (localError) {
                  setLocalError("");
                }
              }}
            />
          </label>

          <label className="composer-field">
            <span>指派角色</span>
            <select
              value={assignedAgent}
              onChange={(event) => setAssignedAgent(event.target.value)}
            >
              <option value="AUTO">AUTO</option>
              <option value="PM">PM</option>
              <option value="DEV">DEV</option>
              <option value="QA">QA</option>
            </select>
          </label>

          <label className="composer-field">
            <span>任务描述</span>
            <textarea
              rows={5}
              value={description}
              placeholder="补充目标、边界、验收标准或依赖说明。"
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <label className="composer-field">
            <span>依赖任务（可选）</span>
            <select
              multiple
              className="composer-multi"
              value={selectedDependencies}
              onChange={(event) =>
                setSelectedDependencies(
                  Array.from(event.target.selectedOptions, (option) => option.value)
                )
              }
            >
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.assigned_agent} · {task.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={`composer-error${localError || error ? " show" : ""}`}>
          {localError || error || "创建失败"}
        </div>

        <div className="composer-meta">
          新任务创建成功后会自动刷新仪表盘、任务中心和团队页面的数据。依赖可用于串起 PM → Dev → QA 链路。
        </div>

        <div className="composer-actions">
          <button className="btn-ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="btn-new composer-submit" type="button" onClick={handleSubmit}>
            {isSubmitting ? "提交中…" : "创建任务"}
          </button>
        </div>
      </div>
    </>
  );
}
