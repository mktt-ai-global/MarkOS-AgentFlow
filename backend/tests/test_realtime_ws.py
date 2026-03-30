def test_workspace_websocket_streams_snapshot_updates(client) -> None:
    with client.websocket_connect("/api/v1/ws/workspace") as websocket:
        initial = websocket.receive_json()

        assert initial["type"] == "workspace.snapshot"
        assert "tasks" in initial["payload"]
        assert "agents" in initial["payload"]
        assert "teams" in initial["payload"]
        assert "skills" in initial["payload"]
        assert "dashboard_stats" in initial["payload"]

        created = client.post(
            "/api/v1/tasks",
            json={
                "title": "WebSocket 同步任务",
                "assigned_agent": "PM",
            },
        )

        assert created.status_code == 201

        updated = websocket.receive_json()
        task_titles = [task["title"] for task in updated["payload"]["tasks"]]

        assert "WebSocket 同步任务" in task_titles
