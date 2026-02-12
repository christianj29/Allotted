from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .extensions import db
from .routes.auth import auth_bp
from .routes.dashboard import dashboard_bp
from .routes.users import users_bp
from .routes.devices import devices_bp
from .routes.computers import computers_bp
from .routes.agents import agents_bp
from .seed import seed_database


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)
    db.init_app(app)

    @app.get("/api/health")
    def health_check():
        return jsonify({"status": "ok"})

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(devices_bp, url_prefix="/api/devices")
    app.register_blueprint(computers_bp, url_prefix="/api/computers")
    app.register_blueprint(agents_bp, url_prefix="/api/agents")

    with app.app_context():
        db.create_all()
        seed_database()

    return app
