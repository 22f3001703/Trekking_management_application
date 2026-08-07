from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.models import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

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


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', '').strip().lower()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if user.status != 1:
        return jsonify({'error': 'Account is deactivated or blacklisted'}), 403

    if role and user.role != role:
        return jsonify({'error': f'Selected role ({role.capitalize()}) does not match account role ({user.role.capitalize()})'}), 400

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200


# ---------- GET /api/users ----------
@auth_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.filter(User.role.in_(['trekker', 'user'])).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        u_dict = u.to_dict()
        u_dict['bookings_count'] = len(u.bookings) if u.bookings else 0
        result.append(u_dict)
    return jsonify(result), 200


# ---------- PUT /api/users/<int:user_id>/status ----------
@auth_bp.route('/users/<int:user_id>/status', methods=['PUT'])
def update_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')

    if new_status not in [0, 1, 2]:
        return jsonify({'error': 'Invalid status. Expected 1 (Active), 2 (Deactivated), or 0 (Blacklisted)'}), 400

    user.status = new_status
    db.session.commit()

    status_labels = {1: 'Active', 2: 'Deactivated', 0: 'Blacklisted'}
    return jsonify({
        'message': f'User status updated to {status_labels[new_status]}',
        'user': user.to_dict()
    }), 200
