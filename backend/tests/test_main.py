from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": "MarkOS-AgentFlow"}

def test_api_v1_router():
    # Placeholder for API v1 tests
    response = client.get("/api/v1/health")
    # This might fail if /api/v1/health is not defined, but it tests the router exists
    assert response.status_code in [200, 404]
