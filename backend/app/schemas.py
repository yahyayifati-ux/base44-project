"""Request/response schemas."""
from typing import List, Optional

from pydantic import BaseModel, Field


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=200)


class PasswordIn(BaseModel):
    current_password: str = Field(min_length=6, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)


class PropertyIn(BaseModel):
    title_fa: str = Field(min_length=2, max_length=255)
    slug: Optional[str] = None
    description_fa: str = ""
    category_slug: Optional[str] = None
    transaction_type: str = "sale"

    province: str = "هرمزگان"
    city: str = "قشم"
    neighborhood: str = ""
    location_note: str = ""

    area_sqm: Optional[int] = None
    land_area_sqm: Optional[int] = None
    rooms: Optional[int] = None
    floor: Optional[int] = None
    year_built: Optional[int] = None
    documentation: str = ""

    price: Optional[int] = None
    price_on_request: bool = True
    deposit: Optional[int] = None
    monthly_rent: Optional[int] = None

    features: List[str] = []
    images: List[str] = []
    featured_image: str = ""
    floor_plan_url: str = ""
    video_url: str = ""
    virtual_tour_url: str = ""

    latitude: str = ""
    longitude: str = ""

    published: bool = False
    featured: bool = False


class InquiryIn(BaseModel):
    kind: str = "contact"
    name: str = Field(min_length=2, max_length=128)
    phone: str = Field(min_length=6, max_length=32)
    email: str = ""
    message: str = ""
    property_id: Optional[int] = None


class InquiryStatusIn(BaseModel):
    status: str = Field(pattern="^(new|read|done)$")


class SettingsIn(BaseModel):
    brand_fa: Optional[str] = None
    brand_en: Optional[str] = None
    phone_1: Optional[str] = None
    phone_2: Optional[str] = None
    whatsapp: Optional[str] = None
    office_code: Optional[str] = None
    email: Optional[str] = None
    address_fa: Optional[str] = None
    hours_fa: Optional[str] = None
    instagram: Optional[str] = None
    telegram: Optional[str] = None
    hero_headline_fa: Optional[str] = None
    hero_sub_fa: Optional[str] = None
    about_intro_fa: Optional[str] = None
    about_body_fa: Optional[str] = None
    qeshm_text_fa: Optional[str] = None
    hero_image: Optional[str] = None
    about_image: Optional[str] = None
    qeshm_image: Optional[str] = None
