from flask import Blueprint, jsonify

from ..models import Device


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


@devices_bp.get("/<int:device_id>")
def get_device(device_id: int):
    device = Device.query.get_or_404(device_id)
    return jsonify(_to_dict(device))
