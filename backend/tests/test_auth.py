import pytest
from fastapi import status


def test_register_new_user(client):
    """Test user registration with valid data."""
    response = client.post(
        "/auth/register",
        json={
            "name": "New User",
            "email": "newuser@test.com",
            "password": "password123",
            "role": "viewer"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["name"] == "New User"
    assert "password" not in data


def test_register_duplicate_email(client, admin_user):
    """Test that registering with existing email fails."""
    response = client.post(
        "/auth/register",
        json={
            "name": "Duplicate",
            "email": admin_user.email,
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, admin_user):
    """Test successful login with valid credentials."""
    response = client.post(
        "/auth/login",
        data={
            "username": admin_user.email,
            "password": "testpass123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] in ["admin", "Admin"]


def test_login_invalid_credentials(client, admin_user):
    """Test login failure with wrong password."""
    response = client.post(
        "/auth/login",
        data={
            "username": admin_user.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "incorrect" in response.json()["detail"].lower()


def test_login_nonexistent_user(client):
    """Test login failure with non-existent user."""
    response = client.post(
        "/auth/login",
        data={
            "username": "nonexistent@test.com",
            "password": "password123"
        }
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_get_profile_authenticated(client, admin_user):
    """Test fetching user profile when authenticated."""
    # Login first
    login_response = client.post(
        "/auth/login",
        data={"username": admin_user.email, "password": "testpass123"}
    )
    assert login_response.status_code == status.HTTP_200_OK
    
    # Get profile
    response = client.get("/auth/profile")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == admin_user.email
    assert data["name"] == admin_user.name


def test_get_profile_unauthenticated(client):
    """Test that unauthenticated users cannot access profile."""
    response = client.get("/auth/profile")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_logout(client, admin_user):
    """Test logout invalidates tokens."""
    # Login first
    login_response = client.post(
        "/auth/login",
        data={"username": admin_user.email, "password": "testpass123"}
    )
    assert login_response.status_code == status.HTTP_200_OK
    
    # Logout
    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == status.HTTP_200_OK
    assert logout_response.json()["ok"] is True
    
    # Try to access profile (should fail after logout)
    profile_response = client.get("/auth/profile")
    assert profile_response.status_code == status.HTTP_401_UNAUTHORIZED
