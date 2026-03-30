from pathlib import Path

from app.core.config import get_settings
from app.services.agent_runner import AgentRunnerService


def test_run_task_executes_pm_chain_and_persists_artifacts(client, tmp_path) -> None:
    settings = get_settings()
    original_artifacts_dir = settings.artifacts_dir
    settings.artifacts_dir = tmp_path / "artifacts"

    try:
        create_response = client.post(
            "/api/v1/tasks",
            json={
                "title": "认证模块需求梳理",
                "description": "输出一份可以继续交给开发实现的 PM PRD 草稿",
                "assigned_agent": "AUTO",
            },
        )

        task_id = create_response.json()["id"]
        run_response = client.post(f"/api/v1/tasks/{task_id}/run")

        assert run_response.status_code == 200

        payload = run_response.json()
        assert payload["status"] == "DONE"
        assert payload["assigned_agent"] == "PM"
        assert payload["token_used"] > 0
        assert payload["handoff_context"]["summary"]
        assert "prd_markdown" in payload["output"]
        assert "handoff_json" in payload["output"]

        prd_path = Path(payload["output"]["prd_markdown"]["path"])
        handoff_path = Path(payload["output"]["handoff_json"]["path"])
        prd_absolute = prd_path if prd_path.is_absolute() else Path.cwd() / prd_path
        handoff_absolute = handoff_path if handoff_path.is_absolute() else Path.cwd() / handoff_path

        assert prd_absolute.exists()
        assert handoff_absolute.exists()
    finally:
        settings.artifacts_dir = original_artifacts_dir


def test_run_task_sequences_ready_downstream_tasks(client, tmp_path) -> None:
    settings = get_settings()
    original_artifacts_dir = settings.artifacts_dir
    settings.artifacts_dir = tmp_path / "artifacts"

    try:
        upstream = client.post(
            "/api/v1/tasks",
            json={
                "title": "上游 PM 任务",
                "assigned_agent": "PM",
            },
        ).json()
        downstream_pm = client.post(
            "/api/v1/tasks",
            json={
                "title": "下游 PM 任务",
                "assigned_agent": "AUTO",
                "depends_on": [upstream["id"]],
            },
        ).json()
        downstream_dev = client.post(
            "/api/v1/tasks",
            json={
                "title": "下游 Dev 实现",
                "assigned_agent": "DEV",
                "depends_on": [downstream_pm["id"]],
            },
        ).json()
        downstream_qa = client.post(
            "/api/v1/tasks",
            json={
                "title": "下游 QA 验证",
                "assigned_agent": "QA",
                "depends_on": [downstream_dev["id"]],
            },
        ).json()

        response = client.post(f"/api/v1/tasks/{upstream['id']}/run")

        assert response.status_code == 200
        assert response.json()["status"] == "DONE"

        downstream_pm_response = client.get(f"/api/v1/tasks/{downstream_pm['id']}")
        downstream_dev_response = client.get(f"/api/v1/tasks/{downstream_dev['id']}")
        downstream_qa_response = client.get(f"/api/v1/tasks/{downstream_qa['id']}")

        assert downstream_pm_response.status_code == 200
        assert downstream_pm_response.json()["status"] == "DONE"
        assert downstream_dev_response.status_code == 200
        assert downstream_dev_response.json()["status"] == "DONE"
        assert downstream_dev_response.json()["output"]["implementation_doc"]["path"]
        assert downstream_qa_response.status_code == 200
        assert downstream_qa_response.json()["status"] == "DONE"
        assert downstream_qa_response.json()["output"]["qa_report"]["path"]
    finally:
        settings.artifacts_dir = original_artifacts_dir


def test_run_task_rejects_unfinished_dependencies(client, tmp_path) -> None:
    settings = get_settings()
    original_artifacts_dir = settings.artifacts_dir
    settings.artifacts_dir = tmp_path / "artifacts"

    try:
        upstream = client.post(
            "/api/v1/tasks",
            json={
                "title": "上游任务",
                "assigned_agent": "PM",
            },
        ).json()
        downstream = client.post(
            "/api/v1/tasks",
            json={
                "title": "下游任务",
                "assigned_agent": "AUTO",
                "depends_on": [upstream["id"]],
            },
        ).json()

        response = client.post(f"/api/v1/tasks/{downstream['id']}/run")

        assert response.status_code == 409
        assert "dependencies are not completed" in response.json()["detail"]
    finally:
        settings.artifacts_dir = original_artifacts_dir


def test_run_task_retries_once_then_succeeds(client, tmp_path, monkeypatch) -> None:
    settings = get_settings()
    original_artifacts_dir = settings.artifacts_dir
    original_retries = settings.task_max_retries
    settings.artifacts_dir = tmp_path / "artifacts"
    settings.task_max_retries = 1
    original_run_task = AgentRunnerService.run_task
    calls = {"count": 0}

    def flaky_run_task(self, *, task, agent, dependencies):
        if calls["count"] == 0:
            calls["count"] += 1
            raise RuntimeError("temporary provider outage")

        return original_run_task(self, task=task, agent=agent, dependencies=dependencies)

    monkeypatch.setattr(AgentRunnerService, "run_task", flaky_run_task)

    try:
        task = client.post(
            "/api/v1/tasks",
            json={
                "title": "需要一次重试的任务",
                "assigned_agent": "AUTO",
            },
        ).json()

        response = client.post(f"/api/v1/tasks/{task['id']}/run")

        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "DONE"
        assert payload["retry_count"] == 1
        assert payload["output"]["prd_markdown"]["path"]
    finally:
        settings.artifacts_dir = original_artifacts_dir
        settings.task_max_retries = original_retries
