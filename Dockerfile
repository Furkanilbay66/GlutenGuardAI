# Stage 1: Build React/Vite frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve Python FastAPI backend and mount static files
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOME=/home/user

# Install Tesseract OCR + required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-tur \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m -u 1000 user
WORKDIR /home/user/app
RUN chown -R user:user /home/user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

# Install Python requirements
COPY --chown=user:user backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY --chown=user:user backend/ ./backend/

# Copy compiled React static files from frontend-builder stage
COPY --from=frontend-builder --chown=user:user /app/dist/ ./dist/

# Expose backend port
EXPOSE 8000

# Set working directory to backend folder so uvicorn runs main:app with local imports (database, models)
WORKDIR /home/user/app/backend

# Use shell form of CMD to expand the dynamic $PORT environment variable injected by Railway
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
