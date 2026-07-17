FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOME=/home/user

# Tesseract OCR + required system packages
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

# Copy source code
COPY --chown=user:user backend/ ./backend/

# Expose backend port
EXPOSE 8000

# Set working directory to backend folder so uvicorn runs main:app with local imports (database, models)
WORKDIR /home/user/app/backend

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
