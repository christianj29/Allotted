from flask import Blueprint, jsonify

from ..models import Computer


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


@computers_bp.get("/<int:computer_id>")
def get_computer(computer_id: int):
    computer = Computer.query.get_or_404(computer_id)
    return jsonify(_to_dict(computer))
