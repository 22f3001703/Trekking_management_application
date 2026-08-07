from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database import db
from models.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400


    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
        role='trekker',
        phone=data.get('phone', '').strip() or None
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Registration successful',
        'user': new_user.to_dict()
    }), 201
