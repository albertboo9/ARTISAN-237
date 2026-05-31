import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"

@pytest.mark.asyncio
async def test_recommendations_endpoint(client):
    response = await client.post("/api/v1/recommendations", json={
        "user_id": "test-user",
        "job_category": "ELECTRICIAN",
        "location": {"latitude": 4.0511, "longitude": 9.7679},
        "max_distance_km": 20.0,
        "max_results": 10
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "metadata" in data

@pytest.mark.asyncio
async def test_categories_endpoint(client):
    response = await client.get("/api/v1/categories")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_recommendation_response_time(client):
    import time
    start = time.time()
    response = await client.post("/api/v1/recommendations", json={
        "user_id": "test-user",
        "job_category": "PLUMBER",
        "location": {"latitude": 4.0511, "longitude": 9.7679},
    })
    elapsed_ms = (time.time() - start) * 1000
    assert elapsed_ms < 300, f"Response took {elapsed_ms:.0f}ms, target <300ms"
    assert response.status_code == 200