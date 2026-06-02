# Architecture and Entity Relationship Diagram — OptiFit 2.0

OptiFit 2.0 uses a modern micro-services design patterns consisting of a client dashboard (React), a prediction server (Flask REST API), and a content classifier pipeline.

---

## 🏛️ System Architecture Diagram

```mermaid
graph TD
    User([User Client Browser])
    React[React JS SPA]
    Flask[Flask REST Server]
    SQLite[(SQLite Database)]
    CV[CV Analyzer]
    Recs[AI Recommender Engine]
    RF[Random Forest Pickles]

    User <-->|HTTP/JSON| React
    React <-->|API Calls| Flask
    Flask <-->|Queries| SQLite
    
    Flask -->|Image File| CV
    CV -->|Features & Classifier| RF
    CV -->|Inferred Tags| Flask
    
    Flask -->|Recommendations Req| Recs
    Recs -->|Outfits / Feedback / Trends| SQLite
    Recs -->|Re-ranked Recommendations| Flask
```

---

## 💾 Entity Relationship (ER) Diagram

```mermaid
erDiagram
    users ||--o| user_preferences : "defines"
    users ||--o{ wardrobe : "owns"
    users ||--o{ feedback : "submits"
    users ||--o{ saved_outfits : "bookmarks"
    users ||--o{ recommendations : "receives"
    users ||--o{ weather_history : "logs"

    outfits ||--o{ feedback : "interacts"
    outfits ||--o{ saved_outfits : "references"
    outfits ||--o{ recommendations : "logged"

    users {
        int id PK
        string name
        string email
        string password_hash
        string role
        int age
        string gender
        timestamp created_at
    }

    user_preferences {
        int user_id PK, FK
        string favorite_colors
        string favorite_styles
        string preferred_fit
        real budget_min
        real budget_max
        timestamp updated_at
    }

    wardrobe {
        int id PK
        int user_id FK
        string image_url
        string category
        string subcategory
        string color
        string style
        string season
        timestamp created_at
    }

    outfits {
        int id PK
        string name
        string category
        string style
        string color
        string occasion
        string gender
        real budget
        string season
        string image_url
        string components
        string style_explanation
        int is_system
        timestamp created_at
    }

    recommendations {
        int id PK
        int user_id FK
        int outfit_id FK
        timestamp recommended_at
        real score
        string feedback_type
        string weather_condition
    }

    feedback {
        int id PK
        int user_id FK
        int outfit_id FK
        string feedback_type
        timestamp created_at
    }

    saved_outfits {
        int id PK
        int user_id FK
        int outfit_id FK
        timestamp saved_at
    }

    trends {
        int id PK
        string name
        string type
        string value
        real score
        int is_active
        int updated_by FK
        timestamp updated_at
    }

    weather_history {
        int id PK
        int user_id FK
        string location
        real temperature
        string condition
        timestamp recorded_at
    }
```
