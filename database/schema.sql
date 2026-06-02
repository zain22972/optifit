-- OptiFit 2.0 SQLite Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    age INTEGER,
    gender TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    favorite_colors TEXT, -- Comma-separated list (e.g., "Black,Blue,White")
    favorite_styles TEXT, -- Comma-separated list (e.g., "Casual,Streetwear")
    preferred_fit TEXT, -- (e.g., "Slim,Regular,Oversized")
    budget_min REAL NOT NULL DEFAULT 0.0,
    budget_max REAL NOT NULL DEFAULT 1000.0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Wardrobe Table (Virtual Wardrobe for individual items)
CREATE TABLE IF NOT EXISTS wardrobe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL, -- "Tops", "Bottoms", "Footwear", "Accessories"
    subcategory TEXT, -- "Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"
    color TEXT NOT NULL, -- "Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"
    style TEXT NOT NULL, -- "Casual", "Formal", "Party", "Traditional", "Streetwear"
    season TEXT NOT NULL, -- "Summer", "Winter", "Rainy"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Outfits Dataset Table (500+ curated system outfits and user combinations)
CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., "Casual Wear", "Business Formal", "Traditional Wedding"
    style TEXT NOT NULL, -- "Casual", "Formal", "Party", "Traditional", "Streetwear", "Smart Casual", "Business Casual"
    color TEXT NOT NULL, -- Dominant color
    occasion TEXT NOT NULL, -- "Interview", "Wedding", "Casual Hangout", "Business Meeting", "Party", "Sport"
    gender TEXT NOT NULL, -- "Men", "Women", "Unisex"
    budget REAL NOT NULL,
    season TEXT NOT NULL, -- "Summer", "Winter", "Rainy", "All-Season"
    image_url TEXT NOT NULL,
    components TEXT NOT NULL, -- Comma-separated or JSON list of items, e.g. "White Shirt, Navy Blazer, Formal Pants, Oxford Shoes"
    style_explanation TEXT, -- AI-style rationale
    is_system INTEGER DEFAULT 1, -- 1 for system dataset, 0 for user custom generated outfits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations Log Table
CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    outfit_id INTEGER NOT NULL,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score REAL NOT NULL,
    feedback_type TEXT DEFAULT NULL, -- 'like', 'dislike', or NULL
    weather_condition TEXT NOT NULL, -- Weather when recommended
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
);

-- Feedback Table (Interaction history for personalization learning)
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    outfit_id INTEGER NOT NULL,
    feedback_type TEXT NOT NULL, -- 'like', 'dislike', 'save', 'view'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(outfit_id) REFERENCES outfits(id) ON DELETE CASCADE
);

-- Saved Outfits Table
CREATE TABLE IF NOT EXISTS saved_outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    outfit_id INTEGER NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
    UNIQUE(user_id, outfit_id)
);

-- Trends Table
CREATE TABLE IF NOT EXISTS trends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL, -- e.g., "Oversized Fashion", "Emerald Green"
    type TEXT NOT NULL, -- "color", "style", "category", "season"
    value TEXT NOT NULL, -- e.g., "Streetwear", "Green", "Hoodie"
    score REAL NOT NULL DEFAULT 1.0, -- Multiplier/Boost factor (e.g. 1.2 for 20% boost)
    is_active INTEGER DEFAULT 1,
    updated_by INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(updated_by) REFERENCES users(id)
);

-- Weather History Table
CREATE TABLE IF NOT EXISTS weather_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    location TEXT NOT NULL,
    temperature REAL NOT NULL,
    condition TEXT NOT NULL, -- "Hot", "Rainy", "Winter"
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
