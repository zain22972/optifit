# OptiFit 2.0 Profile API Blueprint
from flask import Blueprint, request, jsonify, g
from backend.database.db import get_db
from backend.api.auth import token_required

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    user_id = g.current_user['id']
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Fetch user details
        cursor.execute("SELECT id, name, email, role, age, gender, created_at FROM users WHERE id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({'message': 'User not found.'}), 404
            
        user = dict(user_row)
        
        # Fetch user preferences
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
        pref_row = cursor.fetchone()
        
        preferences = {}
        if pref_row:
            preferences = dict(pref_row)
            # Remove redundant user_id
            preferences.pop('user_id', None)
            # Convert comma-separated string back to array for frontend convenience
            preferences['favorite_colors'] = [c.strip() for c in preferences['favorite_colors'].split(',')] if preferences['favorite_colors'] else []
            preferences['favorite_styles'] = [s.strip() for s in preferences['favorite_styles'].split(',')] if preferences['favorite_styles'] else []
            
        return jsonify({
            'user': user,
            'preferences': preferences
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error retrieving profile.', 'error': str(e)}), 500
    finally:
        conn.close()

@profile_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    user_id = g.current_user['id']
    data = request.get_json() or {}
    
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    
    # Preferences fields
    favorite_colors_list = data.get('favorite_colors', [])
    favorite_styles_list = data.get('favorite_styles', [])
    preferred_fit = data.get('preferred_fit', 'Regular')
    budget_min = data.get('budget_min', 0.0)
    budget_max = data.get('budget_max', 300.0)
    
    # Format list fields as comma-separated strings
    favorite_colors = ",".join(favorite_colors_list)
    favorite_styles = ",".join(favorite_styles_list)

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # 1. Update users table details
        cursor.execute(
            "UPDATE users SET name = COALESCE(?, name), age = COALESCE(?, age), gender = COALESCE(?, gender) WHERE id = ?",
            (name, age, gender, user_id)
        )
        
        # 2. Update user_preferences table (upsert behavior)
        cursor.execute("SELECT user_id FROM user_preferences WHERE user_id = ?", (user_id,))
        if cursor.fetchone():
            cursor.execute("""
                UPDATE user_preferences 
                SET favorite_colors = ?, favorite_styles = ?, preferred_fit = ?, budget_min = ?, budget_max = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (favorite_colors, favorite_styles, preferred_fit, budget_min, budget_max, user_id))
        else:
            cursor.execute("""
                INSERT INTO user_preferences (user_id, favorite_colors, favorite_styles, preferred_fit, budget_min, budget_max)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, favorite_colors, favorite_styles, preferred_fit, budget_min, budget_max))
            
        conn.commit()
        return jsonify({'message': 'Profile and preferences updated successfully.'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error updating profile.', 'error': str(e)}), 500
    finally:
        conn.close()
