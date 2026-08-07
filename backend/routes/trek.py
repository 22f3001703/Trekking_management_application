from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db
from models.models import Trek, User, Booking

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
        if t.assigned_staff:
            t_dict['assigned_staff_name'] = t.assigned_staff.name
        else:
            t_dict['assigned_staff_name'] = 'Unassigned'
        result.append(t_dict)
    return jsonify(result), 200


# ---------- GET /api/treks/<id> ----------
@trek_bp.route('/treks/<int:trek_id>', methods=['GET'])
def get_single_trek(trek_id):
    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404
    t_dict = trek.to_dict()
    t_dict['assigned_staff_name'] = trek.assigned_staff.name if trek.assigned_staff else 'Unassigned'
    return jsonify(t_dict), 200


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

    difficulty = data.get('difficulty', 'Moderate').strip()
    price = data.get('price', 0.0)
    try:
        price = float(price) if price else 0.0
    except (ValueError, TypeError):
        price = 0.0

    description = data.get('description', '').strip()
    image = data.get('image', '').strip()
    status = data.get('status', 'Open').strip()

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


# ---------- PUT /api/treks/<id> ----------
@trek_bp.route('/treks/<int:trek_id>', methods=['PUT'])
def update_trek(trek_id):
    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        trek.name = data['name'].strip()

    if 'location' in data and data['location'].strip():
        trek.location = data['location'].strip()

    if 'difficulty' in data:
        trek.difficulty = data['difficulty'].strip()

    if 'duration_days' in data:
        try:
            trek.duration_days = int(data['duration_days'])
        except (ValueError, TypeError):
            pass

    if 'available_slots' in data:
        try:
            trek.available_slots = int(data['available_slots'])
        except (ValueError, TypeError):
            pass

    if 'price' in data:
        try:
            trek.price = float(data['price'])
        except (ValueError, TypeError):
            pass

    if 'description' in data:
        trek.description = data['description'].strip()

    if 'image' in data:
        trek.image = data['image'].strip()

    if 'status' in data:
        trek.status = data['status'].strip()

    if 'start_date' in data:
        if data['start_date']:
            try:
                trek.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        else:
            trek.start_date = None

    if 'end_date' in data:
        if data['end_date']:
            try:
                trek.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        else:
            trek.end_date = None

    if 'assigned_staff_id' in data:
        staff_id = data['assigned_staff_id']
        if staff_id:
            try:
                staff_id = int(staff_id)
                staff_user = User.query.filter_by(id=staff_id, role='staff').first()
                if staff_user:
                    trek.assigned_staff_id = staff_id
                else:
                    trek.assigned_staff_id = None
            except (ValueError, TypeError):
                trek.assigned_staff_id = None
        else:
            trek.assigned_staff_id = None

    db.session.commit()

    res_dict = trek.to_dict()
    res_dict['assigned_staff_name'] = trek.assigned_staff.name if trek.assigned_staff else 'Unassigned'

    return jsonify({
        'message': 'Trek updated successfully',
        'trek': res_dict
    }), 200


# ---------- DELETE /api/treks/<id> ----------
@trek_bp.route('/treks/<int:trek_id>', methods=['DELETE'])
def delete_trek(trek_id):
    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    # Delete any related bookings first to avoid foreign key constraints
    Booking.query.filter_by(trek_id=trek_id).delete()

    db.session.delete(trek)
    db.session.commit()

    return jsonify({'message': f'Trek "{trek.name}" deleted successfully'}), 200
