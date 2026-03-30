def test_list_agents_seeds_default_agents(client) -> None:
    first_response = client.get("/api/v1/agents")

    assert first_response.status_code == 200

    first_payload = first_response.json()
    assert len(first_payload) == 3
    assert {agent["id"] for agent in first_payload} == {
        "agent-pm",
        "agent-dev",
        "agent-qa",
    }

    second_response = client.get("/api/v1/agents")

    assert second_response.status_code == 200
    assert len(second_response.json()) == 3


def test_create_agent_with_skills_and_team(client) -> None:
    skills_response = client.get("/api/v1/skills")
    teams_response = client.get("/api/v1/teams")

    assert skills_response.status_code == 200
    assert teams_response.status_code == 200

    response = client.post(
        "/api/v1/agents",
        json={
            "name": "Review Agent",
            "role": "QA",
            "skills": ["risk-review", "bug-report"],
            "team_ids": [teams_response.json()[0]["id"]],
            "status": "IDLE",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "Review Agent"
    assert payload["role"] == "QA"
    assert payload["skills"] == ["risk-review", "bug-report"]
    assert teams_response.json()[0]["id"] in payload["team_ids"]
