from app.core.config import get_settings
from app.schemas.handoff import (
    HandoffDecision,
    HandoffIssue,
    HandoffOutput,
    HandoffPayload,
)
from app.services.orchestrator import OrchestratorService


def test_validate_handoff_truncates_to_budget() -> None:
    settings = get_settings()
    original_budget = settings.handoff_max_tokens
    settings.handoff_max_tokens = 80

    try:
        payload = HandoffPayload(
            summary="超长摘要 " * 120,
            outputs=[
                HandoffOutput(
                    kind="doc",
                    path=f"data/artifacts/output_{index}.md",
                    description="超长输出说明 " * 40,
                    is_required=True,
                )
                for index in range(6)
            ],
            decisions=[
                HandoffDecision(
                    decision="保留主链路需求",
                    rationale="超长决策原因 " * 40,
                    impact="超长影响说明 " * 30,
                )
                for _ in range(5)
            ],
            open_issues=[
                HandoffIssue(
                    issue="超长待解决问题 " * 40,
                    severity="medium",
                    owner_hint="产品负责人",
                )
                for _ in range(5)
            ],
            next_hints=["超长下一步提示 " * 30 for _ in range(6)],
        )

        orchestrator = OrchestratorService()
        validated = orchestrator.validate_handoff(payload)

        assert orchestrator.estimate_handoff_tokens(validated) <= settings.handoff_max_tokens
    finally:
        settings.handoff_max_tokens = original_budget
