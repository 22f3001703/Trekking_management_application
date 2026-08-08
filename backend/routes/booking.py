from flask import Blueprint, request, jsonify
from database import db
from models.models import User, Trek, Booking

booking_bp = Blueprint('booking', __name__, url_prefix='/api')


def _clear_trek_cache():
    """Invalidate Redis cache when booking changes affect slot counts."""
    try:
        from extensions import cache
        cache.delete('all_treks')
    except Exception:
        pass


def check_date_conflict(user_id, trek, exclude_booking_id=None):
    """
    Check if user has any active ('Booked') booking whose trek date range
    overlaps with the given trek's date range.
    Returns (has_conflict, error_message)
    """
    if not trek or not trek.start_date or not trek.end_date:
        return False, None

    active_user_bookings = Booking.query.filter_by(user_id=user_id, status='Booked').all()
    for b in active_user_bookings:
        if exclude_booking_id and b.id == exclude_booking_id:
            continue
        if b.trek and b.trek.start_date and b.trek.end_date:
            # Overlap check: start1 <= end2 and end1 >= start2
            if trek.start_date <= b.trek.end_date and trek.end_date >= b.trek.start_date:
                msg = (f'Cannot complete booking. The user already has an active booking for "{b.trek.name}" '
                       f'({b.trek.start_date.strftime("%d %b %Y")} to {b.trek.end_date.strftime("%d %b %Y")}) '
                       f'which overlaps with this trek\'s dates ({trek.start_date.strftime("%d %b %Y")} to {trek.end_date.strftime("%d %b %Y")}).')
                return True, msg
    return False, None


