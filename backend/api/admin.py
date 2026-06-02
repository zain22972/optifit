# OptiFit 2.0 Admin Management API Blueprint
from flask import Blueprint, request, jsonify, g
import bcrypt

from backend.database.db import get_db
from backend.api.auth import admin_required
from ml.train import train_and_save_models, retrain_model_with_user_data

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/analytics', methods=['GET'])
@admin_required
def get_analytics():
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # 1. Total Counts
        cursor.execute("SELECT COUNT(id) FROM users")
        total_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(id) FROM outfits")
        total_outfits = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(id) FROM wardrobe")
        total_uploads = cursor.fetchone()[0]
        
        # 2. Most Popular Styles (from user wardrobe)
        cursor.execute("SELECT style, COUNT(id) as count FROM wardrobe GROUP BY style ORDER BY count DESC LIMIT 5")
        popular_styles = [dict(row) for row in cursor.fetchall()]
        
        # 3. Most Popular Colors (from user wardrobe)
        cursor.execute("SELECT color, COUNT(id) as count FROM wardrobe GROUP BY color ORDER BY count DESC LIMIT 5")
        popular_colors = [dict(row) for row in cursor.fetchall()]
        
        # 4. Most Saved Outfits (Top 5)
        cursor.execute("""
            SELECT o.name, COUNT(s.id) as saves 
            FROM outfits o 
            JOIN saved_outfits s ON o.id = s.outfit_id 
            GROUP BY o.id 
            ORDER BY saves DESC 
            LIMIT 5
        """)
        saved_outfits = [dict(row) for row in cursor.fetchall()]
        
        # 5. Recommendation Accuracy (Explicit Likes vs Dislikes ratio)
        cursor.execute("SELECT COUNT(id) FROM feedback WHERE feedback_type = 'like'")
        likes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(id) FROM feedback WHERE feedback_type = 'dislike'")
        dislikes = cursor.fetchone()[0]
        
        total_feedback = likes + dislikes
        accuracy = 85.0 # Default benchmark
        if total_feedback > 0:
            accuracy = round((likes / total_feedback) * 100, 1)

        return jsonify({
            'total_users': total_users,
            'total_outfits': total_outfits,
            'total_uploads': total_uploads,
            'popular_styles': popular_styles,
            'popular_colors': popular_colors,
            'most_saved_outfits': saved_outfits,
            'recommendation_accuracy': accuracy
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error calculating analytics.', 'error': str(e)}), 500
    finally:
        conn.close()

# --- CRUD Users ---

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_users():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, age, gender, created_at FROM users")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(users), 200

@admin_bp.route('/admin/users', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'user')
    age = data.get('age')
    gender = data.get('gender')
    
    if not name or not email or not password:
        return jsonify({'message': 'Missing required fields.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            return jsonify({'message': 'Email already registered.'}), 400
            
        salt = bcrypt.gensalt()
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role, age, gender) VALUES (?, ?, ?, ?, ?, ?)",
            (name, email, pw_hash, role, age, gender)
        )
        user_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({'message': 'User created successfully.', 'user_id': user_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error creating user.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')
    age = data.get('age')
    gender = data.get('gender')
    
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), age = COALESCE(?, age), gender = COALESCE(?, gender) WHERE id = ?",
                       (name, email, role, age, gender, user_id))
        conn.commit()
        return jsonify({'message': 'User updated successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error updating user.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    if user_id == g.current_user['id']:
        return jsonify({'message': 'You cannot delete your own account.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        return jsonify({'message': 'User deleted successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error deleting user.', 'error': str(e)}), 500
    finally:
        conn.close()

# --- CRUD Outfits ---

@admin_bp.route('/admin/outfits', methods=['GET'])
@admin_required
def get_outfits():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM outfits ORDER BY id DESC")
    outfits = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(outfits), 200

@admin_bp.route('/admin/outfits', methods=['POST'])
@admin_required
def create_outfit():
    data = request.get_json() or {}
    name = data.get('name')
    category = data.get('category')
    style = data.get('style')
    color = data.get('color')
    occasion = data.get('occasion')
    gender = data.get('gender', 'Unisex')
    budget = data.get('budget', 50.0)
    season = data.get('season', 'All-Season')
    image_url = data.get('image_url', '/assets/outfits/placeholder.png')
    components = data.get('components', '')
    style_explanation = data.get('style_explanation', '')
    
    if not name or not category or not style or not color or not occasion or not components:
        return jsonify({'message': 'Missing required fields.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO outfits (name, category, style, color, occasion, gender, budget, season, image_url, components, style_explanation, is_system)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (name, category, style, color, occasion, gender, budget, season, image_url, components, style_explanation))
        outfit_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Outfit created successfully.', 'outfit_id': outfit_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error creating outfit.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/outfits/<int:outfit_id>', methods=['PUT'])
@admin_required
def update_outfit(outfit_id):
    data = request.get_json() or {}
    name = data.get('name')
    category = data.get('category')
    style = data.get('style')
    color = data.get('color')
    occasion = data.get('occasion')
    gender = data.get('gender')
    budget = data.get('budget')
    season = data.get('season')
    components = data.get('components')
    style_explanation = data.get('style_explanation')
    
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE outfits 
            SET name = COALESCE(?, name),
                category = COALESCE(?, category),
                style = COALESCE(?, style),
                color = COALESCE(?, color),
                occasion = COALESCE(?, occasion),
                gender = COALESCE(?, gender),
                budget = COALESCE(?, budget),
                season = COALESCE(?, season),
                components = COALESCE(?, components),
                style_explanation = COALESCE(?, style_explanation)
            WHERE id = ?
        """, (name, category, style, color, occasion, gender, budget, season, components, style_explanation, outfit_id))
        conn.commit()
        return jsonify({'message': 'Outfit updated successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error updating outfit.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/outfits/<int:outfit_id>', methods=['DELETE'])
@admin_required
def delete_outfit(outfit_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM outfits WHERE id = ?", (outfit_id,))
        conn.commit()
        return jsonify({'message': 'Outfit deleted successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error deleting outfit.', 'error': str(e)}), 500
    finally:
        conn.close()

# --- CRUD Trends ---

@admin_bp.route('/admin/trends', methods=['GET'])
@admin_required
def get_trends():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trends ORDER BY updated_at DESC")
    trends = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(trends), 200

@admin_bp.route('/admin/trends', methods=['POST'])
@admin_required
def create_trend():
    data = request.get_json() or {}
    name = data.get('name')
    trend_type = data.get('type') # color, style, category, season
    value = data.get('value')
    score = data.get('score', 1.0)
    
    if not name or not trend_type or not value:
        return jsonify({'message': 'Missing required fields.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO trends (name, type, value, score, is_active, updated_by)
            VALUES (?, ?, ?, ?, 1, ?)
        """, (name, trend_type, value, score, g.current_user['id']))
        trend_id = cursor.lastrowid
        conn.commit()
        return jsonify({'message': 'Trend created successfully.', 'trend_id': trend_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error creating trend.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/trends/<int:trend_id>', methods=['PUT'])
@admin_required
def update_trend(trend_id):
    data = request.get_json() or {}
    name = data.get('name')
    trend_type = data.get('type')
    value = data.get('value')
    score = data.get('score')
    is_active = data.get('is_active')
    
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE trends 
            SET name = COALESCE(?, name),
                type = COALESCE(?, type),
                value = COALESCE(?, value),
                score = COALESCE(?, score),
                is_active = COALESCE(?, is_active),
                updated_at = CURRENT_TIMESTAMP,
                updated_by = ?
            WHERE id = ?
        """, (name, trend_type, value, score, is_active, g.current_user['id'], trend_id))
        conn.commit()
        return jsonify({'message': 'Trend updated successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error updating trend.', 'error': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/admin/trends/<int:trend_id>', methods=['DELETE'])
@admin_required
def delete_trend(trend_id):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM trends WHERE id = ?", (trend_id,))
        conn.commit()
        return jsonify({'message': 'Trend deleted successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error deleting trend.', 'error': str(e)}), 500
    finally:
        conn.close()

# --- Retraining ML models trigger ---

@admin_bp.route('/admin/retrain-models', methods=['POST'])
@admin_required
def retrain_models():
    try:
        # Check if we have any custom wardrobe items in database to feed the retraining
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT image_url, category, style, season FROM wardrobe")
        rows = cursor.fetchall()
        conn.close()
        
        # Prepare list of items
        user_items = []
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        for row in rows:
            # Reconstruct absolute filepath
            rel_path = row['image_url'].lstrip('/') # e.g. 'uploads/uuid.jpg'
            abs_path = os.path.join(base_dir, rel_path)
            if os.path.exists(abs_path):
                user_items.append({
                    'image_path': abs_path,
                    'category': row['category'],
                    'style': row['style'],
                    'season': row['season']
                })
                
        if len(user_items) > 5:
            # Retrain with combined synthetic and user corrected clothes
            retrain_model_with_user_data(user_items)
            msg = f"Model retrained using {len(user_items)} custom user garment images."
        else:
            # Just do a base retraining
            train_and_save_models()
            msg = "Model retrained using base synthetic fashion profiles."
            
        return jsonify({'message': msg}), 200
    except Exception as e:
        return jsonify({'message': 'Error during retraining execution.', 'error': str(e)}), 500
