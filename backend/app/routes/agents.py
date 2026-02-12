import time
import uuid
from typing import Dict, List

from flask import Blueprint, jsonify, request

from ..extensions import db
from ..models import Computer


agents_bp = Blueprint("agents", __name__)

# In-memory command queue for demo purposes.
# Structure: { agent_id: [ {id, type, payload, status, createdAt} ] }
_agent_commands: Dict[str, List[dict]] = {}


@agents_bp.post("/<agent_id>/commands")
def create_command(agent_id: str):
    payload = request.get_json(silent=True) or {}
    command_type = (payload.get("type") or "").strip().lower()
    command_payload = payload.get("payload") or {}

    if not command_type:
        return jsonify({"message": "Command type is required."}), 400

    command = {
        "id": uuid.uuid4().hex,
        "type": command_type,
        "payload": command_payload,
        "status": "queued",
        "createdAt": int(time.time()),
    }
    _agent_commands.setdefault(agent_id, []).append(command)
    return jsonify(command), 201


@agents_bp.get("/<agent_id>/commands/next")
def get_next_command(agent_id: str):
    queue = _agent_commands.get(agent_id, [])
    if not queue:
        return jsonify({"command": None}), 200

    command = queue.pop(0)
    command["status"] = "dispatched"
    return jsonify({"command": command}), 200


@agents_bp.post("/<agent_id>/commands/<command_id>/complete")
def complete_command(agent_id: str, command_id: str):
    payload = request.get_json(silent=True) or {}
    status = (payload.get("status") or "completed").strip().lower()
    command_payload = payload.get("payload") or {}

    if status not in {"completed", "failed"}:
        return jsonify({"message": "Invalid status."}), 400

    if command_payload.get("computerId"):
        computer = Computer.query.get(command_payload["computerId"])
        if computer:
            computer.compliant = status == "completed"
            db.session.commit()

    return jsonify({"status": status}), 200
