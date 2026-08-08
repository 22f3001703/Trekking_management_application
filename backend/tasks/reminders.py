"""
Scheduled Job (a) – Daily Reminders
Sends email reminders to users with upcoming treks (within next 3 days).
Runs daily at 8:00 AM IST via Celery Beat.
"""

import datetime
from celery_app import celery


@celery.task(name='tasks.reminders.send_daily_reminders')
def send_daily_reminders():
    """Send daily email reminders to users with upcoming trek bookings."""
    from database import db
    from models.models import Booking, Trek, User
    from flask_mail import Message
    from extensions import mail

    today = datetime.date.today()
    reminder_window = today + datetime.timedelta(days=3)

    # Find treks starting within the next 3 days
    upcoming_treks = Trek.query.filter(
        Trek.start_date >= today,
        Trek.start_date <= reminder_window,
        Trek.status.in_(['Open', 'Approved', 'In Progress'])
    ).all()

    if not upcoming_treks:
        return {'status': 'no_upcoming_treks', 'emails_sent': 0}

    emails_sent = 0

    for trek in upcoming_treks:
        # Get all active bookings for this trek
        bookings = Booking.query.filter_by(
            trek_id=trek.id,
            status='Booked'
        ).all()

        for booking in bookings:
            user = User.query.get(booking.user_id)
            if not user or not user.email:
                continue

            days_until = (trek.start_date - today).days

            # Build email
            subject = f"🏔️ Trek Reminder: {trek.name} starts in {days_until} day(s)!"

            html_body = f"""
            <html>
            <body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f9; padding: 30px;">
                <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                    <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 30px 25px; color: white;">
                        <h1 style="margin: 0; font-size: 22px;">🏔️ Upcoming Trek Reminder</h1>
                        <p style="margin: 8px 0 0; opacity: 0.9;">Your adventure is just around the corner!</p>
                    </div>
                    <div style="padding: 25px;">
                        <p>Hi <strong>{user.name}</strong>,</p>
                        <p>This is a friendly reminder that your trek is starting soon:</p>

                        <div style="background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px; color: #1a73e8;">{trek.name}</h3>
                            <table style="width: 100%; font-size: 14px;">
                                <tr><td style="padding: 4px 0; color: #666;">📍 Location</td><td style="padding: 4px 0;"><strong>{trek.location}</strong></td></tr>
                                <tr><td style="padding: 4px 0; color: #666;">📅 Start Date</td><td style="padding: 4px 0;"><strong>{trek.start_date.strftime('%d %B %Y')}</strong></td></tr>
                                <tr><td style="padding: 4px 0; color: #666;">📅 End Date</td><td style="padding: 4px 0;"><strong>{trek.end_date.strftime('%d %B %Y') if trek.end_date else 'N/A'}</strong></td></tr>
                                <tr><td style="padding: 4px 0; color: #666;">⏱️ Duration</td><td style="padding: 4px 0;"><strong>{trek.duration_days} days</strong></td></tr>
                                <tr><td style="padding: 4px 0; color: #666;">🎯 Difficulty</td><td style="padding: 4px 0;"><strong>{trek.difficulty}</strong></td></tr>
                            </table>
                        </div>

                        <div style="background: #fff3cd; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
                            <strong>⚠️ Pre-Trek Checklist:</strong>
                            <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px;">
                                <li>Pack warm layers, rain gear, and sturdy trekking shoes</li>
                                <li>Carry sufficient water bottles and energy snacks</li>
                                <li>Keep your ID proof and booking confirmation handy</li>
                                <li>Arrive at the meeting point at least 30 minutes early</li>
                                <li>Check weather conditions for {trek.location}</li>
                            </ul>
                        </div>

                        <p style="color: #666; font-size: 13px;">We wish you a safe and memorable trekking experience! 🌟</p>
                    </div>
                    <div style="background: #f8f9fa; padding: 15px 25px; text-align: center; font-size: 12px; color: #999;">
                        Trekking Management App &middot; Happy Trails!
                    </div>
                </div>
            </body>
            </html>
            """

            try:
                from flask import current_app
                msg = Message(
                    subject=subject,
                    recipients=[user.email],
                    sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@trekking.com'),
                    html=html_body
                )
                mail.send(msg)
                emails_sent += 1
            except Exception as e:
                print(f"Failed to send reminder to {user.email}: {e}")

    return {'status': 'completed', 'emails_sent': emails_sent, 'treks_checked': len(upcoming_treks)}
