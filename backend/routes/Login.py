from flask import Blueprint, render_template

login_bp = Blueprint('login', __name__)

@login_bp.route('/')
@login_bp.route('/login')
@login_bp.route('/signup')
def serve_index():
    return render_template('index.html')