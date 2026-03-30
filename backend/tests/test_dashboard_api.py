def test_dashboard_stats_aggregates_tasks_and_agents(client) -> None:
    client.post(
        "/api/v1/tasks",
        json={
            "title": "认证模块需求细化",
            "description": "补齐登录接口的验收标准",
            "assigned_agent": "PM",
        },
    )
    client.post(
        "/api/v1/tasks",
        json={
            "title": "实现 JWT 登录接口",
            "description": "进入开发执行阶段",
            "assigned_agent": "DEV",
        },
    )

    response = client.get("/api/v1/dashboard/stats")

    assert response.status_code == 200

    payload = response.json()
    assert payload["task_summary"]["total"] == 2
    assert payload["agent_summary"]["total"] == 3
    assert len(payload["tasks_by_agent"]) == 3
    assert len(payload["activity_bars"]) == 7
    assert len(payload["recent_tasks"]) == 2
