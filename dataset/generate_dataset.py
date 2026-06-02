# OptiFit 2.0 Dataset Generator and DB Seeder
import os
import csv
import random
import sqlite3
import hashlib

# Configuration
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'optifit.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'schema.sql')
CSV_PATH = os.path.join(os.path.dirname(__file__), 'outfits_dataset.csv')

# Seed for reproducibility
random.seed(42)

# Outfit parameters for dataset generation
GENDERS = ["Men", "Women", "Unisex"]
COLORS = ["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"]
SEASONS = ["Summer", "Winter", "Rainy"]
STYLES = ["Casual", "Formal", "Party", "Traditional", "Streetwear", "Smart Casual", "Business Casual"]
OCCASIONS = ["Interview", "Wedding", "Casual Hangout", "Business Meeting", "Party", "Sport"]

# Templates for different styles and occasions
OUTFIT_TEMPLATES = [
    # Casual Outfits
    {
        "style": "Casual",
        "occasions": ["Casual Hangout", "Sport"],
        "seasons": ["Summer", "Rainy", "Winter"],
        "combinations": [
            {"category": "Casual Wear", "name_fmt": "{color} T-Shirt and Denim Jeans", "components": ["{color} T-Shirt", "Blue Jeans", "White Sneakers"], "explanation": "A classic everyday relaxed look perfect for casual outings."},
            {"category": "Casual Wear", "name_fmt": "Comfy {color} Hoodie and Joggers", "components": ["{color} Hoodie", "Grey Joggers", "Running Shoes"], "explanation": "Comfort-first outfit designed for running errands or lounging."},
            {"category": "Casual Wear", "name_fmt": "Lightweight {color} Shorts and Tee", "components": ["White T-Shirt", "{color} Cotton Shorts", "Sandals"], "explanation": "Perfect breathable outfit for hot summer days."},
            {"category": "Casual Wear", "name_fmt": "Denim Jacket with {color} Shirt", "components": ["Blue Denim Jacket", "{color} Cotton T-Shirt", "Black Jeans", "Sneakers"], "explanation": "Layered denim style that provides casual warmth."}
        ]
    },
    # Formal / Business Outfits
    {
        "style": "Formal",
        "occasions": ["Interview", "Business Meeting"],
        "seasons": ["Winter", "Summer", "Rainy"],
        "combinations": [
            {"category": "Business Formal", "name_fmt": "Tailored {color} Suit Ensemble", "components": ["{color} Blazer", "Matching {color} Trousers", "White Dress Shirt", "Black Oxford Shoes", "Silk Tie"], "explanation": "A sharp, corporate-ready suit combination to exude professionalism."},
            {"category": "Business Casual", "name_fmt": "Chic {color} Blazer and Chinos", "components": ["{color} Blazer", "Beige Chinos", "Light Blue Shirt", "Brown Loafers"], "explanation": "Smart business casual appearance combining structure with daily comfort."},
            {"category": "Business Casual", "name_fmt": "{color} Dress Shirt with Trousers", "components": ["{color} Long-Sleeve Shirt", "Dark Grey Dress Pants", "Leather Belt", "Derby Shoes"], "explanation": "Clean and understated look suitable for modern office environments."}
        ]
    },
    # Smart Casual
    {
        "style": "Smart Casual",
        "occasions": ["Casual Hangout", "Business Meeting", "Party"],
        "seasons": ["Summer", "Winter", "Rainy"],
        "combinations": [
            {"category": "Smart Casual", "name_fmt": "Casual Blazer and White Tee", "components": ["{color} Casual Blazer", "White T-Shirt", "Slim-fit Dark Jeans", "Loafers"], "explanation": "Effortlessly blending casual and formal elements for a modern silhouette."},
            {"category": "Smart Casual", "name_fmt": "{color} Polo and Khaki Pants", "components": ["{color} Polo Shirt", "Khaki Pants", "Leather Watch", "Minimalist White Shoes"], "explanation": "Preppy yet functional styling ideal for weekend social events."}
        ]
    },
    # Party Wear
    {
        "style": "Party",
        "occasions": ["Party"],
        "seasons": ["Summer", "Winter", "Rainy"],
        "combinations": [
            {"category": "Party Wear", "name_fmt": "Sleek {color} Nightout Outfit", "components": ["{color} Leather Jacket", "Black Fitted Tee", "Ripped Black Jeans", "Chelsea Boots"], "explanation": "Edgy and eye-catching ensemble optimized for evening events and parties."},
            {"category": "Party Wear", "name_fmt": "Glamorous {color} Party Dress", "components": ["{color} Cocktail Dress", "Strappy Heels", "Clutch Bag", "Statement Earrings"], "explanation": "Sophisticated evening wear designed to stand out under the lights."},
            {"category": "Party Wear", "name_fmt": "Vibrant {color} Velvet Blazer", "components": ["{color} Velvet Blazer", "Black Dress Shirt", "Black Dress Pants", "Patent Leather Shoes"], "explanation": "Luxurious party styling displaying rich textures and modern cuts."}
        ]
    },
    # Traditional
    {
        "style": "Traditional",
        "occasions": ["Wedding", "Party"],
        "seasons": ["Summer", "Winter", "Rainy"],
        "combinations": [
            {"category": "Traditional Wear", "name_fmt": "Elegant {color} Kurta Pyjama", "components": ["{color} Embroidered Kurta", "White Pajama Pants", "Traditional Mojari Shoes", "Nehru Jacket"], "explanation": "Classic festive wear showcasing rich craftsmanship and cultural heritage."},
            {"category": "Traditional Wear", "name_fmt": "Royal {color} Sherwani Ensemble", "components": ["{color} Silk Sherwani", "Churidar Pants", "Designer Stole", "Traditional Juttis"], "explanation": "An exquisite formal option for weddings and high ceremonies."},
            {"category": "Traditional Wear", "name_fmt": "Designer {color} Anarkali Suit", "components": ["{color} Anarkali Gown", "Matching Dupatta", "Traditional Jhumkas", "Golden Sandals"], "explanation": "Flowing traditional silhouette creating a grace-filled traditional appeal."}
        ]
    },
    # Streetwear
    {
        "style": "Streetwear",
        "occasions": ["Casual Hangout", "Party"],
        "seasons": ["Summer", "Winter", "Rainy"],
        "combinations": [
            {"category": "Streetwear", "name_fmt": "Oversized {color} Tee and Cargoes", "components": ["Oversized {color} Graphic Tee", "Black Cargo Pants", "Chunky Sneakers", "Bucket Hat"], "explanation": "Urban street style leaning heavily on baggy fits and utility details."},
            {"category": "Streetwear", "name_fmt": "Streetwear {color} Windbreaker Outfit", "components": ["{color} Windbreaker Jacket", "Track Pants", "High-top Sneakers", "Crossbody Bag"], "explanation": "Athletic-inspired streetwear designed for active urban exploration."}
        ]
    }
]