# ---------- POST /api/bookings ----------
@booking_bp.route('/bookings', methods=['POST'])
def create_booking():
    data = request.get_json() or {}

    user_id = data.get('user_id')
    trek_id = data.get('trek_id')

    if not user_id or not trek_id:
        return jsonify({'error': 'user_id and trek_id are required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    # Only allow booking when trek status is Open
    if trek.status != 'Open':
        return jsonify({'error': f'Booking is not allowed. Trek status is "{trek.status}". Only "Open" treks can be booked.'}), 400

    if trek.available_slots <= 0:
        return jsonify({'error': 'No available slots remaining for this trek'}), 400

    # Check for date overlap with user's other active bookings
    has_conflict, conflict_msg = check_date_conflict(user_id, trek)
    if has_conflict:
        return jsonify({'error': conflict_msg}), 400

    existing = Booking.query.filter_by(user_id=user_id, trek_id=trek_id).first()
    if existing:
        if existing.status == 'Booked':
            return jsonify({'error': 'You have already booked this trek'}), 409
        elif existing.status == 'Cancelled':
            # Re-activate booking
            existing.status = 'Booked'
            if trek.available_slots > 0:
                trek.available_slots -= 1
            db.session.commit()
            _clear_trek_cache()
            return jsonify({
                'message': 'Booking re-activated successfully',
                'booking': existing.to_dict()
            }), 200

    new_booking = Booking(
        user_id=user_id,
        trek_id=trek_id,
        status='Booked',
        payment_status='Completed'  # Mark payment as completed for convenience
    )

    trek.available_slots = max(0, trek.available_slots - 1)

    db.session.add(new_booking)
    db.session.commit()
    _clear_trek_cache()

    b_dict = new_booking.to_dict()
    b_dict['trek_name'] = trek.name
    b_dict['location'] = trek.location

    return jsonify({
        'message': 'Trek booked successfully',
        'booking': b_dict
    }), 201


# ---------- GET /api/bookings/user/<int:user_id> ----------
@booking_bp.route('/bookings/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        b_dict = b.to_dict()
        if b.trek:
            b_dict['trek_name'] = b.trek.name
            b_dict['location'] = b.trek.location
            b_dict['difficulty'] = b.trek.difficulty
            b_dict['duration_days'] = b.trek.duration_days
            b_dict['price'] = b.trek.price
            b_dict['image'] = b.trek.image
            b_dict['start_date'] = b.trek.start_date.isoformat() if b.trek.start_date else None
            b_dict['end_date'] = b.trek.end_date.isoformat() if b.trek.end_date else None
            b_dict['trek_status'] = b.trek.status
        result.append(b_dict)

    return jsonify(result), 200


# ---------- PUT /api/bookings/<int:booking_id>/cancel ----------
@booking_bp.route('/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    if booking.status == 'Cancelled':
        return jsonify({'error': 'Booking is already cancelled'}), 400

    booking.status = 'Cancelled'
    if booking.trek:
        booking.trek.available_slots += 1

    db.session.commit()
    _clear_trek_cache()

    return jsonify({'message': 'Booking cancelled successfully'}), 200


# ---------- PUT /api/bookings/<int:booking_id>/status ----------
@booking_bp.route('/bookings/<int:booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    """Update the status of a booking (Admin use)."""
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status', '').strip()

    allowed_statuses = ['Booked', 'Cancelled', 'Completed']
    if new_status not in allowed_statuses:
        return jsonify({'error': f'Invalid status. Allowed: {", ".join(allowed_statuses)}'}), 400

    old_status = booking.status

    # If cancelling, restore slot
    if new_status == 'Cancelled' and old_status != 'Cancelled':
        if booking.trek:
            booking.trek.available_slots += 1

    # If re-activating from cancelled, consume slot and check for date conflict
    if new_status == 'Booked' and old_status != 'Booked':
        has_conflict, conflict_msg = check_date_conflict(booking.user_id, booking.trek, exclude_booking_id=booking.id)
        if has_conflict:
            return jsonify({'error': conflict_msg}), 400

        if booking.trek and booking.trek.available_slots > 0:
            booking.trek.available_slots -= 1
        elif booking.trek and booking.trek.available_slots <= 0:
            return jsonify({'error': 'No available slots to re-activate this booking'}), 400

    booking.status = new_status
    db.session.commit()
    _clear_trek_cache()

    return jsonify({
        'message': f'Booking status updated to "{new_status}"',
        'booking': booking.to_dict()
    }), 200


# ---------- GET /api/bookings ----------
@booking_bp.route('/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings with enriched user and trek data (Admin use)."""
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        b_dict = b.to_dict()
        # User details
        b_dict['user_name'] = b.user.name if b.user else 'N/A'
        b_dict['user_email'] = b.user.email if b.user else 'N/A'
        b_dict['user_phone'] = b.user.phone if b.user else 'N/A'
        # Trek details
        if b.trek:
            b_dict['trek_name'] = b.trek.name
            b_dict['location'] = b.trek.location
            b_dict['difficulty'] = b.trek.difficulty
            b_dict['duration_days'] = b.trek.duration_days
            b_dict['price'] = b.trek.price
            b_dict['start_date'] = b.trek.start_date.isoformat() if b.trek.start_date else None
            b_dict['end_date'] = b.trek.end_date.isoformat() if b.trek.end_date else None
            b_dict['trek_status'] = b.trek.status
        else:
            b_dict['trek_name'] = 'N/A'
            b_dict['location'] = 'N/A'
        result.append(b_dict)
    return jsonify(result), 200


# ---------- GET /api/bookings/trek/<int:trek_id> ----------
@booking_bp.route('/bookings/trek/<int:trek_id>', methods=['GET'])
def get_trek_bookings(trek_id):
    """Get all bookings for a specific trek (Staff use)."""
    trek = Trek.query.get(trek_id)
    if not trek:
        return jsonify({'error': 'Trek not found'}), 404

    bookings = Booking.query.filter_by(trek_id=trek_id).order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        b_dict = b.to_dict()
        b_dict['user_name'] = b.user.name if b.user else 'N/A'
        b_dict['user_email'] = b.user.email if b.user else 'N/A'
        b_dict['user_phone'] = b.user.phone if b.user else 'N/A'
        b_dict['trek_name'] = trek.name
        b_dict['location'] = trek.location
        result.append(b_dict)
    return jsonify(result), 200
