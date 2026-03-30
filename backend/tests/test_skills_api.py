def test_list_skills_seeds_default_library(client) -> None:
    response = client.get("/api/v1/skills")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 8
    assert any(item["slug"] == "requirements" for item in payload)


def test_create_skill_persists_library_item(client) -> None:
    response = client.post(
        "/api/v1/skills",
        json={
            "name": "Code Review",
            "category": "engineering",
            "description": "负责高风险代码审阅和结构检查。",
            "prompt_hint": "适合专项审阅 Agent。",
            "is_core": True,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["slug"] == "code-review"
    assert payload["is_core"] is True
