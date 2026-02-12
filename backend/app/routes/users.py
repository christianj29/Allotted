import re
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from ..extensions import db
from ..models import User


users_bp = Blueprint("users", __name__)


def _to_dict(user: User):
    primary_device = user.devices[0] if user.devices else None
    primary_computer = user.computers[0] if user.computers else None

    return {
        "id": user.id,
        "username": user.username,
        "fullName": user.full_name,
        "email": user.email,
        "role": user.role,
        "department": user.department,
        "deviceName": primary_device.name if primary_device else None,
        "computerName": primary_computer.name if primary_computer else None,
        "model": (
            primary_computer.model
            if primary_computer
            else (primary_device.model if primary_device else None)
        ),
    }


@users_bp.get("")
def list_users():
    users = User.query.order_by(User.id.desc()).all()
    return jsonify([_to_dict(u) for u in users])


def _build_username(first_name: str, last_name: str) -> str:
    base = f"{first_name[:1]}{last_name}".lower()
    base = re.sub(r"[^a-z0-9]", "", base)
    if not base:
        raise ValueError("Invalid name for username generation.")

    username = base
    counter = 1
    while User.query.filter_by(username=username).first():
        counter += 1
        username = f"{base}{counter}"
    return username


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


@users_bp.post("")
def create_user():
    payload = request.get_json(silent=True) or {}
    first_name = (payload.get("firstName") or "").strip()
    last_name = (payload.get("lastName") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    role = (payload.get("role") or "").strip()
    department = (payload.get("department") or "").strip()

    if not first_name or not last_name or not email or not role or not department:
        return jsonify({"message": "Missing required fields."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists."}), 409

    try:
        username = _build_username(first_name, last_name)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400

    user = User(
        username=username,
        full_name=f"{first_name} {last_name}",
        email=email,
        password_hash=generate_password_hash("password123"),
        role=role,
        department=department,
    )
    User.query.session.add(user)
    User.query.session.commit()

    return jsonify({"user": _to_dict(user)}), 201


@users_bp.get("/<int:user_id>")
def get_user(user_id: int):
    user = User.query.get_or_404(user_id)
    payload = _to_dict(user)
    payload["devices"] = [
        {"id": d.id, "name": d.name, "model": d.model, "serialNumber": d.serial_number}
        for d in user.devices
    ]
    payload["computers"] = [
        {"id": c.id, "name": c.name, "model": c.model, "serialNumber": c.serial_number}
        for c in user.computers
    ]
    return jsonify(payload)


@users_bp.route("/<int:user_id>", methods=["PUT", "PATCH"])
def update_user(user_id: int):
    user = User.query.get_or_404(user_id)
    payload = request.get_json(silent=True) or {}

    full_name = (payload.get("fullName") or "").strip()
    username = (payload.get("username") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    role = (payload.get("role") or "").strip()
    department = (payload.get("department") or "").strip()

    if not full_name or not username or not email or not role or not department:
        return jsonify({"message": "Missing required fields."}), 400

    if username != user.username and User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists."}), 409
    if email != user.email and User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists."}), 409

    user.full_name = full_name
    user.username = username
    user.email = email
    user.role = role
    user.department = department

    db.session.commit()
    return jsonify(_to_dict(user)), 200


@users_bp.delete("/<int:user_id>")
def delete_user(user_id: int):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return "", 204
