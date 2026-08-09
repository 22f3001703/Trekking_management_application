import os
from flask import Flask
from config import Config
from extensions import db, mail, cache
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')
app = Flask(
    __name__,
    template_folder=FRONTEND_DIR,
    static_folder=FRONTEND_DIR,
    static_url_path='/static'
)
app.config.from_object(Config)
app.debug = True
db.init_app(app)
mail.init_app(app)
cache.init_app(app)
app.app_context().push()
from celery_app import make_celery
celery = make_celery(app)
os.makedirs(Config.EXPORT_DIR, exist_ok=True)
from routes.Login import login_bp
from routes.auth import auth_bp
from routes.trek import trek_bp
from routes.staff import staff_bp
from routes.booking import booking_bp
from routes.export import export_bp
app.register_blueprint(login_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(trek_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(export_bp)
from models.models import User, Trek, Booking, StaffProfile
with app.app_context():
    db.create_all()
if __name__ == '__main__':
    app.run(debug=True, port=5000)
