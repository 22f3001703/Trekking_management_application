from celery import Celery
from celery.schedules import crontab
from config import Config


def make_celery(app=None):
    """Create and configure the Celery application."""
    celery = Celery(
        'trekking',
        broker=Config.CELERY_BROKER_URL,
        backend=Config.CELERY_RESULT_BACKEND,
        include=[
            'tasks.reminders',
            'tasks.reports',
            'tasks.export'
        ]
    )

    celery.conf.update(
        timezone='Asia/Kolkata',
        enable_utc=True,
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        beat_schedule={
            # (a) Daily Reminders — every day at 8:00 AM IST
            'send-daily-reminders': {
                'task': 'tasks.reminders.send_daily_reminders',
                'schedule': crontab(hour=8, minute=0),
            },
            # (b) Monthly Activity Report — 1st of every month at 9:00 AM IST
            'send-monthly-report': {
                'task': 'tasks.reports.send_monthly_report',
                'schedule': crontab(day_of_month=1, hour=9, minute=0),
            },
        }
    )

    # If a Flask app is passed, set up context so tasks can access db / mail
    if app is not None:
        class ContextTask(celery.Task):
            abstract = True

            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)

        celery.Task = ContextTask

    return celery


def _get_flask_app():
    """Lazily import and return the Flask app for Celery worker context."""
    from app import app
    return app


# Default celery instance — imports the Flask app so workers have DB/mail context
celery = make_celery(_get_flask_app())
