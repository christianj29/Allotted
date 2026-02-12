from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Computer, User


computers_bp = Blueprint("computers", __name__)


def _to_dict(computer: Computer):
    return {
        "id": computer.id,
        "name": computer.name,
        "model": computer.model,
        "osVersion": computer.os_version,
        "serialNumber": computer.serial_number,
        "modelIdentifier": computer.model_identifier,
        "compliant": computer.compliant,
        "processorType": computer.processor_type,
        "architectureType": computer.architecture_type,
        "cacheSize": computer.cache_size,
        "user": computer.user.username if computer.user else None,
    }


@computers_bp.get("")
def list_computers():
    computers = Computer.query.order_by(Computer.id.desc()).all()
    return jsonify([_to_dict(c) for c in computers])


@computers_bp.post("")
def create_computer():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    model = (payload.get("model") or "").strip()
    os_version = (payload.get("osVersion") or "").strip() or None
    serial_number = (payload.get("serialNumber") or "").strip()
    model_identifier = (payload.get("modelIdentifier") or "").strip() or None
    processor_type = (payload.get("processorType") or "").strip() or None
    architecture_type = (payload.get("architectureType") or "").strip() or None
    cache_size = (payload.get("cacheSize") or "").strip() or None
    compliant = payload.get("compliant", False)
    user_id = payload.get("userId")

    if not name or not model or not serial_number:
        return jsonify({"message": "Missing required fields."}), 400
    if Computer.query.filter_by(serial_number=serial_number).first():
        return jsonify({"message": "Serial number already exists."}), 409

    user = None
    if user_id is not None:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found."}), 404

    computer = Computer(
        name=name,
        model=model,
        os_version=os_version,
        serial_number=serial_number,
        model_identifier=model_identifier,
        processor_type=processor_type,
        architecture_type=architecture_type,
        cache_size=cache_size,
        compliant=bool(compliant),
        user=user,
    )
    db.session.add(computer)
    db.session.commit()

    return jsonify(_to_dict(computer)), 201


@computers_bp.route("/<int:computer_id>", methods=["PUT", "PATCH"])
def update_computer(computer_id: int):
    computer = Computer.query.get_or_404(computer_id)
    payload = request.get_json(silent=True) or {}

    name = (payload.get("name") or "").strip()
    model = (payload.get("model") or "").strip()
    os_version = (payload.get("osVersion") or "").strip() or None
    serial_number = (payload.get("serialNumber") or "").strip()
    model_identifier = (payload.get("modelIdentifier") or "").strip() or None
    processor_type = (payload.get("processorType") or "").strip() or None
    architecture_type = (payload.get("architectureType") or "").strip() or None
    cache_size = (payload.get("cacheSize") or "").strip() or None
    compliant = payload.get("compliant", computer.compliant)
    user_id = payload.get("userId")

    if not name or not model or not serial_number:
        return jsonify({"message": "Missing required fields."}), 400

    if serial_number != computer.serial_number:
        existing = Computer.query.filter_by(serial_number=serial_number).first()
        if existing:
            return jsonify({"message": "Serial number already exists."}), 409

    user = None
    if user_id is not None:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found."}), 404

    computer.name = name
    computer.model = model
    computer.os_version = os_version
    computer.serial_number = serial_number
    computer.model_identifier = model_identifier
    computer.processor_type = processor_type
    computer.architecture_type = architecture_type
    computer.cache_size = cache_size
    computer.compliant = bool(compliant)
    computer.user = user

    db.session.commit()
    return jsonify(_to_dict(computer)), 200


@computers_bp.delete("/<int:computer_id>")
def delete_computer(computer_id: int):
    computer = Computer.query.get_or_404(computer_id)
    db.session.delete(computer)
    db.session.commit()
    return "", 204


@computers_bp.get("/<int:computer_id>")
def get_computer(computer_id: int):
    computer = Computer.query.get_or_404(computer_id)
    return jsonify(_to_dict(computer))
