import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    scan_history = relationship("ScanHistory", back_populates="user", cascade="all, delete-orphan")
    scan_reports = relationship("ScanReport", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    allergens = Column(JSON, default=list)  # List of active allergen keys e.g. ["gluten", "lactose"]
    custom_allergens = Column(JSON, default=list) # Custom allergen keywords specified by user e.g. ["cilek", "garlic"]
    severity_level = Column(String, default="celiac") # "celiac", "severe", "mild"
    emergency_notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="profile")


class ScanHistory(Base):
    __tablename__ = "scan_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    barcode = Column(String, index=True, nullable=True)
    product_name = Column(String, nullable=False)
    category_icon = Column(String, default="📦")
    food_category = Column(String, default="Ambalajlı Paketli Gıda")
    is_safe = Column(Boolean, default=True)
    memory_verdict = Column(String, nullable=True)
    matched_allergens = Column(JSON, default=list)
    cross_contamination_flags = Column(JSON, default=list)
    additive_warnings = Column(JSON, default=list)
    raw_text = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scan_history")


class ProductCatalog(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, index=True, nullable=True)
    food_category = Column(String, default="Paketli Gıda")
    category_icon = Column(String, default="📦")
    ingredients_text = Column(Text, nullable=False)
    is_certified_gluten_free = Column(Boolean, default=False)
    verified_contained_allergens = Column(JSON, default=list)
    verified_safe_allergens = Column(JSON, default=list)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AdditiveCatalog(Base):
    __tablename__ = "additives"

    id = Column(Integer, primary_key=True, index=True)
    e_code = Column(String, unique=True, index=True, nullable=False) # e.g. "E322"
    name = Column(String, nullable=False) # e.g. "Soya Lesitini"
    allergen_group = Column(String, index=True, nullable=False) # e.g. "soy", "gluten", "egg"
    category = Column(String, default="Gıda Katkı Maddesi")
    risk_level = Column(String, default="high") # "critical", "high", "medium", "low"
    description = Column(Text, nullable=True)
    advice = Column(Text, nullable=True)


class ScanReport(Base):
    __tablename__ = "scan_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_id = Column(Integer, nullable=True)
    issue_type = Column(String, nullable=False) # "ocr_misread", "false_positive", "false_negative", "other"
    comments = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scan_reports")
