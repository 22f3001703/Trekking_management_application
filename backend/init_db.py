from app import app
from database import db
from models.models import User
from werkzeug.security import generate_password_hash
def init_database():
    with app.app_context():
        db.create_all()
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            print("Creating default admin user...")
            default_admin = User(
                name="System Admin",
                email="admin@trekking.com",
                password=generate_password_hash("admin123"),
                role="admin",
                status=1
            )
            db.session.add(default_admin)
            db.session.commit()
            print("Admin user created successfully (email: admin@trekking.com, password: admin123).")
        else:
            print("Admin user already exists.")
if __name__ == '__main__':
    init_database()
