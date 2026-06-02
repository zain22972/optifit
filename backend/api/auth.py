# OptiFit 2.0 Auth API Blueprint
import os
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify, g
import bcrypt
import jwt

from backend.database.db import get_db

auth_bp = Blueprint('auth', __name__)
SECRET_KEY = os.environ.get('SECRET_KEY', 'optifit_super_secret_key_2026')

def generate_token(user_id, role):
    """Generates a JWT token valid for 24 hours."""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    """Decorator to protect endpoints with JWT authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Authentication token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role, age, gender FROM users WHERE id = ?", (data['user_id'],))
            user = cursor.fetchone()
            conn.close()
            
            if not user:
                return jsonify({'message': 'Invalid token, user not found!'}), 401
                
            g.current_user = dict(user)
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to restrict access to Admins only."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user['role'] != 'admin':
            return jsonify({'message': 'Admin privileges required!'}), 403
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    gender = data.get('gender')

    if not name or not email or not password:
        return jsonify({'message': 'Name, Email, and Password are required fields.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'Email already registered.'}), 400

        # Hash password using bcrypt
        salt = bcrypt.gensalt()
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # Insert User
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role, age, gender) VALUES (?, ?, ?, 'user', ?, ?)",
            (name, email, pw_hash, age, gender)
        )
        user_id = cursor.lastrowid

        # Initialize default user preferences
        # Default styles: Casual, Smart Casual
        # Default colors: Black, White, Blue
        cursor.execute(
            "INSERT INTO user_preferences (user_id, favorite_colors, favorite_styles, preferred_fit, budget_min, budget_max) VALUES (?, 'Black,White,Blue', 'Casual,Smart Casual', 'Regular', 10.0, 300.0)",
            (user_id,)
        )
        
        conn.commit()
        
        # Generate token
        token = generate_token(user_id, 'user')
        
        return jsonify({
            'message': 'Registration successful.',
            'token': token,
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'role': 'user',
                'age': age,
                'gender': gender
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error during registration.', 'error': str(e)}), 500
    finally:
        conn.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and Password are required.'}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user_row = cursor.fetchone()
        
        if not user_row:
            return jsonify({'message': 'Invalid email or password.'}), 401
            
        user = dict(user_row)
        pw_hash = user['password_hash']

        # Verify password
        # Compatibility check for our seeded Werkzeug/SHA hashes vs bcrypt
        is_valid = False
        if pw_hash.startswith("sha256$"):
            # Simple hashlib verification for seeds
            parts = pw_hash.split("$")
            salt = parts[1]
            h = hashlib_verifier(salt, password)
            is_valid = (h == parts[2])
        elif pw_hash.startswith("scrypt:") or pw_hash.startswith("pbkdf2:"):
            from werkzeug.security import check_password_hash
            is_valid = check_password_hash(pw_hash, password)
        else:
            # Bcrypt verification
            try:
                is_valid = bcrypt.checkpw(password.encode('utf-8'), pw_hash.encode('utf-8'))
            except Exception:
                is_valid = False

        if not is_valid:
            print(f"[DEBUG-LOGIN] Failed login for email '{email}'. Provided password was {len(password)} characters long.")
            return jsonify({'message': 'Invalid email or password.'}), 401

        # Generate Token
        token = generate_token(user['id'], user['role'])
        
        # Strip password hash from response
        user.pop('password_hash', None)
        
        return jsonify({
            'message': 'Login successful.',
            'token': token,
            'user': user
        }), 200

    except Exception as e:
        return jsonify({'message': 'Error during login.', 'error': str(e)}), 500
    finally:
        conn.close()

def hashlib_verifier(salt, password):
    import hashlib
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
