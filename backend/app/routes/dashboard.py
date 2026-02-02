from flask import Blueprint, jsonify

from ..models import User, Device, Computer


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/summary")
def summary():
    computers = Computer.query.count()
    devices = Device.query.count()
    users = User.query.count()

    compliant_computers = Computer.query.filter_by(compliant=True).count()
    compliant_devices = Device.query.filter_by(compliant=True).count()

    return jsonify(
        {
            "counts": {
                "computers": computers,
                "devices": devices,
                "users": users,
            },
            "compliance": {
                "computers": {
                    "compliant": compliant_computers,
                    "nonCompliant": max(computers - compliant_computers, 0),
                },
                "devices": {
                    "compliant": compliant_devices,
                    "nonCompliant": max(devices - compliant_devices, 0),
                },
            },
        }
    )
