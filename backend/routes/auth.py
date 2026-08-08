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


# ---------- GET /api/admin/search ----------
@auth_bp.route('/admin/search', methods=['GET'])
def admin_search():
    q = request.args.get('q', '').strip()
    
    if not q:
        return jsonify({
            'query': '',
            'results': {
                'users': [],
                'staff': [],
                'treks': []
            }
        }), 200

    search_pattern = f"%{q}%"

    # 1. Search Users (Trekkers)
    users_query = User.query.filter(
        User.role.in_(['trekker', 'user']),
        (User.name.ilike(search_pattern) | User.email.ilike(search_pattern) | User.phone.ilike(search_pattern))
    ).order_by(User.created_at.desc()).all()

    users_res = []
    for u in users_query:
        u_dict = u.to_dict()
        u_dict['bookings_count'] = len(u.bookings) if u.bookings else 0
        users_res.append(u_dict)

    # 2. Search Staff (User + StaffProfile)
    from models.models import StaffProfile, Trek
    staff_query = db.session.query(User).outerjoin(StaffProfile, User.id == StaffProfile.user_id).filter(
        User.role == 'staff',
        (
            User.name.ilike(search_pattern) | 
            User.email.ilike(search_pattern) | 
            User.phone.ilike(search_pattern) |
            StaffProfile.specialization.ilike(search_pattern)
        )
    ).order_by(User.created_at.desc()).all()

    staff_res = []
    for s in staff_query:
        s_dict = s.to_dict()
        if s.staff_profile:
            s_dict['specialization'] = s.staff_profile.specialization
            s_dict['experience_years'] = s.staff_profile.experience_years
        else:
            s_dict['specialization'] = 'General Guide'
            s_dict['experience_years'] = 0
        
        s_dict['assigned_treks_count'] = len(s.assigned_treks) if s.assigned_treks else 0
        staff_res.append(s_dict)

    # 3. Search Treks
    treks_query = Trek.query.filter(
        (
            Trek.name.ilike(search_pattern) |
            Trek.location.ilike(search_pattern) |
            Trek.difficulty.ilike(search_pattern) |
            Trek.status.ilike(search_pattern) |
            Trek.description.ilike(search_pattern)
        )
    ).order_by(Trek.created_at.desc()).all()

    treks_res = []
    for t in treks_query:
        t_dict = t.to_dict()
        t_dict['assigned_staff_name'] = t.assigned_staff.name if t.assigned_staff else 'Unassigned'
        treks_res.append(t_dict)

    return jsonify({
        'query': q,
        'results': {
            'users': users_res,
            'staff': staff_res,
            'treks': treks_res
        }
    }), 200

