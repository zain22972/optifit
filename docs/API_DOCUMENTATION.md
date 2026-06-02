# API Documentation — OptiFit 2.0

The OptiFit 2.0 backend is built on a Flask REST API running on port `5000`. Authentication uses JWT Tokens passed in the request header: `Authorization: Bearer <token>`.

---

## 🔑 Authentication Endpoints

### 1. Register User
- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@optifit.com",
    "password": "user123",
    "age": 26,
    "gender": "Women"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@optifit.com",
      "role": "user",
      "age": 26,
      "gender": "Women"
    }
  }
  ```

### 2. Login User
- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "jane@optifit.com",
    "password": "user123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@optifit.com",
      "role": "user",
      "age": 26,
      "gender": "Women"
    }
  }
  ```

---

## 👤 Profile & Preference Endpoints (Protected)

### 1. Get Profile Details
- **URL**: `/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 2,
      "name": "Jane Doe",
      "email": "jane@optifit.com",
      "role": "user",
      "age": 26,
      "gender": "Women"
    },
    "preferences": {
      "favorite_colors": ["Black", "White", "Blue"],
      "favorite_styles": ["Casual", "Streetwear"],
      "preferred_fit": "Regular",
      "budget_min": 30.0,
      "budget_max": 200.0
    }
  }
  ```

### 2. Update Profile & Preferences
- **URL**: `/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Jane Smith",
    "age": 27,
    "gender": "Women",
    "favorite_colors": ["Black", "Blue", "Green"],
    "favorite_styles": ["Casual", "Smart Casual"],
    "preferred_fit": "Slim",
    "budget_min": 50.0,
    "budget_max": 250.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Profile and preferences updated successfully."
  }
  ```

---

## 👕 Wardrobe Endpoints (Protected)

### 1. Upload Clothing (CV Analysis)
- **URL**: `/upload-clothing`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Payload**: Form-data containing key `image` (JPEG/PNG/WEBP file).
- **Response (201 Created)**:
  ```json
  {
    "message": "Clothing uploaded and CV analyzed successfully.",
    "item": {
      "id": 15,
      "user_id": 2,
      "image_url": "/uploads/3f684cfda...",
      "category": "Tops",
      "subcategory": "Shirt",
      "color": "Blue",
      "style": "Formal",
      "season": "Summer"
    }
  }
  ```

### 2. Get Wardrobe Items
- **URL**: `/wardrobe`
- **Method**: `GET`
- **Query Parameters (Optional)**: `category`, `color`, `style`, `season`, `search`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 15,
      "user_id": 2,
      "image_url": "/uploads/3f684cfda...",
      "category": "Tops",
      "subcategory": "Shirt",
      "color": "Blue",
      "style": "Formal",
      "season": "Summer",
      "created_at": "2026-06-02 23:22:15"
    }
  ]
  ```

### 3. Update Wardrobe Item
- **URL**: `/wardrobe/<int:item_id>`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "subcategory": "Casual Shirt",
    "color": "Blue",
    "style": "Casual",
    "season": "Summer"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Wardrobe item updated successfully."
  }
  ```

### 4. Delete Wardrobe Item
- **URL**: `/wardrobe/<int:item_id>`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Wardrobe item deleted successfully."
  }
  ```

---

## 🔮 Recommendations Endpoints (Protected)

### 1. Get Recommendations
- **URL**: `/recommendations`
- **Method**: `GET`
- **Query Parameters**: `weather` (e.g. Hot, Rainy, Winter), `occasion`, `limit`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 12,
      "name": "Classic White Tee and Blue Jeans",
      "category": "Casual Wear",
      "style": "Casual",
      "color": "White",
      "occasion": "Casual Hangout",
      "gender": "Unisex",
      "budget": 45.0,
      "season": "Summer",
      "image_url": "/assets/outfits/casual_white_12.jpg",
      "components": "White T-Shirt, Blue Jeans, White Sneakers",
      "style_explanation": "A classic everyday relaxed look.",
      "confidence_score": 0.95
    }
  ]
  ```

### 2. Generate Custom Combination
- **URL**: `/generate-outfit`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "occasion": "Interview",
    "weather": "Winter",
    "budget": 200.0,
    "color": "Blue",
    "style": "Formal"
  }
  ```
- **Response (200 OK)**: Returns a complete synthetic outfit JSON object matching specifications.

### 3. Build Outfits from Personal Wardrobe
- **URL**: `/wardrobe-outfits`
- **Method**: `GET`
- **Query Parameters**: `occasion`, `weather`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Returns top 5 matched clothing combinations created from items in the user's wardrobe.

---

## 🛡️ Admin Endpoints (Admins Only)

### 1. Platform Analytics
- **URL**: `/admin/analytics`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "total_users": 5,
    "total_outfits": 520,
    "total_uploads": 14,
    "popular_styles": [{"style": "Casual", "count": 8}],
    "popular_colors": [{"color": "Black", "count": 6}],
    "most_saved_outfits": [{"name": "Summer Shorts Look", "saves": 3}],
    "recommendation_accuracy": 88.5
  }
  ```

### 2. Retrain Classifier
- **URL**: `/admin/retrain-models`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Model retrained using 14 custom user garment images."
  }
  ```
