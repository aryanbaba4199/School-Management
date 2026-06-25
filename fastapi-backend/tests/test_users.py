import pytest
from fastapi.testclient import TestClient

def test_read_users_without_auth(client: TestClient):
    response = client.get("/api/user/")
    assert response.status_code == 401

def test_read_users_with_auth(client: TestClient, superadmin_token_headers):
    response = client.get("/api/user/", headers=superadmin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert type(data) == list
    assert len(data) >= 1

def test_create_user(client: TestClient, superadmin_token_headers):
    # To test creating a user, we should not have duplicate email
    response = client.post(
        "/api/user/",
        headers=superadmin_token_headers,
        json={
            "email": "newuser@test.com",
            "password": "newpassword123",
            "name": "New User",
            "user_code": "TEACH001",
            "role": "TEACHER"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert "id" in data
