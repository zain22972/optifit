# OptiFit 2.0 Recommendations API Blueprint
from flask import Blueprint, request, jsonify, g
from backend.database.db import get_db
from backend.api.auth import token_required
from ml.recommender import AIRecommender

recommendations_bp = Blueprint('recommendations', __name__)
recommender = AIRecommender()

@recommendations_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations():
    user_id = g.current_user['id']
    
    # Query parameters
    occasion = request.args.get('occasion')
    weather_condition = request.args.get('weather') # e.g. Hot, Winter, Rainy
    limit = request.args.get('limit', 12, type=int)
    
    try:
        # Fetch recommendations
        outfits = recommender.recommend_outfits(
            user_id=user_id,
            occasion=occasion,
            weather_condition=weather_condition,
            limit=limit
        )
        
        # Save weather condition history if provided
        if weather_condition:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO weather_history (user_id, location, temperature, condition) VALUES (?, 'Local City', 25.0, ?)",
                (user_id, weather_condition)
            )
            conn.commit()
            conn.close()
            
        return jsonify(outfits), 200
        
    except Exception as e:
        return jsonify({'message': 'Error retrieving recommendations.', 'error': str(e)}), 500

@recommendations_bp.route('/generate-outfit', methods=['POST'])
@token_required
def generate_outfit():
    user_id = g.current_user['id']
    data = request.get_json() or {}
    
    occasion = data.get('occasion', 'Casual Hangout')
    weather = data.get('weather', 'Hot')
    budget = float(data.get('budget', 150.0))
    color = data.get('color')
    style = data.get('style', 'Casual')
    
    try:
        combination = recommender.generate_outfit_combination(
            user_id=user_id,
            occasion=occasion,
            weather=weather,
            budget_pref=budget,
            color_pref=color,
            style_pref=style
        )
        return jsonify(combination), 200
    except Exception as e:
        return jsonify({'message': 'Error generating outfit.', 'error': str(e)}), 500

@recommendations_bp.route('/wardrobe-outfits', methods=['GET'])
@token_required
def generate_wardrobe_outfits():
    user_id = g.current_user['id']
    occasion = request.args.get('occasion')
    weather = request.args.get('weather')
    
    try:
        combinations = recommender.generate_wardrobe_combination(
            user_id=user_id,
            occasion=occasion,
            weather_condition=weather
        )
        return jsonify(combinations), 200
    except Exception as e:
        return jsonify({'message': 'Error constructing outfits from wardrobe.', 'error': str(e)}), 500

@recommendations_bp.route('/like', methods=['POST'])
@token_required
def like_outfit():
    user_id = g.current_user['id']
    data = request.get_json() or {}
    outfit_id = data.get('outfit_id')
    
    if not outfit_id:
        return jsonify({'message': 'Outfit ID is required.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        # Upsert feedback
        cursor.execute("SELECT id FROM feedback WHERE user_id = ? AND outfit_id = ?", (user_id, outfit_id))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE feedback SET feedback_type = 'like' WHERE id = ?", (row['id'],))
        else:
            cursor.execute("INSERT INTO feedback (user_id, outfit_id, feedback_type) VALUES (?, ?, 'like')", (user_id, outfit_id))
            
        # Log to recommendations log if applicable
        cursor.execute(
            "INSERT INTO recommendations (user_id, outfit_id, score, feedback_type, weather_condition) VALUES (?, ?, 1.0, 'like', 'All-Season')",
            (user_id, outfit_id)
        )
            
        conn.commit()
        return jsonify({'message': 'Outfit liked successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error processing feedback.', 'error': str(e)}), 500
    finally:
        conn.close()

@recommendations_bp.route('/dislike', methods=['POST'])
@token_required
def dislike_outfit():
    user_id = g.current_user['id']
    data = request.get_json() or {}
    outfit_id = data.get('outfit_id')
    
    if not outfit_id:
        return jsonify({'message': 'Outfit ID is required.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM feedback WHERE user_id = ? AND outfit_id = ?", (user_id, outfit_id))
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE feedback SET feedback_type = 'dislike' WHERE id = ?", (row['id'],))
        else:
            cursor.execute("INSERT INTO feedback (user_id, outfit_id, feedback_type) VALUES (?, ?, 'dislike')", (user_id, outfit_id))
            
        cursor.execute(
            "INSERT INTO recommendations (user_id, outfit_id, score, feedback_type, weather_condition) VALUES (?, ?, 0.0, 'dislike', 'All-Season')",
            (user_id, outfit_id)
        )
            
        conn.commit()
        return jsonify({'message': 'Outfit disliked successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error processing feedback.', 'error': str(e)}), 500
    finally:
        conn.close()

@recommendations_bp.route('/save-outfit', methods=['POST'])
@token_required
def save_outfit():
    user_id = g.current_user['id']
    data = request.get_json() or {}
    outfit_id = data.get('outfit_id')
    
    if not outfit_id:
        return jsonify({'message': 'Outfit ID is required.'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT OR IGNORE INTO saved_outfits (user_id, outfit_id) VALUES (?, ?)", (user_id, outfit_id))
        cursor.execute("INSERT INTO feedback (user_id, outfit_id, feedback_type) VALUES (?, ?, 'save')", (user_id, outfit_id))
        conn.commit()
        return jsonify({'message': 'Outfit saved to wardrobe successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error saving outfit.', 'error': str(e)}), 500
    finally:
        conn.close()

@recommendations_bp.route('/save-outfit/<int:outfit_id>', methods=['DELETE'])
@token_required
def unsave_outfit(outfit_id):
    user_id = g.current_user['id']
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM saved_outfits WHERE user_id = ? AND outfit_id = ?", (user_id, outfit_id))
        conn.commit()
        return jsonify({'message': 'Outfit unsaved successfully.'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error unsaving outfit.', 'error': str(e)}), 500
    finally:
        conn.close()

@recommendations_bp.route('/saved-outfits', methods=['GET'])
@token_required
def get_saved_outfits():
    user_id = g.current_user['id']
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT o.* FROM outfits o 
            JOIN saved_outfits s ON o.id = s.outfit_id 
            WHERE s.user_id = ?
            ORDER BY s.saved_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
        saved = [dict(row) for row in rows]
        return jsonify(saved), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching saved outfits.', 'error': str(e)}), 500
    finally:
        conn.close()

@recommendations_bp.route('/trends', methods=['GET'])
@token_required
def get_public_trends():
    """Public endpoint for viewing active fashion trends (read-only, no admin required)."""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM trends WHERE is_active = 1 ORDER BY updated_at DESC")
        trends = [dict(row) for row in cursor.fetchall()]
        return jsonify(trends), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching trends.', 'error': str(e)}), 500
    finally:
        conn.close()

