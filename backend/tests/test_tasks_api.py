def test_create_and_get_task(client) -> None:
    create_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "认证模块接口定义",
            "description": "整理登录与 refresh token 主链路",
            "assigned_agent": "PM",
        },
    )

    assert create_response.status_code == 201

    created_task = create_response.json()
    assert created_task["title"] == "认证模块接口定义"
    assert created_task["status"] == "PENDING"
    assert created_task["depends_on"] == []

    get_response = client.get(f"/api/v1/tasks/{created_task['id']}")

    assert get_response.status_code == 200
    assert get_response.json()["id"] == created_task["id"]


def test_create_task_rejects_missing_dependencies(client) -> None:
    response = client.post(
        "/api/v1/tasks",
        json={
            "title": "依赖校验测试",
            "depends_on": ["missing-task-id"],
        },
    )

    assert response.status_code == 422
    payload = response.json()
    assert payload["detail"]["missing_dependency_ids"] == ["missing-task-id"]


def test_list_tasks_returns_latest_items(client) -> None:
    first_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "先创建的任务",
            "assigned_agent": "PM",
        },
    )
    second_response = client.post(
        "/api/v1/tasks",
        json={
            "title": "后创建的任务",
            "assigned_agent": "DEV",
            "depends_on": [first_response.json()["id"]],
        },
    )

    assert second_response.status_code == 201

    list_response = client.get("/api/v1/tasks")

    assert list_response.status_code == 200
    payload = list_response.json()
    assert len(payload) == 2
    assert {task["title"] for task in payload} == {"先创建的任务", "后创建的任务"}
