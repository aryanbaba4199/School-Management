import pytest
from fastapi.testclient import TestClient

def test_login_success(client: TestClient, superadmin_user):
    response = client.post(
        "/api/user/login",
        data={
            "username": superadmin_user.email,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure(client: TestClient, superadmin_user):
    response = client.post(
        "/api/user/login",
        data={
            "username": superadmin_user.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"
