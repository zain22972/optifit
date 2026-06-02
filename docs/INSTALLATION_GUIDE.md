# Installation Guide — OptiFit 2.0

Follow these steps to set up and run OptiFit 2.0 on your local Windows system.

---

## 📋 Prerequisites
- **Python 3.10+** (Ensure Python is added to your environment `PATH`)
- **Node.js v18+** and **npm**

---

## 🐍 Backend Configuration

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the Virtual Environment**:
   - In Powershell:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - In Command Prompt:
     ```cmd
     .venv\Scripts\activate.bat
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## 💾 Seeding Database & ML Training

Before starting the server, seed the SQLite database with user presets and outfits, and train the image classifier models.

1. **Seed 520 Curated Outfits**:
   From the repository root directory:
   ```bash
   python dataset/generate_dataset.py
   ```
   This generates the CSV dataset and seeds `database/optifit.db`.

2. **Train Computer Vision Classifiers**:
   ```bash
   python ml/train.py
   ```
   This generates the Random Forest pickle binaries at `models/clothing_classifier.pkl` for category, style, and season prediction.

---

## 💻 Frontend Configuration

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Packages**:
   ```bash
   npm install
   ```

---

## ⚡ Launching the Application

For full end-to-end functionality, both backend and frontend servers must run simultaneously.

### 1. Launch Flask Server (Port 5000)
From the `backend` directory (with virtual environment active):
```bash
python app.py
```
*Note*: Verify the server is running by navigating to `http://localhost:5000/health` in your browser. You should see `{"status": "healthy"}`.

### 2. Launch Vite Client (Port 5173)
From the `frontend` directory:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Integration Tests

To run the verification test suites:

- **Backend Integration Tests**:
  Run from backend directory:
  ```bash
  python -m unittest test_backend.py
  ```

- **Frontend Structural Tests**:
  Run from frontend directory:
  ```bash
  node test_frontend.js
  ```
