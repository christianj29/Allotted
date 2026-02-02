from werkzeug.security import generate_password_hash

from .extensions import db
from .models import User, Device, Computer


def seed_database():
    if User.query.first():
        return

    admin = User(
        username="cbasuel",
        full_name="Christian Basuel",
        email="cbasuel@email.com",
        password_hash=generate_password_hash("password123"),
        role="admin",
    )

    ben = User(
        username="bbrashaw",
        full_name="Ben Brashaw",
        email="bbrashaw@email.com",
        password_hash=generate_password_hash("password123"),
        role="manager",
    )

    db.session.add_all([admin, ben])
    db.session.flush()

    db.session.add_all(
        [
            Device(
                name="iPad 1",
                model="11-Inch iPad Pro (2025)",
                os_version="iPadOS 26",
                serial_number="DVC-10001",
                udid="9E61A270-28D5-5260-86AB-EQ4FA0A446FF",
                compliant=True,
                primary_mac="A4:5E:60:DB:3F:49",
                processor_type="A16",
                user_id=admin.id,
            ),
            Device(
                name="iPad 2",
                model="11-Inch iPad Pro (2025)",
                os_version="iPadOS 26",
                serial_number="DVC-10002",
                compliant=False,
                user_id=ben.id,
            ),
            Computer(
                name="Christian's Macbook Pro",
                model="13-inch Macbook Pro (Early 2015)",
                os_version="macOS 10.13.0",
                serial_number="CMP-20001",
                model_identifier="MacBookPro12,1",
                compliant=True,
                processor_type="Intel Core i5",
                architecture_type="x86_64",
                cache_size="3 MB",
                user_id=admin.id,
            ),
            Computer(
                name="Ben's Macbook Pro",
                model="16-Inch Macbook Pro (2020)",
                os_version="macOS 14.0",
                serial_number="CMP-20002",
                compliant=False,
                processor_type="M1",
                architecture_type="arm64",
                cache_size="8 MB",
                user_id=ben.id,
            ),
        ]
    )

    db.session.commit()
