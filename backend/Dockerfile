FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOME=/home/user

# Tesseract OCR + gerekli sistem paketleri (EasyOCR/PyTorch YOK)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-tur \
    tesseract-ocr-eng \
    libglib2.0-0 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Non-root kullanıcı
RUN useradd -m -u 1000 user
WORKDIR /home/user/app
RUN chown -R user:user /home/user
USER user
ENV PATH="/home/user/.local/bin:${PATH}"

# Python bağımlılıkları (PyTorch olmadan çok daha hızlı)
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Kaynak kodu kopyala
COPY --chown=user:user . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