def generate_outfits(count=520):
    outfits = []
    # Ensure all combinations are sampled at least once, then generate remainder randomly
    id_counter = 1
    
    # Generate structured random combinations
    while len(outfits) < count:
        template = random.choice(OUTFIT_TEMPLATES)
        comb = random.choice(template["combinations"])
        color = random.choice(COLORS)
        gender = random.choice(GENDERS)
        season = random.choice(template["seasons"])
        occasion = random.choice(template["occasions"])
        
        # Adjust gender specific choices
        name_fmt = comb["name_fmt"]
        components = [c.format(color=color) for c in comb["components"]]
        explanation = comb["explanation"]
        
        # Gender filters for some categories
        if gender == "Men" and "Anarkali" in name_fmt:
            continue
        if gender == "Men" and "Cocktail Dress" in name_fmt:
            continue
        if gender == "Women" and "Sherwani" in name_fmt:
            continue
            
        name = name_fmt.format(color=color)
        
        # Budget ranges depending on category
        if "Suit" in name or "Sherwani" in name:
            budget = round(random.uniform(150.0, 500.0), 2)
        elif "Blazer" in name or "Jacket" in name or "Dress" in name:
            budget = round(random.uniform(70.0, 180.0), 2)
        else:
            budget = round(random.uniform(20.0, 80.0), 2)
            
        # Realistic local image URLs or placehold values
        # We will use assets/placeholder_images or standard local file paths
        img_name = f"{template['style'].lower()}_{color.lower()}_{id_counter}.jpg"
        image_url = f"/assets/outfits/{img_name}"
        
        outfit = {
            "id": id_counter,
            "name": name,
            "category": comb["category"],
            "style": template["style"],
            "color": color,
            "occasion": occasion,
            "gender": gender,
            "budget": budget,
            "season": season,
            "image_url": image_url,
            "components": ", ".join(components),
            "style_explanation": explanation,
            "is_system": 1
        }
        outfits.append(outfit)
        id_counter += 1
        
    return outfits

