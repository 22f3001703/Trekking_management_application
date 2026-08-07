from flask import Blueprint, request, jsonify
from database import db
from models.models import User, Trek, Booking

booking_bp = Blueprint('booking', __name__, url_prefix='/api')


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

    if trek.available_slots <= 0:
        return jsonify({'error': 'No available slots remaining for this trek'}), 400

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

    return jsonify({'message': 'Booking cancelled successfully'}), 200


# ---------- GET /api/bookings ----------
@booking_bp.route('/bookings', methods=['GET'])
def get_all_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    result = []
    for b in bookings:
        b_dict = b.to_dict()
        b_dict['user_name'] = b.user.name if b.user else 'N/A'
        b_dict['user_email'] = b.user.email if b.user else 'N/A'
        b_dict['trek_name'] = b.trek.name if b.trek else 'N/A'
        result.append(b_dict)
    return jsonify(result), 200
