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
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy necessary directories
COPY backend/ ./backend/
COPY ml/ ./ml/
COPY models/ ./models/
COPY database/ ./database/
COPY assets/ ./assets/
COPY uploads/ ./uploads/

# Expose backend port
EXPOSE 5000

# Start Flask Application
CMD ["python", "backend/app.py"]
