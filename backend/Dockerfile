# Hugging Face Spaces Compatible Dockerfile
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860 \
    HOME=/home/user

# Install system dependencies required for OpenCV, EasyOCR, and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    ffmpeg \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user required by Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Ensure correct permissions
RUN chown -R user:user /home/user

# Switch to non-root user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

# Install PyTorch CPU version first to minimize image size and compile speed
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install dependencies
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY --chown=user:user . .

# Expose Hugging Face mandatory port 7860
EXPOSE 7860

# Run uvicorn server on port 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
