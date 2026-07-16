import os
import sys
import uvicorn

if __name__ == '__main__':
    print("🚀 GlutenGuard AI FastAPI Backend Engine Başlatılıyor...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
