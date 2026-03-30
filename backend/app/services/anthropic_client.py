from __future__ import annotations

import json
from dataclasses import dataclass
from urllib import error, request

from app.core.config import get_settings


@dataclass(slots=True)
class ProviderCompletion:
    text: str
    input_tokens: int
    output_tokens: int
    model: str
    provider: str

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


def estimate_tokens(text: str) -> int:
    return max(1, round(len(text) / 4))


class AnthropicClient:
    api_url = "https://api.anthropic.com/v1/messages"

    def __init__(self) -> None:
        self.settings = get_settings()

    def is_configured(self) -> bool:
        return bool(self.settings.anthropic_api_key)

    def complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        max_tokens: int,
    ) -> ProviderCompletion:
        if not self.settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not configured")

        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
        }
        req = request.Request(
            self.api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Anthropic request failed: {detail or exc.reason}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"Anthropic request failed: {exc.reason}") from exc

        text = "\n\n".join(
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        ).strip()
        usage = data.get("usage", {})

        return ProviderCompletion(
            text=text or "No content returned from Anthropic",
            input_tokens=int(usage.get("input_tokens", estimate_tokens(user_prompt))),
            output_tokens=int(usage.get("output_tokens", estimate_tokens(text))),
            model=str(data.get("model", model)),
            provider="anthropic",
        )


class MockAnthropicClient:
    def complete(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str,
        max_tokens: int,
    ) -> ProviderCompletion:
        summary = user_prompt.splitlines()[0].replace("任务标题：", "").strip() or "未命名任务"
        role = self._extract_role(user_prompt)
        body = self._build_mock_body(role=role, summary=summary, user_prompt=user_prompt)

        return ProviderCompletion(
            text=body,
            input_tokens=estimate_tokens(system_prompt + user_prompt),
            output_tokens=estimate_tokens(body),
            model=model,
            provider="mock-anthropic",
        )

    def _extract_role(self, user_prompt: str) -> str:
        for line in user_prompt.splitlines():
            if line.startswith("当前执行角色："):
                return line.replace("当前执行角色：", "", 1).strip().upper() or "PM"

        return "PM"

    def _build_mock_body(self, *, role: str, summary: str, user_prompt: str) -> str:
        if role == "DEV":
            return (
                f"# Dev 执行输出\n\n"
                f"## 实现摘要\n"
                f"- 任务：{summary}\n"
                f"- 当前模式：本地 Mock 执行链\n"
                f"- 输出目标：实现说明、自测清单、下游 handoff\n\n"
                f"## 实现思路\n"
                f"1. 先按 PM handoff 固化主链路接口和数据结构。\n"
                f"2. 为关键路径补齐最小可运行实现与异常处理。\n"
                f"3. 输出一份给 QA 复用的自测与回归关注点。\n\n"
                f"## 自测建议\n"
                f"- 覆盖成功流、边界输入和依赖回退。\n"
                f"- 重点观察上游 handoff 提到的开放问题。\n\n"
                f"## 上下文摘录\n"
                f"{user_prompt}\n"
            )

        if role == "QA":
            return (
                f"# QA 验证输出\n\n"
                f"## 验证概览\n"
                f"- 任务：{summary}\n"
                f"- 当前模式：本地 Mock 执行链\n"
                f"- 输出目标：测试报告、风险结论、复验建议\n\n"
                f"## 覆盖范围\n"
                f"1. 验证主链路可达与关键输出是否生成。\n"
                f"2. 检查 Dev 自测清单与 handoff 中的高风险说明。\n"
                f"3. 标记仍需人工关注的边界和复验点。\n\n"
                f"## 建议结论\n"
                f"- 当前链路可进入下一轮人工验收或继续扩展场景。\n"
                f"- 如发现高风险项，优先回流到 Dev 做定点修复。\n\n"
                f"## 上下文摘录\n"
                f"{user_prompt}\n"
            )

        return (
            f"# PM 执行输出\n\n"
            f"## 任务概览\n"
            f"- 主题：{summary}\n"
            f"- 当前模式：本地 Mock 执行链\n"
            f"- 输出目标：PRD 草稿、执行拆解、handoff 摘要\n\n"
            f"## 需求摘要\n"
            f"{user_prompt}\n\n"
            f"## 建议执行拆解\n"
            f"1. 收敛需求边界与关键验收条件。\n"
            f"2. 标记需要 Dev 先实现的主链路接口与数据结构。\n"
            f"3. 标记需要 QA 提前准备的验证场景和阻塞风险。\n\n"
            f"## Handoff 摘要\n"
            f"- 重点聚焦主链路、依赖顺序和交付节奏。\n"
            f"- 当前产物适合进入多 Agent 编排链继续执行。\n"
        )
