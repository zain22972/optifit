# OptiFit 2.0 Wardrobe API Blueprint
import os
import uuid
import base64
import requests
import json
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

def get_gemini_api_key():
    key = os.environ.get('GEMINI_API_KEY')
    if key:
        return key
    # Try reading from .env in backend/ or project root
    for env_path in [
        os.path.join(os.path.dirname(__file__), '..', '.env'),
        os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
    ]:
        if os.path.exists(env_path):
            try:
                with open(env_path, 'r') as f:
                    for line in f:
                        if line.strip().startswith('GEMINI_API_KEY='):
                            return line.strip().split('=', 1)[1].strip().strip('"').strip("'")
            except Exception:
                pass
    return None
@wardrobe_bp.route('/wardrobe/analyze-photo', methods=['POST'])
@token_required
def analyze_photo():
    api_key = get_gemini_api_key()
    use_fallback = False

    image_base64 = None
    mime_type = "image/jpeg"

    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
            if ext == 'png':
                mime_type = 'image/png'
            elif ext == 'webp':
                mime_type = 'image/webp'
            image_base64 = base64.b64encode(file.read()).decode('utf-8')
    else:
        data = request.get_json() or {}
        image_base64_raw = data.get('image')
        if image_base64_raw:
            if ',' in image_base64_raw:
                header, image_base64 = image_base64_raw.split(',', 1)
                if 'png' in header:
                    mime_type = 'image/png'
                elif 'webp' in header:
                    mime_type = 'image/webp'
            else:
                image_base64 = image_base64_raw

    if not image_base64:
        return jsonify({'message': 'No image provided. Upload a file or send base64 data.'}), 400

    if not api_key:
        print("Gemini API Key is missing. Falling back to local CV analyzer.")
        use_fallback = True
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        prompt = """
        Analyze this image to see if it is a clothing item, footwear, or a clothing accessory (e.g., shirt, pants, dress, shoes, blazer, jacket).
        The output must strictly be a JSON object conforming to the following schema and choosing ONLY from the specified options:
        {
          "is_clothing": true | false,
          "category": "Tops" | "Bottoms" | "Footwear" | "Accessories",
          "subcategory": "Shirt" | "T-Shirt" | "Jeans" | "Jacket" | "Kurta" | "Dress" | "Shoes" | "Blazer" | "Hoodie",
          "color": "Black" | "White" | "Blue" | "Green" | "Red" | "Yellow" | "Brown",
          "style": "Casual" | "Formal" | "Party" | "Traditional" | "Streetwear",
          "season": "Summer" | "Winter" | "Rainy"
        }

        Strict Rules:
        - "is_clothing" must be true only if the image contains a clear clothing item, footwear, or clothing accessory. If the image is a person's face, a landscape, animals, food, or non-clothing items, "is_clothing" MUST be false.
        - Even if a person is wearing clothes, if it's a full portrait or a generic photo of a person rather than a clear product/flat-lay/isolated photo of a garment, prioritize detecting if it's suitable for a virtual wardrobe item, otherwise set "is_clothing" to false or true accordingly.

        Return ONLY the raw JSON block without markdown formatting or other explanation.
        """

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ]
        }

        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
            if response.status_code != 200:
                print(f"Gemini API returned status {response.status_code}: {response.text}. Falling back to local CV analyzer.")
                use_fallback = True
            else:
                result_json = response.json()
                text_content = result_json['candidates'][0]['content']['parts'][0]['text']
                
                clean_text = text_content.strip()
                if clean_text.startswith("```"):
                    lines = clean_text.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines[-1].startswith("```"):
                        lines = lines[:-1]
                    clean_text = "\n".join(lines).strip()
                    
                parsed_details = json.loads(clean_text)
                
                # Check validation
                if not parsed_details.get("is_clothing", True):
                    return jsonify({'message': 'Only clothing photos are allowed to be uploaded. Please upload a clear photo of a single clothing item, footwear, or clothing accessory.'}), 400
        except Exception as e:
            print(f"Gemini API call or parsing failed: {e}. Falling back to local CV analyzer.")
            use_fallback = True

    try:
        if use_fallback:
            unique_name = f"scan-{uuid.uuid4().hex}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, unique_name)
            
            if 'image' in request.files:
                request.files['image'].seek(0)
                request.files['image'].save(filepath)
            else:
                with open(filepath, "wb") as fh:
                    fh.write(base64.b64decode(image_base64))
            
            analysis = analyze_clothing_item(filepath)
            
            subcategory = analysis.get('category', 'T-Shirt')
            color = analysis.get('color', 'Black')
            style = analysis.get('style', 'Casual')
            season = analysis.get('season', 'Summer')
            
            sub_to_main = {
                "Shirt": "Tops", "T-Shirt": "Tops", "Jacket": "Tops", "Kurta": "Tops", "Hoodie": "Tops",
                "Jeans": "Bottoms",
                "Shoes": "Footwear",
                "Dress": "Tops",
                "Blazer": "Accessories"
            }
            category = sub_to_main.get(subcategory, "Tops")
        else:
            valid_categories = ["Tops", "Bottoms", "Footwear", "Accessories"]
            valid_subcategories = ["Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"]
            valid_colors = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"]
            valid_styles = ["Casual", "Formal", "Party", "Traditional", "Streetwear"]
            valid_seasons = ["Summer", "Winter", "Rainy"]

            category = parsed_details.get("category", "Tops")
            if category not in valid_categories:
                category = "Tops"
                
            subcategory = parsed_details.get("subcategory", "T-Shirt")
            if subcategory not in valid_subcategories:
                subcategory = "T-Shirt"
                
            color = parsed_details.get("color", "Black")
            if color not in valid_colors:
                color = "Black"
                
            style = parsed_details.get("style", "Casual")
            if style not in valid_styles:
                style = "Casual"
                
            season = parsed_details.get("season", "Summer")
            if season not in valid_seasons:
                season = "Summer"

            unique_name = f"scan-{uuid.uuid4().hex}.jpg"
            filepath = os.path.join(UPLOAD_FOLDER, unique_name)
            
            if 'image' in request.files:
                request.files['image'].seek(0)
                request.files['image'].save(filepath)
            else:
                with open(filepath, "wb") as fh:
                    fh.write(base64.b64decode(image_base64))
                    
        image_url = f"/uploads/{unique_name}"

        user_id = g.current_user['id']
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO wardrobe (user_id, image_url, category, subcategory, color, style, season)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, image_url, category, subcategory, color, style, season))
        
        item_id = cursor.lastrowid
        conn.commit()
        conn.close()

        message = 'Gemini analyzed image successfully.' if not use_fallback else 'Gemini API failed. Local CV model analyzed image successfully.'

        return jsonify({
            'message': message,
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
        }), 200

    except Exception as e:
        return jsonify({'message': 'Error analyzing photo.', 'error': str(e)}), 500
