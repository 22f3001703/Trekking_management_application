"""
User-Triggered Async Job (c) – Export Booking History as CSV
Users trigger this from the Trekker Dashboard.
The task generates a CSV file and returns the filename for download.
"""

import os
import csv
import datetime
from celery_app import celery
from config import Config


@celery.task(name='tasks.export.export_user_bookings_csv', bind=True)
def export_user_bookings_csv(self, user_id):
    """Generate a CSV export of a user's complete booking history."""
    from models.models import User, Booking

    user = User.query.get(user_id)
    if not user:
        return {'status': 'error', 'message': 'User not found'}

    bookings = Booking.query.filter_by(user_id=user_id).order_by(
        Booking.booking_date.desc()
    ).all()

    # Ensure export directory exists
    export_dir = Config.EXPORT_DIR
    os.makedirs(export_dir, exist_ok=True)

    # Generate filename
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"booking_history_user_{user_id}_{timestamp}.csv"
    filepath = os.path.join(export_dir, filename)

    # Write CSV
    headers = [
        'User ID', 'User Name', 'User Email',
        'Trek Name', 'Location', 'Difficulty', 'Duration (Days)',
        'Start Date', 'End Date',
        'Booking Status', 'Payment Status', 'Booking Date', 'Price (₹)'
    ]

    with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)

        for b in bookings:
            trek = b.trek
            writer.writerow([
                user.id,
                user.name,
                user.email,
                trek.name if trek else 'N/A',
                trek.location if trek else 'N/A',
                trek.difficulty if trek else 'N/A',
                trek.duration_days if trek else 'N/A',
                trek.start_date.isoformat() if trek and trek.start_date else 'N/A',
                trek.end_date.isoformat() if trek and trek.end_date else 'N/A',
                b.status,
                b.payment_status,
                b.booking_date.strftime('%Y-%m-%d %H:%M') if b.booking_date else 'N/A',
                trek.price if trek else 'N/A'
            ])

    return {
        'status': 'completed',
        'filename': filename,
        'records': len(bookings),
        'user_name': user.name
    }
