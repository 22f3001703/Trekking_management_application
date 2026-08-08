"""
Scheduled Job (b) – Monthly Activity Report
Generates an HTML activity report and sends it to all admin users on the 1st of every month.
Runs at 9:00 AM IST via Celery Beat.
"""

import datetime
from celery_app import celery


@celery.task(name='tasks.reports.send_monthly_report')
def send_monthly_report():
    """Generate and email monthly trekking activity report to admin users."""
    from database import db
    from models.models import User, Trek, Booking
    from flask_mail import Message
    from sqlalchemy import func
    from extensions import mail

    today = datetime.date.today()
    # Report covers the previous month
    first_of_current = today.replace(day=1)
    last_of_prev = first_of_current - datetime.timedelta(days=1)
    first_of_prev = last_of_prev.replace(day=1)

    month_name = last_of_prev.strftime('%B %Y')

    # --- Gather statistics ---

    # 1. Treks conducted (completed during the previous month)
    treks_completed = Trek.query.filter(
        Trek.status == 'Completed',
        Trek.end_date >= first_of_prev,
        Trek.end_date <= last_of_prev
    ).count()

    # Total treks in system
    total_treks = Trek.query.count()

    # 2. Bookings in previous month
    bookings_in_month = Booking.query.filter(
        Booking.booking_date >= datetime.datetime.combine(first_of_prev, datetime.time.min),
        Booking.booking_date <= datetime.datetime.combine(last_of_prev, datetime.time.max)
    ).all()

    total_bookings = len(bookings_in_month)
    booked_count = sum(1 for b in bookings_in_month if b.status == 'Booked')
    cancelled_count = sum(1 for b in bookings_in_month if b.status == 'Cancelled')
    completed_count = sum(1 for b in bookings_in_month if b.status == 'Completed')

    # 3. Unique participating users
    unique_users = len(set(b.user_id for b in bookings_in_month if b.status in ('Booked', 'Completed')))

    # 4. Popular treks (by booking count, top 5)
    popular_treks_data = db.session.query(
        Trek.name,
        Trek.location,
        Trek.difficulty,
        func.count(Booking.id).label('booking_count')
    ).join(Booking, Booking.trek_id == Trek.id).filter(
        Booking.booking_date >= datetime.datetime.combine(first_of_prev, datetime.time.min),
        Booking.booking_date <= datetime.datetime.combine(last_of_prev, datetime.time.max)
    ).group_by(Trek.id).order_by(func.count(Booking.id).desc()).limit(5).all()

    # 5. Revenue estimate
    revenue_data = db.session.query(
        func.sum(Trek.price)
    ).join(Booking, Booking.trek_id == Trek.id).filter(
        Booking.booking_date >= datetime.datetime.combine(first_of_prev, datetime.time.min),
        Booking.booking_date <= datetime.datetime.combine(last_of_prev, datetime.time.max),
        Booking.status.in_(['Booked', 'Completed'])
    ).scalar() or 0

    # 6. Total registered users
    total_users = User.query.filter_by(role='trekker').count()

    # --- Build popular treks HTML table rows ---
    popular_rows = ''
    for i, pt in enumerate(popular_treks_data, 1):
        difficulty_color = '#28a745' if pt.difficulty == 'Easy' else '#ffc107' if pt.difficulty == 'Moderate' else '#dc3545'
        popular_rows += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{i}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 600;">{pt.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{pt.location}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><span style="background: {difficulty_color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{pt.difficulty}</span></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">{pt.booking_count}</td>
        </tr>
        """

    if not popular_rows:
        popular_rows = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #999;">No booking data for this period.</td></tr>'

    # --- Build HTML email ---
    subject = f"📊 Monthly Trekking Activity Report — {month_name}"

    html_body = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f6f9; padding: 30px; margin: 0;">
        <div style="max-width: 700px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #1a237e, #283593); padding: 30px 25px; color: white;">
                <h1 style="margin: 0; font-size: 22px;">📊 Monthly Activity Report</h1>
                <p style="margin: 8px 0 0; opacity: 0.85; font-size: 15px;">{month_name}</p>
            </div>
            <div style="padding: 25px;">
                <h3 style="color: #333; border-bottom: 2px solid #1a237e; padding-bottom: 8px; margin-bottom: 20px;">Overview</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                        <td style="width: 25%; padding: 12px; text-align: center;">
                            <div style="background: #e8eaf6; border-radius: 8px; padding: 15px;">
                                <div style="font-size: 28px; font-weight: bold; color: #1a237e;">{treks_completed}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Treks Completed</div>
                            </div>
                        </td>
                        <td style="width: 25%; padding: 12px; text-align: center;">
                            <div style="background: #e8f5e9; border-radius: 8px; padding: 15px;">
                                <div style="font-size: 28px; font-weight: bold; color: #2e7d32;">{total_bookings}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Total Bookings</div>
                            </div>
                        </td>
                        <td style="width: 25%; padding: 12px; text-align: center;">
                            <div style="background: #fff3e0; border-radius: 8px; padding: 15px;">
                                <div style="font-size: 28px; font-weight: bold; color: #e65100;">{unique_users}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Users Participated</div>
                            </div>
                        </td>
                        <td style="width: 25%; padding: 12px; text-align: center;">
                            <div style="background: #fce4ec; border-radius: 8px; padding: 15px;">
                                <div style="font-size: 28px; font-weight: bold; color: #c62828;">₹{revenue_data:,.0f}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">Est. Revenue</div>
                            </div>
                        </td>
                    </tr>
                </table>

                <h3 style="color: #333; border-bottom: 2px solid #1a237e; padding-bottom: 8px; margin-bottom: 15px;">Booking Breakdown</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
                    <tr style="background: #f8f9fa;"><td style="padding: 10px 15px;">Active Bookings</td><td style="padding: 10px 15px; text-align: right; font-weight: bold; color: #2e7d32;">{booked_count}</td></tr>
                    <tr><td style="padding: 10px 15px;">Completed Bookings</td><td style="padding: 10px 15px; text-align: right; font-weight: bold; color: #1565c0;">{completed_count}</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 10px 15px;">Cancelled Bookings</td><td style="padding: 10px 15px; text-align: right; font-weight: bold; color: #c62828;">{cancelled_count}</td></tr>
                    <tr><td style="padding: 10px 15px;">Total Registered Trekkers</td><td style="padding: 10px 15px; text-align: right; font-weight: bold;">{total_users}</td></tr>
                    <tr style="background: #f8f9fa;"><td style="padding: 10px 15px;">Total Treks in System</td><td style="padding: 10px 15px; text-align: right; font-weight: bold;">{total_treks}</td></tr>
                </table>

                <h3 style="color: #333; border-bottom: 2px solid #1a237e; padding-bottom: 8px; margin-bottom: 15px;">🔥 Most Popular Treks</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
                    <thead>
                        <tr style="background: #1a237e; color: white;">
                            <th style="padding: 10px; text-align: center;">#</th>
                            <th style="padding: 10px; text-align: left;">Trek Name</th>
                            <th style="padding: 10px; text-align: left;">Location</th>
                            <th style="padding: 10px; text-align: left;">Difficulty</th>
                            <th style="padding: 10px; text-align: center;">Bookings</th>
                        </tr>
                    </thead>
                    <tbody>
                        {popular_rows}
                    </tbody>
                </table>

                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                    This report was auto-generated on {today.strftime('%d %B %Y')} by the Trekking Management System.
                </p>
            </div>
            <div style="background: #f8f9fa; padding: 15px 25px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee;">
                Trekking Management App &middot; Monthly Activity Report
            </div>
        </div>
    </body>
    </html>
    """

    # Send to all admin users
    admins = User.query.filter_by(role='admin').all()
    emails_sent = 0

    for admin in admins:
        if not admin.email:
            continue
        try:
            from flask import current_app
            msg = Message(
                subject=subject,
                recipients=[admin.email],
                sender=current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@trekking.com'),
                html=html_body
            )
            mail.send(msg)
            emails_sent += 1
        except Exception as e:
            print(f"Failed to send monthly report to {admin.email}: {e}")

    return {
        'status': 'completed',
        'month': month_name,
        'emails_sent': emails_sent,
        'stats': {
            'treks_completed': treks_completed,
            'total_bookings': total_bookings,
            'unique_users': unique_users,
            'revenue': float(revenue_data)
        }
    }
