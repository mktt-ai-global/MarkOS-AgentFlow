from __future__ import annotations

from pathlib import Path

from app.models.agent import Agent, AgentRole
from app.models.task import Task

PROMPT_DIR = Path(__file__).resolve().parent.parent / "prompts"

PROMPT_FILES: dict[AgentRole, str] = {
    AgentRole.PM: "pm_agent.md",
    AgentRole.DEV: "dev_agent.md",
    AgentRole.QA: "qa_agent.md",
}


class PromptService:
    def load_system_prompt(self, agent: Agent) -> str:
        if agent.system_prompt.strip():
            return agent.system_prompt.strip()

        prompt_file = PROMPT_FILES.get(agent.role)
        if prompt_file is None:
            return ""

        return (PROMPT_DIR / prompt_file).read_text(encoding="utf-8").strip()

    def build_task_prompt(self, task: Task, dependencies: list[Task], role: AgentRole) -> str:
        dependency_lines = (
            "\n".join(
                f"- {dependency.title} [{dependency.status.value}]"
                for dependency in dependencies
            )
            if dependencies
            else "- 无上游依赖"
        )
        upstream_context = self._format_upstream_context(task, dependencies)
        description = task.description.strip() or "未提供额外说明，请先补齐需求背景和验收标准。"
        role_instructions = self._build_role_instructions(role)

        return (
            f"任务标题：{task.title}\n"
            f"任务描述：{description}\n"
            f"已分配角色：{task.assigned_agent}\n"
            f"当前执行角色：{role.value}\n"
            f"依赖任务：\n{dependency_lines}\n\n"
            f"上游交接上下文：\n{upstream_context}\n\n"
            "请基于以上上下文输出当前角色的阶段性交付内容：\n"
            f"{role_instructions}"
        )

    def _format_upstream_context(self, task: Task, dependencies: list[Task]) -> str:
        sections: list[str] = []

        for dependency in dependencies:
            summary = dependency.handoff_context.get("summary", "无 handoff 摘要")
            outputs = dependency.handoff_context.get("outputs", [])
            next_hints = dependency.handoff_context.get("next_hints", [])
            output_lines = []

            if isinstance(outputs, list):
                output_lines = [
                    f"  - {item.get('description', '未命名输出')} ({item.get('path', '无路径')})"
                    for item in outputs[:3]
                    if isinstance(item, dict)
                ]

            hint_lines = []
            if isinstance(next_hints, list):
                hint_lines = [f"  - {hint}" for hint in next_hints[:3] if isinstance(hint, str)]

            section = (
                f"- {dependency.title}\n"
                f"  摘要：{summary}\n"
                f"  输出：\n{chr(10).join(output_lines) if output_lines else '  - 无'}\n"
                f"  下一步提示：\n{chr(10).join(hint_lines) if hint_lines else '  - 无'}"
            )
            sections.append(section)

        upstream_handoffs = task.handoff_context.get("upstream_handoffs", [])
        if isinstance(upstream_handoffs, list):
            for handoff in upstream_handoffs[:4]:
                if not isinstance(handoff, dict):
                    continue

                source_title = str(handoff.get("source_title", "上游任务"))
                nested_handoff = handoff.get("handoff", {})
                if not isinstance(nested_handoff, dict):
                    nested_handoff = {}
                summary = str(nested_handoff.get("summary", "无摘要"))
                sections.append(f"- {source_title}\n  摘要：{summary}")

        return "\n".join(sections) if sections else "- 当前没有可用的上游交接内容"

    def _build_role_instructions(self, role: AgentRole) -> str:
        if role == AgentRole.PM:
            return (
                "- 一份结构化 PRD 草稿\n"
                "- 明确的执行拆解与依赖顺序\n"
                "- 适合后续 Dev / QA 使用的 handoff 摘要\n"
            )

        if role == AgentRole.DEV:
            return (
                "- 一份实现说明，说明主链路和关键改动点\n"
                "- 一份可供 QA 继续验证的自测清单\n"
                "- 说明仍需关注的技术风险与未决事项\n"
            )

        return (
            "- 一份测试验证报告，包含覆盖范围与结论\n"
            "- 一份风险或阻塞说明，指出是否需要人工介入\n"
            "- 给后续交付或回归阶段的复验建议\n"
        )
