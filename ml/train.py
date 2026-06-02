# OptiFit 2.0 ML Training & Retraining Pipeline
import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'clothing_classifier.pkl')

CATEGORIES = ["Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"]
STYLES = ["Casual", "Formal", "Party", "Traditional", "Streetwear"]
SEASONS = ["Summer", "Winter", "Rainy"]

def generate_synthetic_data(num_samples=2500):
    """
    Generates a synthetic dataset of image features representing clothing attributes.
    Features: avg_color(3), var_color(3), hist_r(8), hist_g(8), hist_b(8), edge_density(1).
    Total features: 31
    """
    X = []
    y_cat = []
    y_style = []
    y_season = []

    for _ in range(num_samples):
        # Choose a category randomly
        cat = np.random.choice(CATEGORIES)
        
        # Determine likely colors, styles, seasons based on category to build realistic rules
        if cat == "T-Shirt":
            style = np.random.choice(["Casual", "Streetwear"], p=[0.7, 0.3])
            season = np.random.choice(["Summer", "Rainy"], p=[0.8, 0.2])
            avg_rgb = np.random.uniform(0.3, 0.9, size=3) # Colorful
            edge_density = np.random.uniform(0.02, 0.10) # Smooth
        elif cat == "Shirt":
            style = np.random.choice(["Formal", "Smart Casual", "Casual"], p=[0.5, 0.3, 0.2])
            season = np.random.choice(["Summer", "Winter", "Rainy"], p=[0.5, 0.3, 0.2])
            avg_rgb = np.random.uniform(0.5, 0.95, size=3) # Often lighter
            edge_density = np.random.uniform(0.08, 0.18) # Collar, buttons
        elif cat == "Jeans":
            style = np.random.choice(["Casual", "Streetwear"], p=[0.6, 0.4])
            season = "Winter" if np.random.rand() > 0.5 else "Summer" # All-season
            avg_rgb = np.array([0.1, 0.2, np.random.uniform(0.4, 0.8)]) # Bluish/dark
            edge_density = np.random.uniform(0.05, 0.15)
        elif cat == "Jacket":
            style = np.random.choice(["Casual", "Streetwear", "Party"], p=[0.4, 0.4, 0.2])
            season = "Winter"
            avg_rgb = np.random.uniform(0.05, 0.4, size=3) # Darker
            edge_density = np.random.uniform(0.15, 0.35) # Zippers, heavy texture
        elif cat == "Kurta":
            style = "Traditional"
            season = np.random.choice(["Summer", "Winter"], p=[0.7, 0.3])
            avg_rgb = np.random.uniform(0.4, 0.9, size=3) # Bright/warm
            # Traditional Kurtas often have heavy embroidery (high texture/edges)
            edge_density = np.random.uniform(0.20, 0.40)
        elif cat == "Dress":
            style = np.random.choice(["Party", "Casual", "Traditional"], p=[0.5, 0.3, 0.2])
            season = "Summer"
            avg_rgb = np.random.uniform(0.4, 0.9, size=3) # Colorful
            edge_density = np.random.uniform(0.12, 0.30)
        elif cat == "Shoes":
            style = np.random.choice(["Casual", "Formal", "Streetwear"], p=[0.4, 0.3, 0.3])
            season = "Summer" if np.random.rand() > 0.5 else "Winter"
            shoes_choices = [
                np.random.uniform(0.05, 0.2, 3), # Black shoes
                np.random.uniform(0.8, 0.95, 3), # White shoes
                np.array([0.4, 0.2, 0.1])        # Brown shoes
            ]
            shoes_idx = np.random.choice(len(shoes_choices), p=[0.4, 0.3, 0.3])
            avg_rgb = shoes_choices[shoes_idx]
            edge_density = np.random.uniform(0.18, 0.35)
        elif cat == "Blazer":
            style = np.random.choice(["Formal", "Business Casual", "Party"], p=[0.6, 0.3, 0.1])
            season = "Winter"
            blazer_choices = [
                np.array([0.05, 0.05, 0.15]), # Navy
                np.array([0.05, 0.05, 0.05]), # Black
                np.array([0.85, 0.85, 0.85])  # Light Grey
            ]
            blazer_idx = np.random.choice(len(blazer_choices), p=[0.4, 0.4, 0.2])
            avg_rgb = blazer_choices[blazer_idx]
            edge_density = np.random.uniform(0.22, 0.38)
        elif cat == "Hoodie":
            style = "Streetwear"
            season = "Winter"
            avg_rgb = np.random.uniform(0.1, 0.6, size=3) # Dark/muted
            edge_density = np.random.uniform(0.10, 0.22)
            
        # Compile features
        var_rgb = np.random.uniform(0.01, 0.08, size=3)
        
        # Histograms centered around avg colors
        r_hist = np.random.normal(avg_rgb[0], 0.1, 8)
        g_hist = np.random.normal(avg_rgb[1], 0.1, 8)
        b_hist = np.random.normal(avg_rgb[2], 0.1, 8)
        
        # Softmax normalize to make them act like probability histograms
        r_hist = np.exp(r_hist) / np.sum(np.exp(r_hist))
        g_hist = np.exp(g_hist) / np.sum(np.exp(g_hist))
        b_hist = np.exp(b_hist) / np.sum(np.exp(b_hist))
        
        features = np.concatenate([
            avg_rgb,
            var_rgb,
            r_hist,
            g_hist,
            b_hist,
            [edge_density]
        ])
        
        # Map some styles/seasons that could be outside categories to lists
        if style not in STYLES:
            style = STYLES[0]
            
        X.append(features)
        y_cat.append(cat)
        y_style.append(style)
        y_season.append(season)
        
    return np.array(X), np.array(y_cat), np.array(y_style), np.array(y_season)

