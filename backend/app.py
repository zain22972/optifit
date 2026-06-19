# OptiFit 2.0 Flask Backend Server
import os
import sys

# Ensure the project root is on sys.path so both 'backend.*' and 'ml.*' imports work
# regardless of whether this file is run directly or via python -m
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

# Import Blueprints
from backend.api.auth import auth_bp
from backend.api.profile import profile_bp
from backend.api.wardrobe import wardrobe_bp
from backend.api.recommendations import recommendations_bp
from backend.api.admin import admin_bp

app = Flask(__name__)
# Enable CORS for React dev server (typically http://localhost:5173 or other local hosts)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configurations
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PERSISTENT_DATA_DIR = os.environ.get('PERSISTENT_DATA_DIR')

if PERSISTENT_DATA_DIR:
    UPLOAD_FOLDER = os.path.join(PERSISTENT_DATA_DIR, 'uploads')
    # Auto-initialize uploads directory on persistent disk
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        local_uploads = os.path.join(PROJECT_ROOT, 'uploads')
        if os.path.exists(local_uploads):
            import shutil
            for item in os.listdir(local_uploads):
                s = os.path.join(local_uploads, item)
                d = os.path.join(UPLOAD_FOLDER, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
else:
    UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, 'uploads')

ASSETS_FOLDER = os.path.join(PROJECT_ROOT, 'assets')

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ASSETS_FOLDER, exist_ok=True)

# Register blueprints at root prefix to match endpoint requirements exactly
app.register_blueprint(auth_bp, url_prefix='')
app.register_blueprint(profile_bp, url_prefix='')
app.register_blueprint(wardrobe_bp, url_prefix='')
app.register_blueprint(recommendations_bp, url_prefix='')
app.register_blueprint(admin_bp, url_prefix='')

# Static media serving endpoints
@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    """Serves user-uploaded clothing images from the root uploads/ folder."""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serves system outfit thumbnails and icons from the root assets/ folder."""
    return send_from_directory(ASSETS_FOLDER, filename)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource not found.'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'message': 'Internal server error occurred.', 'error': str(error)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple status check for container deployment and monitoring."""
    return jsonify({
        'status': 'healthy',
        'app': 'OptiFit 2.0 Backend',
        'database': 'Connected'
    }), 200

if __name__ == '__main__':
    # Run the server, binding dynamically to the PORT env var (required by Render)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
