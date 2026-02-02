from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from ..models import User
from ..extensions import db


auth_bp = Blueprint("auth", __name__)


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
