def test_list_teams_seeds_default_team(client) -> None:
    response = client.get("/api/v1/teams")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "Core Delivery Team"
    assert payload[0]["member_count"] == 3


def test_create_team_assigns_agents(client) -> None:
    agents = client.get("/api/v1/agents").json()

    response = client.post(
        "/api/v1/teams",
        json={
            "name": "Growth Team",
            "focus": "增长实验",
            "description": "负责拉新与转化主链路。",
            "color": "green",
            "agent_ids": [agents[0]["id"], agents[1]["id"]],
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["name"] == "Growth Team"
    assert payload["member_count"] == 2
    assert len(payload["agent_ids"]) == 2
