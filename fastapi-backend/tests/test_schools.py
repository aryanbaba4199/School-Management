import pytest
from fastapi.testclient import TestClient

def test_school_draft_lifecycle(client: TestClient):
    response = client.post(
        "/api/school/drafts",
        json={
            "email": "owner@newschool.com",
            "data": {
                "name": "New School",
                "phone": "9999999999"
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "owner@newschool.com"

    response2 = client.get("/api/school/drafts/owner@newschool.com")
    assert response2.status_code == 200
    assert response2.json()["data"]["name"] == "New School"
