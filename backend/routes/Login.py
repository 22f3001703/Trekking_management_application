from flask import Blueprint, render_template
login_bp = Blueprint('login', __name__)
@login_bp.route('/')
@login_bp.route('/login')
@login_bp.route('/signup')
@login_bp.route('/admin/dashboard')
@login_bp.route('/staff/dashboard')
@login_bp.route('/trekker/dashboard')
@login_bp.route('/dashboard')
def serve_index():
    return render_template('index.html')
