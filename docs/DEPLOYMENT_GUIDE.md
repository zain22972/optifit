# Deployment Guide — OptiFit 2.0

OptiFit 2.0 is fully containerization-ready and can be deployed to cloud platforms using Docker containers.

---

## 🐋 Containerizing with Docker

### 1. Backend Dockerfile
Create a `Dockerfile` inside the `backend/` directory:
```dockerfile
# Use official lightweight Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for OpenCV / Pillow
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and dataset/database files for seeding
COPY . .

# Expose backend port
EXPOSE 5000

# Start Flask Application
CMD ["python", "app.py"]
```

### 2. Frontend Dockerfile
Create a `Dockerfile` inside the `frontend/` directory to build and serve the React application:
```dockerfile
# Step 1: Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Serve Stage
FROM nginx:alpine

# Copy built files to Nginx public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create the accompanying `nginx.conf` in the `frontend/` directory:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 🚀 Deploying to Google Cloud Run

To deploy the backend to Google Cloud Run:

1. **Submit Container to Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/<PROJECT_ID>/optifit-backend backend/
   ```

2. **Deploy Container to Cloud Run**:
   ```bash
   gcloud run deploy optifit-backend \
     --image gcr.io/<PROJECT_ID>/optifit-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 5000
   ```
   *Note*: Copy the resulting service URL and update the `API_BASE_URL` in `frontend/src/services/api.js` before building the frontend.
