import re
from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import User
from ..extensions import db


auth_bp = Blueprint("auth", __name__)

def _validate_password(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    if not re.search(r"[^A-Za-z0-9]", password):
        return False
    return True

def _is_it_department(user: User) -> bool:
    return (user.department or "").strip().lower() == "it"

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


@auth_bp.post("/account-eligibility")
def account_eligibility():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "").strip().lower()
    if not email:
        return jsonify({"message": "Email is required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "No account found for that email."}), 404
    if not _is_it_department(user):
        return jsonify({"message": "You do not have access to create an account."}), 403

    return jsonify({"eligible": True, "department": user.department})


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
