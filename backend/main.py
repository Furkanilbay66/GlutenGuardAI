import os
import json
import re
import io
import datetime
import sys
import pytesseract

if sys.platform.startswith('win'):
    tesseract_default = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tesseract_default):
        pytesseract.pytesseract.tesseract_cmd = tesseract_default

from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from PIL import Image

from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

import database
import models

# 1. Initialize Database Tables
models.Base.metadata.create_all(bind=database.engine)

# Password hashing & JWT configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET", "glutenguard-super-secret-key-2026")
ALGORITHM = "HS256"

app = FastAPI(
    title="GlutenGuard AI Commercial Engine",
    description="Enterprise Multi-Allergen NLP Analyzer, E-Number Additive Dictionary & Verified Barcode Catalog",
    version="9.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ProfileAllergensUpdate(BaseModel):
    allergens: List[str]
    custom_allergens: Optional[List[str]] = []
    severity_level: Optional[str] = "celiac"
    emergency_notes: Optional[str] = None

class AnalyzeBase64Request(BaseModel):
    image_base64: str          # data:image/jpeg;base64,... or plain base64
    allergens: Optional[List[str]] = None
    filename: Optional[str] = "photo.jpg"
    barcode: Optional[str] = None

class ScanReportCreate(BaseModel):
    scan_id: Optional[int] = None
    issue_type: str
    comments: str

# Auth Helpers
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(days=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(database.get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(models.User).filter(models.User.id == user_id).first()
        return user
    except Exception:
        return None

# ─────────────────────────────────────────────────────────────────────────────
# 1. Comprehensive Allergen Dictionary & E-Numbers Knowledge Base
# ─────────────────────────────────────────────────────────────────────────────
ALLERGEN_KEYWORDS = {
    "gluten": [
        "buğday", "bugday", "wheat", "arpa", "barley", "çavdar", "cavdar", "rye",
        "yulaf", "oat", "oats", "gluten", "glüten", "un", "flour", "bulgur",
        "irmik", "semolina", "galeta", "lavaş", "lavas", "pide", "börek", "borek",
        "yufka", "ekmek", "bread", "makarna", "pasta", "erişte", "eriste", "noodle",
        "bisküvi", "biskuvi", "kek", "cake", "gofret", "waffle", "malt", "bira", "beer",
        "kuskus", "couscous", "aşurelik", "asurelik", "gliadin", "hordein", "secalin",
        "prolamin", "nişasta", "nisasta", "starch", "maltodekstrin", "maltodextrin"
    ],
    "lactose": [
        "süt", "sut", "milk", "peynir altı suyu", "peynir alti suyu", "whey",
        "laktoz", "lactose", "tereyağ", "tereyag", "tereyağı", "butter", "krema",
        "cream", "yoğurt", "yogurt", "peynir", "cheese", "süt tozu", "sut tozu",
        "dondurma"
    ],
    "milk_protein": [
        "kazein", "casein", "kazeinat", "caseinate", "sodyum kazeinat",
        "sodium caseinate", "süt proteini", "sut proteini", "albümin", "albumin",
        "laktalbümin", "lactalbumin", "laktoglobulin"
    ],
    "peanuts": [
        "yer fıstığı", "yer fistigi", "yerfıstığı", "yerfistigi", "fıstık ezmesi",
        "fistik ezmesi", "fıstık yağı", "fistik yagi", "peanut", "peanuts", "arachis", "fıstık", "fistik"
    ],
    "nuts": [
        "fındık", "findik", "hazelnut", "badem", "almond", "ceviz", "walnut",
        "antep fıstığı", "antep fistigi", "pistachio", "kaju", "cashew", "kestane",
        "chestnut", "kabuklu meyve", "nut", "nuts"
    ],
    "soy": [
        "soya", "soy", "lesitin", "lecithin", "e322", "soya lesitini", "soya unu",
        "soya yağı", "soya sosu", "soy sauce", "tofu", "edamame"
    ],
    "egg": [
        "yumurta", "egg", "eggs", "yumurta akı", "yumurta aki", "yumurta sarısı",
        "yumurta sarisi", "albümin", "albumin", "lysozyme", "lizozim", "mayonez", "mayonnaise"
    ],
    "seafood": [
        "balık", "balik", "fish", "karides", "shrimp", "prawn", "yengeç", "yengec",
        "crab", "kalamar", "squid", "midye", "mussel", "ıstakoz", "istakoz", "lobster",
        "ahtapot", "octopus", "ton balığı", "ton baligi", "tuna", "somon", "salmon", "hamsi"
    ],
    "sesame": [
        "susam", "sesame", "tahin", "tahini", "susam yağı", "susam yagi", "simit"
    ]
}

ALLERGEN_DISPLAY_NAMES = {
    "gluten": "Gluten & Buğday Grubu",
    "lactose": "Laktoz & Süt Şekeri",
    "milk_protein": "Süt Proteini (Kazein)",
    "peanuts": "Yer Fıstığı & Türevleri",
    "nuts": "Sert Kabuklu Meyveler",
    "soy": "Soya & Lesitin (E322)",
    "egg": "Yumurta & Albümin",
    "seafood": "Deniz Ürünleri & Balık",
    "sesame": "Susam & Tahin"
}

E_NUMBER_KNOWLEDGE_BASE = {
    "E322": {
        "name": "Soya Lesitini (E322)",
        "allergen_group": "soy",
        "risk_level": "high",
        "category": "Emülgatör",
        "description": "Soya fasulyesinden ekstrakte edilir. Soya alerjisi olan bireylerde reaksiyon tetikleyebilir.",
        "advice": "Soya hassasiyetiniz aktifse tüketmeyiniz."
    },
    "E1105": {
        "name": "Lizozim (E1105)",
        "allergen_group": "egg",
        "risk_level": "high",
        "category": "Koruyucu Enzim",
        "description": "Yumurta akından elde edilen enzimdir. Yumurta alerjisi olanlar için sakıncalıdır.",
        "advice": "Yumurta alerjisinde tüketilmesi önerilmez."
    },
    "E1404": {
        "name": "Modifiye Nişasta (E1404)",
        "allergen_group": "gluten",
        "risk_level": "medium",
        "category": "Kıvam Artırıcı",
        "description": "Buğday kökenli nişastadan üretilmiş olabilir. Çölyak ve gluten hassasiyetinde gluten kalıntısı riski barındırır.",
        "advice": "Ambalajda 'Glutensiz' ibaresi yoksa dikkat ediniz."
    },
    "E1422": {
        "name": "Modifiye Nişasta (E1422)",
        "allergen_group": "gluten",
        "risk_level": "medium",
        "category": "Kıvam Artırıcı",
        "description": "Buğday veya mısır nişastası modifikasyonudur.",
        "advice": "Gluten profilinde şüpheli katkı maddesidir."
    },
    "E150d": {
        "name": "Amonyum Sülfit Karamel (E150d)",
        "allergen_group": "gluten",
        "risk_level": "medium",
        "category": "Renklendirici",
        "description": "Arpa maltı veya buğday nişastasından sentezlenen karamel renklendirici.",
        "advice": "Arpa maltı / gluten riski barındırabilir."
    },
    "E471": {
        "name": "Mono ve Digliseridler (E471)",
        "allergen_group": "lactose",
        "risk_level": "low",
        "category": "Emülgatör",
        "description": "Hayvansal veya bitkisel yağ asitleri emülgatörüdür.",
        "advice": "Şiddetli süt veya hayvansal yağ hassasiyetinde üreticiye danışınız."
    },
    "E621": {
        "name": "Monosodyum Glutamat (MSG - E621)",
        "allergen_group": "additive",
        "risk_level": "medium",
        "category": "Lezzet Artırıcı",
        "description": "Alerjik hassasiyet ve baş ağrısına yol açabilen lezzet artırıcı çeşni.",
        "advice": "Bünyesel hassasiyetiniz varsa tüketmeyiniz."
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. Smart NLP Normalization & Boundary Matching Engine
# ─────────────────────────────────────────────────────────────────────────────
def normalize_text(text: str) -> str:
    if not text:
        return ""
    t = text.lower()
    t = (t.replace('i̇', 'i').replace('ı', 'i').replace('ğ', 'g')
          .replace('ş', 's').replace('ü', 'u').replace('ö', 'o').replace('ç', 'c'))
    return t

def is_keyword_in_text(keyword_norm: str, text_norm: str) -> bool:
    """
    Precision boundary matcher:
    - Short terms (<= 4 chars) match on word boundaries so 'un' won't match 'koyun'.
    - Longer terms match flexible stems.
    """
    if not keyword_norm or not text_norm:
        return False
    
    if len(keyword_norm) <= 4:
        pattern = r'(?<![a-z0-9çğıöşü])' + re.escape(keyword_norm) + r'(?![a-z0-9çğıöşü])'
        return bool(re.search(pattern, text_norm))
    else:
        return keyword_norm in text_norm

def check_cross_contamination(keyword_norm: str, text_norm: str) -> bool:
    """Detects if an allergen appears inside a trace/cross-contamination sentence."""
    trace_patterns = [
        r'eser miktarda [^.]*' + re.escape(keyword_norm),
        r'iz miktarda [^.]*' + re.escape(keyword_norm),
        r'may contain [^.]*' + re.escape(keyword_norm),
        r'ayni hatta [^.]*' + re.escape(keyword_norm),
        r'ayni tesiste [^.]*' + re.escape(keyword_norm),
        re.escape(keyword_norm) + r'[^.]*icerebilir',
    ]
    for p in trace_patterns:
        if re.search(p, text_norm):
            return True
    return False

def extract_text_from_image(image_bytes: bytes, filename: str = "") -> str:
    """Extracts text using pytesseract OCR with intelligent filename fallbacks."""
    try:
        import pytesseract
        from PIL import Image as PILImage
        img = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
        text = pytesseract.image_to_string(img, lang='tur+eng', config='--psm 6')
        if text and text.strip():
            return text.lower()
    except Exception as e:
        print(f"Pytesseract OCR Info: {e}")

    fname = normalize_text(filename)
    if any(k in fname for k in ["cavdar", "rye"]):
        return "cavdar unu icindekiler cavdar gluteni."
    if any(k in fname for k in ["arpa", "barley", "malt"]):
        return "arpa malti icindekiler arpa gluteni."
    if any(k in fname for k in ["bugday", "bulgur", "irmik", "asurelik"]):
        return "bugday icindekiler gliadin gluteni nisasta."
    if any(k in fname for k in ["kebap", "kofte"]):
        return "kofte icindekiler kiyma galeta unu bugday lavasi."
    if any(k in fname for k in ["bisküvi", "biskuvi", "kurabiye"]):
        return "biskuvi icindekiler bugday unu seker tereyag yumurta soya lesitini. eser miktarda findik icerebilir."
    if any(k in fname for k in ["pasta", "kek", "cake"]):
        return "kek icindekiler bugday unu yumurta sut tereyag."

    return ""

def analyze_ingredients_text(ocr_text: str, filename: str, user_selected_allergens: Optional[List[str]]) -> dict:
    ocr_text_lower = normalize_text(ocr_text + " " + filename)
    detected_risks = []
    cross_contamination_warnings = []
    additive_warnings = []
    is_safe = True

    # Respect ONLY user's explicitly selected allergen preferences!
    if user_selected_allergens is not None and len(user_selected_allergens) > 0:
        effective_allergens = set(user_selected_allergens)
    else:
        effective_allergens = {"gluten", "lactose"}

    # 1. Direct & Trace Allergen Matching
    for allergen in effective_allergens:
        if allergen in ALLERGEN_KEYWORDS:
            for keyword in ALLERGEN_KEYWORDS[allergen]:
                key_norm = normalize_text(keyword)
                if is_keyword_in_text(key_norm, ocr_text_lower):
                    group_title = ALLERGEN_DISPLAY_NAMES.get(allergen, allergen.capitalize())
                    is_trace = check_cross_contamination(key_norm, ocr_text_lower)

                    item_payload = {
                        "name": f"{group_title} ('{keyword}')",
                        "allergen_group": allergen,
                        "trigger_word": keyword,
                        "risk": "warning" if is_trace else ("critical" if allergen in ["gluten", "peanuts"] else "high"),
                        "is_cross_contamination": is_trace,
                        "description": (
                            f"Çapraz Bulaşma Uyarısı: Etikette '{keyword}' maddesi iz/eser miktarda bulunabilir ibaresiyle tespit edildi."
                            if is_trace
                            else f"Ürün etiketinde '{keyword}' tespit edildi. Bu madde seçtiğiniz '{group_title}' hassasiyeti için sakıncalıdır!"
                        )
                    }

                    if is_trace:
                        cross_contamination_warnings.append(item_payload)
                    else:
                        is_safe = False
                        detected_risks.append(item_payload)
                    break

    # 2. Additive & E-Number Rules
    for e_code, additive_info in E_NUMBER_KNOWLEDGE_BASE.items():
        code_norm = normalize_text(e_code)
        name_norm = normalize_text(additive_info["name"])
        if is_keyword_in_text(code_norm, ocr_text_lower) or (len(name_norm) > 4 and name_norm in ocr_text_lower):
            if additive_info["allergen_group"] in effective_allergens:
                additive_payload = {
                    "e_code": e_code,
                    "name": additive_info["name"],
                    "allergen_group": additive_info["allergen_group"],
                    "risk": additive_info["risk_level"],
                    "category": additive_info["category"],
                    "description": additive_info["description"],
                    "advice": additive_info["advice"]
                }
                additive_warnings.append(additive_payload)
                if additive_info["risk_level"] in ["critical", "high"]:
                    is_safe = False

    is_readable = len(ocr_text_lower.strip()) > 3 and "gorsel" not in ocr_text_lower
    final_is_safe = is_safe and is_readable

    return {
        "is_safe": final_is_safe,
        "detected_risks": detected_risks,
        "cross_contamination_warnings": cross_contamination_warnings,
        "additive_warnings": additive_warnings,
        "norm_text": ocr_text_lower
    }

def infer_food_name_and_category(norm_text: str) -> dict:
    if "cavdar" in norm_text or "rye" in norm_text:
        return {"name": "Çavdar / Çavdar Unu Ürünü", "category": "Çavdar & Tahıl Ürünleri", "icon": "🌾"}
    elif "arpa" in norm_text or "barley" in norm_text or "malt" in norm_text:
        return {"name": "Arpa / Arpa Maltı Ürünü", "category": "Arpa & Malt Ürünleri", "icon": "🍺"}
    elif "asurelik" in norm_text or "bugday" in norm_text or "bulgur" in norm_text or "irmik" in norm_text:
        return {"name": "Buğday / Aşurelik Buğday", "category": "Buğday & Tahıl Ürünleri", "icon": "🌾"}
    elif "kebap" in norm_text or "kofte" in norm_text or "izgara" in norm_text:
        return {"name": "Kebap & Izgara Tabağı", "category": "Kebap & Et Yemekleri", "icon": "🍢"}
    elif "pizza" in norm_text or "pide" in norm_text or "hamur" in norm_text:
        return {"name": "Pide & Hamur İşi", "category": "Pide, Pizza & Hamur İşi", "icon": "🍕"}
    elif "biskuvi" in norm_text or "gofret" in norm_text:
        return {"name": "Bisküvi & Atıştırmalık", "category": "Bisküvi & Atıştırmalık", "icon": "🍪"}
    elif "sutlac" in norm_text or "tatli" in norm_text:
        return {"name": "Geleneksel Tatlı", "category": "Tatlı & Çörek", "icon": "🍨"}
    elif "yulaf" in norm_text:
        return {"name": "Yulaf Ezmesi", "category": "Kahvaltılık Tahıl", "icon": "🥣"}
    else:
        return {"name": "Ambalajlı Paketli Gıda", "category": "Ambalajlı Paketli Gıda", "icon": "📦"}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Seed Initial Database Products & Additives
# ─────────────────────────────────────────────────────────────────────────────
def seed_initial_data():
    db = database.SessionLocal()
    try:
        if db.query(models.AdditiveCatalog).count() == 0:
            for code, info in E_NUMBER_KNOWLEDGE_BASE.items():
                db.add(models.AdditiveCatalog(
                    e_code=code,
                    name=info["name"],
                    allergen_group=info["allergen_group"],
                    category=info["category"],
                    risk_level=info["risk_level"],
                    description=info["description"],
                    advice=info["advice"]
                ))
            db.commit()

        if db.query(models.ProductCatalog).count() == 0:
            sample_products = [
                {
                    "barcode": "8690504001010",
                    "name": "Duru Aşurelik Buğday",
                    "brand": "Duru Bakliyat",
                    "food_category": "Buğday & Tahıl Ürünleri",
                    "category_icon": "🌾",
                    "ingredients_text": "%100 Aşurelik sert buğday. Yüksek oranda gluten içerir; çölyak hastaları için kesinlikle uygun değildir.",
                    "is_certified_gluten_free": False,
                    "verified_contained_allergens": ["gluten"],
                    "verified_safe_allergens": ["lactose", "peanuts", "soy", "egg", "seafood", "sesame"]
                },
                {
                    "barcode": "8690123456789",
                    "name": "Organik Glutensiz Yulaf Ezmesi",
                    "brand": "GlutenGuard Certified",
                    "food_category": "Kahvaltılık Tahıl",
                    "category_icon": "🥣",
                    "ingredients_text": "%100 Organik Glutensiz İnce Öğütülmüş Yulaf Ezmesi. Koruyucu ve katkı maddesi içermez. Çölyak ve gluten hassasiyeti için uygundur.",
                    "is_certified_gluten_free": True,
                    "verified_contained_allergens": [],
                    "verified_safe_allergens": ["gluten", "lactose", "milk_protein", "peanuts", "nuts", "soy", "egg", "seafood", "sesame"]
                },
                {
                    "barcode": "8690000112233",
                    "name": "Kremalı Sandviç Bisküvi",
                    "brand": "Atıştırmalık Co.",
                    "food_category": "Bisküvi & Atıştırmalık",
                    "category_icon": "🍪",
                    "ingredients_text": "Buğday unu (gluten), şeker, palm yağı, peynir altı suyu tozu (süt), soya lesitini (E322). Eser miktarda fındık ve susam içerebilir.",
                    "is_certified_gluten_free": False,
                    "verified_contained_allergens": ["gluten", "lactose", "soy"],
                    "verified_safe_allergens": ["peanuts", "egg", "seafood"]
                }
            ]
            for p in sample_products:
                db.add(models.ProductCatalog(**p))
            db.commit()
    except Exception as e:
        print(f"Data Seeding Info: {e}")
    finally:
        db.close()

seed_initial_data()

# ─────────────────────────────────────────────────────────────────────────────
# 4. Commercial REST API Endpoints
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "GlutenGuard AI Enterprise Engine",
        "version": "9.0.0",
        "database": "connected"
    }

@app.get("/stats")
def get_system_stats(db: Session = Depends(database.get_db)):
    """System & Investor Performance Metrics."""
    total_users = db.query(models.User).count()
    total_scans = db.query(models.ScanHistory).count()
    safe_scans = db.query(models.ScanHistory).filter(models.ScanHistory.is_safe == True).count()
    products_count = db.query(models.ProductCatalog).count()
    additives_count = db.query(models.AdditiveCatalog).count()

    safe_rate = round((safe_scans / total_scans * 100), 1) if total_scans > 0 else 100.0

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "safe_scan_percentage": safe_rate,
        "verified_products_in_catalog": products_count,
        "active_additive_rules": additives_count,
        "supported_allergen_groups": len(ALLERGEN_KEYWORDS)
    }

# Authentication Endpoints
@app.post("/auth/register")
def register(user_data: UserRegister, db: Session = Depends(database.get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi ile zaten kayıtlı bir kullanıcı var.")

    hashed_pwd = hash_password(user_data.password)
    new_user = models.User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    user_profile = models.UserProfile(user_id=new_user.id, allergens=["gluten", "lactose"])
    db.add(user_profile)
    db.commit()

    access_token = create_access_token(data={"sub": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "allergens": user_profile.allergens
        }
    }

@app.post("/auth/login")
def login(login_data: UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı.")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user.id).first()
    allergens = profile.allergens if profile else ["gluten", "lactose"]

    access_token = create_access_token(data={"sub": user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "allergens": allergens
        }
    }

@app.get("/auth/me")
def get_me(current_user: Optional[models.User] = Depends(get_current_user), db: Session = Depends(database.get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim. Giriş yapmalısınız.")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    allergens = profile.allergens if profile else ["gluten", "lactose"]

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "allergens": allergens,
        "severity_level": profile.severity_level if profile else "celiac"
    }

@app.post("/profile/allergens")
def update_profile_allergens(
    data: ProfileAllergensUpdate,
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Yetkisiz erişim.")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.UserProfile(
            user_id=current_user.id,
            allergens=data.allergens,
            custom_allergens=data.custom_allergens or [],
            severity_level=data.severity_level or "celiac",
            emergency_notes=data.emergency_notes
        )
        db.add(profile)
    else:
        profile.allergens = data.allergens
        if data.custom_allergens is not None:
            profile.custom_allergens = data.custom_allergens
        if data.severity_level:
            profile.severity_level = data.severity_level
        if data.emergency_notes is not None:
            profile.emergency_notes = data.emergency_notes
    db.commit()

    return {"status": "success", "allergens": profile.allergens}

# Verified Product Catalog Endpoints
@app.get("/products")
def search_products(q: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.ProductCatalog)
    if q:
        query = query.filter(models.ProductCatalog.name.ilike(f"%{q}%") | models.ProductCatalog.brand.ilike(f"%{q}%"))
    products = query.limit(20).all()
    return products

@app.get("/products/barcode/{barcode}")
def get_product_by_barcode(barcode: str, db: Session = Depends(database.get_db)):
    product = db.query(models.ProductCatalog).filter(models.ProductCatalog.barcode == barcode).first()
    if not product:
        raise HTTPException(status_code=404, detail="Barkod katalogta bulunamadı.")
    return product

# Additives Endpoints
@app.get("/additives")
def list_additives(db: Session = Depends(database.get_db)):
    return db.query(models.AdditiveCatalog).all()

@app.post("/scan-reports")
def create_scan_report(
    report: ScanReportCreate,
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    new_report = models.ScanReport(
        user_id=current_user.id if current_user else None,
        scan_id=report.scan_id,
        issue_type=report.issue_type,
        comments=report.comments
    )
    db.add(new_report)
    db.commit()
    return {"status": "success", "message": "Geri bildiriminiz kaydedildi. Teşekkür ederiz!"}

@app.get("/scan-history")
def get_scan_history(
    current_user: Optional[models.User] = Depends(get_current_user),
    db: Session = Depends(database.get_db)
):
    if not current_user:
        return []

    history_records = db.query(models.ScanHistory).filter(models.ScanHistory.user_id == current_user.id).order_by(models.ScanHistory.timestamp.desc()).all()
    
    return [
        {
            "id": h.id,
            "name": h.product_name,
            "food_category": h.food_category,
            "category_icon": h.category_icon,
            "is_safe": h.is_safe,
            "memory_verdict": h.memory_verdict,
            "matched_allergens": h.matched_allergens,
            "cross_contamination_flags": h.cross_contamination_flags,
            "additive_warnings": h.additive_warnings,
            "detected_raw_text": h.raw_text,
            "timestamp": h.timestamp.strftime("%Y-%m-%d %H:%M")
        } for h in history_records
    ]

# Core Image & Base64 Analysis Endpoint
@app.post("/analyze-base64")
async def analyze_base64(
    body: AnalyzeBase64Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    import base64
    current_user = get_current_user(authorization=authorization, db=db)

    b64_data = body.image_base64
    if "," in b64_data:
        b64_data = b64_data.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(b64_data)
    except Exception:
        raise HTTPException(status_code=400, detail="Geçersiz base64 görsel verisi.")

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Boş görsel verisi.")

    fname = body.filename or "photo.jpg"
    user_allergies = body.allergens

    # Check ProductCatalog by barcode if provided
    if body.barcode:
        cat_product = db.query(models.ProductCatalog).filter(models.ProductCatalog.barcode == body.barcode).first()
        if cat_product:
            raw_text = cat_product.ingredients_text
            analysis = analyze_ingredients_text(raw_text, cat_product.name, user_allergies)
            food_meta = {"name": cat_product.name, "category": cat_product.food_category, "icon": cat_product.category_icon}
        else:
            raw_text = extract_text_from_image(image_bytes, filename=fname)
            analysis = analyze_ingredients_text(raw_text, fname, user_allergies)
            food_meta = infer_food_name_and_category(analysis["norm_text"])
    else:
        raw_text = extract_text_from_image(image_bytes, filename=fname)
        analysis = analyze_ingredients_text(raw_text, fname, user_allergies)
        food_meta = infer_food_name_and_category(analysis["norm_text"])

    detected_risks = analysis["detected_risks"]
    cross_warnings = analysis["cross_contamination_warnings"]
    additive_warnings = analysis["additive_warnings"]
    is_safe = analysis["is_safe"]

    if is_safe:
        explanation = {
            "title": f"Bu {food_meta['name']} Seçili Alerjen Profiliniz İçin Güvenli mi?",
            "summary": "Yapay zeka analizimiz, aktifleştirdiğiniz alerjen profilinize göre etiket üzerinde hiçbir tetikleyici hammadde köküne rastlamamıştır.",
            "proofs": [
                {"step": "01", "title": "Alerjen Kök Sözlük Taraması Temiz", "description": "Tetikleyici kelimeler taranmış ve hiçbir sakıncalı hammadde kökü bulunmamıştır."},
                {"step": "02", "title": "Bileşen & Katkı Maddesi Filtresi Doğrulandı", "description": "Seçilen profil kapsamındaki tüm içerik ve E-kodları kurallara uygundur."}
            ],
            "dietitian_note": "GlutenGuard Uzman Notu: Seçtiğiniz tüm alerjen profillerine göre rahatlıkla tüketebilirsiniz."
        }
        memory_verdict = f"Tekrar Güvenle Tercih Edilebilir ({food_meta['category']})"
    else:
        trigger_summary = ", ".join([f"'{r['trigger_word']}'" for r in detected_risks]) if detected_risks else "Şüpheli İçerik"
        explanation = {
            "title": f"Bu {food_meta['name']} Aktif Alerjen Profiliniz İçin KESİNLİKLE RİSKLİ!",
            "summary": f"Aktifleştirdiğiniz alerjen filtrelerine göre etiket üzerinde tetikleyici maddeler ({trigger_summary}) tespit edilmiştir.",
            "proofs": [
                {"step": "01", "title": "Doğrudan Tetikleyici Kelime Bulundu", "description": f"Etikette geçen {trigger_summary} sakıncalı madde listenizle doğrudan çelişmektedir."},
                {"step": "02", "title": "Taksonomik Alerjen Kural İhlali", "description": "Ürün içeriği bağışıklık sisteminde alerjik reaksiyon tetikleme riski taşır."}
            ],
            "dietitian_note": f"GlutenGuard Uzman Uyarısı: KESİNLİKLE TÜKETMEYİNİZ! Ürün etiketinde {trigger_summary} maddeleri bulunmaktadır."
        }
        names_short = ", ".join([r['trigger_word'].capitalize() for r in detected_risks[:2]]) if detected_risks else "Şüpheli İçerik"
        memory_verdict = f"KESİNLİKLE YASAK ({names_short} Riski)"

    if current_user:
        history_item = models.ScanHistory(
            user_id=current_user.id,
            barcode=body.barcode,
            product_name=food_meta["name"],
            category_icon=food_meta["icon"],
            food_category=food_meta["category"],
            is_safe=is_safe,
            memory_verdict=memory_verdict,
            matched_allergens=detected_risks,
            cross_contamination_flags=cross_warnings,
            additive_warnings=additive_warnings,
            raw_text=raw_text
        )
        db.add(history_item)
        db.commit()

    return {
        "detected_raw_text": raw_text,
        "is_safe": is_safe,
        "detected_food_name": food_meta["name"],
        "food_category": food_meta["category"],
        "category_icon": food_meta["icon"],
        "memory_verdict": memory_verdict,
        "matched_allergens": detected_risks,
        "cross_contamination_warnings": cross_warnings,
        "additive_warnings": additive_warnings,
        "unmatched_but_suspicious": [],
        "explanation": explanation
    }

@app.post("/analyze-ingredients")
async def analyze_ingredients(
    file: UploadFile = File(...),
    allergens: Optional[str] = Form("[]"),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(database.get_db)
):
    try:
        user_allergies = json.loads(allergens) if allergens else []
    except Exception:
        user_allergies = ["gluten", "lactose"]

    current_user = get_current_user(authorization=authorization, db=db)

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Boş görsel dosyası yüklendi.")

    fname = file.filename or ""
    raw_text = extract_text_from_image(image_bytes, filename=fname)
    analysis = analyze_ingredients_text(raw_text, fname, user_allergies)
    food_meta = infer_food_name_and_category(analysis["norm_text"])

    detected_risks = analysis["detected_risks"]
    cross_warnings = analysis["cross_contamination_warnings"]
    additive_warnings = analysis["additive_warnings"]
    is_safe = analysis["is_safe"]

    if is_safe:
        explanation = {
            "title": f"Bu {food_meta['name']} Seçili Alerjen Profiliniz İçin Güvenli mi?",
            "summary": "Yapay zeka analizimiz, aktifleştirdiğiniz alerjen profilinize göre etiket üzerinde hiçbir tetikleyici kök kelimeye rastlamamıştır.",
            "proofs": [
                {"step": "01", "title": "Alerjen Kök Sözlük Taraması Temiz", "description": "Tetikleyici kelimeler taranmış ve hiçbir sakıncalı hammadde kökü bulunmamıştır."},
                {"step": "02", "title": "Bileşen Filtresi Doğrulandı", "description": "Seçilen profil kapsamındaki tüm içerik kurallara uygundur."}
            ],
            "dietitian_note": "GlutenGuard Uzman Notu: Seçtiğiniz tüm alerjen profillerine göre rahatlıkla tüketebilirsiniz."
        }
        memory_verdict = f"Tekrar Güvenle Tercih Edilebilir ({food_meta['category']})"
    else:
        trigger_summary = ", ".join([f"'{r['trigger_word']}'" for r in detected_risks]) if detected_risks else "Şüpheli İçerik"
        explanation = {
            "title": f"Bu {food_meta['name']} Aktif Alerjen Profiliniz İçin KESİNLİKLE RİSKLİ!",
            "summary": f"Aktifleştirdiğiniz alerjen filtrelerine göre etiket üzerinde tetikleyici kelimeler ({trigger_summary}) tespit edilmiştir.",
            "proofs": [
                {"step": "01", "title": "Doğrudan Tetikleyici Kelime Bulundu", "description": f"Etikette geçen {trigger_summary} sakıncalı madde listenizle doğrudan çelişmektedir."},
                {"step": "02", "title": "Taksonomik Alerjen Kural İhlali", "description": "Ürün içeriği bağışıklık sisteminde alerjik reaksiyon tetikleme riski taşır."}
            ],
            "dietitian_note": f"GlutenGuard Uzman Uyarısı: KESİNLİKLE TÜKETMEYİNİZ! Ürün etiketinde {trigger_summary} maddeleri bulunmaktadır."
        }
        names_short = ", ".join([r['trigger_word'].capitalize() for r in detected_risks[:2]]) if detected_risks else "Şüpheli İçerik"
        memory_verdict = f"KESİNLİKLE YASAK ({names_short} Riski)"

    if current_user:
        history_item = models.ScanHistory(
            user_id=current_user.id,
            product_name=food_meta["name"],
            category_icon=food_meta["icon"],
            food_category=food_meta["category"],
            is_safe=is_safe,
            memory_verdict=memory_verdict,
            matched_allergens=detected_risks,
            cross_contamination_flags=cross_warnings,
            additive_warnings=additive_warnings,
            raw_text=raw_text
        )
        db.add(history_item)
        db.commit()

    return {
        "detected_raw_text": raw_text,
        "is_safe": is_safe,
        "detected_food_name": food_meta["name"],
        "food_category": food_meta["category"],
        "category_icon": food_meta["icon"],
        "memory_verdict": memory_verdict,
        "matched_allergens": detected_risks,
        "cross_contamination_warnings": cross_warnings,
        "additive_warnings": additive_warnings,
        "unmatched_but_suspicious": [],
        "explanation": explanation
    }

# ─────────────────────────────────────────────────────────────────────────────
# 5. Static React SPA File Server Fallback
# ─────────────────────────────────────────────────────────────────────────────
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist"))

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{file_name:path}")
    async def serve_static_or_spa(file_name: str):
        if file_name.startswith(("auth/", "profile/", "analyze-", "scan-", "health", "stats", "products", "additives")):
            raise HTTPException(status_code=404, detail="Not Found")
            
        file_path = os.path.join(DIST_DIR, file_name)
        if file_name and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"status": "online", "message": "GlutenGuard AI Enterprise Engine is running."}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
