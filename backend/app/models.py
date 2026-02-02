from datetime import datetime
from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(40), nullable=False, default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    devices = db.relationship("Device", back_populates="user", cascade="all, delete")
    computers = db.relationship("Computer", back_populates="user", cascade="all, delete")


class Device(db.Model):
    __tablename__ = "devices"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    model = db.Column(db.String(120), nullable=False)
    os_version = db.Column(db.String(80), nullable=True)
    serial_number = db.Column(db.String(120), unique=True, nullable=False)
    udid = db.Column(db.String(120), unique=True, nullable=True)
    compliant = db.Column(db.Boolean, default=True, nullable=False)
    primary_mac = db.Column(db.String(50), nullable=True)
    secondary_mac = db.Column(db.String(50), nullable=True)
    processor_type = db.Column(db.String(80), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = db.relationship("User", back_populates="devices")


class Computer(db.Model):
    __tablename__ = "computers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    model = db.Column(db.String(120), nullable=False)
    os_version = db.Column(db.String(80), nullable=True)
    serial_number = db.Column(db.String(120), unique=True, nullable=False)
    model_identifier = db.Column(db.String(120), nullable=True)
    compliant = db.Column(db.Boolean, default=True, nullable=False)
    processor_type = db.Column(db.String(80), nullable=True)
    architecture_type = db.Column(db.String(80), nullable=True)
    cache_size = db.Column(db.String(50), nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    user = db.relationship("User", back_populates="computers")
