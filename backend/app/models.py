"""ORM models: administrators, categories, properties, inquiries, site settings."""
from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .database import Base

# Transaction types used across the public site and the admin dashboard.
TRANSACTION_TYPES = ("sale", "rent", "mortgage", "investment")
INQUIRY_KINDS = ("property", "consultation", "sell", "contact")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, default="")
    password_hash = Column(String(512), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    slug = Column(String(64), unique=True, nullable=False, index=True)
    title_fa = Column(String(128), nullable=False)
    description_fa = Column(Text, nullable=False, default="")
    image_url = Column(String(512), nullable=False, default="")
    sort_order = Column(Integer, nullable=False, default=0)

    properties = relationship("Property", back_populates="category")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    slug = Column(String(160), unique=True, nullable=False, index=True)
    title_fa = Column(String(255), nullable=False)
    description_fa = Column(Text, nullable=False, default="")

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    transaction_type = Column(String(32), nullable=False, default="sale")

    province = Column(String(64), nullable=False, default="هرمزگان")
    city = Column(String(64), nullable=False, default="قشم")
    neighborhood = Column(String(128), nullable=False, default="")
    location_note = Column(String(255), nullable=False, default="")

    # Specifications - only the fields that apply to a given property are filled.
    area_sqm = Column(Integer, nullable=True)
    land_area_sqm = Column(Integer, nullable=True)
    rooms = Column(Integer, nullable=True)
    floor = Column(Integer, nullable=True)
    year_built = Column(Integer, nullable=True)
    documentation = Column(String(128), nullable=False, default="")

    # Pricing. Amounts are in toman and routinely run into the billions, so these
    # columns are BIGINT (a 32-bit integer would reject most real listings).
    # price_on_request keeps the listing honest when no price is published.
    price = Column(BigInteger, nullable=True)
    price_on_request = Column(Boolean, nullable=False, default=True)
    deposit = Column(BigInteger, nullable=True)
    monthly_rent = Column(BigInteger, nullable=True)

    features = Column(JSONB, nullable=False, default=list)
    images = Column(JSONB, nullable=False, default=list)
    featured_image = Column(String(512), nullable=False, default="")
    floor_plan_url = Column(String(512), nullable=False, default="")
    video_url = Column(String(512), nullable=False, default="")
    virtual_tour_url = Column(String(512), nullable=False, default="")

    latitude = Column(String(32), nullable=False, default="")
    longitude = Column(String(32), nullable=False, default="")

    published = Column(Boolean, nullable=False, default=False, index=True)
    featured = Column(Boolean, nullable=False, default=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    category = relationship("Category", back_populates="properties")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True)
    kind = Column(String(32), nullable=False, default="contact", index=True)
    name = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=False)
    email = Column(String(255), nullable=False, default="")
    message = Column(Text, nullable=False, default="")
    # SET NULL keeps the lead alive: deleting a listing must never destroy the
    # customer inquiries it received (each one keeps its own copy of the title).
    property_id = Column(
        Integer, ForeignKey("properties.id", ondelete="SET NULL"), nullable=True
    )
    property_title = Column(String(255), nullable=False, default="")
    status = Column(String(16), nullable=False, default="new", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SiteSettings(Base):
    """Single-row table (id = 1) holding the editable public site content."""

    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True)

    brand_fa = Column(String(128), nullable=False, default="املاک جاوید")
    brand_en = Column(String(128), nullable=False, default="JAVID REAL ESTATE")

    phone_1 = Column(String(32), nullable=False, default="")
    phone_2 = Column(String(32), nullable=False, default="")
    whatsapp = Column(String(32), nullable=False, default="")
    office_code = Column(String(16), nullable=False, default="")
    email = Column(String(255), nullable=False, default="")
    address_fa = Column(String(255), nullable=False, default="")
    hours_fa = Column(String(255), nullable=False, default="")
    instagram = Column(String(255), nullable=False, default="")
    telegram = Column(String(255), nullable=False, default="")

    hero_headline_fa = Column(Text, nullable=False, default="")
    hero_sub_fa = Column(Text, nullable=False, default="")
    about_intro_fa = Column(Text, nullable=False, default="")
    about_body_fa = Column(Text, nullable=False, default="")
    qeshm_text_fa = Column(Text, nullable=False, default="")

    hero_image = Column(String(512), nullable=False, default="")
    about_image = Column(String(512), nullable=False, default="")
    qeshm_image = Column(String(512), nullable=False, default="")

    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
