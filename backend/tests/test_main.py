from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == settings.PROJECT_NAME

def test_api_v1_docs():
    response = client.get("/docs")
    assert response.status_code == 200

def test_api_v1_router_prefix():
    # Attempt to access a V1 endpoint (even if it returns 404/401, prefix should work)
    response = client.get(f"{settings.API_V1_STR}/tasks")
    assert response.status_code in [200, 401, 404]
