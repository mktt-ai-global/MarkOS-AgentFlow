from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.models.agent import Agent, AgentRole
from app.models.task import Task
from app.schemas.handoff import (
    HandoffDecision,
    HandoffIssue,
    HandoffOutput,
    HandoffPayload,
)
from app.services.anthropic_client import AnthropicClient, MockAnthropicClient, ProviderCompletion
from app.services.file_storage import ArtifactStorageService
from app.services.prompts import PromptService


@dataclass(slots=True)
class AgentExecutionResult:
    handoff: HandoffPayload
    output: dict[str, Any]
    total_tokens: int
    provider: str
    model: str


class AgentRunnerService:
    def __init__(self) -> None:
        self.prompt_service = PromptService()
        self.storage = ArtifactStorageService()
        self.anthropic_client = AnthropicClient()
        self.mock_client = MockAnthropicClient()

    def run_task(self, *, task: Task, agent: Agent, dependencies: list[Task]) -> AgentExecutionResult:
        system_prompt = self.prompt_service.load_system_prompt(agent)
        user_prompt = self.prompt_service.build_task_prompt(task, dependencies, agent.role)
        completion = self._complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=agent.model,
            max_tokens=agent.max_tokens,
        )

        return self._build_result(
            task=task,
            agent=agent,
            completion=completion,
            dependencies=dependencies,
        )

    def _complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        max_tokens: int,
    ) -> ProviderCompletion:
        if self.anthropic_client.is_configured():
            return self.anthropic_client.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=model,
                max_tokens=max_tokens,
            )

        return self.mock_client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            max_tokens=max_tokens,
        )

    def _build_result(
        self,
        *,
        task: Task,
        agent: Agent,
        completion: ProviderCompletion,
        dependencies: list[Task],
    ) -> AgentExecutionResult:
        if agent.role == AgentRole.PM:
            return self._build_pm_result(task=task, completion=completion, dependencies=dependencies)

        if agent.role == AgentRole.DEV:
            return self._build_dev_result(task=task, completion=completion, dependencies=dependencies)

        return self._build_qa_result(task=task, completion=completion, dependencies=dependencies)

    def _build_pm_result(
        self,
        *,
        task: Task,
        completion: ProviderCompletion,
        dependencies: list[Task],
    ) -> AgentExecutionResult:
        artifact_slug = f"task_{task.id[:8]}_pm"

        markdown_artifact = self.storage.write_text(
            task.id,
            f"{artifact_slug}_prd.md",
            completion.text,
        )
        handoff = HandoffPayload(
            summary=f"PM 已完成《{task.title}》的需求梳理与执行拆解，可继续交给 Dev / QA 角色。",
            outputs=[
                HandoffOutput(
                    kind="doc",
                    path=markdown_artifact.path,
                    description="PM 产出的结构化 PRD 草稿",
                    is_required=True,
                )
            ],
            decisions=[
                HandoffDecision(
                    decision="优先固化主链路需求和交付顺序",
                    rationale="先冻结边界、依赖和验收标准，能让下游实现与验证共用同一份上下文。",
                    impact="减少 Dev / QA 对需求理解不一致的概率。",
                )
            ],
            open_issues=(
                []
                if task.description.strip()
                else [
                    HandoffIssue(
                        issue="原始任务缺少详细背景，建议补充更明确的验收标准。",
                        severity="medium",
                        owner_hint="产品负责人",
                    )
                ]
            ),
            next_hints=[
                "将该 handoff 作为 Dev Agent 的直接执行输入。",
                (
                    f"当前上游依赖已确认 {len(dependencies)} 项。"
                    if dependencies
                    else "当前任务无上游依赖，可直接进入下游实现。"
                ),
                "Dev 完成后应补充自测清单，方便 QA 继续复验。",
            ],
        )
        handoff_artifact = self.storage.write_json(
            task.id,
            f"{artifact_slug}_handoff.json",
            handoff.model_dump(mode="json"),
        )

        return AgentExecutionResult(
            handoff=handoff,
            output={
                "prd_markdown": {
                    "path": markdown_artifact.path,
                    "summary": f"{task.title} · PM PRD 草稿",
                    "provider": completion.provider,
                    "model": completion.model,
                    "role": AgentRole.PM.value,
                },
                "handoff_json": {
                    "path": handoff_artifact.path,
                    "summary": handoff.summary,
                    "role": AgentRole.PM.value,
                },
            },
            total_tokens=completion.total_tokens,
            provider=completion.provider,
            model=completion.model,
        )

    def _build_dev_result(
        self,
        *,
        task: Task,
        completion: ProviderCompletion,
        dependencies: list[Task],
    ) -> AgentExecutionResult:
        artifact_slug = f"task_{task.id[:8]}_dev"
        implementation_artifact = self.storage.write_text(
            task.id,
            f"{artifact_slug}_implementation.md",
            completion.text,
        )
        self_test_payload = {
            "task_id": task.id,
            "task_title": task.title,
            "role": AgentRole.DEV.value,
            "checks": [
                "主链路输入输出已走通",
                "关键边界参数已覆盖",
                "与上游 handoff 对齐了异常路径",
            ],
            "dependency_count": len(dependencies),
        }
        self_test_artifact = self.storage.write_json(
            task.id,
            f"{artifact_slug}_self_check.json",
            self_test_payload,
        )

        handoff = HandoffPayload(
            summary=f"Dev 已基于《{task.title}》完成实现说明与自测清单，可继续交给 QA 复验。",
            outputs=[
                HandoffOutput(
                    kind="code",
                    path=implementation_artifact.path,
                    description="Dev 产出的实现说明与代码草稿",
                    is_required=True,
                ),
                HandoffOutput(
                    kind="test",
                    path=self_test_artifact.path,
                    description="Dev 输出的自测清单与回归关注点",
                    is_required=True,
                ),
            ],
            decisions=[
                HandoffDecision(
                    decision="优先实现主链路与关键依赖接口",
                    rationale="Phase 6 目标是先跑通 PM -> Dev -> QA 主链，再逐步扩展复杂场景。",
                    impact="方便 QA 先围绕稳定主流程做复验。",
                )
            ],
            open_issues=[],
            next_hints=[
                "QA 优先验证主链路、异常输入和依赖回退路径。",
                "如需人工介入，优先标记影响交付节奏的高风险问题。",
                "继续保留上游 PRD 与 handoff 路径，方便回放。",
            ],
        )
        handoff_artifact = self.storage.write_json(
            task.id,
            f"{artifact_slug}_handoff.json",
            handoff.model_dump(mode="json"),
        )

        return AgentExecutionResult(
            handoff=handoff,
            output={
                "implementation_doc": {
                    "path": implementation_artifact.path,
                    "summary": f"{task.title} · Dev 实现说明",
                    "provider": completion.provider,
                    "model": completion.model,
                    "role": AgentRole.DEV.value,
                },
                "self_test_manifest": {
                    "path": self_test_artifact.path,
                    "summary": "Dev 自测清单已生成",
                    "role": AgentRole.DEV.value,
                },
                "handoff_json": {
                    "path": handoff_artifact.path,
                    "summary": handoff.summary,
                    "role": AgentRole.DEV.value,
                },
            },
            total_tokens=completion.total_tokens,
            provider=completion.provider,
            model=completion.model,
        )

    def _build_qa_result(
        self,
        *,
        task: Task,
        completion: ProviderCompletion,
        dependencies: list[Task],
    ) -> AgentExecutionResult:
        artifact_slug = f"task_{task.id[:8]}_qa"
        report_artifact = self.storage.write_text(
            task.id,
            f"{artifact_slug}_report.md",
            completion.text,
        )
        verdict_payload = {
            "task_id": task.id,
            "task_title": task.title,
            "role": AgentRole.QA.value,
            "result": "pass-with-attention" if not task.description.strip() else "pass",
            "focus_areas": [
                "主链路可达",
                "关键异常输入",
                "上游 handoff 中列出的风险项",
            ],
            "dependency_count": len(dependencies),
        }
        verdict_artifact = self.storage.write_json(
            task.id,
            f"{artifact_slug}_verdict.json",
            verdict_payload,
        )

        open_issues = (
            [
                HandoffIssue(
                    issue="当前任务描述仍较简略，后续建议补充更明确的人工验收结论。",
                    severity="low",
                    owner_hint="项目负责人",
                )
            ]
            if not task.description.strip()
            else []
        )
        handoff = HandoffPayload(
            summary=f"QA 已完成《{task.title}》的验证报告与风险确认，当前链路可进入交付或人工验收。",
            outputs=[
                HandoffOutput(
                    kind="report",
                    path=report_artifact.path,
                    description="QA 产出的验证报告",
                    is_required=True,
                ),
                HandoffOutput(
                    kind="log",
                    path=verdict_artifact.path,
                    description="QA 产出的验证结论与复验清单",
                    is_required=True,
                ),
            ],
            decisions=[
                HandoffDecision(
                    decision="优先确认主链路产物已完整生成",
                    rationale="Phase 6 强调多 Agent 闭环和可追踪交付，而不是一次性覆盖所有边界。",
                    impact="有助于尽快把重点风险收敛到少数人工节点。",
                )
            ],
            open_issues=open_issues,
            next_hints=[
                "如进入 Phase 7，可将该报告纳入人工介入与审计链路。",
                "如需回流修复，保留当前 verdict 与 Dev 自测清单以便定位。",
                "当前链路已具备完整的 PM -> Dev -> QA 回放信息。",
            ],
        )
        handoff_artifact = self.storage.write_json(
            task.id,
            f"{artifact_slug}_handoff.json",
            handoff.model_dump(mode="json"),
        )

        return AgentExecutionResult(
            handoff=handoff,
            output={
                "qa_report": {
                    "path": report_artifact.path,
                    "summary": f"{task.title} · QA 验证报告",
                    "provider": completion.provider,
                    "model": completion.model,
                    "role": AgentRole.QA.value,
                },
                "qa_verdict": {
                    "path": verdict_artifact.path,
                    "summary": "QA 验证结论已生成",
                    "role": AgentRole.QA.value,
                },
                "handoff_json": {
                    "path": handoff_artifact.path,
                    "summary": handoff.summary,
                    "role": AgentRole.QA.value,
                },
            },
            total_tokens=completion.total_tokens,
            provider=completion.provider,
            model=completion.model,
        )
