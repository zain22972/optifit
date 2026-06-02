# OptiFit 2.0 Wardrobe API Blueprint
import os
import uuid
from flask import Blueprint, request, jsonify, g, url_for
from werkzeug.utils import secure_filename

from backend.database.db import get_db
from backend.api.auth import token_required
from ml.cv_analyzer import analyze_clothing_item

wardrobe_bp = Blueprint('wardrobe', __name__)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'uploads'))
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@wardrobe_bp.route('/upload-clothing', methods=['POST'])
@token_required
def upload_clothing():
    user_id = g.current_user['id']
    
    # Check if image is in request files
    if 'image' not in request.files:
        return jsonify({'message': 'No image file uploaded.'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'message': 'No image selected.'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'message': 'Allowed image formats are png, jpg, jpeg, webp.'}), 400

    try:
        # Create a unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, unique_name)
        
        # Save image file
        file.save(filepath)
        
        # Invoke CV Clothing Analyzer
        analysis = analyze_clothing_item(filepath)
        
        # Map subcategory to main category
        # tops: Shirt, T-Shirt, Jacket, Kurta, Hoodie
        # bottoms: Jeans (and Trouser/Chinos/Shorts if present)
        # footwear: Shoes
        # accessories: Blazer, Dress (or other accessories)
        subcategory = analysis.get('category', 'T-Shirt')
        color = analysis.get('color', 'Black')
        style = analysis.get('style', 'Casual')
        season = analysis.get('season', 'Summer')
        
        sub_to_main = {
            "Shirt": "Tops", "T-Shirt": "Tops", "Jacket": "Tops", "Kurta": "Tops", "Hoodie": "Tops",
            "Jeans": "Bottoms",
            "Shoes": "Footwear",
            "Dress": "Tops", # Dress acts as a Top/Full piece
            "Blazer": "Accessories" # Blazer can layer
        }
        category = sub_to_main.get(subcategory, "Tops")

        # Save relative URL for the image
        # In a real app we'd serve the uploads static directory.
        # We can reference uploads using /uploads/<filename>
        image_url = f"/uploads/{unique_name}"

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO wardrobe (user_id, image_url, category, subcategory, color, style, season)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, image_url, category, subcategory, color, style, season))
        
        item_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Clothing uploaded and CV analyzed successfully.',
            'item': {
                'id': item_id,
                'user_id': user_id,
                'image_url': image_url,
                'category': category,
                'subcategory': subcategory,
                'color': color,
                'style': style,
                'season': season
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Error uploading clothing.', 'error': str(e)}), 500

@wardrobe_bp.route('/wardrobe', methods=['GET'])
@token_required
def get_wardrobe():
    user_id = g.current_user['id']
    
    # Filtering parameters
    category = request.args.get('category')
    color = request.args.get('color')
    style = request.args.get('style')
    season = request.args.get('season')
    search = request.args.get('search')

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        query = "SELECT * FROM wardrobe WHERE user_id = ?"
        params = [user_id]
        
        if category:
            query += " AND category = ?"
            params.append(category)
        if color:
            query += " AND color = ?"
            params.append(color)
        if style:
            query += " AND style = ?"
            params.append(style)
        if season:
            query += " AND season = ?"
            params.append(season)
        if search:
            query += " AND (subcategory LIKE ? OR color LIKE ? OR style LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
            
        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        wardrobe_items = [dict(row) for row in rows]
        
        return jsonify(wardrobe_items), 200
        
    except Exception as e:
        return jsonify({'message': 'Error retrieving wardrobe.', 'error': str(e)}), 500
    finally:
        conn.close()

@wardrobe_bp.route('/wardrobe/<int:item_id>', methods=['PUT'])
@token_required
def update_wardrobe_item(item_id):
    user_id = g.current_user['id']
    data = request.get_json() or {}
    
    category = data.get('category')
    subcategory = data.get('subcategory')
    color = data.get('color')
    style = data.get('style')
    season = data.get('season')

    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check ownership
        cursor.execute("SELECT id FROM wardrobe WHERE id = ? AND user_id = ?", (item_id, user_id))
        if not cursor.fetchone():
            return jsonify({'message': 'Wardrobe item not found.'}), 404
            
        cursor.execute("""
            UPDATE wardrobe 
            SET category = COALESCE(?, category),
                subcategory = COALESCE(?, subcategory),
                color = COALESCE(?, color),
                style = COALESCE(?, style),
                season = COALESCE(?, season)
            WHERE id = ?
        """, (category, subcategory, color, style, season, item_id))
        
        conn.commit()
        return jsonify({'message': 'Wardrobe item updated successfully.'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error updating wardrobe item.', 'error': str(e)}), 500
    finally:
        conn.close()

@wardrobe_bp.route('/wardrobe/<int:item_id>', methods=['DELETE'])
@token_required
def delete_wardrobe_item(item_id):
    user_id = g.current_user['id']
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check ownership and get image url to delete local file
        cursor.execute("SELECT image_url FROM wardrobe WHERE id = ? AND user_id = ?", (item_id, user_id))
        row = cursor.fetchone()
        
        if not row:
            return jsonify({'message': 'Wardrobe item not found.'}), 404
            
        image_url = row['image_url']
        
        # Delete from database
        cursor.execute("DELETE FROM wardrobe WHERE id = ?", (item_id,))
        
        # Delete local file if it exists
        if image_url.startswith("/uploads/"):
            filename = image_url.split("/uploads/")[1]
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                
        conn.commit()
        return jsonify({'message': 'Wardrobe item deleted successfully.'}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'Error deleting wardrobe item.', 'error': str(e)}), 500
    finally:
        conn.close()