def create_db_and_seed(outfits):
    print("Initializing SQLite Database...")
    db_dir = os.path.dirname(DB_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Read and execute schema
    with open(SCHEMA_PATH, 'r') as schema_file:
        schema_sql = schema_file.read()
        cursor.executescript(schema_sql)
        
    # Seed default Admin User
    # Password: adminpassword123
    # PBKDF2 hash of password (compatible with werkzeug.security generate_password_hash)
    # To keep it simple, we'll hash it. In Flask, werkzeug uses pbkdf2:sha256 by default.
    # We can write a compatible hash format here.
    # Format: pbkdf2:sha256:600000$salt$hash
    # But since Flask is installed, we can import it. Let's do a try/except so standard script runs.
    try:
        from werkzeug.security import generate_password_hash
        admin_pass_hash = generate_password_hash("admin123")
        user_pass_hash = generate_password_hash("user123")
    except ImportError:
        # Fallback simple hash (though Flask should have it, it's safer to have fallback)
        salt = "optifit_salt_42"
        h = hashlib.sha256((salt + "admin123").encode('utf-8')).hexdigest()
        admin_pass_hash = f"sha256${salt}${h}"
        h2 = hashlib.sha256((salt + "user123").encode('utf-8')).hexdigest()
        user_pass_hash = f"sha256${salt}${h2}"

    # Insert default users
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, name, email, password_hash, role, age, gender) 
        VALUES (1, 'System Admin', 'admin@optifit.com', ?, 'admin', 30, 'Unisex')
    """, (admin_pass_hash,))
    
    cursor.execute("""
        INSERT OR IGNORE INTO users (id, name, email, password_hash, role, age, gender) 
        VALUES (2, 'Jane Doe', 'jane@optifit.com', ?, 'user', 26, 'Women')
    """, (user_pass_hash,))

    # Insert user preferences for Jane Doe
    cursor.execute("""
        INSERT OR IGNORE INTO user_preferences (user_id, favorite_colors, favorite_styles, preferred_fit, budget_min, budget_max)
        VALUES (2, 'Black,White,Blue', 'Casual,Streetwear,Smart Casual', 'Regular', 30.0, 200.0)
    """)

    # Seed Trends Table
    trends_seed = [
        ("Oversized Fashion", "style", "Streetwear", 1.25),
        ("Smart Casual Blazers", "category", "Smart Casual", 1.15),
        ("Minimalist Monochrome", "color", "Black", 1.20),
        ("Classic White Style", "color", "White", 1.10),
        ("Rainy Season Outerwear", "season", "Rainy", 1.30),
        ("Emerald Green Partywear", "color", "Green", 1.15)
    ]
    for name, trend_type, value, score in trends_seed:
        cursor.execute("""
            INSERT INTO trends (name, type, value, score, is_active, updated_by)
            VALUES (?, ?, ?, ?, 1, 1)
        """, (name, trend_type, value, score))

    # Seed Outfits
    print(f"Seeding {len(outfits)} outfits into database...")
    for outfit in outfits:
        cursor.execute("""
            INSERT INTO outfits (id, name, category, style, color, occasion, gender, budget, season, image_url, components, style_explanation, is_system)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            outfit["id"], outfit["name"], outfit["category"], outfit["style"],
            outfit["color"], outfit["occasion"], outfit["gender"], outfit["budget"],
            outfit["season"], outfit["image_url"], outfit["components"],
            outfit["style_explanation"], outfit["is_system"]
        ))
        
    conn.commit()
    conn.close()
    print("Database seeding completed successfully.")

def write_to_csv(outfits):
    print(f"Writing {len(outfits)} outfits to CSV at {CSV_PATH}...")
    dataset_dir = os.path.dirname(CSV_PATH)
    if not os.path.exists(dataset_dir):
        os.makedirs(dataset_dir)
        
    fields = ["Outfit ID", "Name", "Category", "Style", "Color", "Occasion", "Gender", "Budget", "Season", "Image URL", "Components", "Style Explanation"]
    with open(CSV_PATH, mode='w', newline='', encoding='utf-8') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fields)
        writer.writeheader()
        for o in outfits:
            writer.writerow({
                "Outfit ID": o["id"],
                "Name": o["name"],
                "Category": o["category"],
                "Style": o["style"],
                "Color": o["color"],
                "Occasion": o["occasion"],
                "Gender": o["gender"],
                "Budget": o["budget"],
                "Season": o["season"],
                "Image URL": o["image_url"],
                "Components": o["components"],
                "Style Explanation": o["style_explanation"]
            })
    print("CSV dataset generation completed successfully.")

if __name__ == "__main__":
    generated = generate_outfits(520)
    write_to_csv(generated)
    create_db_and_seed(generated)