def train_and_save_models():
    """
    Trains the three Random Forest Classifiers and saves them as a dictionary.
    """
    print("Generating training dataset...")
    X, y_cat, y_style, y_season = generate_synthetic_data(2500)
    
    # Train Category Classifier
    print("Training clothing Category classifier...")
    clf_cat = RandomForestClassifier(n_estimators=80, max_depth=12, random_state=42)
    clf_cat.fit(X, y_cat)
    
    # Train Style Classifier
    print("Training clothing Style classifier...")
    clf_style = RandomForestClassifier(n_estimators=80, max_depth=10, random_state=42)
    clf_style.fit(X, y_style)
    
    # Train Season Classifier
    print("Training clothing Season classifier...")
    clf_season = RandomForestClassifier(n_estimators=80, max_depth=8, random_state=42)
    clf_season.fit(X, y_season)
    
    # Create models directory if it doesn't exist
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        
    # Serialize models
    models_dict = {
        "category_classifier": clf_cat,
        "style_classifier": clf_style,
        "season_classifier": clf_season
    }
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(models_dict, f)
        
    print(f"Successfully saved trained classifiers to {MODEL_PATH}")

def retrain_model_with_user_data(user_items):
    """
    Optional function to retrain models by combining synthetic data with real user-labeled clothes.
    `user_items` is a list of dicts: [{'image_path': '...', 'category': '...', 'style': '...', 'season': '...'}]
    """
    if not user_items:
        return
        
    # Extract features for user items
    user_X = []
    user_y_cat = []
    user_y_style = []
    user_y_season = []
    
    from ml.cv_analyzer import extract_image_features
    for item in user_items:
        feats = extract_image_features(item['image_path'])
        if feats is not None:
            user_X.append(feats)
            user_y_cat.append(item['category'])
            user_y_style.append(item['style'])
            user_y_season.append(item['season'])
            
    if not user_X:
        return
        
    # Generate base synthetic data to avoid overfitting
    synth_X, synth_y_cat, synth_y_style, synth_y_season = generate_synthetic_data(1000)
    
    # Combine data
    combined_X = np.vstack([synth_X, np.array(user_X)])
    combined_y_cat = np.concatenate([synth_y_cat, np.array(user_y_cat)])
    combined_y_style = np.concatenate([synth_y_style, np.array(user_y_style)])
    combined_y_season = np.concatenate([synth_y_season, np.array(user_y_season)])
    
    # Retrain
    clf_cat = RandomForestClassifier(n_estimators=80, random_state=42).fit(combined_X, combined_y_cat)
    clf_style = RandomForestClassifier(n_estimators=80, random_state=42).fit(combined_X, combined_y_style)
    clf_season = RandomForestClassifier(n_estimators=80, random_state=42).fit(combined_X, combined_y_season)
    
    models_dict = {
        "category_classifier": clf_cat,
        "style_classifier": clf_style,
        "season_classifier": clf_season
    }
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(models_dict, f)
        
    print(f"Retrained classifier successfully with {len(user_X)} user samples.")

if __name__ == "__main__":
    train_and_save_models()
