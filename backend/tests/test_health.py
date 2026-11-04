import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "project" in data
    assert "version" in data
    assert data["api_v1"] == "/api/v1"


@pytest.mark.asyncio
async def test_health_check_healthy():
    with patch("backend.app.main.check_db_health", return_value=True):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["services"]["api"] == "healthy"
        assert data["services"]["database"] == "connected"
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_check_degraded():
    with patch("backend.app.main.check_db_health", return_value=False):
        response = client.get("/api/v1/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "degraded"
        assert data["services"]["api"] == "healthy"
        assert data["services"]["database"] == "disconnected"
