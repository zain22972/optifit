# OptiFit 2.0 AI Outfit Recommendation Engine
import os
import sqlite3
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'database', 'optifit.db'))

def get_db_connection():
    # Relative path from root
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

class AIRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        
    def _fetch_outfits(self, conn):
        """Fetches all system and user custom outfits from the database."""
        query = "SELECT * FROM outfits"
        df = pd.read_sql_query(query, conn)
        return df

    def _fetch_user_interactions(self, conn, user_id):
        """Fetches user feedback (likes/dislikes) for personalized learning."""
        query = "SELECT outfit_id, feedback_type FROM feedback WHERE user_id = ?"
        df = pd.read_sql_query(query, conn, params=(user_id,))
        return df

    def _fetch_active_trends(self, conn):
        """Fetches active fashion trends and their boost scores."""
        query = "SELECT type, value, score FROM trends WHERE is_active = 1"
        cursor = conn.cursor()
        cursor.execute(query)
        return cursor.fetchall()

    def _build_outfit_text(self, row):
        """Creates a composite text description of an outfit for TF-IDF."""
        return f"{row['category']} {row['style']} {row['color']} {row['occasion']} {row['season']} {row['components']} {row['name']}"

    def recommend_outfits(self, user_id, preferences=None, occasion=None, weather_condition=None, limit=12):
        """
        Main recommendation engine function.
        Combines TF-IDF, Cosine Similarity, Weather intelligence, Trends, and Personalized feedback.
        """
        conn = get_db_connection()
        try:
            # 1. Fetch outfits
            df_outfits = self._fetch_outfits(conn)
            if df_outfits.empty:
                return []

            # 2. Get User Details
            cursor = conn.cursor()
            cursor.execute("SELECT gender, age FROM users WHERE id = ?", (user_id,))
            user_row = cursor.fetchone()
            user_gender = user_row["gender"] if user_row else "Unisex"
            
            # Fetch user preferences
            if not preferences:
                cursor.execute("SELECT * FROM user_preferences WHERE user_id = ?", (user_id,))
                pref_row = cursor.fetchone()
                if pref_row:
                    preferences = {
                        "favorite_colors": pref_row["favorite_colors"].split(",") if pref_row["favorite_colors"] else [],
                        "favorite_styles": pref_row["favorite_styles"].split(",") if pref_row["favorite_styles"] else [],
                        "budget_min": pref_row["budget_min"],
                        "budget_max": pref_row["budget_max"]
                    }
                else:
                    preferences = {
                        "favorite_colors": [],
                        "favorite_styles": [],
                        "budget_min": 0,
                        "budget_max": 500
                    }

            # 3. Create Outfit Corpus & Vectorize
            df_outfits['corpus'] = df_outfits.apply(self._build_outfit_text, axis=1)
            tfidf_matrix = self.vectorizer.fit_transform(df_outfits['corpus'])

            # 4. Construct Query Vector
            # Combine occasion, preferences, and weather to build query
            colors_str = " ".join(preferences.get("favorite_colors", []))
            styles_str = " ".join(preferences.get("favorite_styles", []))
            
            query_parts = []
            if occasion:
                query_parts.append(occasion)
            if styles_str:
                query_parts.append(styles_str)
            if colors_str:
                query_parts.append(colors_str)
            if weather_condition:
                # Map weather condition to season tags to align text vectors
                weather_map = {"Hot": "Summer", "Rainy": "Rainy", "Winter": "Winter"}
                mapped_season = weather_map.get(weather_condition, "")
                if mapped_season:
                    query_parts.append(mapped_season)
                    
            query_text = " ".join(query_parts)
            if not query_text.strip():
                query_text = "Casual Shirt Jeans" # Fallback search
                
            query_vector = self.vectorizer.transform([query_text])

            # 5. Compute Content-Based Similarity
            cosine_scores = cosine_similarity(query_vector, tfidf_matrix).flatten()

            # 6. Apply Personalized Learning (Explicit Feedback Loops)
            interactions = self._fetch_user_interactions(conn, user_id)
            likes = set(interactions[interactions['feedback_type'] == 'like']['outfit_id'])
            dislikes = set(interactions[interactions['feedback_type'] == 'dislike']['outfit_id'])
            saves = set(interactions[interactions['feedback_type'] == 'save']['outfit_id'])
            
            # If user has liked items, we can build a User Profile Vector from liked outfits
            user_profile_vector = None
            if likes:
                liked_indices = df_outfits[df_outfits['id'].isin(likes)].index
                if len(liked_indices) > 0:
                    user_profile_vector = tfidf_matrix[liked_indices].mean(axis=0)
                    
            if user_profile_vector is not None:
                # Convert matrix back to array form
                user_profile_vector_arr = np.asarray(user_profile_vector)
                profile_scores = cosine_similarity(user_profile_vector_arr, tfidf_matrix).flatten()
                # Blend initial query similarity (70%) with historical preference similarity (30%)
                final_scores = (0.7 * cosine_scores) + (0.3 * profile_scores)
            else:
                final_scores = cosine_scores.copy()

            # 7. Apply Domain Heuristics & Filters (Gender, Budget, Weather, Trends)
            trends = self._fetch_active_trends(conn)
            
            scored_outfits = []
            for idx, row in df_outfits.iterrows():
                outfit_id = row['id']
                base_score = float(final_scores[idx])
                
                # A. Gender Filter: Strict filtering to avoid mismatching items
                # e.g., don't suggest specific gender outfits to opposite genders
                if user_gender != "Unisex" and row['gender'] != "Unisex" and row['gender'] != user_gender:
                    continue # Skip this outfit

                # B. Budget Filter: Penalty if outside budget range
                budget = row['budget']
                budget_min = preferences.get("budget_min", 0)
                budget_max = preferences.get("budget_max", 500)
                budget_multiplier = 1.0
                if budget > budget_max:
                    # Penalize outfits exceeding budget limit
                    excess = budget - budget_max
                    budget_multiplier = max(0.2, 1.0 - (excess / budget_max))
                elif budget < budget_min:
                    # Minor penalty if below budget range (often fine, but prioritize preferred range)
                    deficit = budget_min - budget
                    budget_multiplier = max(0.8, 1.0 - (deficit / budget_min * 0.2))

                # C. Weather-Aware Boost
                weather_multiplier = 1.0
                if weather_condition:
                    season_lower = row['season'].lower()
                    if weather_condition == "Hot" and (season_lower == "summer" or season_lower == "all-season"):
                        weather_multiplier = 1.35
                    elif weather_condition == "Winter" and (season_lower == "winter" or season_lower == "all-season"):
                        weather_multiplier = 1.35
                    elif weather_condition == "Rainy" and (season_lower == "rainy" or season_lower == "all-season"):
                        weather_multiplier = 1.35
                    else:
                        # Mismatched weather (e.g. Winter coat in Hot weather) gets penalized
                        weather_multiplier = 0.5

                # D. Trend Boosts
                trend_multiplier = 1.0
                for trend_type, trend_value, trend_score in trends:
                    # Match trends on style, color, category, or season
                    match = False
                    if trend_type == "style" and row['style'].lower() == trend_value.lower():
                        match = True
                    elif trend_type == "color" and row['color'].lower() == trend_value.lower():
                        match = True
                    elif trend_type == "category" and row['category'].lower() == trend_value.lower():
                        match = True
                    elif trend_type == "season" and row['season'].lower() == trend_value.lower():
                        match = True
                        
                    if match:
                        trend_multiplier *= float(trend_score)

                # E. Direct Feedback Penalties
                feedback_multiplier = 1.0
                if outfit_id in dislikes:
                    feedback_multiplier = 0.05 # Almost filter out completely
                elif outfit_id in likes:
                    feedback_multiplier = 1.25 # Boost liked items
                elif outfit_id in saves:
                    feedback_multiplier = 1.20 # Boost saved items

                # Calculate final recommendation score (confidence score)
                # Scale normal TF-IDF similarity (usually 0 to 1) with our multipliers
                confidence_score = base_score * budget_multiplier * weather_multiplier * trend_multiplier * feedback_multiplier
                # Ensure it remains a value between 0.0 and 1.0
                confidence_score = float(np.clip(confidence_score, 0.0, 1.0))
                
                # Round to 3 decimal places
                confidence_score = round(confidence_score, 3)

                # Build result dict
                outfit_data = dict(row)
                # Remove corpus string to save response bandwidth
                outfit_data.pop('corpus', None)
                outfit_data['confidence_score'] = confidence_score
                
                scored_outfits.append(outfit_data)

            # Sort by confidence score descending
            scored_outfits.sort(key=lambda x: x['confidence_score'], reverse=True)
            return scored_outfits[:limit]

        finally:
            conn.close()

    def generate_outfit_combination(self, user_id, occasion, weather, budget_pref, color_pref, style_pref):
        """
        Creates a custom synthetic outfit combination on demand for the flagship AI Outfit Generator feature.
        """
        conn = get_db_connection()
        try:
            # First, try to search the dataset for matching combinations
            results = self.recommend_outfits(
                user_id=user_id,
                preferences={
                    "favorite_colors": [color_pref] if color_pref else [],
                    "favorite_styles": [style_pref] if style_pref else [],
                    "budget_min": 0,
                    "budget_max": budget_pref if budget_pref else 300.0
                },
                occasion=occasion,
                weather_condition=weather,
                limit=3
            )
            
            # If we find a good match in system outfits, return it
            if results and results[0]['confidence_score'] > 0.4:
                return results[0]
                
            # If no good outfit exists in the database, programmatically compile a new outfit combination
            # Components based on occasion
            comp_templates = {
                "Interview": ["Dress Shirt", "Blazer", "Formal Trousers", "Oxford Shoes", "Leather Belt"],
                "Wedding": ["Sherwani / Kurta", "Churidar Pants", "Traditional Sandals", "Designer Stole"],
                "Casual Hangout": ["T-Shirt / Casual Shirt", "Jeans / Cargoes", "Sneakers"],
                "Business Meeting": ["Collared Shirt", "Formal Pants", "Loafers", "Leather Watch"],
                "Party": ["Leather Jacket / Party Dress", "Slim-fit Jeans / Heels", "Chelsea Boots / Clutch Bag"],
                "Sport": ["Active Hoodie / Dry-fit Tee", "Track Joggers / Shorts", "Running Shoes"]
            }
            
            style_explanations = {
                "Interview": "A sharp, contrast-balanced formal combination designed to project confidence and executive presence.",
                "Wedding": "A culturally rich traditional ensemble combining vibrant textures and comfortable footwear for long ceremonies.",
                "Casual Hangout": "Comfortable street-level styling utilizing relaxed fits and versatile colors for effortless hanging out.",
                "Business Meeting": "Smart casual presentation conveying approachability without sacrificing professional credibility.",
                "Party": "A bold fashion statement utilizing high contrast materials and accent footwear to stand out in crowds.",
                "Sport": "Breathable, performance-oriented athletic wear combining utility with modern active design."
            }

            color = color_pref or "Blue"
            style = style_pref or "Casual"
            oc = occasion or "Casual Hangout"
            components = comp_templates.get(oc, ["T-Shirt", "Jeans", "Sneakers"])
            
            # Inject color where appropriate
            filled_components = []
            for item in components:
                if "/" in item: # E.g., "Sherwani / Kurta"
                    chosen = item.split(" / ")[0]
                else:
                    chosen = item
                filled_components.append(f"{color} {chosen}" if "Shirt" in chosen or "Blazer" in chosen or "Jacket" in chosen or "Sherwani" in chosen or "Dress" in chosen else chosen)
                
            outfit_name = f"Custom {style} {oc} Combo"
            explanation = style_explanations.get(oc, "A personalized outfit combination tailored to your style, budget, and weather conditions.")
            
            custom_outfit = {
                "id": 9999, # Sentinel ID for dynamically generated
                "name": outfit_name,
                "category": f"{style} Combination",
                "style": style,
                "color": color,
                "occasion": oc,
                "gender": "Unisex",
                "budget": budget_pref or 120.0,
                "season": "Summer" if weather == "Hot" else ("Winter" if weather == "Winter" else "Rainy"),
                "image_url": f"/assets/outfits/placeholder_{oc.lower().replace(' ', '_')}.jpg",
                "components": ", ".join(filled_components),
                "style_explanation": explanation,
                "confidence_score": 0.85,
                "is_system": 0
            }
            
            return custom_outfit
            
        finally:
            conn.close()

    def generate_wardrobe_combination(self, user_id, occasion=None, weather_condition=None):
        """
        AI Module 5: Smart Wardrobe Outfit Builder.
        Combines the user's OWN wardrobe items to construct complete outfits.
        Returns outfits grouped by Category combination (Tops + Bottoms + Footwear (+ Accessories)).
        """
        conn = get_db_connection()
        try:
            # 1. Fetch user's wardrobe items
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM wardrobe WHERE user_id = ?", (user_id,))
            items = [dict(row) for row in cursor.fetchall()]
            
            if not items:
                return []
                
            # Categorize wardrobe items
            tops = [i for i in items if i['category'].lower() == 'tops']
            bottoms = [i for i in items if i['category'].lower() == 'bottoms']
            footwear = [i for i in items if i['category'].lower() == 'footwear']
            accessories = [i for i in items if i['category'].lower() == 'accessories']
            
            if not tops or not bottoms:
                return [] # Need at least Tops + Bottoms to build an outfit
                
            # 2. Build combinations
            combos = []
            for t in tops:
                for b in bottoms:
                    # Footwear is optional but highly recommended
                    fw_list = footwear if footwear else [{"color": "Neutral", "subcategory": "Shoes", "style": "Casual", "image_url": "/assets/placeholder_shoes.png"}]
                    for f in fw_list:
                        # Accessories are optional
                        acc_list = accessories if accessories else [None]
                        for a in acc_list:
                            # Calculate matching score between these wardrobe items
                            style_match = 1.0 if t['style'].lower() == b['style'].lower() else 0.5
                            if f.get('id') and f['style'].lower() != t['style'].lower():
                                style_match *= 0.7
                                
                            # Color matching heuristics (e.g. avoid double bright colors, black/white match anything)
                            color_match = 1.0
                            t_color = t['color'].lower()
                            b_color = b['color'].lower()
                            if t_color == b_color and t_color not in ['black', 'white']:
                                color_match = 0.6 # Wearing the exact same bright color top & bottom is usually a clash
                                
                            # Weather/Season match
                            season_match = 1.0
                            if weather_condition:
                                season_map = {"Hot": "summer", "Winter": "winter", "Rainy": "rainy"}
                                target_season = season_map.get(weather_condition)
                                if target_season:
                                    t_match = 1.0 if t['season'].lower() == target_season else 0.5
                                    b_match = 1.0 if b['season'].lower() == target_season else 0.5
                                    season_match = (t_match + b_match) / 2.0
                                    
                            matching_score = round(0.4 * style_match + 0.4 * color_match + 0.2 * season_match, 2)
                            
                            # Occasion Suitability
                            # Map clothing style to occasion
                            style_to_occ = {
                                "casual": ["Casual Hangout", "Sport"],
                                "formal": ["Interview", "Business Meeting"],
                                "streetwear": ["Casual Hangout", "Party"],
                                "traditional": ["Wedding", "Party"],
                                "party": ["Party"]
                            }
                            
                            t_style = t['style'].lower()
                            occ_suitability = "Medium"
                            if occasion:
                                if occasion in style_to_occ.get(t_style, []):
                                    occ_suitability = "High"
                                elif t_style == "formal" and occasion == "Wedding":
                                    occ_suitability = "Medium"
                                else:
                                    occ_suitability = "Low"
                                    
                            # Create outfit combination
                            components = [
                                f"{t['color']} {t['subcategory'] or 'Top'}",
                                f"{b['color']} {b['subcategory'] or 'Bottom'}"
                            ]
                            if f.get('id'):
                                components.append(f"{f['color']} {f['subcategory'] or 'Footwear'}")
                            if a:
                                components.append(f"{a['color']} {a['subcategory'] or 'Accessory'}")
                                
                            combos.append({
                                "matching_score": int(matching_score * 100),
                                "style_score": int(style_match * 100),
                                "occasion_suitability": occ_suitability,
                                "components": components,
                                "items": {
                                    "top": t,
                                    "bottom": b,
                                    "footwear": f if f.get('id') else None,
                                    "accessory": a
                                }
                            })
                            
            # Sort combinations by matching score descending
            combos.sort(key=lambda x: x['matching_score'], reverse=True)
            return combos[:5] # Return top 5 wardrobe combinations
            
        finally:
            conn.close()
