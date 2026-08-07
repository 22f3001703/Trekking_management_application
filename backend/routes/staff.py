from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database import db
from models.models import User, StaffProfile, Trek

staff_bp = Blueprint('staff', __name__, url_prefix='/api')


# ---------- GET /api/staff ----------
@staff_bp.route('/staff', methods=['GET'])
def get_all_staff():
    staff_users = User.query.filter_by(role='staff').order_by(User.created_at.desc()).all()
    result = []
    for s in staff_users:
        profile = s.staff_profile
        assigned_treks = Trek.query.filter_by(assigned_staff_id=s.id).all()
        result.append({
            'id': s.id,
            'name': s.name,
            'email': s.email,
            'phone': s.phone,
            'status': s.status,
            'specialization': profile.specialization if profile else '',
            'experience_years': profile.experience_years if profile else 0,
            'emergency_contact': profile.emergency_contact if profile else '',
            'assigned_treks_count': len(assigned_treks),
            'assigned_treks': [{'id': t.id, 'name': t.name} for t in assigned_treks]
        })
    return jsonify(result), 200


# ---------- POST /api/staff ----------
@staff_bp.route('/staff', methods=['POST'])
def create_staff():
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip() or None
    specialization = data.get('specialization', '').strip()
    experience_years = data.get('experience_years', 0)

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    try:
        experience_years = int(experience_years) if experience_years else 0
    except (ValueError, TypeError):
        experience_years = 0

    new_staff_user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
        role='staff',
        phone=phone,
        status=1
    )
    db.session.add(new_staff_user)
    db.session.flush()  # To get new_staff_user.id

    new_profile = StaffProfile(
        user_id=new_staff_user.id,
        specialization=specialization,
        experience_years=experience_years,
        status='Active'
    )
    db.session.add(new_profile)
    db.session.commit()

    return jsonify({
        'message': 'Staff member created successfully',
        'staff': {
            'id': new_staff_user.id,
            'name': new_staff_user.name,
            'email': new_staff_user.email,
            'phone': new_staff_user.phone,
            'specialization': new_profile.specialization,
            'experience_years': new_profile.experience_years
        }
    }), 201


# ---------- PUT /api/staff/<id> ----------
@staff_bp.route('/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    staff_user = User.query.filter_by(id=staff_id, role='staff').first()
    if not staff_user:
        return jsonify({'error': 'Staff member not found'}), 404

    data = request.get_json() or {}

    if 'name' in data:
        staff_user.name = data['name'].strip()
    if 'email' in data:
        email = data['email'].strip()
        existing = User.query.filter(User.email == email, User.id != staff_id).first()
        if existing:
            return jsonify({'error': 'Email already in use by another user'}), 409
        staff_user.email = email
    if 'phone' in data:
        staff_user.phone = data['phone'].strip() or None
    if 'password' in data and data['password'].strip():
        staff_user.password = generate_password_hash(data['password'].strip())

    profile = staff_user.staff_profile
    if not profile:
        profile = StaffProfile(user_id=staff_user.id)
        db.session.add(profile)

    if 'specialization' in data:
        profile.specialization = data['specialization'].strip()
    if 'experience_years' in data:
        try:
            profile.experience_years = int(data['experience_years'])
        except (ValueError, TypeError):
            pass

    db.session.commit()

    return jsonify({'message': 'Staff member updated successfully'}), 200


# ---------- DELETE /api/staff/<id> ----------
@staff_bp.route('/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    staff_user = User.query.filter_by(id=staff_id, role='staff').first()
    if not staff_user:
        return jsonify({'error': 'Staff member not found'}), 404

    # 1. Unassign all treks assigned to this staff member
    assigned_treks = Trek.query.filter_by(assigned_staff_id=staff_id).all()
    for trek in assigned_treks:
        trek.assigned_staff_id = None  # Immediately set assigned_staff to None ("Not allotted")

    # 2. Delete staff profile if exists
    if staff_user.staff_profile:
        db.session.delete(staff_user.staff_profile)

    # 3. Delete user record
    db.session.delete(staff_user)
    db.session.commit()

    return jsonify({
        'message': f'Staff member deleted successfully. {len(assigned_treks)} assigned trek(s) set to Not Allotted.'
    }), 200
