from flask import Blueprint, jsonify

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
