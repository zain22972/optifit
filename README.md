# OptiFit 2.0 – Complete AI-Powered Fashion Assistant Platform

OptiFit 2.0 is a premium, production-ready full-stack AI fashion platform designed to answer the daily question: **"What should I wear today?"**

It utilizes Computer Vision (CV), Machine Learning (ML), weather intelligence, and personalized learning algorithms to digitize users' physical wardrobes and recommend styled outfits from a database of 500+ curated combinations.

---

## 🌟 Core Features

- **Virtual Wardrobe Manager**: Upload and digitize physical clothes. Uses custom visual classifiers to extract color, category, style, and season parameters automatically.
- **Smart Outfit Recommendation Engine**: Implements TF-IDF vectorization and Cosine Similarity to compare user preferences against 500+ outfit profiles.
- **AI Outfit Synthesizer**: Programmatically compiles new combinations based on budget, style accents, and occasions.
- **Weather-Aware Reranking**: Dynamically re-scores recommendations in real-time based on local weather constraints (Hot, Rainy, Winter).
- **Fashion Trend Intelligence**: Integrates administrative boost factors to promote trendy styles and colors.
- **Personalized Feedback Loop**: Tracks likes, dislikes, and saves to continuously calibrate recommendation similarity profiles.
- **Telemetry & Admin Dashboard**: Offers user CRUD, outfit seeding, trend management, and interactive charts for platform usage.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Vite, React Router v6)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (micro-interactions and glassmorphic card transitions)
- **Data Visualization**: Recharts

### Backend
- **Framework**: Python Flask (Flask REST API)
- **Database**: SQLite3 (relational schema with foreign keys)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing

### Machine Learning & Computer Vision
- **CV Classifier**: OpenCV-python & Pillow (RGB feature histograms, Sobel edge densities, variance analysis)
- **ML Core**: Scikit-Learn (Random Forest Classifiers), NumPy, and Pandas

---

## 📁 Repository Structure

```text
COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM/
├── backend/            # Python Flask server & endpoint blueprints
│   ├── api/            # API Route logic (auth, profile, wardrobe, recs, admin)
│   ├── database/       # SQLite db connection utilities
│   ├── app.py          # Flask entry point
│   ├── requirements.txt
│   └── test_backend.py # Integration test suite
├── database/           # Schema design and seeded DB (optifit.db)
├── dataset/            # CSV dataset & generator seeder
├── docs/               # Advanced documentation markdown files
├── frontend/           # React dashboard UI
│   ├── src/            # Components, contexts, and views
│   ├── test_frontend.js# Static structural tests
│   └── tailwind.config.js
├── ml/                 # Model training and prediction pipelines
└── models/             # Serialized PKL model binaries
```

---

## 🚀 Setup & Launch

Detailed step-by-step instructions are available in the guides below:

1. [Installation Guide](file:///c:/Zubeen%20Project/COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM/docs/INSTALLATION_GUIDE.md) — Local SQLite, Python environment, and React setup.
2. [API Documentation](file:///c:/Zubeen%20Project/COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM/docs/API_DOCUMENTATION.md) — API route reference and token parameters.
3. [Architecture and ER Diagram](file:///c:/Zubeen%20Project/COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM/docs/ARCHITECTURE_AND_ER.md) — Database model relationships and system workflow.
4. [Deployment Guide](file:///c:/Zubeen%20Project/COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM/docs/DEPLOYMENT_GUIDE.md) — Docker container builds.
# COMPLETE-AI-POWERED-FASHION-ASSISTANT-PLATFORM
