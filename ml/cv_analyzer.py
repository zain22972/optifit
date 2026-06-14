# OptiFit 2.0 CV Clothing Analyzer
import os
import pickle
import numpy as np
from PIL import Image

# Predefined colors and their standard RGB values
COLOR_PALETTE = {
    "Black": (15, 15, 15),
    "White": (240, 240, 240),
    "Blue": (30, 80, 200),
    "Green": (35, 130, 60),
    "Red": (210, 40, 40),
    "Yellow": (245, 200, 30),
    "Brown": (120, 75, 45)
}

# Target categories for predictions
CATEGORIES = ["Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"]
STYLES = ["Casual", "Formal", "Party", "Traditional", "Streetwear"]
SEASONS = ["Summer", "Winter", "Rainy"]

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'clothing_classifier.pkl')

def extract_image_features(image_path):
    """
    Extracts a normalized visual feature vector from an image.
    Features: average color (3), color variance (3), 3-channel histogram bins (24), edge density (1).
    Total features: 31
    """
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return None

    # Resize to standard processing size
    img_resized = img.resize((64, 64))
    img_np = np.array(img_resized)

    # Average color & variance
    avg_color = img_np.mean(axis=(0, 1)) / 255.0
    var_color = img_np.var(axis=(0, 1)) / (255.0 ** 2)

    # Histograms (8 bins per channel)
    r_hist, _ = np.histogram(img_np[:, :, 0], bins=8, range=(0, 255), density=True)
    g_hist, _ = np.histogram(img_np[:, :, 1], bins=8, range=(0, 255), density=True)
    b_hist, _ = np.histogram(img_np[:, :, 2], bins=8, range=(0, 255), density=True)

    # Edge density (texture approximation using simple grayscale gradients)
    gray_img = img_resized.convert('L')
    gray_np = np.array(gray_img, dtype=float)
    # Sobel-like filter elements
    gx = np.diff(gray_np, axis=1)[:-1, :]
    gy = np.diff(gray_np, axis=0)[:, :-1]
    grad_mag = np.sqrt(gx**2 + gy**2)
    edge_density = grad_mag.mean() / 255.0 if grad_mag.size > 0 else 0.0

    # Assemble feature vector
    features = np.concatenate([
        avg_color,      # 3
        var_color,      # 3
        r_hist,         # 8
        g_hist,         # 8
        b_hist,         # 8
        [edge_density]  # 1
    ])
    return features

def extract_dominant_color(image_path):
    """
    Finds the average color of the image and maps it to the closest target color in COLOR_PALETTE.
    """
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        print(f"Error opening image {image_path}: {e}")
        return "Black"

    # Resize to average out detail
    img_small = img.resize((16, 16))
    img_np = np.array(img_small)
    avg_rgb = img_np.mean(axis=(0, 1))

    # Calculate Euclidean distance to each color in our palette
    best_color = "Black"
    min_dist = float('inf')
    
    for color_name, palette_rgb in COLOR_PALETTE.items():
        dist = np.linalg.norm(np.array(avg_rgb) - np.array(palette_rgb))
        if dist < min_dist:
            min_dist = dist
            best_color = color_name
            
    return best_color

def analyze_clothing_item(image_path):
    """
    Analyzes an uploaded clothing image.
    Returns: { 'color': '...', 'category': '...', 'style': '...', 'season': '...' }
    """
    # 1. Detect Color
    dominant_color = extract_dominant_color(image_path)

    # 2. Extract Features for Classifier
    features = extract_image_features(image_path)
    
    if features is None:
        # Fallback values
        return {
            "color": dominant_color,
            "category": "T-Shirt",
            "style": "Casual",
            "season": "Summer"
        }

    # 3. Load ML model and predict
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training script...")
        # Auto-train if model doesn't exist
        try:
            from ml.train import train_and_save_models
            train_and_save_models()
        except ImportError:
            # Fallback path if imports differ
            import sys
            sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
            from ml.train import train_and_save_models
            train_and_save_models()

    try:
        with open(MODEL_PATH, 'rb') as f:
            models_dict = pickle.load(f)
            
        clf_cat = models_dict['category_classifier']
        clf_style = models_dict['style_classifier']
        clf_season = models_dict['season_classifier']
        
        # Format feature for prediction
        x = features.reshape(1, -1)
        
        category = clf_cat.predict(x)[0]
        style = clf_style.predict(x)[0]
        season = clf_season.predict(x)[0]
        
        return {
            "color": dominant_color,
            "category": category,
            "style": style,
            "season": season
        }
    except Exception as e:
        print(f"Error during ML prediction: {e}. Using intelligent fallback.")
        # Intelligent Rule-based fallback if model load/prediction fails
        category = "T-Shirt"
        style = "Casual"
        season = "Summer"
        
        # Color & texture heuristics
        avg_color = features[0:3]
        edge_density = features[-1]
        
        # Dark color + high edges -> jacket / hoodie
        if avg_color.mean() < 0.3:
            category = "Jacket" if edge_density > 0.15 else "Jeans"
            style = "Streetwear"
            season = "Winter"
        elif edge_density > 0.25:
            category = "Kurta"
            style = "Traditional"
            season = "All-season"
        elif avg_color[0] > 0.7 and avg_color[1] > 0.7 and avg_color[2] > 0.7:
            category = "Shirt"
            style = "Formal"
            season = "Summer"
            
        return {
            "color": dominant_color,
            "category": category,
            "style": style,
            "season": season
        }
