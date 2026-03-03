import re
from flask import Blueprint, jsonify, request
import time
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import User
from ..extensions import db


auth_bp = Blueprint("auth", __name__)

# Short-lived cache to speed up repeated eligibility checks for the same email.
# This reduces DB lookups during account creation when users retry or double-click.
_ELIGIBILITY_CACHE_TTL_SECONDS = 60
_eligibility_cache: dict[str, tuple[float, dict, int]] = {}

# Validate password strength for account creation.
def _validate_password(password: str) -> bool:
    # Enforce baseline password strength for account creation.
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

# Check whether a user belongs to the IT department.
def _is_it_department(user: User) -> bool:
    # Only IT department users are eligible to create accounts.
    return (user.department or "").strip().lower() == "it"

# Authenticate a user with email/password and return a dev token.
@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid credentials."}), 401

    return jsonify(
        {
            # Dev-only token to keep the demo flow simple.
            "token": f"dev-token-{user.id}",
            "user": {
                "id": user.id,
                "username": user.username,
                "fullName": user.full_name,
                "email": user.email,
                "role": user.role,
            },
        }
    )


# Authenticate a user via Auth0 email lookup and return a dev token.
@auth_bp.post("/auth0-login")
def auth0_login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()

    if not email:
        return jsonify({"message": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found for that email."}), 404

    return jsonify(
        {
            # Dev-only token to keep the demo flow simple.
            "token": f"dev-token-{user.id}",
            "user": {
                "id": user.id,
                "username": user.username,
                "fullName": user.full_name,
                "email": user.email,
                "role": user.role,
            },
        }
    )


# Update a user's password after validating inputs.
@auth_bp.post("/forgot-password")
def forgot_password():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    new_password = payload.get("newPassword", "")

    if not email or not new_password:
        return jsonify({"message": "Email and new password are required."}), 400

    if len(new_password) < 8:
        return jsonify({"message": "New password must be at least 8 characters."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found for that email."}), 404

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully."})


# Check if a user is eligible to create an account (cached).
@auth_bp.post("/account-eligibility")
def account_eligibility():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    if not email:
        return jsonify({"message": "Email is required."}), 400

    # Return cached result if it's still fresh.
    cached = _eligibility_cache.get(email)
    if cached:
        cached_at, cached_payload, cached_status = cached
        if time.time() - cached_at < _ELIGIBILITY_CACHE_TTL_SECONDS:
            return jsonify(cached_payload), cached_status
        _eligibility_cache.pop(email, None)

    # Single indexed lookup by email; cache the result for quick repeats.
    user = User.query.filter_by(email=email).first()
    if not user:
        payload = {"message": "No account found for that email."}
        _eligibility_cache[email] = (time.time(), payload, 404)
        return jsonify(payload), 404
    if not _is_it_department(user):
        payload = {"message": "You do not have access to create an account."}
        _eligibility_cache[email] = (time.time(), payload, 403)
        return jsonify(payload), 403

    payload = {"eligible": True, "department": user.department}
    _eligibility_cache[email] = (time.time(), payload, 200)
    return jsonify(payload)


# Set a password for an eligible user.
@auth_bp.post("/create-account")
def create_account():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    if not _validate_password(password):
        return jsonify({"message": "Password does not meet requirements."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found for that email."}), 404
    if not _is_it_department(user):
        return jsonify({"message": "You do not have access to create an account."}), 403

    user.password_hash = generate_password_hash(password)
    db.session.commit()
    return jsonify({"message": "Account created. You can now log in."})
