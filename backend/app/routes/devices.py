from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Device, User


devices_bp = Blueprint("devices", __name__)


def _to_dict(device: Device):
    return {
        "id": device.id,
        "name": device.name,
        "model": device.model,
        "osVersion": device.os_version,
        "serialNumber": device.serial_number,
        "udid": device.udid,
        "compliant": device.compliant,
        "processorType": device.processor_type,
        "primaryMacAddress": device.primary_mac,
        "secondaryMacAddress": device.secondary_mac,
        "user": device.user.username if device.user else None,
    }


@devices_bp.get("")
def list_devices():
    devices = Device.query.order_by(Device.id.desc()).all()
    return jsonify([_to_dict(d) for d in devices])


@devices_bp.post("")
def create_device():
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    model = (payload.get("model") or "").strip()
    os_version = (payload.get("osVersion") or "").strip() or None
    serial_number = (payload.get("serialNumber") or "").strip()
    udid = (payload.get("udid") or "").strip() or None
    processor_type = (payload.get("processorType") or "").strip() or None
    primary_mac = (payload.get("primaryMacAddress") or "").strip() or None
    secondary_mac = (payload.get("secondaryMacAddress") or "").strip() or None
    compliant = payload.get("compliant", False)
    user_id = payload.get("userId")

    if not name or not model or not serial_number:
        return jsonify({"message": "Missing required fields."}), 400
    if Device.query.filter_by(serial_number=serial_number).first():
        return jsonify({"message": "Serial number already exists."}), 409

    user = None
    if user_id is not None:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found."}), 404

    device = Device(
        name=name,
        model=model,
        os_version=os_version,
        serial_number=serial_number,
        udid=udid,
        processor_type=processor_type,
        primary_mac=primary_mac,
        secondary_mac=secondary_mac,
        compliant=bool(compliant),
        user=user,
    )
    db.session.add(device)
    db.session.commit()

    return jsonify(_to_dict(device)), 201


@devices_bp.route("/<int:device_id>", methods=["PUT", "PATCH"])
def update_device(device_id: int):
    device = Device.query.get_or_404(device_id)
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    model = (payload.get("model") or "").strip()
    os_version = (payload.get("osVersion") or "").strip() or None
    serial_number = (payload.get("serialNumber") or "").strip()
    udid = (payload.get("udid") or "").strip() or None
    processor_type = (payload.get("processorType") or "").strip() or None
    primary_mac = (payload.get("primaryMacAddress") or "").strip() or None
    secondary_mac = (payload.get("secondaryMacAddress") or "").strip() or None
    compliant = payload.get("compliant", device.compliant)
    user_id = payload.get("userId")

    if not name or not model or not serial_number:
        return jsonify({"message": "Missing required fields."}), 400

    if serial_number != device.serial_number:
        existing = Device.query.filter_by(serial_number=serial_number).first()
        if existing:
            return jsonify({"message": "Serial number already exists."}), 409

    user = None
    if user_id is not None:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found."}), 404

    device.name = name
    device.model = model
    device.os_version = os_version
    device.serial_number = serial_number
    device.udid = udid
    device.processor_type = processor_type
    device.primary_mac = primary_mac
    device.secondary_mac = secondary_mac
    device.compliant = bool(compliant)
    device.user = user

    db.session.commit()
    return jsonify(_to_dict(device)), 200


@devices_bp.delete("/<int:device_id>")
def delete_device(device_id: int):
    device = Device.query.get_or_404(device_id)
    db.session.delete(device)
    db.session.commit()
    return "", 204


@devices_bp.get("/<int:device_id>")
def get_device(device_id: int):
    device = Device.query.get_or_404(device_id)
    return jsonify(_to_dict(device))
