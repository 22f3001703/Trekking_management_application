from celery import Celery
from celery.schedules import crontab
from config import Config
def make_celery(app=None):
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
            'send-daily-reminders': {
                'task': 'tasks.reminders.send_daily_reminders',
                'schedule': crontab(hour=8, minute=0),
            },
            'send-monthly-report': {
                'task': 'tasks.reports.send_monthly_report',
                'schedule': crontab(day_of_month=1, hour=9, minute=0),
            },
        }
    )
    if app is not None:
        class ContextTask(celery.Task):
            abstract = True
            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return self.run(*args, **kwargs)
        celery.Task = ContextTask
    return celery
def _get_flask_app():
    from app import app
    return app
celery = make_celery(_get_flask_app())
