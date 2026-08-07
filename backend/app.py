import os
from database import db
from flask import Flask, render_template

# Paths
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(
    __name__,
    template_folder=FRONTEND_DIR,
    static_folder=FRONTEND_DIR,
    static_url_path='/static'
)
app.debug=True
app.config["SQLALCHEMY_DATABASE_URI"]= 'sqlite:///trekking.db'
db.init_app(app)
app.app_context().push()
app.secret_key = "123456"

from routes.Login import login_bp
from routes.auth import auth_bp
from routes.trek import trek_bp
from routes.staff import staff_bp
from routes.booking import booking_bp

app.register_blueprint(login_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(trek_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(booking_bp)

# Import models so SQLAlchemy creates tables
from models.models import User, Trek, Booking, StaffProfile
with app.app_context():
    db.create_all()


if __name__ == '__main__':
    app.run(debug=True, port=5000)
