\
\
\
\
\
import os
from flask import Blueprint, request, jsonify, send_from_directory
from config import Config
export_bp = Blueprint('export', __name__, url_prefix='/api')
@export_bp.route('/export/bookings', methods=['POST'])
def trigger_export():
    from tasks.export import export_user_bookings_csv
    data = request.get_json() or {}
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    task = export_user_bookings_csv.delay(user_id)
    return jsonify({
        'message': 'Export job started',
        'task_id': task.id
    }), 202
@export_bp.route('/export/status/<task_id>', methods=['GET'])
def export_status(task_id):
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
@export_bp.route('/export/download/<filename>', methods=['GET'])
def download_export(filename):
    export_dir = Config.EXPORT_DIR
    if not os.path.exists(os.path.join(export_dir, filename)):
        return jsonify({'error': 'File not found'}), 404
    return send_from_directory(
        export_dir,
        filename,
        as_attachment=True,
        mimetype='text/csv'
    )
