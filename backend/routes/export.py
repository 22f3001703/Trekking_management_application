"""
Export API routes for user-triggered async CSV export.
POST /api/export/bookings     — Trigger CSV export (returns task_id)
GET  /api/export/status/<id>  — Poll task status
GET  /api/export/download/<f> — Download generated CSV file
"""

import os
from flask import Blueprint, request, jsonify, send_from_directory
from config import Config

export_bp = Blueprint('export', __name__, url_prefix='/api')


# ---------- POST /api/export/bookings ----------
@export_bp.route('/export/bookings', methods=['POST'])
def trigger_export():
    """Trigger async CSV export of a user's booking history."""
    from tasks.export import export_user_bookings_csv

    data = request.get_json() or {}
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    # Dispatch async Celery task
    task = export_user_bookings_csv.delay(user_id)

    return jsonify({
        'message': 'Export job started',
        'task_id': task.id
    }), 202


# ---------- GET /api/export/status/<task_id> ----------
@export_bp.route('/export/status/<task_id>', methods=['GET'])
def export_status(task_id):
    """Check the status of an export task."""
    from celery.result import AsyncResult
    from celery_app import celery

    result = AsyncResult(task_id, app=celery)

    response = {
        'task_id': task_id,
        'state': result.state
    }

    if result.state == 'SUCCESS':
        response['result'] = result.result
    elif result.state == 'FAILURE':
        response['error'] = str(result.info)
    elif result.state == 'PENDING':
        response['message'] = 'Task is queued, waiting for worker...'

    return jsonify(response), 200


# ---------- GET /api/export/download/<filename> ----------
@export_bp.route('/export/download/<filename>', methods=['GET'])
def download_export(filename):
    """Serve a generated CSV file for download."""
    export_dir = Config.EXPORT_DIR

    if not os.path.exists(os.path.join(export_dir, filename)):
        return jsonify({'error': 'File not found'}), 404

    return send_from_directory(
        export_dir,
        filename,
        as_attachment=True,
        mimetype='text/csv'
    )
