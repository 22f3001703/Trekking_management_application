from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.models import Trek, User

trek_bp = Blueprint('trek', __name__, url_prefix='/api')


# ---------- GET /api/staff-list ----------
@trek_bp.route('/staff-list', methods=['GET'])
def get_staff_list():
    staff_members = User.query.filter_by(role='staff', status=1).all()
    return jsonify([
        {
            'id': s.id,
            'name': s.name,
            'email': s.email
        }
        for s in staff_members
    ]), 200


# ---------- GET /api/treks ----------
@trek_bp.route('/treks', methods=['GET'])
def get_treks():
    treks = Trek.query.order_by(Trek.created_at.desc()).all()
    result = []
    for t in treks:
        t_dict = t.to_dict()
        # include assigned staff name if available
        if t.assigned_staff:
            t_dict['assigned_staff_name'] = t.assigned_staff.name
        else:
            t_dict['assigned_staff_name'] = 'Unassigned'
        result.append(t_dict)
    return jsonify(result), 200


# ---------- POST /api/treks ----------
@trek_bp.route('/treks', methods=['POST'])
def create_trek():
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    location = data.get('location', '').strip()
    duration_days = data.get('duration_days')
    available_slots = data.get('available_slots')

    if not name or not location or duration_days is None or available_slots is None:
        return jsonify({'error': 'Name, location, duration_days, and available_slots are required'}), 400

    try:
        duration_days = int(duration_days)
        available_slots = int(available_slots)
        if duration_days <= 0 or available_slots < 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({'error': 'duration_days must be > 0 and available_slots must be >= 0'}), 400

    # Optional fields
    difficulty = data.get('difficulty', 'Moderate').strip()
    price = data.get('price', 0.0)
    try:
        price = float(price) if price else 0.0
    except (ValueError, TypeError):
        price = 0.0

    description = data.get('description', '').strip()
    image = data.get('image', '').strip()
    status = data.get('status', 'Open').strip()  # Defaults to Open per user decision

    # Dates parsing
    start_date = None
    end_date = None
    if data.get('start_date'):
        try:
            start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid start_date format (expected YYYY-MM-DD)'}), 400

    if data.get('end_date'):
        try:
            end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid end_date format (expected YYYY-MM-DD)'}), 400

    # Assigned staff
    assigned_staff_id = data.get('assigned_staff_id')
    if assigned_staff_id:
        try:
            assigned_staff_id = int(assigned_staff_id)
            staff_user = User.query.filter_by(id=assigned_staff_id, role='staff').first()
            if not staff_user:
                return jsonify({'error': 'Assigned staff user not found or not a staff member'}), 404
        except (ValueError, TypeError):
            assigned_staff_id = None
    else:
        assigned_staff_id = None

    new_trek = Trek(
        name=name,
        location=location,
        difficulty=difficulty,
        duration_days=duration_days,
        available_slots=available_slots,
        price=price,
        description=description,
        image=image,
        status=status,
        start_date=start_date,
        end_date=end_date,
        assigned_staff_id=assigned_staff_id
    )

    db.session.add(new_trek)
    db.session.commit()

    res_dict = new_trek.to_dict()
    if new_trek.assigned_staff:
        res_dict['assigned_staff_name'] = new_trek.assigned_staff.name

    return jsonify({
        'message': 'Trek created successfully',
        'trek': res_dict
    }), 201
